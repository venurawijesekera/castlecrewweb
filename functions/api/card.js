export async function onRequest(context) {
    const { request, env } = context;

    // 1. Authenticate the User
    const token = request.headers.get("Authorization");
    if (!token) {
        return new Response(JSON.stringify({ error: "Not logged in" }), { 
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    // Find user ID from the session token
    const session = await env.DB.prepare("SELECT user_id FROM sessions WHERE id = ?").bind(token).first();
    if (!session) {
        return new Response(JSON.stringify({ error: "Invalid session" }), { 
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    const userId = session.user_id;

    // --- HANDLE GET REQUEST (Load Data) ---
    if (request.method === "GET") {
        const card = await env.DB.prepare("SELECT * FROM cards WHERE user_id = ?").bind(userId).first();
        return new Response(JSON.stringify(card || {}), { headers: { "Content-Type": "application/json" } });
    }

    // --- HANDLE POST REQUEST (Save Data) ---
    if (request.method === "POST") {
        try {
            const body = await request.json();
            
            // Basic validation for Slug (only lowercase, numbers, and hyphens)
            const cleanSlug = body.slug ? body.slug.toLowerCase().replace(/[^a-z0-9-]/g, '') : null;

            if (!cleanSlug) {
                return new Response(JSON.stringify({ error: "Invalid Username/Url" }), { status: 400 });
            }

            // Update the card in the database
            // Note: If 'slug' is already taken by ANOTHER user, this will throw a constraint error
            await env.DB.prepare(`
                UPDATE cards SET 
                full_name = ?, job_title = ?, company = ?, bio = ?,
                email = ?, phone = ?, website = ?,
                slug = ?, template_id = ?
                WHERE user_id = ?
            `).bind(
                body.full_name, body.job_title, body.company, body.bio,
                body.email, body.phone, body.website,
                cleanSlug, body.template_id,
                userId
            ).run();

            return new Response(JSON.stringify({ success: true, slug: cleanSlug }), { 
                headers: { "Content-Type": "application/json" } 
            });

        } catch (e) {
            // Check for Unique Constraint Violation (SQLite error)
            if (e.message.includes("UNIQUE constraint failed") || e.message.includes("constraint")) {
                 return new Response(JSON.stringify({ error: "This username is already taken. Please choose another." }), { 
                    status: 409, // Conflict status code
                    headers: { "Content-Type": "application/json" } 
                });
            }

            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
    }

    return new Response("Method not allowed", { status: 405 });
}