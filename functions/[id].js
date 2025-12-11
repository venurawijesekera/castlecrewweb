export async function onRequest(context) {
    const { request, env, params } = context;
    const slug = params.id;

    // 1. IGNORE SYSTEM FILES
    // If the URL is for an image, css, or api, let it pass through normal routing
    if (slug.includes('.') || slug === 'api' || slug === 'admin' || slug === 'assets') {
        return context.next();
    }

    try {
        // 2. LOOK UP USER IN DATABASE
        const card = await env.DB.prepare("SELECT template_id FROM cards WHERE slug = ?").bind(slug).first();

        // If user doesn't exist, return 404 (or redirect to home)
        if (!card) {
            return new Response("User not found", { status: 404 });
        }

        // 3. DETERMINE WHICH HTML FILE TO SERVE
        let templateFile = "/card.html"; // Default
        
        if (card.template_id === "realestate") templateFile = "/theme-realestate.html";
        if (card.template_id === "creative")   templateFile = "/theme-creative.html";
        if (card.template_id === "minimal")    templateFile = "/theme-minimal.html";

        // 4. SERVE THE FILE (REWRITE)
        // This loads the HTML file content but keeps the URL as /venura
        const url = new URL(request.url);
        const assetUrl = new URL(templateFile, url.origin);
        
        return env.ASSETS.fetch(assetUrl);

    } catch (e) {
        return new Response("System Error: " + e.message, { status: 500 });
    }
}