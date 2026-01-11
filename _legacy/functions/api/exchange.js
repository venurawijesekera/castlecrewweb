export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();
    const { slug, name, phone, email = null, message = "" } = body;

    if (!slug || !name || !phone) {
        return new Response(JSON.stringify({ error: "Name and Phone are required" }), { status: 400 });
    }

    try {
        // 1. Find the owner of the card based on the slug
        const owner = await env.DB.prepare("SELECT user_id FROM cards WHERE slug = ?").bind(slug).first();

        if (!owner) {
            return new Response(JSON.stringify({ error: "Card owner not found" }), { status: 404 });
        }

        // 2. Save the Lead (with Lazy Migration)
        try {
            await env.DB.prepare("INSERT INTO leads (card_user_id, name, phone, email, message, card_slug) VALUES (?, ?, ?, ?, ?, ?)")
                .bind(owner.user_id, name, phone, email, message, slug)
                .run();
        } catch (dbError) {
            // Check if error is due to missing column
            const msg = dbError.message || "";
            if (msg.includes('card_slug') || msg.includes('no such column')) {
                // Auto-Migrate
                try {
                    await env.DB.prepare("ALTER TABLE leads ADD COLUMN card_slug TEXT").run();
                } catch (migErr) { console.log("Migration Info: " + migErr.message); }

                // Retry Insert
                await env.DB.prepare("INSERT INTO leads (card_user_id, name, phone, email, message, card_slug) VALUES (?, ?, ?, ?, ?, ?)")
                    .bind(owner.user_id, name, phone, email, message, slug)
                    .run();
            } else {
                throw dbError; // Re-throw if other error
            }
        }

        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}