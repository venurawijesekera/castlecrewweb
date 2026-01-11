import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/runtime";

export const runtime = 'edge';

function isMasterAuthorized(req: NextRequest): boolean {
    const key = req.headers.get("X-Admin-Master-Key");
    const masterKey = process.env.MASTER_ADMIN_KEY || "technotronic_master_sys_2024";
    return key === masterKey;
}

export async function GET(request: NextRequest) {
    if (!isMasterAuthorized(request)) {
        return NextResponse.json({ error: "Forbidden: Master Admin Key Required" }, { status: 403 });
    }

    try {
        const db = getDB();
        const { searchParams } = new URL(request.url);
        const enterpriseId = searchParams.get('enterprise_id');

        if (!enterpriseId) {
            return NextResponse.json({ error: "Enterprise ID required" }, { status: 400 });
        }

        // Auto-Migration logic
        try {
            const { results: tableInfo }: any = await db.prepare("PRAGMA table_info(support_messages)").all();
            const columns = tableInfo.map((c: any) => c.name);

            if (!columns.includes('is_read')) {
                await db.prepare("ALTER TABLE support_messages ADD COLUMN is_read INTEGER DEFAULT 0").run();
            }
            if (!columns.includes('sender_role')) {
                await db.prepare("ALTER TABLE support_messages ADD COLUMN sender_role TEXT DEFAULT 'enterprise_admin'").run();
            }
        } catch (e) {
            console.error("Migration warning:", e);
        }

        // 1. Fetch pending license requests
        const { results: requests } = await db.prepare(`
            SELECT 
                lr.id, 
                lr.request_type as type, 
                lr.amount, 
                lr.message, 
                lr.created_at, 
                'request' as alert_type 
            FROM license_requests lr
            WHERE lr.enterprise_id = ? AND lr.status = 'pending'
        `).bind(parseInt(enterpriseId)).all();

        // 2. Fetch unread support messages
        const { results: messages } = await db.prepare(`
            SELECT 
                id, 
                'message' as type,
                0 as amount,
                message, 
                created_at, 
                'message' as alert_type
            FROM support_messages
            WHERE enterprise_id = ? AND sender_role = 'enterprise_admin' AND (is_read = 0 OR is_read IS NULL)
        `).bind(parseInt(enterpriseId)).all();

        const combined: any[] = [...(requests || []), ...(messages || [])];
        combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return NextResponse.json(combined);

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
