import { NextRequest } from "next/server";
import { getDB } from "./runtime";

export async function getUserIdFromToken(request: NextRequest): Promise<number | null> {
    let token: string | undefined;

    // 1. Check Cookie
    const cookieToken = request.cookies.get("session_token");
    if (cookieToken) {
        token = cookieToken.value;
    }

    // 2. Check Authorization Header
    if (!token) {
        const authHeader = request.headers.get("Authorization");
        if (authHeader) {
            token = authHeader.replace("Bearer ", "").trim();
        }
    }

    if (!token) return null;

    try {
        const db = getDB();
        const now = Date.now();

        // Note: D1 prepare/bind might need explicit casting if types are strict, 
        // but standard usage usually infers.
        const session: any = await db.prepare(`
        SELECT user_id 
        FROM sessions 
        WHERE id = ? AND expires_at > ?
    `).bind(token, now).first();

        return session ? (session.user_id as number) : null;
    } catch (e) {
        console.error("Auth utility error:", e);
        return null;
    }
}
