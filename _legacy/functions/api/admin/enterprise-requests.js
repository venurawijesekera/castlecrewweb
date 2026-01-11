
import { getUserIdFromToken, isMasterAuthorized } from '../../utils/auth';

export async function onRequestGet(context) {
    const { request, env } = context;

    try {
        if (!env.DB) throw new Error("Database binding 'DB' is missing");

        // Authentication Check
        const currentUserId = await getUserIdFromToken(request, env);
        if (!currentUserId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

        // Security Check
        if (!isMasterAuthorized(request, env)) {
            return new Response(JSON.stringify({ error: "Forbidden: Master Admin Key Required" }), { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const enterpriseId = searchParams.get('enterprise_id');

        if (!enterpriseId) {
            return new Response(JSON.stringify({ error: "Enterprise ID required" }), { status: 400 });
        }

        // Fetch all requests for this enterprise
        const requests = await env.DB.prepare(`
            SELECT lr.id, lr.request_type, lr.amount, lr.message, lr.status, lr.created_at, u.email as requester_email, u.full_name as requester_name
            FROM license_requests lr
            JOIN users u ON lr.user_id = u.id
            WHERE lr.enterprise_id = ?
            ORDER BY lr.created_at DESC
        `).bind(parseInt(enterpriseId)).all();

        return new Response(JSON.stringify(requests.results), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
