import { getUserIdFromToken } from '../utils/auth';

export async function onRequest(context) {
    const { request, env } = context;

    // Use the central utility for auth
    const userId = await getUserIdFromToken(request, env);
    if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    
    if (request.method === "GET") {
        // SAFE QUERY: Uses the original simple JOIN to get card and plan data,
        // without relying on the yet-to-be-created 'enterprises' table or 'role' column.
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
    
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
}