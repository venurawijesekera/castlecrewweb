export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();
    const { slug, type } = body; // type = 'visit', 'save', 'call'

    if (!slug || !type) return new Response("Missing data", { status: 400 });

    try {
        // 1. Find User ID based on Slug
        const card = await env.DB.prepare("SELECT user_id FROM cards WHERE slug = ?").bind(slug).first();
        
        if (card) {
            // 2. Record Event
            await env.DB.prepare("INSERT INTO analytics (card_user_id, type) VALUES (?, ?)")
                .bind(card.user_id, type)
                .run();
        }

        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}