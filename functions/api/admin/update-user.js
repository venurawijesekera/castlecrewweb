export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { user_id, plan, action } = body;

        // 1. DELETE USER ACTION
        if (action === 'delete') {
            await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(user_id).run();
            await env.DB.prepare("DELETE FROM cards WHERE user_id = ?").bind(user_id).run();
            await env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(user_id).run();
            return new Response(JSON.stringify({ success: true, message: "User deleted" }), { headers: { "Content-Type": "application/json" } });
        }

        // 2. UPDATE PLAN ACTION
        if (plan) {
            await env.DB.prepare("UPDATE users SET plan = ? WHERE id = ?")
                .bind(plan, user_id)
                .run();
            
            return new Response(JSON.stringify({ success: true, message: "Plan updated" }), { headers: { "Content-Type": "application/json" } });
        }

        return new Response(JSON.stringify({ error: "No action specified" }), { status: 400 });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}