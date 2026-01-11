import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/runtime";

export const runtime = 'edge';

export async function POST(request: NextRequest) {
    const db = getDB();

    try {
        const body: any = await request.json();
        const { slug, type, model } = body; // type = 'visit', 'save', 'call'

        if (!slug || !type) return NextResponse.json({ error: "Missing data" }, { status: 400 });

        // 1. Find User ID based on Slug
        const card: any = await db.prepare("SELECT user_id FROM cards WHERE slug = ?").bind(slug).first();

        if (card) {
            // 2. Record Event with LOCATION & DEVICE
            // Note: In Next.js middleware or functions, geo is often in 'request.geo' or headers depending on platform.
            // Cloudflare Workers specifically populates 'request.cf'.
            // However, NextRequest wrapper might need access to it.
            // On deployed 'next-on-pages', 'request' object passed to route handlers is enhanced.
            // We will attempt to read standard headers if 'cf' is not directly exposed on NextRequest type.

            const cf = (request as any).cf || {};
            const country = cf.country || request.headers.get("cf-ipcountry") || "Unknown";
            const city = cf.city || request.headers.get("cf-ipcity") || "Unknown";
            const lat = cf.latitude || 0;
            const lon = cf.longitude || 0;

            // Get Device Type & Model from User-Agent
            const ua = request.headers.get("User-Agent") || "";
            let device = "Desktop";
            let deviceModel = "Unknown";

            // 1. Check Explicit Model from Frontend (Gold Standard)
            if (model && model.trim() !== "") {
                deviceModel = model;
            }
            // 2. Client Hints
            else {
                const chModel = request.headers.get("Sec-CH-UA-Model");
                if (chModel && chModel.trim() !== "") {
                    deviceModel = chModel.replace(/^"|"$/g, '');
                }
            }

            // 1. Detect Type
            if (/mobile/i.test(ua)) device = "Mobile";
            if (/ipad|tablet/i.test(ua)) device = "Tablet";

            // 2. Detect Model Fallback (simplified version of legacy logic)
            if (deviceModel === "Unknown" || deviceModel.length < 2) {
                try {
                    if (/iphone/i.test(ua)) deviceModel = "iPhone";
                    else if (/ipad/i.test(ua)) deviceModel = "iPad";
                    else if (/android/i.test(ua)) {
                        const buildMatch = ua.match(/;\s+([^;]+?)\s+Build\//i);
                        if (buildMatch && buildMatch[1]) deviceModel = buildMatch[1].trim();
                        else deviceModel = "Android Device";
                    }
                    else if (/windows/i.test(ua)) deviceModel = "Windows PC";
                    else if (/mac/i.test(ua)) deviceModel = "Mac";
                } catch (e) { }
            }

            try {
                await db.prepare("INSERT INTO analytics (card_user_id, type, slug, country, city, latitude, longitude, device, device_model) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
                    .bind(card.user_id, type, slug, country, city, lat, lon, device, deviceModel)
                    .run();
            } catch (e) {
                // Auto-fix schema if missing columns (simplified)
                try {
                    await db.prepare("INSERT INTO analytics (card_user_id, type, slug) VALUES (?, ?, ?)").bind(card.user_id, type, slug).run();
                } catch (legacyErr) {
                    await db.prepare("INSERT INTO analytics (card_user_id, type) VALUES (?, ?)").bind(card.user_id, type).run();
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
