// ============================================================================
// OPULENT OASIS — INTERAKT INBOUND WEBHOOK (WHATSAPP API + INSTAGRAM DM)
// Configure in Interakt -> Developer Settings -> Webhooks:
//   https://opulentoasis.co.in/api/webhooks/interakt?secret=YOUR_WEBHOOK_SECRET
// ============================================================================

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

function sanitize(v, max = 160) {
  if (typeof v !== 'string') return '';
  return v.replace(/[<>"'`\\]/g, '').trim().slice(0, max);
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const challenge = url.searchParams.get('hub.challenge');
  const secret = url.searchParams.get('secret') || url.searchParams.get('hub.verify_token');

  if (env.WEBHOOK_SECRET && secret !== env.WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }
  if (challenge) {
    return new Response(challenge, { status: 200 });
  }
  return jsonResponse({ status: 'Opulent Oasis Interakt Webhook Active' });
}

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const providedSecret =
    url.searchParams.get('secret') || request.headers.get('X-Webhook-Secret') || '';

  if (env.WEBHOOK_SECRET && providedSecret !== env.WEBHOOK_SECRET) {
    return jsonResponse({ error: 'Unauthorized webhook secret' }, 401);
  }

  try {
    const payload = await request.json();
    const eventType = sanitize(payload.type || payload.event || 'unknown', 80);
    const customer = payload.data?.customer || payload.customer || {};
    const messageText = sanitize(
      payload.data?.message?.message || payload.data?.message?.text || '',
      600
    );
    const rawPhone = String(customer.phone_number || customer.phoneNumber || '').replace(/\D/g, '');
    const phone = rawPhone.slice(-10) || sanitize(customer.id || 'ig-guest', 30);
    const channelHint = String(
      payload.data?.message?.channel || payload.channel || ''
    ).toLowerCase();

    let sourceChannel = 'whatsapp_organic';
    if (channelHint.includes('instagram') && eventType.includes('comment')) {
      sourceChannel = 'instagram_comment';
    } else if (channelHint.includes('instagram')) {
      sourceChannel = 'instagram_dm';
    } else if (payload.data?.message?.referral || payload.data?.referral) {
      sourceChannel = 'whatsapp_ctwa';
    }

    if (env.DB) {
      // 1. Record observability log
      await env.DB.prepare(`
        INSERT INTO automation_logs (id, provider, direction, event_type, reference_id, http_status, payload_summary, success)
        VALUES (?, ?, 'inbound', ?, ?, 200, ?, 1)
      `)
        .bind(
          `wh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          sourceChannel.startsWith('instagram') ? 'instagram_webhook' : 'interakt',
          eventType,
          phone,
          JSON.stringify(payload).slice(0, 950)
        )
        .run();

      // 2. Auto-capture new inbound WhatsApp / Instagram leads into D1 `inquiries`
      if (/message_received|comment|lead/i.test(eventType) && phone) {
        const existing = await env.DB.prepare(
          'SELECT id FROM inquiries WHERE phone = ? LIMIT 1'
        )
          .bind(phone)
          .first();

        if (!existing) {
          const guestName = sanitize(
            customer.traits?.name || customer.name || 'Social Concierge Guest',
            120
          );

          // Auto-detect destination keyword in inbound DM / WhatsApp text
          let detectedDest = 'Inbound Social Concierge';
          if (/alibaug|mandwa/i.test(messageText)) detectedDest = 'Alibaug Coast';
          else if (/gorai/i.test(messageText)) detectedDest = 'Gorai Sanctuary';
          else if (/sahyadri|kokankada/i.test(messageText)) detectedDest = 'Sahyadri Crest';
          else if (/spiti/i.test(messageText)) detectedDest = 'Spiti Valley';
          else if (/bhutan|paro/i.test(messageText)) detectedDest = 'Paro Valley';
          else if (/zermatt|swiss|alps/i.test(messageText)) detectedDest = 'Zermatt Alps';

          let detectedCategory = 'Stay';
          if (/trek|climb|hike/i.test(messageText)) detectedCategory = 'Trek';
          else if (/tour|yacht|heli/i.test(messageText)) detectedCategory = 'Tour';

          await env.DB.prepare(`
            INSERT INTO inquiries (
              id, name, phone, country_code, category, destination, notes,
              source_channel, interakt_synced, interakt_user_id, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 'New Inquiry')
          `)
            .bind(
              `soc-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
              guestName,
              phone,
              sanitize(customer.country_code || '+91', 8),
              detectedCategory,
              detectedDest,
              messageText || 'Inbound social message via Interakt',
              sourceChannel,
              sanitize(customer.id || '', 120)
            )
            .run();
        }
      }
    }

    return jsonResponse({ received: true, eventType, sourceChannel });
  } catch {
    return jsonResponse({ error: 'Webhook processing failed' }, 500);
  }
}
