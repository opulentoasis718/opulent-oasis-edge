// ============================================================================
// OPULENT OASIS — HARDENED ZERO-TRUST CLOUDFLARE PAGES EDGE API
// ============================================================================

const RATE_LIMIT_MAP = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_GET_PER_MINUTE = 90;
const MAX_POST_PER_MINUTE = 10;

// Precomputed SHA-256 hex digest of default curator passcode ('oasis2026')
const DEFAULT_CURATOR_HASH = '457e60590089897c1e7b8293681b6577049a20b56634194a0e9d76294b929a22';

function getSecurityHeaders(origin = '*') {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Curator-Token, X-Requested-With',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'"
  };
}

function checkRateLimit(ip, limit) {
  const now = Date.now();
  const entry = RATE_LIMIT_MAP.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW_MS) {
    RATE_LIMIT_MAP.set(ip, { start: now, count: 1 });
    return true;
  }
  if (entry.count >= limit) {
    return false;
  }
  entry.count += 1;
  return true;
}

function sanitizeText(input, maxLen = 250) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>"'`\\]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, maxLen);
}

function validateHttpsImage(url) {
  const fallback = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80';
  if (typeof url !== 'string') return fallback;
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'https:') return fallback;
    return parsed.toString().slice(0, 500);
  } catch {
    return fallback;
  }
}

async function sha256Hex(message) {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqualString(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get('Origin') || '*';
  return new Response(null, { status: 204, headers: getSecurityHeaders(origin) });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const origin = request.headers.get('Origin') || '*';
  const clientIp = request.headers.get('CF-Connecting-IP') || 'anonymous';

  if (!checkRateLimit(`get:${clientIp}`, MAX_GET_PER_MINUTE)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again shortly.' }), {
      status: 429,
      headers: getSecurityHeaders(origin)
    });
  }

  try {
    if (!env.DB) {
      return new Response(JSON.stringify({ error: 'Cloudflare D1 database binding not found' }), {
        status: 500,
        headers: getSecurityHeaders(origin)
      });
    }

    const { results } = await env.DB.prepare(
      'SELECT * FROM listings WHERE published = 1 ORDER BY created_at DESC LIMIT 100'
    ).all();

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: {
        ...getSecurityHeaders(origin),
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60'
      }
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Unable to fetch listings' }), {
      status: 500,
      headers: getSecurityHeaders(origin)
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = request.headers.get('Origin') || '*';
  const clientIp = request.headers.get('CF-Connecting-IP') || 'anonymous';

  if (!checkRateLimit(`post:${clientIp}`, MAX_POST_PER_MINUTE)) {
    return new Response(JSON.stringify({ error: 'Too many write requests. Rate limit active.' }), {
      status: 429,
      headers: getSecurityHeaders(origin)
    });
  }

  try {
    if (!env.DB) {
      return new Response(JSON.stringify({ error: 'Cloudflare D1 database binding not found' }), {
        status: 500,
        headers: getSecurityHeaders(origin)
      });
    }

    // Verify Curator Token (Supports raw passcode or SHA-256 token header)
    const providedToken = request.headers.get('X-Curator-Token') || '';
    const expectedHash = env.CURATOR_TOKEN_HASH || DEFAULT_CURATOR_HASH;
    const candidateHash =
      providedToken.length === 64 ? providedToken.toLowerCase() : await sha256Hex(providedToken);

    if (!timingSafeEqualString(candidateHash, expectedHash)) {
      return new Response(JSON.stringify({ error: 'Unauthorized curator credentials' }), {
        status: 401,
        headers: getSecurityHeaders(origin)
      });
    }

    const body = await request.json();

    // Honeypot bot trap check
    if (body.website_url_trap) {
      return new Response(JSON.stringify({ error: 'Bot submission rejected' }), {
        status: 400,
        headers: getSecurityHeaders(origin)
      });
    }

    const validCategories = ['Stay', 'Tour', 'Trek'];
    const category = validCategories.includes(body.category) ? body.category : 'Stay';
    const cleanId = sanitizeText(body.id || `listing-${Date.now()}`, 80);
    const cleanName = sanitizeText(body.name, 160);

    if (!cleanName || cleanName.length < 2) {
      return new Response(JSON.stringify({ error: 'Valid experience title is required' }), {
        status: 400,
        headers: getSecurityHeaders(origin)
      });
    }

    const numericPrice = Math.max(0, Math.min(10000000, Number(body.numericPrice || body.numeric_price || 30000) || 30000));
    const lat = Math.max(-90, Math.min(90, Number(body.lat || 19.24) || 19.24));
    const lng = Math.max(-180, Math.min(180, Number(body.lng || 72.78) || 72.78));

    const stmt = env.DB.prepare(`
      INSERT INTO listings (id, name, location_name, country, region, category, sub_type, price, numeric_price, lat, lng, altitude, duration, group_size, terrain_type, base_index, published, image, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    await stmt.bind(
      cleanId,
      cleanName,
      sanitizeText(body.locationName || body.location_name || 'Alibaug Coast', 100),
      sanitizeText(body.country || 'India', 60),
      sanitizeText(body.region || 'Global Sanctuary', 120),
      category,
      sanitizeText(body.subType || body.sub_type || 'Villa', 60),
      sanitizeText(body.price || '₹30,000 / night', 60),
      numericPrice,
      lat,
      lng,
      sanitizeText(body.altitude || '20m ASL', 40),
      sanitizeText(body.duration || '2 Nights', 50),
      sanitizeText(body.groupSize || body.group_size || 'Up to 8 Guests', 50),
      sanitizeText(body.terrainType || body.terrain_type || 'Sanctuary', 60),
      9.5,
      1,
      validateHttpsImage(body.image),
      sanitizeText(body.description || 'Luxury sanctuary space.', 1500)
    ).run();

    // Write non-blocking security audit record if audit table exists
    try {
      const ipHash = await sha256Hex(clientIp);
      await env.DB.prepare(
        `INSERT INTO security_audit_logs (id, event_type, actor_ip_hash, resource_id, user_agent) VALUES (?, ?, ?, ?, ?)`
      )
        .bind(
          `audit-${Date.now()}`,
          'CREATE_LISTING',
          ipHash.slice(0, 24),
          cleanId,
          sanitizeText(request.headers.get('User-Agent') || 'unknown', 120)
        )
        .run();
    } catch {
      // Ignore if audit table migration hasn't been applied yet
    }

    return new Response(JSON.stringify({ success: true, id: cleanId }), {
      status: 201,
      headers: getSecurityHeaders(origin)
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Unable to process listing creation' }), {
      status: 500,
      headers: getSecurityHeaders(origin)
    });
  }
}
