export async function onRequest(context) {
    const { request, env } = context;

    // Auth Check
    const token = request.headers.get("Authorization");
    if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const session = await env.DB.prepare("SELECT user_id FROM sessions WHERE id = ?").bind(token).first();
    if (!session) return new Response(JSON.stringify({ error: "Invalid Session" }), { status: 401 });

    try {
        // Fetch leads for this user, newest first
        const results = await env.DB.prepare("SELECT * FROM leads WHERE card_user_id = ? ORDER BY id DESC").bind(session.user_id).all();
        return new Response(JSON.stringify(results.results || []), { headers: { "Content-Type": "application/json" } });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}