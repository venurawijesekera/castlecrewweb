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

        // 3. Create User - FIX: Explicitly set plan='starter' and role='staff' (Requires columns to exist for new users)
        const result = await env.DB.prepare("INSERT INTO users (email, password, full_name, plan, role) VALUES (?, ?, ?, 'starter', 'staff') RETURNING id")
            .bind(email, password, full_name)
            .first();

        const newUserId = result.id;

        // 4. Create a Default Card
        const slugBase = full_name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const randomSuffix = Math.floor(Math.random() * 10000);
        const slug = `${slugBase}-${randomSuffix}`;

        // Create the card entry
        await env.DB.prepare(`
            INSERT INTO cards (user_id, slug, template_id, full_name, email, job_title, company) 
            VALUES (?, ?, 'signature', ?, ?, 'New Member', 'Castle Cards')
        `).bind(newUserId, slug, full_name, email).run();

        return new Response(JSON.stringify({ success: true, user_id: newUserId }), { 
            headers: { "Content-Type": "application/json" } 
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}