export async function onRequest(context) {
    const { request, env, params } = context;
    const slug = params.id;

    // 1. DEFINE SYSTEM PAGES (Reserved Words)
    // These are your actual HTML files. We must prevent the router from looking them up in the DB.
    const systemPages = [
        'login', 'register', 'dashboard', 'editor', 'admin', 
        'pricing', 'order', 'index', 'card', 'assets', 'api'
    ];

    // 2. IGNORE SYSTEM FILES & EXTENSIONS
    // If it has a dot (like image.png or style.css) OR is in the list above, let it pass.
    if (slug.includes('.') || systemPages.includes(slug)) {
        return context.next();
    }

    try {
        // 3. LOOK UP USER IN DATABASE
        const card = await env.DB.prepare("SELECT template_id FROM cards WHERE slug = ?").bind(slug).first();

        // If user doesn't exist, return 404
        if (!card) {
            return new Response("User not found", { status: 404 });
        }

        // 4. DETERMINE WHICH HTML FILE TO SERVE
        let templateFile = "/card.html"; // Default
        
        if (card.template_id === "realestate") templateFile = "/theme-realestate.html";
        if (card.template_id === "creative")   templateFile = "/theme-creative.html";
        if (card.template_id === "minimal")    templateFile = "/theme-minimal.html";

        // 5. SERVE THE FILE (REWRITE)
        const url = new URL(request.url);
        const assetUrl = new URL(templateFile, url.origin);
        
        return env.ASSETS.fetch(assetUrl);

    } catch (e) {
        return new Response("System Error: " + e.message, { status: 500 });
    }
}