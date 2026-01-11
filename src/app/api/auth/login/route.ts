import { getDB } from "@/lib/runtime";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
    try {
        const db = getDB();
        const body = await request.json();
        const { email, password } = body as any;

        if (!email || !password) {
            return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
        }

        // 1. Check Database
        const user: any = await db.prepare("SELECT * FROM users WHERE email = ? AND password = ?")
            .bind(email, password)
            .first();

        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        if (user.is_suspended) {
            return NextResponse.json({ error: "Account Suspended. Please contact support." }, { status: 403 });
        }

        // 2. Create Session Token
        const token = crypto.randomUUID();
        // 24 hours in milliseconds
        const expires_at_ms = Date.now() + 86400000;

        await db.prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)")
            .bind(token, user.id, expires_at_ms)
            .run();

        // 3. Prepare Response
        const responseData = {
            success: true,
            token: token,
            user_id: user.id,
            role: user.role || 'staff',
            enterprise_id: user.enterprise_id || null
        };

        const response = NextResponse.json(responseData);

        // Set cookie
        response.cookies.set("session_token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
            maxAge: 86400, // seconds
        });

        return response;

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
