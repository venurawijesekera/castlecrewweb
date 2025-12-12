export async function onRequest(context) {
    const { request, env } = context;

    const token = request.headers.get("Authorization");
    if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const session = await env.DB.prepare("SELECT user_id FROM sessions WHERE id = ?").bind(token).first();
    if (!session) return new Response(JSON.stringify({ error: "Invalid Session" }), { status: 401 });

    try {
        const userId = session.user_id;

        // 1. Count Visits
        const visits = await env.DB.prepare("SELECT COUNT(*) as count FROM analytics WHERE card_user_id = ? AND type = 'visit'").bind(userId).first();
        
        // 2. Count Saves
        const saves = await env.DB.prepare("SELECT COUNT(*) as count FROM analytics WHERE card_user_id = ? AND type = 'save'").bind(userId).first();
        
        // 3. Count Calls
        const calls = await env.DB.prepare("SELECT COUNT(*) as count FROM analytics WHERE card_user_id = ? AND type = 'call'").bind(userId).first();

        // 4. Count Exchanges (From Leads Table)
        const exchanges = await env.DB.prepare("SELECT COUNT(*) as count FROM leads WHERE card_user_id = ?").bind(userId).first();

        return new Response(JSON.stringify({
            visits: visits.count,
            saves: saves.count,
            calls: calls.count,
            exchanges: exchanges.count
        }), { headers: { "Content-Type": "application/json" } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}