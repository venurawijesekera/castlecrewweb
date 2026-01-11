
import { getUserIdFromToken, isMasterAuthorized } from '../../utils/auth';

export async function onRequestGet(context) {
    const { request, env } = context;

    try {
        if (!env.DB) throw new Error("Database binding 'DB' is missing");

        // Authentication Check
        const currentUserId = await getUserIdFromToken(request, env);
        if (!currentUserId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

        // Security: The Master Creator Key is required for ALL root administrative functions.
        if (!isMasterAuthorized(request, env)) {
            return new Response(JSON.stringify({ error: "Forbidden: Master Admin Key Required" }), { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const enterpriseId = searchParams.get('enterprise_id');

        if (!enterpriseId) {
            return new Response(JSON.stringify({ error: "Enterprise ID required" }), { status: 400 });
        }

        // Safe Schema Migration: Ensure columns exist
        try {
            const tableInfo = await env.DB.prepare("PRAGMA table_info(support_messages)").all();
            const columns = tableInfo.results.map(c => c.name);

            if (!columns.includes('is_read')) {
                await env.DB.prepare("ALTER TABLE support_messages ADD COLUMN is_read INTEGER DEFAULT 0").run();
            }
            if (!columns.includes('sender_role')) {
                await env.DB.prepare("ALTER TABLE support_messages ADD COLUMN sender_role TEXT DEFAULT 'enterprise_admin'").run();
            }
        } catch (e) {
            // Ignore migration errors if concurrent or already exists
            console.error("Migration warning:", e);
        }

        // 1. Fetch pending license requests
        const requests = await env.DB.prepare(`
            SELECT 
                lr.id, 
                lr.request_type as type, 
                lr.amount, 
                lr.message, 
                lr.created_at, 
                'request' as alert_type 
            FROM license_requests lr
            WHERE lr.enterprise_id = ? AND lr.status = 'pending'
        `).bind(parseInt(enterpriseId)).all();

        // 2. Fetch unread support messages
        const messages = await env.DB.prepare(`
            SELECT 
                id, 
                'message' as type,
                0 as amount,
                message, 
                created_at, 
                'message' as alert_type
            FROM support_messages
            WHERE enterprise_id = ? AND sender_role = 'enterprise_admin' AND (is_read = 0 OR is_read IS NULL)
        `).bind(parseInt(enterpriseId)).all();

        // Combine and sort
        const combined = [...(requests.results || []), ...(messages.results || [])];
        combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        return new Response(JSON.stringify(combined), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
