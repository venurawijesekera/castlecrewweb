
export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        if (!env.DB) throw new Error("Database binding 'DB' is missing");

        // 1. Authentication (Get User & Enterprise from Session)
        const cookie = request.headers.get("Cookie");
        if (!cookie || !cookie.includes("session_token=")) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }
        const sessionToken = cookie.split("session_token=")[1].split(";")[0];

        // Get user and their enterprise_id
        const user = await env.DB.prepare(`
            SELECT u.id, u.role, u.enterprise_id 
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = ? AND s.expires_at > ?
        `).bind(sessionToken, Date.now()).first();

        if (!user || user.role !== 'super_admin' || !user.enterprise_id) {
            return new Response(JSON.stringify({ error: "Unauthorized: Super Admin access required" }), { status: 403 });
        }

        const enterpriseId = user.enterprise_id;
        const body = await request.json();
        const { email, password, name, employee_id } = body;

        if (!email || !password || !name) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        // 2. License Checks
        const enterprise = await env.DB.prepare("SELECT license_count FROM enterprises WHERE id = ?").bind(enterpriseId).first();
        if (enterprise) {
            const userCountResult = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE enterprise_id = ?").bind(enterpriseId).first();
            const userCount = userCountResult ? userCountResult.count : 0;
            if (userCount >= enterprise.license_count) {
                return new Response(JSON.stringify({ error: "Profile license limit reached for this enterprise." }), { status: 403 });
            }
        }

        // 3. Check if user already exists
        const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
        if (existing) {
            return new Response(JSON.stringify({ error: "User with this email already exists" }), { status: 409 });
        }

        // 3. Create User (Role = admin)
        // Note: Assuming 'employee_id' column exists in 'users' table.
        const { results: userInsert } = await env.DB.prepare(`
            INSERT INTO users (email, password, role, enterprise_id, full_name, plan, employee_id)
            VALUES (?, ?, 'admin', ?, ?, 'enterprise', ?)
            RETURNING id
        `).bind(email, password, enterpriseId, name, employee_id || null).run();

        // D1 RETURNING support might vary or return differently in .run(). 
        // If results is empty, we might need a separate query or use uuid.
        // Assuming recently added RETURNING support works or fallback to select.
        // For safety, let's fetch the ID if not returned.
        let newUserId = userInsert && userInsert.length > 0 ? userInsert[0].id : null;

        if (!newUserId) {
            const verify = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
            newUserId = verify.id;
        }

        // 4. Create Default Card
        const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000);
        await env.DB.prepare(`
            INSERT INTO cards (user_id, slug, full_name, email, design)
            VALUES (?, ?, ?, ?, ?)
        `).bind(newUserId, slug, name, email, '{}').run();

        return new Response(JSON.stringify({ success: true, message: "Admin created successfully" }), { headers: { "Content-Type": "application/json" } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
