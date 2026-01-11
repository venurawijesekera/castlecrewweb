export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();
    const { slug, type, model } = body; // type = 'visit', 'save', 'call'

    if (!slug || !type) return new Response("Missing data", { status: 400 });

    try {
        // 1. Find User ID based on Slug
        const card = await env.DB.prepare("SELECT user_id FROM cards WHERE slug = ?").bind(slug).first();

        if (card) {
            // 2. Record Event with LOCATION & DEVICE
            // Get location from Cloudflare properties
            const cf = request.cf || {};
            const country = cf.country || "Unknown";
            const city = cf.city || "Unknown";
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
            // 2. Check Client Hints Header (Silver Standard)
            else {
                const chModel = request.headers.get("Sec-CH-UA-Model");
                if (chModel && chModel.trim() !== "") {
                    deviceModel = chModel.replace(/^"|"$/g, '');
                }
            }

            // 1. Detect Type
            if (/mobile/i.test(ua)) device = "Mobile";
            if (/ipad|tablet/i.test(ua)) device = "Tablet";

            // 2. Detect Model (Backup if Client Hints failed or look suspicious)
            try {
                // Determine if Client Hints gave us garbage (like "K" or empty)
                if (deviceModel === "Unknown" || deviceModel.length < 2) {
                    if (/android/i.test(ua)) {
                        // Strategy 1: Look for "Build/" pattern (Most reliable)
                        // matches: ...; <Model> Build/
                        const buildMatch = ua.match(/;\s+([^;]+?)\s+Build\//i);
                        let candidate = null;

                        if (buildMatch && buildMatch[1]) {
                            candidate = buildMatch[1].trim();
                        }

                        // Strategy 2: If Build/ failed, look for explicit manufacturer codes in the whole string
                        if (!candidate || candidate.length < 3) {
                            const explicit = ua.match(/(Pixel\s\w+|SM-\w+|M2\w+|CPH\w+|V2\w+)/i);
                            if (explicit) {
                                candidate = explicit[1];
                            } else {
                                // Strategy 3: Fallback to token after 'Android'
                                // ... Android 10; <TOKEN>; ...
                                const parts = ua.split(';');
                                const idx = parts.findIndex(p => p.toLowerCase().includes('android'));
                                if (idx > -1 && parts[idx + 1]) {
                                    let raw = parts[idx + 1].trim();
                                    // Clean common noise
                                    if (raw.length > 2 && raw.length < 30 &&
                                        !raw.startsWith('en-') &&
                                        !raw.includes('Build') &&
                                        !raw.startsWith('K)') &&
                                        !raw.includes('AppleWebKit') &&
                                        !raw.includes('Chrome/')) {
                                        candidate = raw;
                                    }
                                }
                            }
                        }

                        if (candidate && candidate.length > 2) {
                            deviceModel = candidate;
                            // Clean up common prefixes
                            if (deviceModel.toLowerCase().startsWith('sm-')) deviceModel = "Samsung " + deviceModel;
                        } else {
                            deviceModel = "Android Device";
                        }

                        // Specific overrides for popular flagships (Strongest Signal)
                        if (/Pixel\s+(\d+)/i.test(ua)) {
                            const p = ua.match(/Pixel\s+(\d+\s?(?:Pro|XL|Fold|a)?)/i);
                            if (p) deviceModel = "Google Pixel " + p[1];
                        } else if (/SM-F9/i.test(ua) || /Fold/i.test(ua)) {
                            if (!deviceModel.toLowerCase().includes("samsung")) deviceModel = "Samsung Galaxy Fold";
                            if (ua.includes('Fold 6')) deviceModel = "Samsung Z Fold 6";
                        }

                    } else if (/iphone/i.test(ua)) {
                        deviceModel = "iPhone";
                    } else if (/ipad/i.test(ua)) {
                        deviceModel = "iPad";
                    } else if (/macintosh|mac os x/i.test(ua)) {
                        deviceModel = "Mac";
                    } else if (/windows nt/i.test(ua)) {
                        deviceModel = "Windows PC";
                    }
                }
            } catch (e) { deviceModel = "Unknown"; }

            try {
                await env.DB.prepare("INSERT INTO analytics (card_user_id, type, slug, country, city, latitude, longitude, device, device_model) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
                    .bind(card.user_id, type, slug, country, city, lat, lon, device, deviceModel)
                    .run();
            } catch (e) {
                // If it failed, it might be missing columns. 
                console.warn("Analytics insert failed. Attempting schema update for Location/Device/Model...", e);

                try {
                    // Auto-migrate: Add the missing columns
                    // We run these sequentially. Some might fail if they exist, which is fine.
                    try { await env.DB.prepare("ALTER TABLE analytics ADD COLUMN slug TEXT").run(); } catch (e) { }
                    try { await env.DB.prepare("ALTER TABLE analytics ADD COLUMN country TEXT").run(); } catch (e) { }
                    try { await env.DB.prepare("ALTER TABLE analytics ADD COLUMN city TEXT").run(); } catch (e) { }
                    try { await env.DB.prepare("ALTER TABLE analytics ADD COLUMN latitude REAL").run(); } catch (e) { }
                    try { await env.DB.prepare("ALTER TABLE analytics ADD COLUMN longitude REAL").run(); } catch (e) { }
                    try { await env.DB.prepare("ALTER TABLE analytics ADD COLUMN device TEXT").run(); } catch (e) { }
                    try { await env.DB.prepare("ALTER TABLE analytics ADD COLUMN device_model TEXT").run(); } catch (e) { }
                } catch (migrationErr) {
                    console.log("Migration warning:", migrationErr.message);
                }

                try {
                    // Retry the insert with full data
                    await env.DB.prepare("INSERT INTO analytics (card_user_id, type, slug, country, city, latitude, longitude, device, device_model) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
                        .bind(card.user_id, type, slug, country, city, lat, lon, device, deviceModel)
                        .run();
                } catch (retryErr) {
                    console.error("Retry failed. Fallback to minimal insert.", retryErr);
                    // Final Fallback for really old schema
                    try {
                        await env.DB.prepare("INSERT INTO analytics (card_user_id, type, slug) VALUES (?, ?, ?)")
                            .bind(card.user_id, type, slug)
                            .run();
                    } catch (legacyErr) {
                        await env.DB.prepare("INSERT INTO analytics (card_user_id, type) VALUES (?, ?)")
                            .bind(card.user_id, type)
                            .run();
                    }
                }
            }
        }

        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}