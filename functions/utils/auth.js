export async function getUserIdFromToken(request, env) {
    const token = request.headers.get("Authorization");
    if (!token) return null;
    // Assuming your session table uses the token as the ID field
    const session = await env.DB.prepare("SELECT user_id FROM sessions WHERE id = ?").bind(token).first();
    return session ? session.user_id : null;
}