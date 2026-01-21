import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/runtime";

export const runtime = 'edge';

// GET - Get single product by ID (public)
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const db = getDB();
        const product = await db.prepare(
            `SELECT * FROM products WHERE id = ? AND is_active = 1`
        ).bind(params.id).first();

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
