import { getUserIdFromToken } from '../../utils/auth';

export async function onRequest(context) {
    const { env, request } = context;

    const adminId = await getUserIdFromToken(request, env);
    if (!adminId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    try {
        // 1. Verify user is a Delegated Admin
        const adminUser = await env.DB.prepare("SELECT enterprise_id FROM users WHERE id = ? AND role = 'admin'")
            .bind(adminId).first();

        if (!adminUser) {
            return new Response(JSON.stringify({ error: "Access Denied: Must be Delegated Admin" }), { status: 403 });
        }
        
        // 2. Fetch all staff users assigned to this admin, along with their card details
        const query = `
            SELECT 
                u.id, 
                u.email, 
                u.full_name AS name, 
                c.slug,
                u.created_at AS last_activity 
            FROM users u
            LEFT JOIN cards c ON c.user_id = u.id
            WHERE u.assigned_admin_id = ? AND u.role = 'staff'
            ORDER BY u.id ASC
        `;
        
        const staffUsers = await env.DB.prepare(query).bind(adminId).all();
        
        return new Response(JSON.stringify(staffUsers.results), { 
            headers: { "Content-Type": "application/json" } 
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}