import { getUserIdFromToken } from '../../utils/auth';

export async function onRequest(context) {
    const { request, env } = context;

    const adminId = await getUserIdFromToken(request, env);
    if (!adminId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    try {
        // 1. Verify user is a Delegated Admin and get their enterprise_id
        const adminUser = await env.DB.prepare("SELECT enterprise_id FROM users WHERE id = ? AND role = 'admin'")
            .bind(adminId).first();

        if (!adminUser) {
            return new Response(JSON.stringify({ error: "Access Denied: Must be Delegated Admin" }), { status: 403 });
        }
        
        // 2. Get list of staff users managed by this admin
        const managedStaff = await env.DB.prepare("SELECT id FROM users WHERE assigned_admin_id = ? AND role = 'staff'")
            .bind(adminId).all();
            
        const staffIds = managedStaff.results.map(u => u.id);
        const staffCount = staffIds.length;

        if (staffCount === 0) {
            return new Response(JSON.stringify({ managed_staff_count: 0, team_views: 0, team_leads: 0 }), { headers: { "Content-Type": "application/json" } });
        }
        
        const idPlaceholders = staffIds.map(() => '?').join(', ');

        // 3. Calculate Stats for the managed team
        const queries = [
            // Total Card Visits
            env.DB.prepare(`SELECT COUNT(*) AS count FROM analytics WHERE card_user_id IN (${idPlaceholders}) AND type = 'visit'`).bind(...staffIds),

            // Total Leads/Exchanges
            env.DB.prepare(`SELECT COUNT(*) AS count FROM leads WHERE card_user_id IN (${idPlaceholders})`).bind(...staffIds),
        ];

        const [totalViewsRes, totalLeadsRes] = await env.DB.batch(queries);

        return new Response(JSON.stringify({
            managed_staff_count: staffCount,
            team_views: totalViewsRes.results[0].count,
            team_leads: totalLeadsRes.results[0].count
        }), { headers: { "Content-Type": "application/json" } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}