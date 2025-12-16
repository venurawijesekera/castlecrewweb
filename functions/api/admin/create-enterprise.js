// /api/admin/create-enterprise.js

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { company_name, super_admin_email, super_admin_password, total_licenses, sub_licenses } = body;

        if (!company_name || !super_admin_email || !super_admin_password || !total_licenses) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        // 1. Check if email already exists
        const existingUser = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(super_admin_email).first();
        if (existingUser) {
            return new Response(JSON.stringify({ error: "Email already taken" }), { status: 409 });
        }

        // 2. Create Enterprise
        // We use .first() after RETURNING id to get the ID immediately
        const entResult = await env.DB.prepare(
            "INSERT INTO enterprises (name, license_count, sub_license_count) VALUES (?, ?, ?) RETURNING id"
        ).bind(company_name, total_licenses, sub_licenses || 0).first();

        if (!entResult) {
            throw new Error("Failed to create enterprise record");
        }

        const enterpriseId = entResult.id;

        // 3. Create Super Admin User
        const userResult = await env.DB.prepare(`
            INSERT INTO users (email, password, plan, role, enterprise_id) 
            VALUES (?, ?, 'enterprise', 'super_admin', ?) RETURNING id
        `).bind(super_admin_email, super_admin_password, enterpriseId).first();

        const userId = userResult.id;

        // 4. Create Default Admin Card
        const slug = company_name.toLowerCase().replace(/[^a-z0-9]/g, '-') + "-admin";

        await env.DB.prepare(`
            INSERT INTO cards (user_id, slug, template_id, full_name, job_title, company, email) 
            VALUES (?, ?, 'executive', 'Super Admin', 'System Admin', ?, ?)
        `).bind(userId, slug, company_name, super_admin_email).run();

        return new Response(JSON.stringify({ success: true, enterprise_id: enterpriseId }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        console.error("Create Enterprise Error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
