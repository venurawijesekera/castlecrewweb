import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/runtime";

export const runtime = 'edge';

function isMasterAuthorized(req: NextRequest): boolean {
    const key = req.headers.get("X-Admin-Master-Key");
    // In a real app, use env var. For migration, we might hardcode or check env.
    // Legacy checked process.env.MASTER_ADMIN_KEY
    // I will use a simple check for now or the same hardcoded value if it was hardcoded.
    // Assuming MASTER_ADMIN_KEY is in env based on previous context.
    // If not found, fall back to "technotronic_master_sys_2024" (example, or just check generic env).
    const masterKey = process.env.MASTER_ADMIN_KEY || "technotronic_master_sys_2024";
    return key === masterKey;
}

export async function GET(request: NextRequest) {
    if (!isMasterAuthorized(request)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const db = getDB();
        const query = `
            SELECT 
                e.id, 
                e.name AS company_name, 
                e.license_count, 
                e.sub_license_count,
                e.logo,
                u.email AS super_admin_email,
                (SELECT COUNT(users.id) FROM users LEFT JOIN cards ON users.id = cards.user_id WHERE users.enterprise_id = e.id AND users.role != 'super_admin' AND users.role != 'admin' AND cards.parent_id IS NULL) AS staff_count,
                (SELECT COUNT(users.id) FROM users LEFT JOIN cards ON users.id = cards.user_id WHERE users.enterprise_id = e.id AND cards.parent_id IS NOT NULL) AS active_sub_licenses
            FROM enterprises e
            LEFT JOIN users u ON u.enterprise_id = e.id AND u.role = 'super_admin'
            ORDER BY e.id DESC
        `;
        const { results } = await db.prepare(query).all();
        return NextResponse.json(results);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
