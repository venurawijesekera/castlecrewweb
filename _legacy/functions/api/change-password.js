export async function onRequestPost(context) {
    const { request, env } = context;

    const token = request.headers.get("Authorization");
    if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const session = await env.DB.prepare("SELECT user_id FROM sessions WHERE id = ?").bind(token).first();
    if (!session) return new Response(JSON.stringify({ error: "Invalid Session" }), { status: 401 });

    const { current_password, new_password } = await request.json();

    if (!current_password || !new_password) {
        return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    // 1. Verify Current Password
    const user = await env.DB.prepare("SELECT password FROM users WHERE id = ?").bind(session.user_id).first();
    
    // Note: In production, use bcrypt.compare here. Since we are using plain text for now:
    if (user.password !== current_password) {
        return new Response(JSON.stringify({ error: "Incorrect current password" }), { status: 403 });
    }

    // 2. Update Password
    await env.DB.prepare("UPDATE users SET password = ? WHERE id = ?").bind(new_password, session.user_id).run();

    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
}