export async function onRequest(context) {
    const { request, env } = context;

    // 1. Authenticate the User
    const token = request.headers.get("Authorization");
    if (!token) {
        return new Response(JSON.stringify({ error: "Not logged in" }), { status: 401 });
    }

    // Find user ID from the session token
    const session = await env.DB.prepare("SELECT user_id FROM sessions WHERE id = ?").bind(token).first();
    if (!session) {
        return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401 });
    }

    const userId = session.user_id;

    // --- HANDLE GET REQUEST (Load Data) ---
    if (request.method === "GET") {
        const card = await env.DB.prepare("SELECT * FROM cards WHERE user_id = ?").bind(userId).first();
        return new Response(JSON.stringify(card || {}), { headers: { "Content-Type": "application/json" } });
    }

    // --- HANDLE POST REQUEST (Save Data) ---
    if (request.method === "POST") {
        const body = await request.json();
        
        // Update the card in the database
        await env.DB.prepare(`
            UPDATE cards SET 
            full_name = ?, job_title = ?, company = ?, bio = ?,
            email = ?, phone = ?, website = ?
            WHERE user_id = ?
        `).bind(
            body.full_name, body.job_title, body.company, body.bio,
            body.email, body.phone, body.website,
            userId
        ).run();

        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    }

    return new Response("Method not allowed", { status: 405 });
}