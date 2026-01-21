import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/runtime";

export const runtime = 'edge';

function isMasterAuthorized(req: NextRequest): boolean {
    const key = req.headers.get("X-Admin-Master-Key");
    const masterKey = process.env.MASTER_ADMIN_KEY || "technotronic_master_sys_2024";
    return key === masterKey;
}

// GET - List all products (for admin)
export async function GET(request: NextRequest) {
    if (!isMasterAuthorized(request)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const db = getDB();
        const products = await db.prepare(
            `SELECT * FROM products ORDER BY created_at DESC`
        ).all();

        return NextResponse.json(products.results || []);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create new product
export async function POST(request: NextRequest) {
    if (!isMasterAuthorized(request)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json() as { name: string; description?: string; price: number; category?: string; images?: string[]; stock?: number };
        const { name, description, price, category, images, stock } = body;

        if (!name || !price) {
            return NextResponse.json(
                { error: "Name and price are required" },
                { status: 400 }
            );
        }

        if (!images || images.length < 4) {
            return NextResponse.json(
                { error: "At least 4 images are required" },
                { status: 400 }
            );
        }

        const db = getDB();
        const imagesJson = JSON.stringify(images);
        const result = await db.prepare(
            `INSERT INTO products (name, description, price, category, image_url, images, stock, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1)`
        ).bind(name, description || "", price, category || "General", images[0] || "", imagesJson, stock || 0).run();

        return NextResponse.json({
            success: true,
            id: result.meta.last_row_id
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT - Update product
export async function PUT(request: NextRequest) {
    if (!isMasterAuthorized(request)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json() as { id: number; name?: string; description?: string; price?: number; category?: string; images?: string[]; stock?: number; is_active?: boolean };
        const { id, name, description, price, category, images, stock, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        const imagesJson = images ? JSON.stringify(images) : undefined;
        const mainImage = images && images.length > 0 ? images[0] : undefined;

        const db = getDB();
        await db.prepare(
            `UPDATE products 
             SET name = ?, description = ?, price = ?, category = ?, 
                 image_url = ?, images = ?, stock = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`
        ).bind(
            name, description, price, category, mainImage, imagesJson, stock, is_active ? 1 : 0, id
        ).run();

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
    if (!isMasterAuthorized(request)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        const db = getDB();
        await db.prepare(`DELETE FROM products WHERE id = ?`).bind(id).run();

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
