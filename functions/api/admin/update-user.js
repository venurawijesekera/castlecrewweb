import { getUserIdFromToken } from '../../utils/auth';

export async function onRequestPost(context) {
    const { request, env } = context;

    const currentUserId = await getUserIdFromToken(request, env);
    if (!currentUserId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    
    try {
        const body = await request.json();
        const { user_id, plan, role, enterprise_id, action } = body;

        if (!user_id) return new Response(JSON.stringify({ error: "Missing user ID" }), { status: 400 });

        // 1. DELETE USER ACTION
        if (action === 'delete') {
            await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(user_id).run();
            await env.DB.prepare("DELETE FROM cards WHERE user_id = ?").bind(user_id).run();
            await env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(user_id).run();
            return new Response(JSON.stringify({ success: true, message: "User deleted" }), { headers: { "Content-Type": "application/json" } });
        }

        // 2. UPDATE PLAN/ROLE/ENTERPRISE_ID ACTION
        if (plan || role || enterprise_id !== undefined) {
            let setClauses = [];
            let bindings = [];

            if (plan) {
                setClauses.push("plan = ?");
                bindings.push(plan);
            }
            
            // NEW: Allow Admin to change the user's role
            if (role) {
                setClauses.push("role = ?");
                bindings.push(role);
            }
            
            // NEW: Allow Admin to change the user's enterprise membership
            if (enterprise_id !== undefined) {
                setClauses.push("enterprise_id = ?");
                // If enterprise_id is null/0, set it to NULL in the database
                bindings.push(enterprise_id || null); 
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
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}