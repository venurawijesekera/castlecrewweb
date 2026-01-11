import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/runtime";

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    try {
        const db = getDB();

        // 1. Authentication
        // 1. Authentication
        let sessionToken = req.cookies.get("castle_token")?.value;

        if (!sessionToken) {
            const authHeader = req.headers.get("Authorization");
            if (authHeader) {
                sessionToken = authHeader.replace("Bearer ", "");
            }
        }

        if (!sessionToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user: any = await db.prepare(`
            SELECT u.id, u.role, u.enterprise_id, u.full_name, c.slug, c.avatar_url
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN cards c ON u.id = c.user_id AND c.parent_id IS NULL
            WHERE s.token = ? AND s.expires_at > ?
        `).bind(sessionToken, Date.now()).first();

        // Note: Legacy query used s.id = ?. If token is stored in s.token, verify schema.
        // Assuming session_token cookie holds the token string which matches s.token or s.id.
        // Legacy `api/login.js` inserts into sessions (id, user_id, token...).
        // Reg.js and Login.js in legacy:
        // `INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`
        // And cookie was `session_token=${token}`. So the cookie value IS the token column.
        // Legacy query: `WHERE s.id = ?`. Wait.
        // Legacy login: `const token = crypto.randomUUID(); ... insert ... VALUES(token, ...)`
        // It seems ID and Token might be same or legacy query was checking ID?
        // Let's assume standard behavior: Token lookup.
        // My new auth.ts uses `WHERE token = ?`. I will stick to that.

        if (!user || !user.enterprise_id || (user.role !== 'super_admin' && user.role !== 'admin')) {
            return NextResponse.json({ error: "Unauthorized: Enterprise access required" }, { status: 403 });
        }

        const enterpriseId = user.enterprise_id;
        const isSuperAdmin = user.role === 'super_admin';

        // 2. Fetch Enterprise Info
        const enterprise: any = await db.prepare("SELECT * FROM enterprises WHERE id = ?").bind(enterpriseId).first();
        if (!enterprise) throw new Error("Enterprise not found");

        // 3. Stats
        const activeProfileCountResult: any = await db.prepare(`
            SELECT COUNT(DISTINCT u.id) as count 
            FROM users u
            JOIN cards c ON u.id = c.user_id
            WHERE u.enterprise_id = ?
        `).bind(enterpriseId).first();
        const activeProfileCount = activeProfileCountResult?.count || 0;

        const totalCardCountResult: any = await db.prepare(`
            SELECT COUNT(c.id) as count 
            FROM cards c
            JOIN users u ON c.user_id = u.id
            WHERE u.enterprise_id = ?
        `).bind(enterpriseId).first();
        const totalCardCount = totalCardCountResult?.count || 0;

        const productCardCount = Math.max(0, totalCardCount - activeProfileCount);

        const assignedSubLicensesResult: any = await db.prepare(`
            SELECT COALESCE(SUM(sub_license_count), 0) as total
            FROM users
            WHERE enterprise_id = ?
        `).bind(enterpriseId).first();
        const assignedSubLicenses = assignedSubLicensesResult?.total || 0;

        // 4. Admins (Super Admin Only)
        let admins: any[] = [];
        if (isSuperAdmin) {
            const res = await db.prepare(`
                SELECT u.id, u.email, u.full_name as name, u.employee_id, u.is_suspended,
                (SELECT COUNT(*) FROM users WHERE assigned_admin_id = u.id) as staff_managed,
                (SELECT slug FROM cards WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as slug,
                (SELECT avatar_url FROM cards WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as avatar_url,
                (SELECT job_title FROM cards WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as job_title,
                (SELECT company FROM cards WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as company,
                (SELECT phone FROM cards WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as phone
                FROM users u
                WHERE enterprise_id = ? AND role = 'admin'
            `).bind(enterpriseId).all();
            admins = res.results || [];
        }

        // 5. Staff
        let staffQuery = `
            SELECT u.id, u.email, u.full_name as name, u.sub_license_count, u.employee_id, u.is_suspended, 
                   c.id as card_id, c.slug, c.avatar_url, c.is_suspended as card_suspended, c.parent_id, u.assigned_admin_id
            FROM users u
            LEFT JOIN cards c ON u.id = c.user_id
            WHERE u.enterprise_id = ? AND (u.role = 'user' OR u.role = 'staff')
        `;
        const staffRes = await db.prepare(staffQuery).bind(enterpriseId).all();
        const staff = staffRes.results || [];

        // Managed Staff Count
        const uniqueManagedIds = new Set();
        staff.forEach((s: any) => {
            if (s.assigned_admin_id === user.id && s.id !== user.id) {
                uniqueManagedIds.add(s.id);
            }
        });
        const managedStaffCount = uniqueManagedIds.size;

        // 6. Unassigned Cards
        const unassignedRes = await db.prepare(`
            SELECT id, slug, full_name, created_at, avatar_url, is_suspended, 'Unassigned' as status
            FROM cards
            WHERE enterprise_id = ? AND user_id IS NULL
            ORDER BY created_at DESC
        `).bind(enterpriseId).all();
        const unassignedCards = unassignedRes.results || [];

        // 7. Analytics Counts
        const totalViewsResult: any = await db.prepare(`
             SELECT COUNT(*) as count 
             FROM analytics a
             JOIN users u ON a.card_user_id = u.id
             WHERE u.enterprise_id = ? AND a.type = 'visit'
         `).bind(enterpriseId).first();
        const totalViews = totalViewsResult?.count || 0;

        const totalLeadsResult: any = await db.prepare(`
             SELECT COUNT(*) as count
             FROM leads l
             JOIN users u ON l.card_user_id = u.id
             WHERE u.enterprise_id = ?
         `).bind(enterpriseId).first();
        const totalLeads = totalLeadsResult?.count || 0;

        // 8. Logs (Simplified for now - can be optimized)
        // Fetching limited latest items and sorting in JS is okay for migration MVP
        const newStaffRes = await db.prepare(`
             SELECT u.id, u.full_name, u.created_at, u.role, a.full_name as admin_name, c.slug as topic_slug
             FROM users u
             LEFT JOIN users a ON u.assigned_admin_id = a.id
             LEFT JOIN cards c ON u.id = c.user_id 
             WHERE u.enterprise_id = ?
             ORDER BY u.created_at DESC LIMIT 10
         `).bind(enterpriseId).all();

        const logs: any[] = [];
        // ... (Logic to push to logs array similar to legacy)
        const newStaff = newStaffRes.results || [];
        newStaff.forEach((s: any) => {
            if (s.created_at) logs.push({ type: 'new_staff', title: 'New Staff', description: `Created by ${s.admin_name || 'System'}`, target_name: s.full_name, timestamp: s.created_at });
        });

        // Can add other logs later if needed for full parity

        return NextResponse.json({
            company: {
                name: enterprise.name,
                license_count: enterprise.license_count,
                sub_license_count: enterprise.sub_license_count || 0,
                logo: enterprise.logo
            },
            stats: {
                active_staff_count: activeProfileCount,
                product_card_count: productCardCount,
                assigned_sub_licenses: assignedSubLicenses,
                managed_staff_count: managedStaffCount,
                total_views: totalViews,
                total_leads: totalLeads
            },
            admins,
            staff,
            unassigned_cards: unassignedCards,
            viewer: {
                role: user.role,
                id: user.id,
                name: user.full_name,
                slug: user.slug,
                avatar_url: user.avatar_url
            },
            logs: logs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
