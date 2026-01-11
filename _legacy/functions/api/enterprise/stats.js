import { getUserIdFromToken } from '../../utils/auth';

export async function onRequest(context) {
    const { request, env } = context;

    const userId = await getUserIdFromToken(request, env);
    if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    try {
        // 1. Get the Enterprise ID associated with this Super Admin
        const enterprise = await env.DB.prepare("SELECT enterprise_id FROM users WHERE id = ? AND role = 'super_admin'")
            .bind(userId).first();

        if (!enterprise) {
            return new Response(JSON.stringify({ error: "Not a Super Admin" }), { status: 403 });
        }
        const enterpriseId = enterprise.enterprise_id;

        // 2. Get the list of ALL user IDs belonging to this Enterprise
        const users = await env.DB.prepare("SELECT id FROM users WHERE enterprise_id = ?").bind(enterpriseId).all();
        const enterpriseUserIds = users.results.map(u => u.id);

        if (enterpriseUserIds.length === 0) {
            return new Response(JSON.stringify({ active_staff_count: 0, total_views: 0, total_leads: 0 }), { headers: { "Content-Type": "application/json" } });
        }
        
        const idPlaceholders = enterpriseUserIds.map(() => '?').join(', ');

        // 3. Calculate Stats for all users in the Enterprise
        const queries = [
            // Active Staff Count (All users in enterprise that have a card/slug set)
            env.DB.prepare(`SELECT COUNT(cards.user_id) AS count FROM cards LEFT JOIN users ON cards.user_id = users.id WHERE users.enterprise_id = ?`).bind(enterpriseId),
            
            // Total Card Visits (Analytics for all users in the enterprise)
            env.DB.prepare(`SELECT COUNT(*) AS count FROM analytics WHERE card_user_id IN (${idPlaceholders}) AND type = 'visit'`).bind(...enterpriseUserIds),

            // Total Leads/Exchanges (Leads for all users in the enterprise)
            env.DB.prepare(`SELECT COUNT(*) AS count FROM leads WHERE card_user_id IN (${idPlaceholders})`).bind(...enterpriseUserIds),
        ];

        const [activeStaffRes, totalViewsRes, totalLeadsRes] = await env.DB.batch(queries);

        return new Response(JSON.stringify({
            active_staff_count: activeStaffRes.results[0].count,
            total_views: totalViewsRes.results[0].count,
            total_leads: totalLeadsRes.results[0].count
        }), { headers: { "Content-Type": "application/json" } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}