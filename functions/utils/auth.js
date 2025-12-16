// This utility is located in functions/utils/auth.js

export async function getUserIdFromToken(request, env) {
    // 1. Check the Cookie header (Standard web authentication method)
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return null;

    // Split the cookie header to find the session_token
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const sessionCookie = cookies.find(c => c.startsWith('session_token='));
    
    if (!sessionCookie) return null;
    
    // Extract the token value
    const token = sessionCookie.split('=')[1];
    if (!token) return null;

    // 2. Query D1 to find the active session and user ID
    try {
        // This query requires the 'expires_at' column, which we confirmed exists.
        const query = `
            SELECT user_id 
            FROM sessions 
            WHERE id = ? AND expires_at > ?
        `;
        
        const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
        
        const session = await env.DB.prepare(query).bind(token, now).first();

        // 3. Return the user ID if the session is valid
        return session ? session.user_id : null;

    } catch (e) {
        console.error("Auth utility error:", e);
        return null;
    }
}