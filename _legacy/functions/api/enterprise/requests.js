
export async function onRequestGet(context) {
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

        // Check for enterprise_id and super_admin role
        if (!user || !user.enterprise_id || user.role !== 'super_admin') {
            return new Response(JSON.stringify({ error: "Unauthorized: Enterprise Super Admin access required" }), { status: 403 });
        }

        // 2. Fetch Requests
        const requests = await env.DB.prepare(`
            SELECT id, request_type, amount, message, status, created_at
            FROM license_requests
            WHERE enterprise_id = ?
            ORDER BY created_at DESC
        `).bind(user.enterprise_id).all();

        return new Response(JSON.stringify(requests.results), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
