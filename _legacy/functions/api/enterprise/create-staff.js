
import { getUserIdFromToken } from '../../utils/auth';

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        if (!env.DB) throw new Error("Database binding 'DB' is missing");

        // 1. Authentication & Authorization
        // We need to know WHO is creating the staff (to set assigned_admin_id)
        // and WHICH enterprise they belong to.
        const cookie = request.headers.get("Cookie");
        if (!cookie || !cookie.includes("session_token=")) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }
        const sessionToken = cookie.split("session_token=")[1].split(";")[0];

        const user = await env.DB.prepare(`
            SELECT u.id, u.role, u.enterprise_id 
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = ? AND s.expires_at > ?
        `).bind(sessionToken, Date.now()).first();

        if (!user || !user.enterprise_id || (user.role !== 'super_admin' && user.role !== 'admin')) {
            return new Response(JSON.stringify({ error: "Unauthorized: Enterprise Admin access required" }), { status: 403 });
        }

        const enterpriseId = user.enterprise_id;

        // 2. Parse Request
        const body = await request.json();
        const { name, email, phone, sub_licenses, assigned_admin_id, employee_id } = body;

        let finalAssignedAdmin = null;

        if (user.role === 'admin') {
            finalAssignedAdmin = user.id; // Admins always assigned to themselves
        } else if (user.role === 'super_admin') {
            // Super Admin can choose, or default to unassigned (null)
            if (assigned_admin_id) finalAssignedAdmin = assigned_admin_id;
        }

        if (!name || !email) {
            return new Response(JSON.stringify({ error: "Name and Email are required" }), { status: 400 });
        }

        // 3. License Checks
        const enterprise = await env.DB.prepare("SELECT license_count, sub_license_count FROM enterprises WHERE id = ?").bind(enterpriseId).first();
        if (enterprise) {
            // Check Profile License (Total Users)
            const userCountResult = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE enterprise_id = ?").bind(enterpriseId).first();
            const userCount = userCountResult ? userCountResult.count : 0;
            if (userCount >= enterprise.license_count) {
                return new Response(JSON.stringify({ error: "Profile license limit reached for this enterprise." }), { status: 403 });
            }

            // Check Sub-License Allocation
            const requestedLimit = parseInt(sub_licenses) || 0;
            const allocationResult = await env.DB.prepare("SELECT SUM(sub_license_count) as total FROM users WHERE enterprise_id = ?").bind(enterpriseId).first();
            const currentAllocation = allocationResult ? (allocationResult.total || 0) : 0;
            if (currentAllocation + requestedLimit > enterprise.sub_license_count) {
                return new Response(JSON.stringify({ error: "Enterprise sub-license capacity exceeded." }), { status: 403 });
            }
        }

        // 4. Check if user already exists
        const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
        if (existing) {
            return new Response(JSON.stringify({ error: "User with this email already exists" }), { status: 409 });
        }

        // 4. Create User
        // Role = 'user' (or 'staff')
        // Plan = 'enterprise' (inherits)
        const password = Math.random().toString(36).slice(-8); // Random temporary password (in real app, send invite email)

        const { results: userInsert } = await env.DB.prepare(`
            INSERT INTO users (email, password, role, enterprise_id, full_name, plan, phone, assigned_admin_id, sub_license_count, employee_id)
            VALUES (?, ?, 'user', ?, ?, 'enterprise', ?, ?, ?, ?)
            RETURNING id
        `).bind(email, password, enterpriseId, name, phone || null, finalAssignedAdmin, sub_licenses || 0, employee_id || null).run();

        let newUserId = userInsert && userInsert.length > 0 ? userInsert[0].id : null;
        if (!newUserId) {
            const verify = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
            newUserId = verify.id;
        }

        // 5. Create Default Card
        const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000);
        await env.DB.prepare(`
            INSERT INTO cards (user_id, slug, full_name, email, phone, design)
            VALUES (?, ?, ?, ?, ?, ?)
        `).bind(newUserId, slug, name, email, phone || null, '{}').run();

        return new Response(JSON.stringify({
            success: true,
            message: "Staff user created successfully",
            temp_password: password
        }), { headers: { "Content-Type": "application/json" } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
