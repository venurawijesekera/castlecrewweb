import { getUserIdFromToken } from '../../utils/auth';

export async function onRequest(context) {
    const { env, request } = context;

    const userId = await getUserIdFromToken(request, env);
    if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    try {
        // 1. Verify user is Super Admin and get enterprise_id
        const superAdmin = await env.DB.prepare("SELECT enterprise_id FROM users WHERE id = ? AND role = 'super_admin'")
            .bind(userId).first();

        if (!superAdmin) {
            return new Response(JSON.stringify({ error: "Access Denied: Must be Super Admin" }), { status: 403 });
        }
        const enterpriseId = superAdmin.enterprise_id;

        // 2. Fetch all delegated admins and calculate their managed staff count
        const query = `
            SELECT 
                u.id, 
                u.email, 
                u.full_name AS name, 
                u.created_at AS last_login,
                (SELECT COUNT(id) FROM users WHERE assigned_admin_id = u.id AND role = 'staff') AS staff_managed
            FROM users u
            WHERE u.enterprise_id = ? AND u.role = 'admin'
            ORDER BY u.id DESC
        `;
        
        const admins = await env.DB.prepare(query).bind(enterpriseId).all();
        
        return new Response(JSON.stringify(admins.results), { 
            headers: { "Content-Type": "application/json" } 
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}