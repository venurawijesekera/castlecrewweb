import { getDB } from "@/lib/runtime";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
    try {
        const db = getDB();
        const body = await request.json();
        const { email, password, full_name } = body as any;

        // 1. Validation
        if (!email || !password || !full_name) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // 2. Check if email already exists
        const existing = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
        if (existing) {
            return NextResponse.json({ error: "Email already taken" }, { status: 409 });
        }

        // 3. Create User
        const result: any = await db.prepare("INSERT INTO users (email, password, full_name, plan, role) VALUES (?, ?, ?, 'starter', 'staff') RETURNING id")
            .bind(email, password, full_name)
            .first();

        const newUserId = result.id;

        // 4. Create a Default Card
        const slugBase = full_name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const randomSuffix = Math.floor(Math.random() * 10000);
        const slug = `${slugBase}-${randomSuffix}`;

        await db.prepare(`
        INSERT INTO cards (user_id, slug, template_id, full_name, email, job_title, company) 
        VALUES (?, ?, 'signature', ?, ?, 'New Member', 'Castle Cards')
    `).bind(newUserId, slug, full_name, email).run();

        return NextResponse.json({ success: true, user_id: newUserId });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
