export async function onRequest(context) {
    const { env } = context;

    // Handle OPTIONS request for CORS preflight
    if (context.request.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            status: 204, // No Content
        });
    }

    try {
        // 1. Query D1 for a random sample of up to 8 distinct avatar_urls
        // We ensure avatar_url is not empty/null and use RANDOM() for a shuffle effect.
        const { results } = await env.DB.prepare(
            "SELECT DISTINCT avatar_url FROM cards WHERE avatar_url IS NOT NULL AND LENGTH(avatar_url) > 5 ORDER BY RANDOM() LIMIT 8"
        ).all();

        // 2. Extract just the URLs into a simple array
        const avatarUrls = results.map(row => row.avatar_url);

        // 3. Return the array as JSON
        return new Response(JSON.stringify(avatarUrls), {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
            },
            status: 200,
        });

    } catch (e) {
        console.error("D1 Error fetching random avatars:", e);
        return new Response(JSON.stringify({ error: "Database error fetching avatars." }), {
            headers: { "Content-Type": "application/json" },
            status: 500,
        });
    }
}