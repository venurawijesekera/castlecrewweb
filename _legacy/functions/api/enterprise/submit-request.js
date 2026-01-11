
import { getUserIdFromToken } from '../../utils/auth';

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        if (!env.DB) throw new Error("Database binding 'DB' is missing");

        // 1. Authentication
        const cookie = request.headers.get("Cookie");
        if (!cookie || !cookie.includes("session_token=")) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }
        const sessionToken = cookie.split("session_token=")[1].split(";")[0];

        const user = await env.DB.prepare(`
            SELECT u.id, u.role, u.enterprise_id 
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = ? AND s.expires_at > ?
        `).bind(sessionToken, Date.now()).first();

        if (!user || !user.enterprise_id || user.role !== 'super_admin') {
            return new Response(JSON.stringify({ error: "Unauthorized: Enterprise Super Admin access required" }), { status: 403 });
        }

        const body = await request.json();
        const { request_type, amount, message } = body;

        if (!request_type || !amount) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        // 2. Insert Request
        await env.DB.prepare(`
            INSERT INTO license_requests (enterprise_id, user_id, request_type, amount, message)
            VALUES (?, ?, ?, ?, ?)
        `).bind(user.enterprise_id, user.id, request_type, amount, message || '').run();

        return new Response(JSON.stringify({ success: true, message: "Request sent successfully" }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
