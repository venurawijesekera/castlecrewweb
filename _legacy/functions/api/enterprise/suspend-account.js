
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

        // Get requesting user (Super Admin)
        const requester = await env.DB.prepare(`
            SELECT u.id, u.role, u.enterprise_id 
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = ? AND s.expires_at > ?
        `).bind(sessionToken, Date.now()).first();

        if (!requester || requester.role !== 'super_admin' || !requester.enterprise_id) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
        }

        const body = await request.json();
        const { user_id, action } = body; // action: 'suspend' or 'unsuspend'

        if (!user_id || !action) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        // 2. Verify target user
        const targetUser = await env.DB.prepare("SELECT id, enterprise_id FROM users WHERE id = ?").bind(user_id).first();

        if (!targetUser) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        if (targetUser.enterprise_id !== requester.enterprise_id) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
        if (targetUser.id === requester.id) return new Response(JSON.stringify({ error: "Cannot suspend self" }), { status: 400 });

        // 3. Update Status
        const isSuspended = action === 'suspend' ? 1 : 0;
        await env.DB.prepare("UPDATE users SET is_suspended = ? WHERE id = ?").bind(isSuspended, user_id).run();

        // 4. If suspending, kill active sessions
        if (isSuspended) {
            await env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(user_id).run();
        }

        return new Response(JSON.stringify({ success: true, message: `Account ${action}ed.` }), { headers: { "Content-Type": "application/json" } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
