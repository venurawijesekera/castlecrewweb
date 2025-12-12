export async function onRequest(context) {
    const { env, params } = context;
    const slug = params.slug; 

    if (!slug) return new Response("No slug provided", { status: 400 });

    try {
        const card = await env.DB.prepare("SELECT * FROM cards WHERE slug = ?").bind(slug).first();

        if (!card) {
            return new Response(JSON.stringify({ error: "Card not found" }), { 
                status: 404,
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify(card), {
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}