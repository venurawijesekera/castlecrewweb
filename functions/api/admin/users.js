export async function onRequest(context) {
    const { env } = context;

    try {
        // Fetch all users sorted by newest first
        const users = await env.DB.prepare("SELECT id, email, created_at FROM users ORDER BY id DESC").all();
        
        return new Response(JSON.stringify(users.results), { 
            headers: { "Content-Type": "application/json" } 
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}