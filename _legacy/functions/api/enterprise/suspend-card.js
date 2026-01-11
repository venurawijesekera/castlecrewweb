export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        if (!env.DB) throw new Error("Database binding 'DB' is missing");

        // 1. Authentication
        const cookie = request.headers.get("Cookie");
        if (!cookie || !cookie.includes("session_token=")) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }
        const sessionToken = cookie.split("session_token=")[1].split(";")[0];

        const user = await env.DB.prepare(`
            SELECT u.id, u.role, u.enterprise_id
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = ? AND s.expires_at > ?
        `).bind(sessionToken, Date.now()).first();

        if (!user || !user.enterprise_id || (user.role !== 'super_admin' && user.role !== 'admin')) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
        }

        const body = await request.json();
        const { card_id, action } = body;

        if (!card_id || !action) {
            return new Response(JSON.stringify({ error: "Card ID and Action are required" }), { status: 400 });
        }

        // 2. Verify Card Ownership
        const card = await env.DB.prepare("SELECT id FROM cards WHERE id = ? AND enterprise_id = ?").bind(card_id, user.enterprise_id).first();
        if (!card) {
            return new Response(JSON.stringify({ error: "Card not found or access denied" }), { status: 404 });
        }

        // 3. Suspend/Reactivate
        const isSuspended = action === 'suspend' ? 1 : 0;
        await env.DB.prepare("UPDATE cards SET is_suspended = ? WHERE id = ?").bind(isSuspended, card_id).run();

        return new Response(JSON.stringify({ success: true, is_suspended: isSuspended }), { headers: { 'Content-Type': 'application/json' } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
