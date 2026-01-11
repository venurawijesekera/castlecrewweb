import { getUserIdFromToken, isSystemAdmin, isMasterAuthorized } from '../../utils/auth';

export async function onRequest(context) {
    const { request, env } = context;

    // 1. Authentication Check
    const currentUserId = await getUserIdFromToken(request, env);
    if (!currentUserId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    // Security: The Master Creator Key is required for ALL root administrative functions.
    if (!isMasterAuthorized(request)) {
        return new Response(JSON.stringify({ error: "Forbidden: Master Admin Key Required" }), { status: 403 });
    }

    try {
        // 2. Query including NEW Enterprise Columns
        const query = `
            SELECT 
                users.id, 
                users.email, 
                users.plan, 
                users.created_at, 
                cards.slug,
                cards.avatar_url,
                cards.parent_id,
                cards.id as profile_card_id,
                users.role,           
                users.enterprise_id,
                users.sub_license_count
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