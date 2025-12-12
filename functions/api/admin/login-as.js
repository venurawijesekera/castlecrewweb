export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const body = await request.json();
        const { user_id } = body;

        if (!user_id) return new Response("Missing ID", { status: 400 });

        // Generate a new Session Token for this user
        const token = crypto.randomUUID();

        // Insert into DB
        await env.DB.prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)")
            .bind(token, user_id, Date.now() + 86400000) // 24 hours
            .run();

        // Return the token to the Admin frontend
        return new Response(JSON.stringify({ success: true, token: token }), { 
            headers: { "Content-Type": "application/json" } 
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}