// ============================================================================
// OPULENT OASIS — AD-BLOCKER-PROOF FIRST-PARTY EDGE ANALYTICS API
// Endpoints:
//   POST /api/analytics -> Lightweight beacon event ingestion into Cloudflare D1
//   GET  /api/analytics -> Curator-authenticated executive funnel & ROI metrics
// ============================================================================

const DEFAULT_CURATOR_HASH =
'457e60590089897c1e7b8293681b6577049a20b56634194a0e9d76294b929a22';

const ALLOWED_EVENTS = new Set([
	'page_view',
	'globe_stamp_click',
	'category_select',
	'catalog_open',
	'detail_view',
	'estimator_update',
	'currency_switch',
	'wishlist_save',
	'whatsapp_handoff',
	'lead_submitted'
]);

function headers(origin = '*') {
	return {
		'Content-Type': 'application/json; charset=utf-8',
		'Access-Control-Allow-Origin': origin,
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, X-Curator-Token',
		'X-Content-Type-Options': 'nosniff'
	};
}

function clean(v, max = 120) {
	if (typeof v !== 'string') return '';
	return v.replace(/[<>"'`\\]/g, '').trim().slice(0, max);
}

async function sha256Hex(str) {
	const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(str || '')));
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

export async function onRequestOptions({ request }) {
	return new Response(null, { status: 204, headers: headers(request.headers.get('Origin') || '*') });
}

export async function onRequestPost({ request, env }) {
	const origin = request.headers.get('Origin') || '*';
	try {
		const body = await request.json();
		const eventName = clean(body.eventName, 40);
		if (!ALLOWED_EVENTS.has(eventName)) {
			return new Response(JSON.stringify({ error: 'Unsupported event' }), {
				status: 400,
				headers: headers(origin)
			});
		}
		
		if (env.DB) {
			const device = ['mobile', 'tablet', 'desktop'].includes(body.deviceType)
			? body.deviceType
			: 'desktop';
			const countryCode = clean(request.cf?.country || 'IN', 8);
			
			await env.DB.prepare(`
			INSERT INTO analytics_events (
				id, session_id, event_name, category, destination, listing_id,
				value_inr, utm_source, utm_campaign, device_type, country_code
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`)
			.bind(
				`evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
				  clean(body.sessionId || 'anon', 120),
				  eventName,
		 clean(body.category || '', 30),
				  clean(body.destination || '', 110),
				  clean(body.listingId || '', 110),
				  Math.max(0, Number(body.valueInr || 0)),
				  clean(body.utm_source || '', 90),
				  clean(body.utm_campaign || '', 150),
				  device,
		 countryCode
			)
			.run();
		}
		
		return new Response(JSON.stringify({ ok: true }), { status: 202, headers: headers(origin) });
	} catch {
		return new Response(JSON.stringify({ ok: false }), { status: 400, headers: headers(origin) });
	}
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
		const [funnelRes, destRes, channelRes, logsRes] = await Promise.all([
			env.DB.prepare(`
			SELECT event_name, COUNT(*) AS total
			FROM analytics_events
			WHERE created_at >= datetime('now', '-30 days')
			GROUP BY event_name
			`).all(),
																			env.DB.prepare(`
																			SELECT
																			destination,
								  COUNT(CASE WHEN event_name = 'globe_stamp_click' THEN 1 END) AS stamp_clicks,
																						   COUNT(CASE WHEN event_name = 'detail_view' THEN 1 END) AS detail_views,
																						   COUNT(CASE WHEN event_name IN ('lead_submitted', 'whatsapp_handoff') THEN 1 END) AS intents
																						   FROM analytics_events
																						   WHERE destination != '' AND created_at >= datetime('now', '-30 days')
																						   GROUP BY destination
																						   ORDER BY (stamp_clicks + detail_views + intents) DESC
																						   LIMIT 8
																						   `).all(),
																			env.DB.prepare(`
																			SELECT
																			source_channel,
								  COUNT(*) AS total_leads,
																						   SUM(CASE WHEN status = 'Confirmed' THEN 1 ELSE 0 END) AS confirmed_bookings,
																						   ROUND(SUM(estimated_value_inr), 0) AS pipeline_value_inr
																						   FROM inquiries
																						   GROUP BY source_channel
																						   ORDER BY pipeline_value_inr DESC
																						   `).all(),
																			env.DB.prepare(`
																			SELECT provider, direction, event_type, http_status, success, created_at
																			FROM automation_logs
																			ORDER BY created_at DESC
																			LIMIT 12
																			`).all()
		]);
		
		const funnelMap = {};
		(funnelRes.results || []).forEach((r) => {
			funnelMap[r.event_name] = Number(r.total || 0);
		});
		
		return new Response(
			JSON.stringify({
				funnel: funnelMap,
				destinations: destRes.results || [],
				channels: channelRes.results || [],
				recentAutomations: logsRes.results || []
			}),
			{ status: 200, headers: headers(origin) }
		);
	} catch {
		return new Response(JSON.stringify({ error: 'Analytics query failed' }), {
			status: 500,
			headers: headers(origin)
		});
	}
}
