import { getUserIdFromToken } from '../utils/auth';

export async function onRequest(context) {
    const { request, env } = context;

    // Use the central utility for auth
    const userId = await getUserIdFromToken(request, env);
    if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    if (request.method === "GET") {
        const url = new URL(request.url);
        const slug = url.searchParams.get("slug");
        const id = url.searchParams.get("id");

        // Query to get card, user role, and enterprise info
        let query = `
            SELECT cards.*, users.plan, users.role, users.created_at, users.enterprise_id, enterprises.name as company_name, enterprises.logo as enterprise_logo
            FROM cards 
            LEFT JOIN users ON cards.user_id = users.id 
            LEFT JOIN enterprises ON users.enterprise_id = enterprises.id
            WHERE cards.user_id = ?
        `;

        const params = [userId];

        // If specific card requested, add filter
        if (slug) {
            // Use TRIM and COLLATE NOCASE to match slugs robustly
            query += " AND TRIM(cards.slug) = ? COLLATE NOCASE";
            params.push(slug.trim());
        } else if (id) {
            query += " AND cards.id = ?";
            params.push(id);
        } else {
            // Default to oldest card with parent_id IS NULL (Main Profile behavior)
            // This ensures products reassigned to a user don't override their main profile card.
            query += " ORDER BY CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END ASC, created_at ASC";
        }

        const data = await env.DB.prepare(query).bind(...params).first();
        return new Response(JSON.stringify(data || {}), { headers: { "Content-Type": "application/json" } });
    }

    if (request.method === "POST") {
        const body = await request.json();

        // Validate ID exists to prevent silent failures
        if (!body.id) {
            return new Response(JSON.stringify({ error: "Card ID is missing. Cannot update." }), { status: 400 });
        }

        // Determine permissions
        let authorized = false;
        let targetId = body.id;

        // Check if updating own card
        const cardOwnership = await env.DB.prepare("SELECT user_id FROM cards WHERE id = ?").bind(body.id).first();
        if (cardOwnership && cardOwnership.user_id === userId) {
            authorized = true;
        }
        // Check Enterprise Admin override
        else if (body.is_enterprise) {
            // 1. Get Card Owner Info
            const cardUser = await env.DB.prepare(`
                SELECT u.id, u.enterprise_id, u.assigned_admin_id 
                FROM cards c 
                JOIN users u ON c.user_id = u.id 
                WHERE c.id = ?
            `).bind(body.id).first();

            // 2. Get Admin Info
            const adminUser = await env.DB.prepare(`
                SELECT enterprise_id, role FROM users WHERE id = ?
            `).bind(userId).first();

            if (cardUser && adminUser) {
                // Check Assignments
                if (cardUser.assigned_admin_id === userId) authorized = true;

                // Check Enterprise Match
                // Use loose equality (==) for ID comparison safety
                if (cardUser.enterprise_id && adminUser.enterprise_id &&
                    cardUser.enterprise_id == adminUser.enterprise_id) {
                    authorized = true;
                }
                // FALLBACK: Allow Admins to edit users with NULL Enterprise ID (e.g. converted personal accounts)
                // This resolves the issue where Dashboard sees them but Card check sees null.
                else if (!cardUser.enterprise_id && adminUser.enterprise_id) {
                    authorized = true;
                }
            } else {
                return new Response(JSON.stringify({ error: "Unauthorized: Target user or Admin profile not found." }), { status: 403 });
            }

            if (!authorized) {
                // Detailed debug error to diagnose mismatch
                return new Response(JSON.stringify({
                    error: `Unauthorized: Enterprise Mismatch. Card Ent: ${cardUser?.enterprise_id} vs Admin Ent: ${adminUser?.enterprise_id}. Admin Assign: ${cardUser?.assigned_admin_id} vs ${userId}`
                }), { status: 403 });
            }
        }

        if (!authorized) {
            // Silently fail or error? Using error helps debugging.
            // But to mimic original behavior (silent success if 0 rows), we could just let the query run with user_id mismatch.
            // However, debugging proved silent failure is bad.
            // Let's return 403.
            return new Response(JSON.stringify({ error: "Unauthorized: You do not own this card." }), { status: 403 });
        }

        try {
            await env.DB.prepare(`
                UPDATE cards SET 
                full_name = ?, job_title = ?, company = ?, bio = ?,
                email = ?, phone = ?, website = ?,
                slug = ?, template_id = ?,
                socials = ?, phones = ?, emails = ?,
                avatar_url = ?, gallery = ?, design = ?,
                title = ?, description = ?

                WHERE id = ?
            `).bind(
                body.full_name, body.job_title, body.company, body.bio,
                body.email, body.phone, body.website,
                body.slug ? body.slug.trim() : body.slug, // Ensure we trim on save too
                body.template_id,
                JSON.stringify(body.socials || {}),
                JSON.stringify(body.phones || []),
                JSON.stringify(body.emails || []),
                body.avatar_url,
                JSON.stringify(body.gallery || []),
                JSON.stringify(body.design || {}),
                body.full_name, // Mapping full_name to title
                body.bio,       // Mapping bio to description
                body.id
            ).run();

            // Sync name change to User account ONLY if this is the Main Profile card
            // (A Main Profile card has no parent_id)
            if (body.full_name) {
                await env.DB.prepare(`
                    UPDATE users SET full_name = ? 
                    WHERE id = (SELECT user_id FROM cards WHERE id = ? AND parent_id IS NULL)
                `).bind(body.full_name, body.id).run();
            }

            // Note: Removed 'AND user_id = ?' from WHERE because we pre-validated 'authorized'
            return new Response(JSON.stringify({ success: true, id: body.id }), { headers: { "Content-Type": "application/json" } });
        } catch (e) {
            // Return specific error to debug constraint violations
            if (e.message.includes('UNIQUE constraint failed')) {
                return new Response(JSON.stringify({ success: false, error: "Database Conflict: " + e.message }), { status: 409 });
            }
            return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
        }
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
}