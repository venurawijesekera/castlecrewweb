export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // Log that we received a request
        console.log("Login Request Received");

        // 1. Get data
        const body = await request.json();
        const { email, password } = body;
        console.log("Attempting login for:", email);

        // Check if DB is connected
        if (!env.DB) {
            throw new Error("Database binding 'DB' is missing!");
        }

        // 2. Check Database
        const user = await env.DB.prepare("SELECT * FROM users WHERE email = ? AND password = ?")
            .bind(email, password)
            .first();

        console.log("User found:", user);

        if (!user) {
            return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
        }

        // 3. Create Session (Manual UUID to be safe)
        const token = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });

        console.log("Generated Token:", token);

        await env.DB.prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)")
            .bind(token, user.id, Date.now() + 86400000)
            .run();

        console.log("Session Saved. Returning success.");

        // 4. Return Success
        return new Response(JSON.stringify({ 
            success: true, 
            token: token,
            user_id: user.id 
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        // PRINT THE ERROR TO THE TERMINAL
        console.error("LOGIN ERROR:", e.message);
        console.error(e.stack);
        
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}