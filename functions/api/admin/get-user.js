import { getUserIdFromToken } from '../../utils/auth';

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const userIdToFetch = url.searchParams.get("user_id");

    // Auth Check: Ensure the requester is logged in
    const currentUserId = await getUserIdFromToken(request, env);
    if (!currentUserId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    if (!userIdToFetch) {
        return new Response(JSON.stringify({ error: "Missing user_id parameter" }), { status: 400 });
    }

    try {
        // Fetch ALL user data, including new columns
        const query = `
            SELECT id, email, password, full_name, phone, address, plan, role, enterprise_id
            FROM users 
            WHERE id = ?
        `;
        
        const user = await env.DB.prepare(query).bind(userIdToFetch).first();
        
        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }
        
        // Also fetch their card details for context
        const card = await env.DB.prepare("SELECT slug, template_id, avatar_url FROM cards WHERE user_id = ?").bind(userIdToFetch).first();

        // Combine and return
        return new Response(JSON.stringify({ ...user, ...card }), { 
            headers: { "Content-Type": "application/json" } 
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}