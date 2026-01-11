import { getUserIdFromToken, isSystemAdmin, isMasterAuthorized } from '../../utils/auth';

export async function onRequestPost(context) {
    const { request, env } = context;

    // 1. Authentication Check
    const currentUserId = await getUserIdFromToken(request, env);
    if (!currentUserId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    // Security: The Master Creator Key is required for ALL root administrative functions.
    if (!isMasterAuthorized(request)) {
        return new Response(JSON.stringify({ error: "Forbidden: Master Admin Key Required" }), { status: 403 });
    }

    try {
        const body = await request.json();
        const { user_id } = body;

        if (!user_id) return new Response("Missing ID", { status: 400 });

        // Generate a new Session Token for this user
        const token = crypto.randomUUID();

        // Insert into DB
        await env.DB.prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)")
            .bind(token, user_id, Date.now() + 86400000) // 24 hours
            .run();

        // Return the token to the Admin frontend
        return new Response(JSON.stringify({ success: true, token: token }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}