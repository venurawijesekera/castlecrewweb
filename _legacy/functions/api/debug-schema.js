
export async function onRequest(context) {
    const { env } = context;
    try {
        const result = await env.DB.prepare("PRAGMA table_info(support_messages)").all();
        return new Response(JSON.stringify(result.results), { headers: { "Content-Type": "application/json" } });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
