export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { email, password } = body;

        if (!env.DB) {
            throw new Error("Database binding 'DB' is missing!");
        }

        // 1. Check Database - Use SELECT * to retrieve all available columns
        const user = await env.DB.prepare("SELECT * FROM users WHERE email = ? AND password = ?")
            .bind(email, password)
            .first();

        if (!user) {
            return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
        }

        if (user.is_suspended) {
            return new Response(JSON.stringify({ error: "Account Suspended. Please contact support." }), { status: 403 });
        }

        // 2. Create Session Token
        const token = crypto.randomUUID(); // Use standard crypto.randomUUID

        // Note: D1 uses seconds for expiry, but JS Date.now() is milliseconds.
        // We use milliseconds here because your original code did, but be mindful of units.
        const expires_at_ms = Date.now() + 86400000; // 24 hours in milliseconds

        await env.DB.prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)")
            .bind(token, user.id, expires_at_ms)
            .run();

        // 3. Prepare Response Data
        const responseData = {
            success: true,
            token: token,
            user_id: user.id,
            role: user.role || 'staff',
            enterprise_id: user.enterprise_id || null
        };

        // --- CRITICAL FIX: Set the session_token cookie ---
        const headers = {
            "Content-Type": "application/json",
            // Set session_token cookie: Expires in 24 hours (86400 seconds)
            "Set-Cookie": `session_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
        };

        return new Response(JSON.stringify(responseData), {
            headers: headers
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}