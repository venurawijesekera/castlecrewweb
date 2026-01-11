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

        // Get User and Sub License Count
        const user: any = await db.prepare("SELECT sub_license_count, enterprise_id FROM users WHERE id = ?").bind(userId).first();
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get All Cards
        const { results: cards } = await db.prepare("SELECT * FROM cards WHERE user_id = ? ORDER BY created_at ASC").bind(userId).all();

        // Get Enterprise Data if applicable
        let enterpriseInfo = null;
        if (user.enterprise_id) {
            const enterprise: any = await db.prepare("SELECT sub_license_count FROM enterprises WHERE id = ?").bind(user.enterprise_id).first();
            const usedResult: any = await db.prepare("SELECT COUNT(*) as count FROM cards WHERE enterprise_id = ? AND parent_id IS NOT NULL").bind(user.enterprise_id).first();
            if (enterprise) {
                enterpriseInfo = {
                    total: enterprise.sub_license_count,
                    used: usedResult ? usedResult.count : 0
                };
            }
        }

        return NextResponse.json({
            sub_license_count: user.sub_license_count || 0,
            cards: cards,
            enterprise: enterpriseInfo
        });

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
        const { title, slug } = body;

        // Validation
        if (!title || !slug) {
            return NextResponse.json({ error: "Title and Slug are required" }, { status: 400 });
        }

        // Check Quota and Get Enterprise ID
        const user: any = await db.prepare("SELECT sub_license_count, enterprise_id FROM users WHERE id = ?").bind(userId).first();
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const cardCountResult: any = await db.prepare("SELECT COUNT(*) as count FROM cards WHERE user_id = ?").bind(userId).first();
        const cardCount = cardCountResult ? cardCountResult.count : 0;

        const quota = user.sub_license_count || 0;
        // logic: Total Cards Allowed = 1 (Main) + Quota
        if (cardCount >= (1 + quota)) {
            return NextResponse.json({ error: "Quota reached. Limit: " + quota + " product cards." }, { status: 403 });
        }

        // Enterprise-wide Limit Check
        if (user.enterprise_id) {
            const enterprise: any = await db.prepare("SELECT sub_license_count FROM enterprises WHERE id = ?").bind(user.enterprise_id).first();
            if (enterprise) {
                const totalEnterpriseCardsResult: any = await db.prepare("SELECT COUNT(*) as count FROM cards WHERE enterprise_id = ? AND parent_id IS NOT NULL").bind(user.enterprise_id).first();
                const totalEnterpriseCards = totalEnterpriseCardsResult ? totalEnterpriseCardsResult.count : 0;

                if (totalEnterpriseCards >= enterprise.sub_license_count) {
                    return NextResponse.json({ error: "Enterprise sub-license limit reached. Please contact your administrator." }, { status: 403 });
                }
            }
        }

        // Check Slug Uniqueness
        const existing: any = await db.prepare("SELECT id FROM cards WHERE slug = ?").bind(slug).first();
        if (existing) {
            return NextResponse.json({ error: "Slug already taken" }, { status: 400 });
        }

        // Get Main Card ID to set as Parent
        const mainCard: any = await db.prepare("SELECT id FROM cards WHERE user_id = ? ORDER BY created_at ASC LIMIT 1").bind(userId).first();
        const parentId = mainCard ? mainCard.id : null;

        // Insert
        await db.prepare(`
        INSERT INTO cards (user_id, slug, full_name, bio, title, description, company, phone, template_id, created_at, parent_id, enterprise_id)
        VALUES (?, ?, ?, 'New Product Card', ?, 'New Product Card', '', '', ?, CURRENT_TIMESTAMP, ?, ?)
    `).bind(userId, slug, title, title, body.template_id || 'signature', parentId, user.enterprise_id || null).run();

        return NextResponse.json({ success: true });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const userId = await getUserIdFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = getDB();
        const url = new URL(request.url);
        const slug = url.searchParams.get('slug');

        if (!slug) {
            return NextResponse.json({ error: "Slug required" }, { status: 400 });
        }

        // Delete (Ensure user owns it)
        const res = await db.prepare(`DELETE FROM cards WHERE user_id = ? AND slug = ?`).bind(userId, slug).run();

        if (res.meta.changes === 0) {
            return NextResponse.json({ error: "Card not found or could not be deleted" }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
