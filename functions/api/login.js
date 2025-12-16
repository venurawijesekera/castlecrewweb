export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { email, password } = body;

        if (!env.DB) {
            throw new Error("Database binding 'DB' is missing!");
        }

        // 2. Check Database - FIX: Use SELECT * to retrieve all available columns (plan, role, enterprise_id) safely
        const user = await env.DB.prepare("SELECT * FROM users WHERE email = ? AND password = ?")
            .bind(email, password)
            .first();

        if (!user) {
            return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
        }

        // 3. Create Session
        const token = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });

        await env.DB.prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)")
            .bind(token, user.id, Date.now() + 86400000)
            .run();

        // 4. Return Success - FIX: Safely return role and enterprise_id (they might be null if the column is missing in the DB, but the frontend logic needs them)
        return new Response(JSON.stringify({ 
            success: true, 
            token: token,
            user_id: user.id,
            role: user.role || 'staff', // Default role if the column is still missing
            enterprise_id: user.enterprise_id || null
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}