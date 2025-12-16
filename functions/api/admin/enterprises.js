// /api/admin/enterprises.js

export async function onRequest(context) {
    const { env } = context;

    try {
        const query = `
            SELECT 
                e.id, 
                e.name AS company_name, 
                e.license_count, 
                u.email AS super_admin_email,
                (SELECT COUNT(id) FROM users WHERE enterprise_id = e.id AND role != 'super_admin' AND role != 'admin') AS staff_count
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