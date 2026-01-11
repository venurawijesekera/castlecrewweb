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

        const { results } = await db.prepare(`
            SELECT lr.id, lr.request_type, lr.amount, lr.message, lr.status, lr.created_at, u.email as requester_email, u.full_name as requester_name
            FROM license_requests lr
            JOIN users u ON lr.user_id = u.id
            WHERE lr.enterprise_id = ?
            ORDER BY lr.created_at DESC
        `).bind(parseInt(enterpriseId)).all();

        return NextResponse.json(results);

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
