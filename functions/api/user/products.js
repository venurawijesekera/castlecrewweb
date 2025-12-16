
import { getUserIdFromToken } from '../../utils/auth';

export async function onRequestGet(context) {
    const { request, env } = context;
    try {
        const userId = await getUserIdFromToken(request, env);
        if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

        // Get User and Sub License Count
        const user = await env.DB.prepare("SELECT sub_license_count FROM users WHERE id = ?").bind(userId).first();
        if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

        // Get All Cards
        const { results: cards } = await env.DB.prepare("SELECT * FROM cards WHERE user_id = ? ORDER BY created_at ASC").bind(userId).all();

        return new Response(JSON.stringify({
            sub_license_count: user.sub_license_count || 0,
            cards: cards
        }), { headers: { "Content-Type": "application/json" } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const userId = await getUserIdFromToken(request, env);
        if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

        const body = await request.json();
        const { title, slug } = body;

        // Validation
        if (!title || !slug) return new Response(JSON.stringify({ error: "Title and Slug are required" }), { status: 400 });

        // Check Quota
        const user = await env.DB.prepare("SELECT sub_license_count FROM users WHERE id = ?").bind(userId).first();
        const cardCount = await env.DB.prepare("SELECT COUNT(*) as count FROM cards WHERE user_id = ?").bind(userId).first().then(r => r.count);

        // Assuming the first card is the "Main" card and doesn't count against the "Product" (sub-license) quota.
        // Or if sub_license_count includes the main card? Usually "sub" implies "additional".
        // Let's assume sub_license_count is for ADDITIONAL cards.
        // So allow creation if (cardCount - 1) < sub_license_count.
        // If user has 0 cards (weird), they can create 1. 
        // If user has 1 card (main), cardCount is 1. (1-1) = 0. If quota is 2, 0 < 2, OK.

        const quota = user.sub_license_count || 0;
        // Use logic: Total Cards Allowed = 1 (Main) + Quota
        if (cardCount >= (1 + quota)) {
            return new Response(JSON.stringify({ error: "Quota reached. Limit: " + quota + " product cards." }), { status: 403 });
        }

        // Check Slug Uniqueness
        const existing = await env.DB.prepare("SELECT id FROM cards WHERE slug = ?").bind(slug).first();
        if (existing) return new Response(JSON.stringify({ error: "Slug already taken" }), { status: 400 });

        // Insert
        await env.DB.prepare(`
            INSERT INTO cards (user_id, slug, title, description, company_name, phone, theme, template_id, created_at)
            VALUES (?, ?, ?, 'New Product Card', '', '', 'dark_modern', ?, CURRENT_TIMESTAMP)
        `).bind(userId, slug, title, body.template_id || 'signature').run();

        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
