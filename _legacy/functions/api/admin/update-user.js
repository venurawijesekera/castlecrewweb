import { getUserIdFromToken, isSystemAdmin } from '../../utils/auth';

export async function onRequestPost(context) {
    const { request, env } = context;

    // 1. Authentication Check
    const currentUserId = await getUserIdFromToken(request, env);
    if (!currentUserId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    // Security: The Master Creator Key is required for ALL root administrative functions.
    if (!isMasterAuthorized(request)) {
        return new Response(JSON.stringify({ error: "Forbidden: Master Admin Key Required" }), { status: 403 });
    }

    try {
        const body = await request.json();
        // 2. Pull in ALL possible update fields
        const { user_id, plan, role, enterprise_id, action } = body;

        if (!user_id) return new Response(JSON.stringify({ error: "Missing user ID" }), { status: 400 });

        // DELETE ACTION
        if (action === 'delete') {
            await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(user_id).run();
            await env.DB.prepare("DELETE FROM cards WHERE user_id = ?").bind(user_id).run();
            await env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(user_id).run();
            return new Response(JSON.stringify({ success: true, message: "User deleted" }), { headers: { "Content-Type": "application/json" } });
        }

        // UPDATE ACTION (handles plan, role, and enterprise_id)
        if (plan || role || enterprise_id !== undefined) {
            let setClauses = [];
            let bindings = [];

            if (plan) {
                setClauses.push("plan = ?");
                bindings.push(plan);
            }

            if (role) {
                setClauses.push("role = ?");
                bindings.push(role);
            }

            if (enterprise_id !== undefined) {
                setClauses.push("enterprise_id = ?");
                bindings.push(enterprise_id || null); // Converts 0/null to SQL NULL
            }

            if (setClauses.length === 0) {
                return new Response(JSON.stringify({ error: "No update fields specified" }), { status: 400 });
            }

            const query = `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`;
            bindings.push(user_id);

            await env.DB.prepare(query).bind(...bindings).run();

            return new Response(JSON.stringify({ success: true, message: "User updated" }), { headers: { "Content-Type": "application/json" } });
        }

        return new Response(JSON.stringify({ error: "No action specified" }), { status: 400 });

    } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
    }
}