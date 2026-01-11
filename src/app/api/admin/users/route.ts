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
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const db = getDB();
        const query = `
            SELECT 
                users.id, 
                users.email, 
                users.plan, 
                users.created_at, 
                cards.slug,
                cards.avatar_url,
                cards.parent_id,
                cards.id as profile_card_id,
                users.role,           
                users.enterprise_id,
                users.sub_license_count
            FROM users 
            LEFT JOIN cards ON users.id = cards.user_id 
            ORDER BY users.id DESC
        `;
        const { results } = await db.prepare(query).all();
        return NextResponse.json(results);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
