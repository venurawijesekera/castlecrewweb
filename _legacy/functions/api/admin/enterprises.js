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
        const query = `
            SELECT 
                e.id, 
                e.name AS company_name, 
                e.license_count, 
                e.sub_license_count,
                e.logo,
                u.email AS super_admin_email,
                (SELECT COUNT(users.id) FROM users LEFT JOIN cards ON users.id = cards.user_id WHERE users.enterprise_id = e.id AND users.role != 'super_admin' AND users.role != 'admin' AND cards.parent_id IS NULL) AS staff_count,
                (SELECT COUNT(users.id) FROM users LEFT JOIN cards ON users.id = cards.user_id WHERE users.enterprise_id = e.id AND cards.parent_id IS NOT NULL) AS active_sub_licenses
            FROM enterprises e
            LEFT JOIN users u ON u.enterprise_id = e.id AND u.role = 'super_admin'
            ORDER BY e.id DESC
        `;

        const enterprises = await env.DB.prepare(query).all();

        return new Response(JSON.stringify(enterprises.results), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}