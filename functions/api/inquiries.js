// ============================================================================
// OPULENT OASIS — OMNICHANNEL INQUIRY ENGINE (D1 + INTERAKT + META CAPI)
// Endpoints:
//   POST  /api/inquiries  -> Public lead capture + Interakt WhatsApp + Meta CAPI Lead
//   GET   /api/inquiries  -> Curator-authenticated CRM inbox
//   PATCH /api/inquiries  -> Curator status update (Confirmed triggers CAPI Purchase + Interakt)
// ============================================================================

const RATE_LIMIT_MAP = new Map();
const WINDOW_MS = 60_000;
const MAX_LEADS_PER_MIN = 15;
const DEFAULT_CURATOR_HASH =
  '457e60590089897c1e7b8293681b6577049a20b56634194a0e9d76294b929a22';

function headers(origin = '*') {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Curator-Token',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
}

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = RATE_LIMIT_MAP.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    RATE_LIMIT_MAP.set(ip, { start: now, count: 1 });
    return true;
  }
  if (entry.count >= MAX_LEADS_PER_MIN) return false;
  entry.count += 1;
  return true;
}

function cleanText(val, max = 200) {
  if (typeof val !== 'string') return '';
  return val
    .replace(/[<>"'`\\]/g, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, max);
}

function parsePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return { countryCode: '+91', phoneNumber: '0000000000' };
  if (digits.length === 10) return { countryCode: '+91', phoneNumber: digits };
  if (digits.startsWith('91') && digits.length === 12) {
    return { countryCode: '+91', phoneNumber: digits.slice(2) };
  }
  const phoneNumber = digits.slice(-10);
  const prefix = digits.slice(0, digits.length - 10) || '91';
  return { countryCode: `+${prefix.slice(0, 4)}`, phoneNumber };
}

async function sha256Hex(str) {
  if (!str) return undefined;
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(String(str).trim().toLowerCase())
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifyCurator(request, env) {
  const token = request.headers.get('X-Curator-Token') || '';
  const expected = env.CURATOR_TOKEN_HASH || DEFAULT_CURATOR_HASH;
  const candidate = token.length === 64 ? token.toLowerCase() : await sha256Hex(token);
  return timingSafeEqual(candidate, expected);
}

async function logAutomation(env, { provider, direction, eventType, referenceId, status, summary, success }) {
  try {
    await env.DB.prepare(`
      INSERT INTO automation_logs (id, provider, direction, event_type, reference_id, http_status, payload_summary, success)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
      .bind(
        `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        provider,
        direction,
        eventType,
        referenceId || '',
        status || 0,
        String(summary || '').slice(0, 950),
        success ? 1 : 0
      )
      .run();
  } catch {
    // Non-blocking audit log
  }
}

async function sendMetaCapiEvent(env, {
  eventName,
  eventId,
  pageUrl,
  email,
  fullPhone,
  clientIp,
  userAgent,
  fbp,
  fbc,
  destination,
  category,
  valueInr
}) {
  if (!env.META_PIXEL_ID || !env.META_CAPI_TOKEN) return { ok: false, skipped: true };

  const userData = {
    client_ip_address: clientIp || undefined,
    client_user_agent: userAgent || undefined,
    fbp: fbp || undefined,
    fbc: fbc || undefined
  };
  if (email) userData.em = [await sha256Hex(email)];
  if (fullPhone && !fullPhone.endsWith('0000000000')) {
    userData.ph = [await sha256Hex(fullPhone.replace(/\D/g, ''))];
  }

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: 'website',
        event_source_url: pageUrl || 'https://opulentoasis.co.in/',
        user_data: userData,
        custom_data: {
          content_name: destination || 'Opulent Oasis',
          content_category: category || 'Stay',
          value: Math.max(0, Number(valueInr || 35000)),
          currency: 'INR'
        }
      }
    ]
  };

  if (env.META_TEST_EVENT_CODE) {
    payload.test_event_code = env.META_TEST_EVENT_CODE;
  }

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${env.META_PIXEL_ID}/events?access_token=${env.META_CAPI_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );
  const text = await res.text();
  await logAutomation(env, {
    provider: 'meta_capi',
    direction: 'outbound',
    eventType: eventName,
    referenceId: eventId,
    status: res.status,
    summary: text,
    success: res.ok
  });
  return { ok: res.ok, status: res.status };
}

async function syncInterakt(env, {
  id,
  name,
  email,
  countryCode,
  phoneNumber,
  destination,
  category,
  utmSource,
  eventName,
  estimatedValueInr,
  dates,
  guests
}) {
  if (!env.INTERAKT_API_KEY || !phoneNumber || phoneNumber === '0000000000') {
    return { ok: false, skipped: true };
  }

  const authHeader = `Basic ${env.INTERAKT_API_KEY}`;

  // 1. Upsert Contact & Tags inside Interakt CRM
  await fetch('https://api.interakt.ai/v1/public/track/users/', {
    method: 'POST',
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: id,
      countryCode,
      phoneNumber,
      traits: {
        name: name || 'Guest',
        email: email || '',
        preferred_destination: destination || 'Alibaug Coast',
        preferred_category: category || 'Stay',
        utm_source: utmSource || 'direct'
      },
      tags: [category || 'Stay', destination || 'OpulentOasis', 'Website_Lead']
    })
  });

  // 2. Fire Interakt Event to trigger automated WhatsApp Ongoing Campaigns
  const evtRes = await fetch('https://api.interakt.ai/v1/public/track/events/', {
    method: 'POST',
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      countryCode,
      phoneNumber,
      event: eventName || 'Oasis_Inquiry_Created',
      traits: {
        destination: destination || 'Alibaug Coast',
        category: category || 'Stay',
        estimated_value: `₹${Number(estimatedValueInr || 35000).toLocaleString('en-IN')}`,
        dates: dates || 'Flexible',
        guests: String(guests || 2)
      }
    })
  });

  const text = await evtRes.text();
  await logAutomation(env, {
    provider: 'interakt',
    direction: 'outbound',
    eventType: eventName || 'Oasis_Inquiry_Created',
    referenceId: id,
    status: evtRes.status,
    summary: text,
    success: evtRes.ok
  });
  return { ok: evtRes.ok, status: evtRes.status };
}

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: headers(request.headers.get('Origin') || '*') });
}

export async function onRequestGet({ request, env }) {
  const origin = request.headers.get('Origin') || '*';
  if (!(await verifyCurator(request, env))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: headers(origin) });
  }
  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'D1 binding missing' }), { status: 500, headers: headers(origin) });
  }

  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 60'
    ).all();
    return new Response(JSON.stringify({ inquiries: results || [] }), {
      status: 200,
      headers: headers(origin)
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to load inquiries' }), {
      status: 500,
      headers: headers(origin)
    });
  }
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin') || '*';
  const clientIp = request.headers.get('CF-Connecting-IP') || 'anonymous';
  const userAgent = request.headers.get('User-Agent') || '';

  if (!checkRateLimit(clientIp)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers: headers(origin) });
  }

  try {
    const body = await request.json();
    if (body.website_trap || body.website_url_trap) {
      return new Response(JSON.stringify({ error: 'Bot rejected' }), { status: 400, headers: headers(origin) });
    }

    const id = `inq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const metaEventId = cleanText(body.metaEventId || id, 120);
    const name = cleanText(body.name || 'Concierge Guest', 120);
    const email = cleanText(body.email || '', 160);
    const { countryCode, phoneNumber } = parsePhone(body.phone);
    const category = ['Stay', 'Tour', 'Trek'].includes(body.category) ? body.category : 'Stay';
    const destination = cleanText(body.destination || 'Alibaug Coast', 120);
    const listingId = cleanText(body.listingId || '', 120);
    const dates = cleanText(body.dates || 'Flexible', 120);
    const nights = Math.max(1, Math.min(60, Number(body.nights || 2)));
    const guests = Math.max(1, Math.min(100, Number(body.guests || 2)));
    const estimatedValueInr = Math.max(0, Number(body.estimatedValueInr || 0));
    const currency = ['INR', 'USD', 'EUR', 'CHF'].includes(body.currency) ? body.currency : 'INR';
    const notes = cleanText(body.notes || '', 1400);

    const allowedChannels = [
      'website',
      'instagram_dm',
      'instagram_comment',
      'facebook_ad',
      'whatsapp_ctwa',
      'whatsapp_organic',
      'referral'
    ];
    let sourceChannel = allowedChannels.includes(body.sourceChannel) ? body.sourceChannel : 'website';
    const utmSource = cleanText(body.utm_source || '', 90);
    const utmMedium = cleanText(body.utm_medium || '', 90);
    const utmCampaign = cleanText(body.utm_campaign || '', 150);
    if (sourceChannel === 'website' && /fb|facebook|meta|ig|instagram/i.test(utmSource)) {
      sourceChannel = 'facebook_ad';
    }

    const fbp = cleanText(body.fbp || '', 150);
    const fbc = cleanText(body.fbc || '', 190);

    if (env.DB) {
      await env.DB.prepare(`
        INSERT INTO inquiries (
          id, name, email, phone, country_code, category, destination, listing_id,
          dates, nights, guests, estimated_value_inr, currency, notes,
          source_channel, utm_source, utm_medium, utm_campaign, fbp, fbc, meta_event_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
        .bind(
          id,
          name,
          email,
          phoneNumber,
          countryCode,
          category,
          destination,
          listingId,
          dates,
          nights,
          guests,
          estimatedValueInr,
          currency,
          notes,
          sourceChannel,
          utmSource,
          utmMedium,
          utmCampaign,
          fbp,
          fbc,
          metaEventId
        )
        .run();
    }

    const [interaktRes, capiRes] = await Promise.all([
      syncInterakt(env, {
        id,
        name,
        email,
        countryCode,
        phoneNumber,
        destination,
        category,
        utmSource,
        eventName: 'Oasis_Inquiry_Created',
        estimatedValueInr,
        dates,
        guests
      }),
      sendMetaCapiEvent(env, {
        eventName: 'Lead',
        eventId: metaEventId,
        pageUrl: body.pageUrl,
        email,
        fullPhone: `${countryCode}${phoneNumber}`,
        clientIp,
        userAgent,
        fbp,
        fbc,
        destination,
        category,
        valueInr: estimatedValueInr
      })
    ]);

    if (env.DB) {
      await env.DB.prepare(
        'UPDATE inquiries SET interakt_synced = ?, capi_synced = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      )
        .bind(interaktRes.ok ? 1 : 0, capiRes.ok ? 1 : 0, id)
        .run();
    }

    return new Response(
      JSON.stringify({
        success: true,
        id,
        metaEventId,
        interaktSynced: Boolean(interaktRes.ok),
        capiSynced: Boolean(capiRes.ok)
      }),
      { status: 201, headers: headers(origin) }
    );
  } catch {
    return new Response(JSON.stringify({ error: 'Unable to record inquiry' }), {
      status: 500,
      headers: headers(origin)
    });
  }
}

export async function onRequestPatch({ request, env }) {
  const origin = request.headers.get('Origin') || '*';
  if (!(await verifyCurator(request, env))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: headers(origin) });
  }
  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'D1 binding missing' }), { status: 500, headers: headers(origin) });
  }

  try {
    const body = await request.json();
    const id = cleanText(body.id, 120);
    const validStatuses = ['New Inquiry', 'Qualified', 'Proposal Sent', 'Confirmed', 'Completed', 'Archived'];
    if (!id || !validStatuses.includes(body.status)) {
      return new Response(JSON.stringify({ error: 'Invalid status payload' }), {
        status: 400,
        headers: headers(origin)
      });
    }

    const existing = await env.DB.prepare('SELECT * FROM inquiries WHERE id = ? LIMIT 1').bind(id).first();
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Inquiry not found' }), {
        status: 404,
        headers: headers(origin)
      });
    }

    await env.DB.prepare(
      'UPDATE inquiries SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    )
      .bind(body.status, id)
      .run();

    let purchaseCapiTriggered = false;
    let interaktConfirmTriggered = false;

    // When a Curator marks a booking as "Confirmed", automatically feed revenue back to Meta CAPI + Interakt
    if (body.status === 'Confirmed' && existing.status !== 'Confirmed') {
      const [capiPurchase, interaktConfirm] = await Promise.all([
        sendMetaCapiEvent(env, {
          eventName: 'Purchase',
          eventId: `purchase-${id}`,
          pageUrl: 'https://opulentoasis.co.in/',
          email: existing.email,
          fullPhone: `${existing.country_code || '+91'}${existing.phone}`,
          fbp: existing.fbp,
          fbc: existing.fbc,
          destination: existing.destination,
          category: existing.category,
          valueInr: existing.estimated_value_inr || 45000
        }),
        syncInterakt(env, {
          id: existing.id,
          name: existing.name,
          email: existing.email,
          countryCode: existing.country_code || '+91',
          phoneNumber: existing.phone,
          destination: existing.destination,
          category: existing.category,
          utmSource: existing.utm_source,
          eventName: 'Oasis_Booking_Confirmed',
          estimatedValueInr: existing.estimated_value_inr,
          dates: existing.dates,
          guests: existing.guests
        })
      ]);
      purchaseCapiTriggered = Boolean(capiPurchase.ok);
      interaktConfirmTriggered = Boolean(interaktConfirm.ok);
    }

    return new Response(
      JSON.stringify({
        success: true,
        id,
        status: body.status,
        purchaseCapiTriggered,
        interaktConfirmTriggered
      }),
      { status: 200, headers: headers(origin) }
    );
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to update inquiry' }), {
      status: 500,
      headers: headers(origin)
    });
  }
}
