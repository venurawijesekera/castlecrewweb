export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();
    const { slug, name, phone, email, message } = body;

    if (!slug || !name || !phone) {
        return new Response(JSON.stringify({ error: "Name and Phone are required" }), { status: 400 });
    }

    try {
        // 1. Find the owner of the card based on the slug
        const owner = await env.DB.prepare("SELECT user_id FROM cards WHERE slug = ?").bind(slug).first();
        
        if (!owner) {
            return new Response(JSON.stringify({ error: "Card owner not found" }), { status: 404 });
        }

        // 2. Save the Lead
        await env.DB.prepare("INSERT INTO leads (card_user_id, name, phone, email, message) VALUES (?, ?, ?, ?, ?)")
            .bind(owner.user_id, name, phone, email, message)
            .run();

        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}