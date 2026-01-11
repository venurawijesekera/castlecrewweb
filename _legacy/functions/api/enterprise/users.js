import { getUserIdFromToken } from '../../utils/auth';

export async function onRequest(context) {
    const { request, env } = context;

    const userId = await getUserIdFromToken(request, env);
    if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    try {
        // 1. Get the Enterprise ID associated with the current Admin/Super Admin
        const enterprise = await env.DB.prepare("SELECT enterprise_id FROM users WHERE id = ?")
            .bind(userId).first();

        if (!enterprise || !enterprise.enterprise_id) {
            return new Response(JSON.stringify({ error: "User is not part of an Enterprise" }), { status: 403 });
        }
        const enterpriseId = enterprise.enterprise_id;

        // 2. Fetch all users and their card slug/template in this Enterprise
        const query = `
            SELECT 
                u.id, 
                u.email, 
                u.full_name AS name, 
                u.role,
                c.slug
            FROM users u
            LEFT JOIN cards c ON c.user_id = u.id
            WHERE u.enterprise_id = ?
            ORDER BY u.role DESC, u.id ASC
        `;
        
        const users = await env.DB.prepare(query).bind(enterpriseId).all();

        // Separate Admins and Staff for the response (if necessary, though the frontend combines them)
        const admins = users.results.filter(u => u.role === 'admin');
        const staff = users.results.filter(u => u.role === 'staff');
        const superAdmin = users.results.find(u => u.role === 'super_admin');

        return new Response(JSON.stringify({ 
            super_admin: superAdmin, 
            admins: admins, 
            staff: staff 
        }), { 
            headers: { "Content-Type": "application/json" } 
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}