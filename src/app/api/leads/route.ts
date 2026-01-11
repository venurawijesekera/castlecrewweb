import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/runtime";

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const token = request.headers.get("Authorization");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDB();

    try {
        const session: any = await db.prepare("SELECT user_id FROM sessions WHERE id = ?").bind(token).first();
        if (!session) return NextResponse.json({ error: "Invalid Session" }, { status: 401 });

        // Fetch leads for this user, newest first
        const { results } = await db.prepare("SELECT * FROM leads WHERE card_user_id = ? ORDER BY id DESC").bind(session.user_id).all();

        return NextResponse.json(results || []);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
