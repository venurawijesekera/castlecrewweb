import { getUserIdFromToken, isSystemAdmin, isMasterAuthorized } from '../../utils/auth';

export async function onRequestPost(context) {
    const { request, env } = context;

    // 1. Authentication Check
    const currentUserId = await getUserIdFromToken(request, env);
    if (!currentUserId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    // Security: The Master Creator Key is required for ALL root administrative functions.
    if (!isMasterAuthorized(request)) {
        return new Response(JSON.stringify({ error: "Forbidden: Master Admin Key Required" }), { status: 403 });
    }

    try {
        const body = await request.json();
        const { enterprise_id, license_count, sub_license_count } = body;

        if (!enterprise_id) return new Response(JSON.stringify({ error: "Missing enterprise_id" }), { status: 400 });

        // Update Enterprise Quotas
        await env.DB.prepare(`
            UPDATE enterprises 
            SET license_count = ?, sub_license_count = ?
            WHERE id = ?
        `).bind(license_count, sub_license_count, enterprise_id).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
