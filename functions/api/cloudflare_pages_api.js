export async function onRequestGet(context) {
  try {
    const { env } = context;
    if (!env.DB) {
      return new Response(JSON.stringify({ error: 'Cloudflare D1 database binding not found' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { results } = await env.DB.prepare('SELECT * FROM listings ORDER BY created_at DESC').all();
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();

    if (!env.DB) {
      return new Response(JSON.stringify({ error: 'Cloudflare D1 database binding not found' }), { status: 500 });
    }

    const stmt = env.DB.prepare(`
      INSERT INTO listings (id, name, location_name, country, region, category, sub_type, price, numeric_price, lat, lng, altitude, duration, group_size, terrain_type, base_index, published, image, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    await stmt.bind(
      body.id || `listing-${Date.now()}`,
      body.name,
      body.locationName || body.location_name,
      body.country || 'India',
      body.region || 'Global',
      body.category || 'Stay',
      body.subType || body.sub_type || 'Villa',
      body.price || '₹30,000 / night',
      body.numericPrice || body.numeric_price || 30000,
      body.lat || 19.24,
      body.lng || 72.78,
      body.altitude || '20m ASL',
      body.duration || '2 Nights',
      body.groupSize || body.group_size || 'Up to 8 Guests',
      body.terrainType || body.terrain_type || 'Sanctuary',
      body.baseIndex || body.base_index || 9.2,
      body.published !== false ? 1 : 0,
      body.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      body.description || 'Luxury sanctuary space.'
    ).run();

    return new Response(JSON.stringify({ success: true, id: body.id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
