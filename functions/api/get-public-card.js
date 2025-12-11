export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    
    // In the future, we can grab ?id=1 or ?slug=venura
    // For now, we will just load the main admin user (ID: 1)
    const userId = 1;

    try {
        const card = await env.DB.prepare("SELECT * FROM cards WHERE user_id = ?").bind(userId).first();
        
        if (!card) {
            return new Response(JSON.stringify({ error: "Card not found" }), { status: 404 });
        }

        // Return the public data
        return new Response(JSON.stringify(card), { 
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" // Allow any phone to read this
            } 
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}