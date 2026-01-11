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
        const { request_id, action } = body;

        if (!request_id || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const req: any = await db.prepare(`
            SELECT * FROM license_requests WHERE id = ?
        `).bind(request_id).first();

        if (!req) return NextResponse.json({ error: "Request not found" }, { status: 404 });
        if (req.status !== 'pending') return NextResponse.json({ error: "Request already handled" }, { status: 400 });

        if (action === 'approve') {
            const enterprise: any = await db.prepare(`
                SELECT license_count, sub_license_count FROM enterprises WHERE id = ?
            `).bind(req.enterprise_id).first();

            if (!enterprise) return NextResponse.json({ error: "Enterprise not found" }, { status: 404 });

            let newLicenseCount = enterprise.license_count;
            let newSubLicenseCount = enterprise.sub_license_count;

            if (req.request_type === 'profile') {
                newLicenseCount += req.amount;
            } else if (req.request_type === 'sub') {
                newSubLicenseCount += req.amount;
            }

            // Update enterprise limits
            await db.prepare(`
                UPDATE enterprises 
                SET license_count = ?, sub_license_count = ?
                WHERE id = ?
            `).bind(newLicenseCount, newSubLicenseCount, req.enterprise_id).run();

            // Mark as approved
            await db.prepare(`
                UPDATE license_requests SET status = 'approved' WHERE id = ?
            `).bind(request_id).run();

            return NextResponse.json({ success: true, message: "Request approved and licenses updated" });

        } else if (action === 'reject') {
            await db.prepare(`
                UPDATE license_requests SET status = 'rejected' WHERE id = ?
            `).bind(request_id).run();
            return NextResponse.json({ success: true, message: "Request rejected" });
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
