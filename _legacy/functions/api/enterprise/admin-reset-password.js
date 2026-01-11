
export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        if (!env.DB) throw new Error("Database binding 'DB' is missing");

        // 1. Authentication & Authorization
        const cookie = request.headers.get("Cookie");
        if (!cookie || !cookie.includes("session_token=")) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }
        const sessionToken = cookie.split("session_token=")[1].split(";")[0];

        const adminUser = await env.DB.prepare(`
            SELECT u.id, u.role, u.enterprise_id 
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = ? AND s.expires_at > ?
        `).bind(sessionToken, Date.now()).first();

        if (!adminUser || !adminUser.enterprise_id || adminUser.role !== 'super_admin') {
            return new Response(JSON.stringify({ error: "Unauthorized: Super Admin access required" }), { status: 403 });
        }

        // 2. Parse Request
        const body = await request.json();
        const { user_id } = body;

        if (!user_id) {
            return new Response(JSON.stringify({ error: "User ID is required" }), { status: 400 });
        }

        // 3. Verify target user belongs to enterprise
        const targetUser = await env.DB.prepare("SELECT id, enterprise_id FROM users WHERE id = ?").bind(user_id).first();

        if (!targetUser || targetUser.enterprise_id !== adminUser.enterprise_id) {
            return new Response(JSON.stringify({ error: "User not found or not in your enterprise" }), { status: 404 });
        }

        // 4. Reset Password
        const newPassword = Math.random().toString(36).slice(-8);

        // In a real app, you might want to hash this. 
        // Assuming current implementation stores plain text or frontend handles hashing? 
        // Based on create-staff.js, it inserts the password directly.
        await env.DB.prepare("UPDATE users SET password = ? WHERE id = ?").bind(newPassword, user_id).run();

        return new Response(JSON.stringify({
            success: true,
            message: "Password reset successfully",
            new_password: newPassword
        }), { headers: { "Content-Type": "application/json" } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
