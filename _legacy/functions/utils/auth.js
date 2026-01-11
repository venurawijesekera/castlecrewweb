// This utility is located in functions/utils/auth.js

export async function getUserIdFromToken(request, env) {
    let token;

    // 1. Check the Cookie header
    const cookieHeader = request.headers.get('Cookie');
    if (cookieHeader) {
        const cookies = cookieHeader.split(';').map(c => c.trim());
        const sessionCookie = cookies.find(c => c.startsWith('session_token='));
        if (sessionCookie) token = sessionCookie.split('=')[1];
    }

    // 2. Check Authorization Header (Bearer or plain)
    if (!token) {
        const authHeader = request.headers.get('Authorization');
        if (authHeader) token = authHeader.replace('Bearer ', '').trim();
    }

    if (!token) return null;

    // 2. Query D1 to find the active session and user ID
    try {
        // This query requires the 'expires_at' column, which we confirmed exists.
        const query = `
            SELECT user_id 
            FROM sessions 
            WHERE id = ? AND expires_at > ?
        `;

        const now = Date.now(); // Current timestamp in milliseconds

        const session = await env.DB.prepare(query).bind(token, now).first();

        // 3. Return the user ID if the session is valid
        return session ? session.user_id : null;

    } catch (e) {
        console.error("Auth utility error:", e);
        return null;
    }
}

/**
 * Checks if a user is a System (Global) Administrator.
 * A system admin must have an admin/super_admin role AND no enterprise_id.
 */
export async function isSystemAdmin(userId, env) {
    if (!userId) return false;
    try {
        const user = await env.DB.prepare("SELECT role, enterprise_id FROM users WHERE id = ?")
            .bind(userId)
            .first();
        if (!user) return false;

        // Site Founders/Admins should have enterprise_id NULL.
        // The project currently uses 'staff' role for many global accounts.
        return (user.role === 'admin' || user.role === 'super_admin' || user.role === 'staff') && user.enterprise_id === null;
    } catch (e) {
        return false;
    }
}

/**
 * Secondary security layer for System Control Center.
 * Checks for a Master Key provided via headers or query.
 */
export function isMasterAuthorized(request, env) {
    // Priority: 1. Environment Variable, 2. Fallback hardcoded key
    const masterKey = (env && env.MASTER_ADMIN_KEY) || "CastleAdmin99";

    const headerKey = request.headers.get('X-Admin-Master-Key');
    const url = new URL(request.url);
    const queryKey = url.searchParams.get('master_key');

    return (headerKey === masterKey || queryKey === masterKey);
}
