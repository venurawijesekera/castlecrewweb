
import { getUserIdFromToken } from '../../utils/auth';

export async function onRequestGet(context) {
    const { request, env } = context;
    try {
        const userId = await getUserIdFromToken(request, env);
        if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

        // Get User and Sub License Count
        const user = await env.DB.prepare("SELECT sub_license_count, enterprise_id FROM users WHERE id = ?").bind(userId).first();
        if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

        // Get All Cards
        const { results: cards } = await env.DB.prepare("SELECT * FROM cards WHERE user_id = ? ORDER BY created_at ASC").bind(userId).all();

        // Get Enterprise Data if applicable
        let enterpriseInfo = null;
        if (user.enterprise_id) {
            const enterprise = await env.DB.prepare("SELECT sub_license_count FROM enterprises WHERE id = ?").bind(user.enterprise_id).first();
            const usedResult = await env.DB.prepare("SELECT COUNT(*) as count FROM cards WHERE enterprise_id = ? AND parent_id IS NOT NULL").bind(user.enterprise_id).first();
            if (enterprise) {
                enterpriseInfo = {
                    total: enterprise.sub_license_count,
                    used: usedResult ? usedResult.count : 0
                };
            }
        }

        return new Response(JSON.stringify({
            sub_license_count: user.sub_license_count || 0,
            cards: cards,
            enterprise: enterpriseInfo
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

        // Check Quota and Get Enterprise ID
        const user = await env.DB.prepare("SELECT sub_license_count, enterprise_id FROM users WHERE id = ?").bind(userId).first();
        if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

        const cardCountResult = await env.DB.prepare("SELECT COUNT(*) as count FROM cards WHERE user_id = ?").bind(userId).first();
        const cardCount = cardCountResult ? cardCountResult.count : 0;

        const quota = user.sub_license_count || 0;
        // logic: Total Cards Allowed = 1 (Main) + Quota
        if (cardCount >= (1 + quota)) {
            return new Response(JSON.stringify({ error: "Quota reached. Limit: " + quota + " product cards." }), { status: 403 });
        }

        // Enterprise-wide Limit Check
        if (user.enterprise_id) {
            const enterprise = await env.DB.prepare("SELECT sub_license_count FROM enterprises WHERE id = ?").bind(user.enterprise_id).first();
            if (enterprise) {
                const totalEnterpriseCardsResult = await env.DB.prepare("SELECT COUNT(*) as count FROM cards WHERE enterprise_id = ? AND parent_id IS NOT NULL").bind(user.enterprise_id).first();
                const totalEnterpriseCards = totalEnterpriseCardsResult ? totalEnterpriseCardsResult.count : 0;

                if (totalEnterpriseCards >= enterprise.sub_license_count) {
                    return new Response(JSON.stringify({ error: "Enterprise sub-license limit reached. Please contact your administrator." }), { status: 403 });
                }
            }
        }

        // Check Slug Uniqueness
        const existing = await env.DB.prepare("SELECT id FROM cards WHERE slug = ?").bind(slug).first();
        if (existing) return new Response(JSON.stringify({ error: "Slug already taken" }), { status: 400 });

        // Get Main Card ID to set as Parent
        const mainCard = await env.DB.prepare("SELECT id FROM cards WHERE user_id = ? ORDER BY created_at ASC LIMIT 1").bind(userId).first();
        const parentId = mainCard ? mainCard.id : null;

        // Insert
        // Mapped title to full_name and description to bio for wider system compatibility
        await env.DB.prepare(`
            INSERT INTO cards (user_id, slug, full_name, bio, title, description, company, phone, template_id, created_at, parent_id, enterprise_id)
            VALUES (?, ?, ?, 'New Product Card', ?, 'New Product Card', '', '', ?, CURRENT_TIMESTAMP, ?, ?)
        `).bind(userId, slug, title, title, body.template_id || 'signature', parentId, user.enterprise_id || null).run();

        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}

export async function onRequestDelete(context) {
    const { request, env } = context;
    try {
        const userId = await getUserIdFromToken(request, env);
        if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

        const url = new URL(request.url);
        const slug = url.searchParams.get('slug');

        if (!slug) return new Response(JSON.stringify({ error: "Slug required" }), { status: 400 });

        // Delete (Ensure user owns it)
        const res = await env.DB.prepare(`DELETE FROM cards WHERE user_id = ? AND slug = ?`).bind(userId, slug).run();

        if (res.meta.changes === 0) {
            return new Response(JSON.stringify({ error: "Card not found or could not be deleted" }), { status: 404 });
        }

        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
