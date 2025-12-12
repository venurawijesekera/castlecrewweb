export async function onRequest(context) {
    const { env } = context;

    try {
        // Fetch users + their chosen slug from the cards table
        const query = `
            SELECT users.id, users.email, users.plan, users.created_at, cards.slug 
            FROM users 
            LEFT JOIN cards ON users.id = cards.user_id 
            ORDER BY users.id DESC
        `;
        
        const users = await env.DB.prepare(query).all();
        
        return new Response(JSON.stringify(users.results), { 
            headers: { "Content-Type": "application/json" } 
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}