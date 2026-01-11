export async function onRequest(context) {
    const { env, params } = context;
    const slug = params.slug;

    if (!slug) return new Response("No slug provided", { status: 400 });

    try {
        // Join with users and enterprises to get the logo if it exists
        const card = await env.DB.prepare(`
            SELECT cards.*, enterprises.logo as enterprise_logo 
            FROM cards 
            LEFT JOIN users ON cards.user_id = users.id 
            LEFT JOIN enterprises ON users.enterprise_id = enterprises.id 
            WHERE TRIM(cards.slug) = ? COLLATE NOCASE
        `).bind(slug.trim()).first();

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