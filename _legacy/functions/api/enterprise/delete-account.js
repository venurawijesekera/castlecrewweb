
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

        // Get requesting user (must be super_admin)
        const requester = await env.DB.prepare(`
            SELECT u.id, u.role, u.enterprise_id 
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = ? AND s.expires_at > ?
        `).bind(sessionToken, Date.now()).first();

        if (!requester || requester.role !== 'super_admin' || !requester.enterprise_id) {
            return new Response(JSON.stringify({ error: "Unauthorized: Super Admin access required" }), { status: 403 });
        }

        // Get target user ID from body
        const body = await request.json();
        const { user_id, delete_cards } = body; // delete_cards can be true or false (default true)

        if (!user_id) {
            return new Response(JSON.stringify({ error: "Missing user_id" }), { status: 400 });
        }

        // 2. Verify target user
        const targetUser = await env.DB.prepare("SELECT id, enterprise_id, role FROM users WHERE id = ?").bind(user_id).first();

        if (!targetUser) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        // Security: Ensure target belongs to same enterprise
        if (targetUser.enterprise_id !== requester.enterprise_id) {
            return new Response(JSON.stringify({ error: "Unauthorized: User belongs to another enterprise" }), { status: 403 });
        }

        // Prevent self-deletion
        if (targetUser.id === requester.id) {
            return new Response(JSON.stringify({ error: "Cannot delete your own account" }), { status: 400 });
        }

        // 3. Perform Deletion

        // A. Unassign any staff managed by this user (if they are an admin)
        await env.DB.prepare(`
            UPDATE users SET assigned_admin_id = NULL WHERE assigned_admin_id = ?
        `).bind(targetUser.id).run();

        // B. Delete Sessions
        await env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(targetUser.id).run();

        // C. Handle Cards
        if (delete_cards === false) {
            // Keep cards: Unassign them (user_id = NULL) but strictly set enterprise_id
            await env.DB.prepare(`
                UPDATE cards 
                SET user_id = NULL, enterprise_id = ? 
                WHERE user_id = ?
            `).bind(requester.enterprise_id, targetUser.id).run();
        } else {
            // Default: Delete everything
            await env.DB.prepare("DELETE FROM cards WHERE user_id = ?").bind(targetUser.id).run();
        }

        // D. Delete User
        await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(targetUser.id).run();

        return new Response(JSON.stringify({ success: true, message: "Account deleted." }), { headers: { "Content-Type": "application/json" } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
