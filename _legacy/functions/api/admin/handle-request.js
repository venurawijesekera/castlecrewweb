
import { getUserIdFromToken, isMasterAuthorized } from '../../utils/auth';

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        if (!env.DB) throw new Error("Database binding 'DB' is missing");

        // 1. Authentication
        const currentUserId = await getUserIdFromToken(request, env);
        if (!currentUserId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

        // 2. Security Check
        if (!isMasterAuthorized(request, env)) {
            return new Response(JSON.stringify({ error: "Forbidden: Master Admin Key Required" }), { status: 403 });
        }

        const body = await request.json();
        const { request_id, action } = body;

        if (!request_id || !action) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        // Fetch the request
        const req = await env.DB.prepare(`
            SELECT * FROM license_requests WHERE id = ?
        `).bind(request_id).first();

        if (!req) {
            return new Response(JSON.stringify({ error: "Request not found" }), { status: 404 });
        }

        if (req.status !== 'pending') {
            return new Response(JSON.stringify({ error: "Request already handled" }), { status: 400 });
        }

        if (action === 'approve') {
            // Fetch current enterprise limits
            const enterprise = await env.DB.prepare(`
                SELECT license_count, sub_license_count FROM enterprises WHERE id = ?
            `).bind(req.enterprise_id).first();

            if (!enterprise) {
                return new Response(JSON.stringify({ error: "Enterprise not found" }), { status: 404 });
            }

            let newLicenseCount = enterprise.license_count;
            let newSubLicenseCount = enterprise.sub_license_count;

            if (req.request_type === 'profile') {
                newLicenseCount += req.amount;
            } else if (req.request_type === 'sub') {
                newSubLicenseCount += req.amount;
            }

            // Update enterprise limits
            await env.DB.prepare(`
                UPDATE enterprises 
                SET license_count = ?, sub_license_count = ?
                WHERE id = ?
            `).bind(newLicenseCount, newSubLicenseCount, req.enterprise_id).run();

            // Mark as approved
            await env.DB.prepare(`
                UPDATE license_requests SET status = 'approved' WHERE id = ?
            `).bind(request_id).run();

            return new Response(JSON.stringify({ success: true, message: "Request approved and licenses updated" }), {
                headers: { "Content-Type": "application/json" }
            });

        } else if (action === 'reject') {
            // Mark as rejected
            await env.DB.prepare(`
                UPDATE license_requests SET status = 'rejected' WHERE id = ?
            `).bind(request_id).run();

            return new Response(JSON.stringify({ success: true, message: "Request rejected" }), {
                headers: { "Content-Type": "application/json" }
            });
        } else {
            return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });
        }

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
