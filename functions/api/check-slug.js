export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");

    if (!slug) return new Response(JSON.stringify({ error: "No slug" }), { status: 400 });

    try {
        // Check if slug exists in DB
        const existing = await env.DB.prepare("SELECT id FROM cards WHERE slug = ?").bind(slug).first();

        return new Response(JSON.stringify({ 
            available: !existing, 
            slug: slug 
        }), { headers: { "Content-Type": "application/json" } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}