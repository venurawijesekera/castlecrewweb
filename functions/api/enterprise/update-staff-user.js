import { getUserIdFromToken } from '../../utils/auth';

export async function onRequestPost(context) {
    const { request, env } = context;

    const adminId = await getUserIdFromToken(request, env);
    if (!adminId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    try {
        const body = await request.json();
        const { staff_user_id, action, status } = body;

        if (!staff_user_id || !action) {
            return new Response(JSON.stringify({ error: "Missing user ID or action" }), { status: 400 });
        }

        // 1. Verify current user is a Delegated Admin AND the staff user is assigned to them
        const staffUser = await env.DB.prepare("SELECT assigned_admin_id FROM users WHERE id = ? AND role = 'staff'").bind(staff_user_id).first();
        
        if (!staffUser || staffUser.assigned_admin_id !== adminId) {
            return new Response(JSON.stringify({ error: "Access Denied: Staff user is not managed by this admin." }), { status: 403 });
        }
        
        // --- ACTION: DELETE ---
        if (action === 'delete') {
            await env.DB.prepare(`DELETE FROM users WHERE id = ?`).bind(staff_user_id).run();
            await env.DB.prepare(`DELETE FROM cards WHERE user_id = ?`).bind(staff_user_id).run();
            await env.DB.prepare(`DELETE FROM sessions WHERE user_id = ?`).bind(staff_user_id).run();
            return new Response(JSON.stringify({ success: true, message: "Staff user deleted" }), { headers: { "Content-Type": "application/json" } });
        }
        
        // --- ACTION: UPDATE STATUS (Suspend/Reassign) ---
        if (action === 'update_status' && status) {
            if (status === 'inactive') {
                 await env.DB.prepare(`UPDATE users SET plan = 'suspended' WHERE id = ?`).bind(staff_user_id).run();
            } else if (status === 'active') {
                 await env.DB.prepare(`UPDATE users SET plan = 'enterprise' WHERE id = ?`).bind(staff_user_id).run();
            } else if (status === 'reassign' || status === 'unassign') {
                 await env.DB.prepare(`UPDATE users SET assigned_admin_id = NULL WHERE id = ?`).bind(staff_user_id).run();
            }
            return new Response(JSON.stringify({ success: true, message: `User status updated to ${status}` }), { headers: { "Content-Type": "application/json" } });
        }

        return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}