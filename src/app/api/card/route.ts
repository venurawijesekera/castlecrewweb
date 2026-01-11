import { getDB } from "@/lib/runtime";
import { getUserIdFromToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
    try {
        const userId = await getUserIdFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = getDB();
        const url = new URL(request.url);
        const slug = url.searchParams.get("slug");
        const id = url.searchParams.get("id");

        let query = `
        SELECT cards.*, users.plan, users.role, users.created_at, users.enterprise_id, enterprises.name as company_name, enterprises.logo as enterprise_logo
        FROM cards 
        LEFT JOIN users ON cards.user_id = users.id 
        LEFT JOIN enterprises ON users.enterprise_id = enterprises.id
        WHERE cards.user_id = ?
    `;

        const params: any[] = [userId];

        if (slug) {
            query += " AND TRIM(cards.slug) = ? COLLATE NOCASE";
            params.push(slug.trim());
        } else if (id) {
            query += " AND cards.id = ?";
            params.push(id);
        } else {
            // Default to oldest card with parent_id IS NULL (Main Profile behavior)
            query += " ORDER BY CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END ASC, created_at ASC";
        }

        const data = await db.prepare(query).bind(...params).first();
        return NextResponse.json(data || {});

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const userId = await getUserIdFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = getDB();
        const body: any = await request.json();

        if (!body.id) {
            return NextResponse.json({ error: "Card ID is missing. Cannot update." }, { status: 400 });
        }

        let authorized = false;

        // Check ownership
        const cardOwnership: any = await db.prepare("SELECT user_id FROM cards WHERE id = ?").bind(body.id).first();
        if (cardOwnership && cardOwnership.user_id === userId) {
            authorized = true;
        }
        // Enterprise Admin Override
        else if (body.is_enterprise) {
            const cardUser: any = await db.prepare(`
            SELECT u.id, u.enterprise_id, u.assigned_admin_id 
            FROM cards c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.id = ?
        `).bind(body.id).first();

            const adminUser: any = await db.prepare(`
            SELECT enterprise_id, role FROM users WHERE id = ?
        `).bind(userId).first();

            if (cardUser && adminUser) {
                if (cardUser.assigned_admin_id === userId) authorized = true;

                if (cardUser.enterprise_id && adminUser.enterprise_id &&
                    cardUser.enterprise_id == adminUser.enterprise_id) {
                    authorized = true;
                }
                // Fallback for NULL enterprise users
                else if (!cardUser.enterprise_id && adminUser.enterprise_id) {
                    authorized = true;
                }
            }
        }

        if (!authorized) {
            return NextResponse.json({ error: "Unauthorized: You do not own this card." }, { status: 403 });
        }

        try {
            await db.prepare(`
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
                body.slug ? body.slug.trim() : body.slug,
                body.template_id,
                JSON.stringify(body.socials || {}),
                JSON.stringify(body.phones || []),
                JSON.stringify(body.emails || []),
                body.avatar_url,
                JSON.stringify(body.gallery || []),
                JSON.stringify(body.design || {}),
                body.full_name,
                body.bio,
                body.id
            ).run();

            // Sync name change
            if (body.full_name) {
                await db.prepare(`
                UPDATE users SET full_name = ? 
                WHERE id = (SELECT user_id FROM cards WHERE id = ? AND parent_id IS NULL)
            `).bind(body.full_name, body.id).run();
            }

            return NextResponse.json({ success: true, id: body.id });

        } catch (e: any) {
            if (e.message.includes('UNIQUE constraint failed')) {
                return NextResponse.json({ success: false, error: "Database Conflict: " + e.message }, { status: 409 });
            }
            throw e;
        }

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
