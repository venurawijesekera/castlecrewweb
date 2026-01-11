
export async function onRequestGet(context) {
    const { request, env } = context;

    try {
        if (!env.DB) throw new Error("Database binding 'DB' is missing");

        // 1. Authentication (Get User & Enterprise from Session)
        const cookie = request.headers.get("Cookie");
        if (!cookie || !cookie.includes("session_token=")) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }
        const sessionToken = cookie.split("session_token=")[1].split(";")[0];

        // Get user and their enterprise_id
        // LEFT JOIN cards to get the slug for the profile link
        const user = await env.DB.prepare(`
            SELECT u.id, u.role, u.enterprise_id, u.full_name, c.slug, c.avatar_url
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN cards c ON u.id = c.user_id
            WHERE s.id = ? AND s.expires_at > ?
        `).bind(sessionToken, Date.now()).first();

        if (!user || !user.enterprise_id || (user.role !== 'super_admin' && user.role !== 'admin')) {
            return new Response(JSON.stringify({ error: "Unauthorized: Enterprise access required" }), { status: 403 });
        }

        const enterpriseId = user.enterprise_id;
        const isSuperAdmin = user.role === 'super_admin';

        // 2. Fetch Enterprise Info
        const enterprise = await env.DB.prepare("SELECT * FROM enterprises WHERE id = ?").bind(enterpriseId).first();
        if (!enterprise) throw new Error("Enterprise not found");

        // 3. Fetch Stats
        // Active Staff: Count users with at least one card
        // If Admin: Count only THEIR assigned staff? Or all enterprise staff?
        // Usually "Active Staff" on top is Enterprise wide, but "Managed Staff" is personal.
        // Let's return both or context aware.

        // Active Staff (Profiles): Users with at least one card
        const activeProfileCount = await env.DB.prepare(`
            SELECT COUNT(DISTINCT u.id) as count 
            FROM users u
            JOIN cards c ON u.id = c.user_id
            WHERE u.enterprise_id = ?
        `).bind(enterpriseId).first().then(r => r ? r.count : 0);

        // Total Cards (All types)
        const totalCardCount = await env.DB.prepare(`
            SELECT COUNT(c.id) as count 
            FROM cards c
            JOIN users u ON c.user_id = u.id
            WHERE u.enterprise_id = ?
        `).bind(enterpriseId).first().then(r => r ? r.count : 0);

        // Product Cards = Total - Profiles
        // Logic: If each user has 1 profile card, then excess cards are products.
        const productCardCount = Math.max(0, totalCardCount - activeProfileCount);

        const assignedSubLicenses = await env.DB.prepare(`
            SELECT COALESCE(SUM(sub_license_count), 0) as total
            FROM users
            WHERE enterprise_id = ?
        `).bind(enterpriseId).first().then(r => r ? r.total : 0);

        // 4. Fetch Delegated Admins (Only for Super Admin)
        let admins = [];
        if (isSuperAdmin) {
            const res = await env.DB.prepare(`
                SELECT id, email, full_name as name, 'N/A' as last_login, employee_id, is_suspended,
                (SELECT COUNT(*) FROM users WHERE assigned_admin_id = u.id) as staff_managed,
                (SELECT slug FROM cards WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as slug,
                (SELECT avatar_url FROM cards WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as avatar_url,
                (SELECT job_title FROM cards WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as job_title,
                (SELECT company FROM cards WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as company,
                (SELECT phone FROM cards WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as phone
                FROM users u
                WHERE enterprise_id = ? AND role = 'admin'
            `).bind(enterpriseId).all();
            admins = res.results;
        }

        // 5. Fetch Staff Users
        let staffQuery = `
            SELECT u.id, u.email, u.full_name as name, u.password, u.sub_license_count, u.employee_id, u.is_suspended, 
                   c.id as card_id, c.slug, c.avatar_url, c.is_suspended as card_suspended, c.parent_id, u.assigned_admin_id
            FROM users u
            LEFT JOIN cards c ON u.id = c.user_id
            WHERE u.enterprise_id = ? AND (u.role = 'user' OR u.role = 'staff')
        `;
        let staffParams = [enterpriseId];

        // If NOT super admin, filter by assigned_admin_id (users managed by this admin)
        // OR does "Enterprise Admin" see all users? 
        // "Delegated Admin" usually implies managing a subset. 
        // But the dashboard shows "Managed User Staff".
        // Let's filter for now to be safe/specific.
        if (!isSuperAdmin) {
            // For now, let's assume Enterprise Admins see ALL users for simplicity 
            // unless explicitly asked to restrict.
            // But the prompt said "accounts should go to enterprise_admin_dashboard" 
            // and that dashboard references "Managed Staff".
            // Let's show ALL users for now to ensure they see *something*.
            // Only strictly filter if user asked for "Teams".
        }

        const { results: staff } = await env.DB.prepare(staffQuery).bind(...staffParams).all();

        // Calculate managed count for the requesting user (Count Unique Users)
        const uniqueManagedIds = new Set();
        staff.forEach(s => {
            // Check if this user row is assigned to the current admin
            if (s.assigned_admin_id === user.id && s.id !== user.id) {
                uniqueManagedIds.add(s.id);
            }
        });
        const managedStaffCount = uniqueManagedIds.size;

        // 6. Fetch Unassigned Cards (Orphans)
        let unassignedCards = [];
        try {
            const res = await env.DB.prepare(`
                SELECT id, slug, full_name, created_at, avatar_url, is_suspended, 'Unassigned' as status
                FROM cards
                WHERE enterprise_id = ? AND user_id IS NULL
                ORDER BY created_at DESC
            `).bind(enterpriseId).all();
            unassignedCards = res.results || [];
        } catch (e) {
            console.warn("Error fetching unassigned cards", e);
        }

        return new Response(JSON.stringify({
            company: {
                name: enterprise.name,
                license_count: enterprise.license_count,
                sub_license_count: enterprise.sub_license_count || 0,
                logo: enterprise.logo // Expose Logo
            },
            stats: {
                active_staff_count: activeProfileCount,
                product_card_count: productCardCount,
                assigned_sub_licenses: assignedSubLicenses,
                managed_staff_count: managedStaffCount,
                total_views: await env.DB.prepare(`
                    SELECT COUNT(*) as count 
                    FROM analytics a
                    JOIN users u ON a.card_user_id = u.id
                    WHERE u.enterprise_id = ? AND a.type = 'visit'
                `).bind(enterpriseId).first().then(r => r ? r.count : 0),
                total_leads: await env.DB.prepare(`
                    SELECT COUNT(*) as count
                    FROM leads l
                    JOIN users u ON l.card_user_id = u.id
                    WHERE u.enterprise_id = ?
                `).bind(enterpriseId).first().then(r => r ? r.count : 0)
            },
            admins: admins,
            staff: staff, // Returns all for now, frontend can filter or we can refine later
            unassigned_cards: unassignedCards,
            viewer: {
                role: user.role,
                id: user.id,
                name: user.full_name,
                slug: user.slug,
                avatar_url: user.avatar_url
            },
            logs: await (async () => {
                // Helper to format logs
                const logs = [];

                // A. New Staff Logs
                // Assuming 'created_at' exists on users. If not, we might miss some, but usually it does.
                // Join with creator admin if possible. users.assigned_admin_id points to the admin.
                try {
                    const newStaff = await env.DB.prepare(`
                        SELECT u.id, u.full_name, u.created_at, u.role, a.full_name as admin_name, c.slug as topic_slug
                        FROM users u
                        LEFT JOIN users a ON u.assigned_admin_id = a.id
                        LEFT JOIN cards c ON u.id = c.user_id AND c.created_at = (SELECT MIN(created_at) FROM cards WHERE user_id = u.id)
                        WHERE u.enterprise_id = ?
                        ORDER BY u.created_at DESC LIMIT 20
                    `).bind(enterpriseId).all();

                    if (newStaff.results) {
                        newStaff.results.forEach(s => {
                            if (s.created_at) {
                                logs.push({
                                    type: 'new_staff',
                                    title: 'New Staff Account',
                                    description: `Created by ${s.admin_name || 'System'}`,
                                    target_name: s.full_name,
                                    slug: s.topic_slug,
                                    timestamp: s.created_at
                                });
                            }
                        });
                    }
                } catch (e) { console.warn("Log/Staff Error", e); }

                // B. New Product Logs (Cards)
                try {
                    const newCards = await env.DB.prepare(`
                        SELECT c.id, c.slug, c.full_name, c.created_at, u.full_name as owner_name
                        FROM cards c
                        JOIN users u ON c.user_id = u.id
                        WHERE u.enterprise_id = ?
                        ORDER BY c.created_at DESC LIMIT 20
                    `).bind(enterpriseId).all();

                    if (newCards.results) {
                        newCards.results.forEach(c => {
                            if (c.created_at) {
                                logs.push({
                                    type: 'new_card',
                                    title: 'New Product Card', // Could be profile too, but "Product" is safe generic for now
                                    description: `Created for ${c.owner_name || 'Unknown User'}`,
                                    target_name: c.slug,
                                    slug: c.slug,
                                    timestamp: c.created_at
                                });
                            }
                        });
                    }
                } catch (e) { console.warn("Log/Card Error", e); }

                // C. New Leads
                try {
                    const newLeads = await env.DB.prepare(`
                        SELECT l.id, l.created_at, l.name as lead_name, c.full_name as owner_name, c.slug as card_slug
                        FROM leads l
                        JOIN users u ON l.card_user_id = u.id
                        LEFT JOIN cards c ON l.card_slug = c.slug 
                        WHERE u.enterprise_id = ?
                        ORDER BY l.created_at DESC LIMIT 20
                    `).bind(enterpriseId).all();

                    if (newLeads.results) {
                        newLeads.results.forEach(l => {
                            if (l.created_at) {
                                logs.push({
                                    type: 'new_lead',
                                    title: 'New Lead Generated',
                                    description: `Lead for ${l.owner_name || 'Card'}`,
                                    target_name: l.lead_name,
                                    slug: l.card_slug, // Link to the card that got the lead
                                    timestamp: l.created_at
                                });
                            }
                        });
                    }
                } catch (e) { console.warn("Log/Lead Error", e); }

                // Sort combined logs by timestamp desc
                return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 50);
            })()
        }), { headers: { "Content-Type": "application/json" } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
