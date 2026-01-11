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
        // action field determines if delete or update
        // legacy used separate 'action' param for delete logic inside 'update-user.js'
        const { user_id, plan, role, enterprise_id, action } = body;

        if (!user_id) return NextResponse.json({ error: "Missing user ID" }, { status: 400 });

        // DELETE ACTION
        if (action === 'delete') {
            await db.prepare("DELETE FROM users WHERE id = ?").bind(user_id).run();
            await db.prepare("DELETE FROM cards WHERE user_id = ?").bind(user_id).run();
            await db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(user_id).run();
            return NextResponse.json({ success: true, message: "User deleted" });
        }

        // UPDATE ACTION
        let setClauses = [];
        let bindings = [];

        if (plan) { setClauses.push("plan = ?"); bindings.push(plan); }
        if (role) { setClauses.push("role = ?"); bindings.push(role); }
        if (enterprise_id !== undefined) {
            setClauses.push("enterprise_id = ?");
            bindings.push(enterprise_id || null);
        }

        if (setClauses.length > 0) {
            const query = `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`;
            bindings.push(user_id);
            await db.prepare(query).bind(...bindings).run();
            return NextResponse.json({ success: true, message: "User updated" });
        }

        return NextResponse.json({ error: "No valid action specified" }, { status: 400 });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
