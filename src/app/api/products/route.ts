import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/runtime";

export const runtime = 'edge';

// GET - List all active products (public)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        const db = getDB();
        let query = `SELECT * FROM products WHERE is_active = 1`;
        const params: any[] = [];

        if (category) {
            query += ` AND (category = ? OR category LIKE '%"' || ? || '"%')`;
            params.push(category, category);
        }

        query += ` ORDER BY created_at DESC`;

        const products = await db.prepare(query).bind(...params).all();

        return NextResponse.json(products.results || []);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
