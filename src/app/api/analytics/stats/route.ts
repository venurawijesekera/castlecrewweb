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

        const userId = session.user_id;

        // 1. Count Visits
        const visits: any = await db.prepare("SELECT COUNT(*) as count FROM analytics WHERE card_user_id = ? AND type = 'visit'").bind(userId).first();

        // 2. Count Saves
        const saves: any = await db.prepare("SELECT COUNT(*) as count FROM analytics WHERE card_user_id = ? AND type = 'save'").bind(userId).first();

        // 3. Count Calls
        const calls: any = await db.prepare("SELECT COUNT(*) as count FROM analytics WHERE card_user_id = ? AND type = 'call'").bind(userId).first();

        // 4. Count Exchanges (From Leads Table)
        const exchanges: any = await db.prepare("SELECT COUNT(*) as count FROM leads WHERE card_user_id = ?").bind(userId).first();

        return NextResponse.json({
            visits: visits?.count || 0,
            saves: saves?.count || 0,
            calls: calls?.count || 0,
            exchanges: exchanges?.count || 0
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
