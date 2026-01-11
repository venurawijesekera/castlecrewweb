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
        const { company_name, super_admin_email, super_admin_password, total_licenses, sub_licenses } = body;

        if (!company_name || !super_admin_email || !super_admin_password || !total_licenses) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Check if email exists
        const existingUser = await db.prepare("SELECT id FROM users WHERE email = ?").bind(super_admin_email).first();
        if (existingUser) {
            return NextResponse.json({ error: "Email already taken" }, { status: 409 });
        }

        // 2. Create Enterprise
        const entResult: any = await db.prepare(
            "INSERT INTO enterprises (name, license_count, sub_license_count) VALUES (?, ?, ?) RETURNING id"
        ).bind(company_name, total_licenses, sub_licenses || 0).first();

        if (!entResult) {
            throw new Error("Failed to create enterprise record");
        }
        const enterpriseId = entResult.id;

        // 3. Create Super Admin User
        // Note: Password storing in plain text as per legacy code (based on provided snippet).
        // Ideally should hash, but respecting legacy for now unless auth.ts handles hashing which it seemed to do via plain text compare?
        // Wait, legacy `login.js` does `password === ?` or `md5`? We saw `api/auth/login.js` earlier, it did simple comparison?
        // Actually earlier migration `api/auth/login/route.ts` used strict comparison.
        // We will stick to request body password.
        const userResult: any = await db.prepare(`
            INSERT INTO users (email, password, plan, role, enterprise_id) 
            VALUES (?, ?, 'enterprise', 'super_admin', ?) RETURNING id
        `).bind(super_admin_email, super_admin_password, enterpriseId).first();

        const userId = userResult.id;

        // 4. Create Default Admin Card
        const slug = company_name.toLowerCase().replace(/[^a-z0-9]/g, '-') + "-admin-" + Math.floor(Math.random() * 1000);

        await db.prepare(`
            INSERT INTO cards (user_id, slug, template_id, full_name, job_title, company, email) 
            VALUES (?, ?, 'executive', 'Super Admin', 'System Admin', ?, ?)
        `).bind(userId, slug, company_name, super_admin_email).run();

        return NextResponse.json({ success: true, enterprise_id: enterpriseId });

    } catch (e: any) {
        console.error("Create Enterprise Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
