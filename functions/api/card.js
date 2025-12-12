export async function onRequest(context) {
    const { request, env } = context;

    const token = request.headers.get("Authorization");
    if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const session = await env.DB.prepare("SELECT user_id FROM sessions WHERE id = ?").bind(token).first();
    if (!session) return new Response(JSON.stringify({ error: "Invalid Session" }), { status: 401 });
    
    const userId = session.user_id;

    if (request.method === "GET") {
        // UPDATED QUERY: Added 'users.created_at'
        const query = `
            SELECT cards.*, users.plan, users.created_at 
            FROM cards 
            LEFT JOIN users ON cards.user_id = users.id 
            WHERE cards.user_id = ?
        `;
        const data = await env.DB.prepare(query).bind(userId).first();
        return new Response(JSON.stringify(data || {}), { headers: { "Content-Type": "application/json" } });
    }

    if (request.method === "POST") {
        const body = await request.json();
        try {
            await env.DB.prepare(`
                UPDATE cards SET 
                full_name = ?, job_title = ?, company = ?, bio = ?,
                email = ?, phone = ?, website = ?,
                slug = ?, template_id = ?,
                socials = ?, phones = ?, emails = ?,
                avatar_url = ?, design = ?
                WHERE user_id = ?
            `).bind(
                body.full_name, body.job_title, body.company, body.bio,
                body.email, body.phone, body.website,
                body.slug, body.template_id,
                JSON.stringify(body.socials || {}),
                JSON.stringify(body.phones || []),
                JSON.stringify(body.emails || []),
                body.avatar_url,
                JSON.stringify(body.design || {}),
                userId
            ).run();
            return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
        } catch (e) {
            return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
        }
    }
}