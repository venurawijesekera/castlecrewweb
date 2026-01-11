import { getUserIdFromToken, isSystemAdmin, isMasterAuthorized } from '../../utils/auth';

export async function onRequest(context) {
    const { request, env } = context;
    const currentUserId = await getUserIdFromToken(request, env);
    if (!currentUserId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    try {
        // 1. Get user details
        const user = await env.DB.prepare("SELECT id, role, enterprise_id, full_name, email FROM users WHERE id = ?").bind(currentUserId).first();
        if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

        const url = new URL(request.url);
        const enterpriseIdFromQuery = url.searchParams.get("enterprise_id");

        // 2. Identify System Admin Status
        // The Master Key is the absolute authority for System Admin / Support actions.
        const isMaster = isMasterAuthorized(request);
        let isSystemAdminContext = isMaster;

        let targetEnterpriseId;

        if (isSystemAdminContext) {
            if (!enterpriseIdFromQuery) {
                targetEnterpriseId = user.enterprise_id;
                if (!targetEnterpriseId) {
                    return new Response(JSON.stringify({ error: "enterprise_id required for system admins" }), { status: 400 });
                }
                // If they have an enterprise_id but didn't specify a target, they are viewing their OWN dash as an admin.
                isSystemAdminContext = false;
            } else {
                targetEnterpriseId = enterpriseIdFromQuery;
            }

            // SECURITY: Only System Admins (either global or via Master Key) can message other enterprises.
            if (!isMaster && parseInt(targetEnterpriseId) !== user.enterprise_id) {
                return new Response(JSON.stringify({ error: "Forbidden: Cannot access other enterprise messages" }), { status: 403 });
            }
        } else if (user.enterprise_id) {
            targetEnterpriseId = user.enterprise_id;
        } else {
            return new Response(JSON.stringify({ error: "Forbidden: No enterprise scope" }), { status: 403 });
        }

        if (request.method === "GET") {
            // Mark as read if System Admin is viewing
            if (isSystemAdminContext && url.searchParams.get("view_as") === "support") {
                await env.DB.prepare(`
                    UPDATE support_messages 
                    SET is_read = 1 
                    WHERE enterprise_id = ? AND sender_role = 'enterprise_admin' AND is_read = 0
                `).bind(targetEnterpriseId).run();
            }

            const { results: messages } = await env.DB.prepare(`
                SELECT sm.*, u.full_name as sender_name
                FROM support_messages sm
                JOIN users u ON sm.sender_id = u.id
                WHERE sm.enterprise_id = ?
                ORDER BY sm.created_at ASC
            `).bind(targetEnterpriseId).all();
            return new Response(JSON.stringify(messages), { status: 200 });
        }

        if (request.method === "POST") {
            const body = await request.json();
            const { message } = body;
            if (!message) return new Response(JSON.stringify({ error: "Message is empty" }), { status: 400 });

            // Final role determination
            const senderRole = isSystemAdminContext ? 'system_admin' : 'enterprise_admin';

            await env.DB.prepare(`
                INSERT INTO support_messages (enterprise_id, sender_id, sender_role, message)
                VALUES (?, ?, ?, ?)
            `).bind(targetEnterpriseId, currentUserId, senderRole, message).run();

            return new Response(JSON.stringify({ success: true }), { status: 201 });
        }

        return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });

    } catch (e) {
        console.error("Messaging API Error:", e);
        return new Response(JSON.stringify({ error: "Internal Server Error", details: e.message }), { status: 500 });
    }
}
