import { getUserIdFromToken } from '../../utils/auth';

export async function onRequest(context) {
    const { request, env } = context;

    // 1. Authentication Check (Will now work due to fixed login.js/auth.js)
    const currentUserId = await getUserIdFromToken(request, env);
    if (!currentUserId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    try {
        // 2. Query including NEW Enterprise Columns
        const query = `
            SELECT 
                users.id, 
                users.email, 
                users.plan, 
                users.created_at, 
                cards.slug,
                users.role,           
                users.enterprise_id   
            FROM users 
            LEFT JOIN cards ON users.id = cards.user_id 
            ORDER BY users.id DESC
        `;
        
        const users = await env.DB.prepare(query).all();
        
        return new Response(JSON.stringify(users.results), { 
            headers: { "Content-Type": "application/json" } 
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}