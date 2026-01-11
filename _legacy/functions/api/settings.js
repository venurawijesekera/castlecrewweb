import { getUserIdFromToken } from '../utils/auth';

export async function onRequest(context) {
    const { request, env } = context;

    // Use the central utility for auth
    const userId = await getUserIdFromToken(request, env);
    if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    
    // --- GET SETTINGS ---
    if (request.method === "GET") {
        // Fetch user details (excluding password)
        const user = await env.DB.prepare("SELECT id, email, full_name, phone, address, shipping_info FROM users WHERE id = ?").bind(userId).first();
        return new Response(JSON.stringify(user || {}), { headers: { "Content-Type": "application/json" } });
    }

    // --- SAVE SETTINGS (POST) ---
    if (request.method === "POST") {
        const body = await request.json();
        
        try {
            await env.DB.prepare(`
                UPDATE users SET 
                full_name = ?, phone = ?, address = ?, shipping_info = ?, email = ?
                WHERE id = ?
            `).bind(
                body.full_name, 
                body.phone, 
                body.address, 
                JSON.stringify(body.shipping_info || {}), 
                body.email,
                userId
            ).run();

            return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });

        } catch (e) {
            return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
        }
    }
}