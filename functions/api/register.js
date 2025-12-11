export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { email, password, full_name } = body;

        // 1. Validation
        if (!email || !password || !full_name) {
            return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
        }

        // 2. Check if email already exists
        const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
        if (existing) {
            return new Response(JSON.stringify({ error: "Email already taken" }), { status: 409 });
        }

        // 3. Create User
        // Note: In production, we MUST hash passwords (e.g., bcrypt). For now, we store plain text as per previous steps.
        const result = await env.DB.prepare("INSERT INTO users (email, password) VALUES (?, ?) RETURNING id")
            .bind(email, password)
            .first();

        const newUserId = result.id;

        // 4. Create a Default Card for them
        // We create a "slug" from their name (e.g., "Venura Wijesekera" -> "venura-wijesekera")
        const slug = full_name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000);

        await env.DB.prepare(`
            INSERT INTO cards (user_id, slug, template_id, full_name, email, job_title, company) 
            VALUES (?, ?, 'executive', ?, ?, 'New Member', 'Castle Cards')
        `).bind(newUserId, slug, full_name, email).run();

        return new Response(JSON.stringify({ success: true, user_id: newUserId }), { 
            headers: { "Content-Type": "application/json" } 
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}