
export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        if (!env.DB) throw new Error("Database binding 'DB' is missing");

        // 1. Authentication (Get User & Enterprise from Session)
        const cookie = request.headers.get("Cookie");
        if (!cookie || !cookie.includes("session_token=")) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }
        const sessionToken = cookie.split("session_token=")[1].split(";")[0];

        const requester = await env.DB.prepare(`
            SELECT u.id, u.role, u.enterprise_id 
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = ? AND s.expires_at > ?
        `).bind(sessionToken, Date.now()).first();

        if (!requester || (requester.role !== 'super_admin' && requester.role !== 'admin') || !requester.enterprise_id) {
            return new Response(JSON.stringify({ error: "Unauthorized: Admin access required" }), { status: 403 });
        }

        const body = await request.json();
        const { card_id, new_user_id } = body;

        if (!card_id || !new_user_id) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        // 2. Verify Card Ownership (Enterprise)
        const card = await env.DB.prepare("SELECT id, enterprise_id FROM cards WHERE id = ?").bind(card_id).first();

        if (!card) return new Response(JSON.stringify({ error: "Card not found" }), { status: 404 });

        // Security check: If card has enterprise_id, must match. If not (legacy), we rely on orphan logic.
        // But orphan logic in dashboard checks enterprise_id. So it must match.
        if (card.enterprise_id && card.enterprise_id !== requester.enterprise_id) {
            return new Response(JSON.stringify({ error: "Unauthorized: Card belongs to another enterprise" }), { status: 403 });
        }

        // 3. Verify Target User
        const targetUser = await env.DB.prepare("SELECT id, enterprise_id FROM users WHERE id = ?").bind(new_user_id).first();
        if (!targetUser) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        if (targetUser.enterprise_id !== requester.enterprise_id) return new Response(JSON.stringify({ error: "Unauthorized: Target user in diff enterprise" }), { status: 403 });

        // 4. Find Target User's Main Card (to set as parent if this is a product card)
        const mainCard = await env.DB.prepare("SELECT id FROM cards WHERE user_id = ? ORDER BY created_at ASC LIMIT 1").bind(new_user_id).first();
        const parentId = mainCard ? mainCard.id : null;

        // 5. Update Card
        await env.DB.prepare("UPDATE cards SET user_id = ?, parent_id = ? WHERE id = ?")
            .bind(new_user_id, parentId, card_id)
            .run();

        return new Response(JSON.stringify({ success: true, message: "Card reassigned successfully." }), { headers: { "Content-Type": "application/json" } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
