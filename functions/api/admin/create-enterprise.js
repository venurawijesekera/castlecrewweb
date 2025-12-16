// /api/admin/create-enterprise.js

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { company_name, super_admin_email, super_admin_password, total_licenses } = body;

        if (!company_name || !super_admin_email || !super_admin_password || !total_licenses) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        // --- Transaction Start ---
        await env.DB.batch([
            // 1. Check if the Super Admin email already exists in the users table
            env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(super_admin_email),

            // 2. Insert new Enterprise
            env.DB.prepare("INSERT INTO enterprises (name, license_count) VALUES (?, ?) RETURNING id")
                .bind(company_name, total_licenses),
        ]);

        const existingUserCheck = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(super_admin_email).first();
        if (existingUserCheck) {
             return new Response(JSON.stringify({ error: "Email already taken" }), { status: 409 });
        }
        
        // Retrieve the newly created enterprise ID (requires two separate steps unless using a single stored procedure or a more advanced transaction pattern)
        // Since D1 simple batch doesn't return results from all statements, we'll fetch the enterprise ID after insertion.
        const enterpriseInsertResult = await env.DB.prepare("INSERT INTO enterprises (name, license_count) VALUES (?, ?) RETURNING id")
            .bind(company_name, total_licenses)
            .first();
        const enterpriseId = enterpriseInsertResult.id;

        // 3. Insert the Super Admin User
        const superAdminResult = await env.DB.prepare(`
            INSERT INTO users (email, password, full_name, plan, enterprise_id, role) 
            VALUES (?, ?, ?, ?, ?, ?) RETURNING id
        `).bind(
            super_admin_email,
            super_admin_password,
            "Super Admin", // Default name
            "enterprise",
            enterpriseId,
            "super_admin"
        ).first();
        const superAdminId = superAdminResult.id;

        // 4. Create a default card for the Super Admin
        const slugBase = company_name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const slug = `${slugBase}-admin`;

        await env.DB.prepare(`
            INSERT INTO cards (user_id, slug, template_id, full_name, email, job_title, company) 
            VALUES (?, ?, 'signature', ?, ?, 'Super Admin', ?)
        `).bind(superAdminId, slug, "Super Admin", super_admin_email, company_name).run();

        // --- Transaction End ---

        return new Response(JSON.stringify({ success: true, enterprise_id: enterpriseId }), { 
            headers: { "Content-Type": "application/json" } 
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}