import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/runtime";

export const runtime = 'edge';

function isMasterAuthorized(req: NextRequest): boolean {
    const key = req.headers.get("X-Admin-Master-Key");
    const masterKey = process.env.MASTER_ADMIN_KEY || "technotronic_master_sys_2024";
    return key === masterKey;
}

export async function POST(request: NextRequest) {
    if (!isMasterAuthorized(request)) {
        return NextResponse.json({ error: "Forbidden: Master Admin Key Required" }, { status: 403 });
    }

    try {
        const db = getDB();
        const body: any = await request.json();
        const { enterprise_id, license_count, sub_license_count } = body;

        if (!enterprise_id) return NextResponse.json({ error: "Missing enterprise_id" }, { status: 400 });

        await db.prepare(`
            UPDATE enterprises 
            SET license_count = ?, sub_license_count = ?
            WHERE id = ?
        `).bind(license_count, sub_license_count, enterprise_id).run();

        return NextResponse.json({ success: true });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
