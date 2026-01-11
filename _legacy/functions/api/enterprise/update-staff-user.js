import { getUserIdFromToken } from '../../utils/auth';

export async function onRequestPost(context) {
    const { request, env } = context;

    // 1. Authentication & Authorization
    const cookie = request.headers.get("Cookie");
    if (!cookie || !cookie.includes("session_token=")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const sessionToken = cookie.split("session_token=")[1].split(";")[0];

    const adminUser = await env.DB.prepare(`
            SELECT u.id, u.role, u.enterprise_id 
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = ? AND s.expires_at > ?
        `).bind(sessionToken, Date.now()).first();

    if (!adminUser || !adminUser.enterprise_id || (adminUser.role !== 'super_admin' && adminUser.role !== 'admin')) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    try {
        // 2. Pars Body
        const body = await request.json();
        const { staff_user_id, action, status } = body;

        if (!staff_user_id || !action) {
            return new Response(JSON.stringify({ error: "Missing user ID or action" }), { status: 400 });
        }

        // 3. Verify target user belongs to enterprise
        const targetUser = await env.DB.prepare("SELECT id, enterprise_id, assigned_admin_id, role FROM users WHERE id = ?").bind(staff_user_id).first();

        if (!targetUser || targetUser.enterprise_id !== adminUser.enterprise_id) {
            return new Response(JSON.stringify({ error: "User not found or not in your enterprise" }), { status: 404 });
        }

        // 4. Permission Check
        if (adminUser.role === 'super_admin') {
            // Super Admin can do anything to anyone in their enterprise
        } else if (adminUser.role === 'admin') {
            // Delegated Admin can only manage their assigned Staff
            if (targetUser.role !== 'staff' && targetUser.role !== 'user') {
                return new Response(JSON.stringify({ error: "Access Denied: You can only manage Staff." }), { status: 403 });
            }
            if (targetUser.assigned_admin_id !== adminUser.id) {
                return new Response(JSON.stringify({ error: "Access Denied: You do not manage this user." }), { status: 403 });
            }
        } else {
            return new Response(JSON.stringify({ error: "Access Denied." }), { status: 403 });
        }


        // --- ACTION: DELETE ---
        if (action === 'delete') {
            await env.DB.prepare(`DELETE FROM users WHERE id = ?`).bind(staff_user_id).run();
            await env.DB.prepare(`DELETE FROM cards WHERE user_id = ?`).bind(staff_user_id).run();
            await env.DB.prepare(`DELETE FROM sessions WHERE user_id = ?`).bind(staff_user_id).run();
            return new Response(JSON.stringify({ success: true, message: "User deleted" }), { headers: { "Content-Type": "application/json" } });
        }

        // --- ACTION: UPDATE DETAILS (Employee ID matches) ---
        if (action === 'update_details') {
            const employeeId = body.employee_id;
            await env.DB.prepare("UPDATE users SET employee_id = ? WHERE id = ?").bind(employeeId || null, staff_user_id).run();
            return new Response(JSON.stringify({ success: true, message: "Details updated" }), { headers: { "Content-Type": "application/json" } });
        }

        // --- ACTION: ASSIGN ADMIN ---
        if (action === 'assign_admin') {
            if (adminUser.role !== 'super_admin') {
                return new Response(JSON.stringify({ error: "Only Super Admin can reassign users." }), { status: 403 });
            }
            const newAdminId = body.new_admin_id; // Pass this in body
            await env.DB.prepare("UPDATE users SET assigned_admin_id = ? WHERE id = ?").bind(newAdminId || null, staff_user_id).run();
            return new Response(JSON.stringify({ success: true, message: "Admin assigned successfully" }), { headers: { "Content-Type": "application/json" } });
        }

        // --- ACTION: UPDATE STATUS (Suspend/Reassign) ---
        if (action === 'update_status' && status) {
            if (status === 'inactive') {
                await env.DB.prepare(`UPDATE users SET plan = 'suspended' WHERE id = ?`).bind(staff_user_id).run();
            } else if (status === 'active') {
                await env.DB.prepare(`UPDATE users SET plan = 'enterprise' WHERE id = ?`).bind(staff_user_id).run();
            } else if (status === 'reassign' || status === 'unassign') {
                // Deprecated in favor of explicit assign_admin, but kept for compatibility if needed
                await env.DB.prepare(`UPDATE users SET assigned_admin_id = NULL WHERE id = ?`).bind(staff_user_id).run();
            }
            return new Response(JSON.stringify({ success: true, message: `User status updated to ${status}` }), { headers: { "Content-Type": "application/json" } });
        }

        // --- ACTION: UPDATE LIMIT ---
        if (action === 'update_limit') {
            const limit = body.limit;
            if (typeof limit !== 'number' || limit < 0) {
                return new Response(JSON.stringify({ error: "Invalid limit value" }), { status: 400 });
            }

            // Check Enterprise Capacity
            const enterprise = await env.DB.prepare("SELECT sub_license_count FROM enterprises WHERE id = ?").bind(adminUser.enterprise_id).first();
            if (enterprise) {
                // Calculate current total allocation (excluding this user's current limit)
                const allocationResult = await env.DB.prepare("SELECT SUM(sub_license_count) as total FROM users WHERE enterprise_id = ? AND id != ?").bind(adminUser.enterprise_id, staff_user_id).first();
                const currentAllocation = allocationResult ? (allocationResult.total || 0) : 0;

                if (currentAllocation + limit > enterprise.sub_license_count) {
                    return new Response(JSON.stringify({
                        error: `Enterprise capacity exceeded. Max: ${enterprise.sub_license_count}. Remaining available: ${enterprise.sub_license_count - currentAllocation}`
                    }), { status: 403 });
                }
            }

            await env.DB.prepare("UPDATE users SET sub_license_count = ? WHERE id = ?").bind(limit, staff_user_id).run();
            return new Response(JSON.stringify({ success: true, message: "Limit updated", new_limit: limit }), { headers: { "Content-Type": "application/json" } });
        }

        return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}