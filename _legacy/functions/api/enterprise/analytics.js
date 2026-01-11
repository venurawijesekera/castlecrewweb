export async function onRequestGet(context) {
    const { request, env } = context;

    try {
        if (!env.DB) throw new Error("Database binding 'DB' is missing");

        // 1. Auth Check
        const cookie = request.headers.get("Cookie");
        if (!cookie || !cookie.includes("session_token=")) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }
        const sessionToken = cookie.split("session_token=")[1].split(";")[0];

        const user = await env.DB.prepare(`
            SELECT u.id, u.role, u.enterprise_id
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = ? AND s.expires_at > ?
        `).bind(sessionToken, Date.now()).first();

        if (!user || !user.enterprise_id || (user.role !== 'super_admin' && user.role !== 'admin')) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
        }

        const enterpriseId = user.enterprise_id;

        // --- DETERMINE DATE RANGE ---
        const url = new URL(request.url);
        const range = url.searchParams.get('range') || '30d';

        let currentStart = '-30 days';
        let prevStart = '-60 days';
        let prevEnd = '-30 days';

        switch (range) {
            case '24h':
                currentStart = '-1 day';
                prevStart = '-2 days';
                prevEnd = '-1 day';
                break;
            case '7d':
                currentStart = '-7 days';
                prevStart = '-14 days';
                prevEnd = '-7 days';
                break;
            case '30d':
                currentStart = '-30 days';
                prevStart = '-60 days';
                prevEnd = '-30 days';
                break;
            case '90d':
                currentStart = '-90 days';
                prevStart = '-180 days';
                prevEnd = '-90 days';
                break;
            case '6m':
                currentStart = '-180 days';
                prevStart = '-360 days';
                prevEnd = '-180 days';
                break;
            case '1y':
                currentStart = '-365 days';
                prevStart = '-730 days';
                prevEnd = '-365 days';
                break;
        }

        // --- FETCH CURRENT STATS ---

        const getTotalScans = async (start, end = null) => {
            let query = `
                SELECT COUNT(*) as count 
                FROM analytics a
                JOIN users u ON a.card_user_id = u.id
                WHERE u.enterprise_id = ? AND a.type = 'visit'
                AND a.created_at >= DATETIME('now', ?)
            `;
            const params = [enterpriseId, start];
            if (end) {
                query += ` AND a.created_at < DATETIME('now', ?)`;
                params.push(end);
            }
            return await env.DB.prepare(query).bind(...params).first().then(r => r.count);
        };

        const getProductVisits = async (start, end = null) => {
            let query = `
                SELECT COUNT(*) as count
                FROM analytics a
                JOIN cards c ON a.slug = c.slug
                JOIN users u ON a.card_user_id = u.id
                WHERE u.enterprise_id = ? AND a.type = 'visit' 
                AND c.parent_id IS NOT NULL AND c.parent_id != 0 AND c.parent_id != ''
                AND a.created_at >= DATETIME('now', ?)
            `;
            const params = [enterpriseId, start];
            if (end) {
                query += ` AND a.created_at < DATETIME('now', ?)`;
                params.push(end);
            }
            try {
                const res = await env.DB.prepare(query).bind(...params).first();
                return res ? res.count : 0;
            } catch (e) { return 0; }
        };

        const getActions = async (start, end = null) => {
            let query = `
                SELECT COUNT(*) as count 
                FROM analytics a
                JOIN users u ON a.card_user_id = u.id
                WHERE u.enterprise_id = ? AND a.type != 'visit'
                AND a.created_at >= DATETIME('now', ?)
             `;
            const params = [enterpriseId, start];
            if (end) {
                query += ` AND a.created_at < DATETIME('now', ?)`;
                params.push(end);
            }
            return await env.DB.prepare(query).bind(...params).first().then(r => r.count);
        };

        // 1. Current Period Data
        const curTotal = await getTotalScans(currentStart);
        const curProduct = await getProductVisits(currentStart);
        const curProfile = Math.max(0, curTotal - curProduct);
        const curActions = await getActions(currentStart);

        // 2. Previous Period Data
        const prevTotal = await getTotalScans(prevStart, prevEnd);
        const prevProduct = await getProductVisits(prevStart, prevEnd);
        const prevProfile = Math.max(0, prevTotal - prevProduct);
        const prevActions = await getActions(prevStart, prevEnd);

        // 3. Calculate Trends
        const calcTrend = (curr, prev) => {
            if (prev === 0) return curr > 0 ? 100 : 0;
            return ((curr - prev) / prev) * 100;
        };

        const profileTrend = calcTrend(curProfile, prevProfile);
        const productTrend = calcTrend(curProduct, prevProduct);
        const actionsTrend = calcTrend(curActions, prevActions);
        const engagementTrend = 5.3; // Still mocked

        // Engagement placeholder
        const engagementTime = "0m 45s";

        // 3. Traffic Chart (Filtered by Range)
        let trafficQuery = "";
        const dateCol = range === '24h' ? "STRFTIME('%Y-%m-%d %H:00', a.created_at)" : "DATE(a.created_at)";

        trafficQuery = `
            SELECT 
                ${dateCol} as date,
                SUM(CASE 
                    WHEN c.parent_id IS NOT NULL AND c.parent_id != 0 AND c.parent_id != '' 
                    THEN 1 ELSE 0 
                END) as product_count,
                COUNT(*) as total_count
            FROM analytics a
            LEFT JOIN cards c ON a.slug = c.slug
            JOIN users u ON a.card_user_id = u.id
            WHERE u.enterprise_id = ? AND a.type = 'visit' 
            AND a.created_at >= DATETIME('now', ?)
            GROUP BY date
            ORDER BY date ASC
        `;

        const trafficRes = await env.DB.prepare(trafficQuery).bind(enterpriseId, currentStart).all();

        const statsByDate = trafficRes.results || [];
        const chartLabels = statsByDate.map(r => {
            if (range === '24h' && r.date.includes(' ')) {
                return r.date.split(' ')[1];
            }
            return r.date;
        });

        const productData = statsByDate.map(r => r.product_count);
        const totalData = statsByDate.map(r => r.total_count);
        const profileData = totalData.map((t, i) => Math.max(0, t - productData[i]));

        // Device Chart (Real data)
        let deviceData = [0, 0, 0]; // [Mobile, Desktop, Tablet]
        try {
            const deviceRes = await env.DB.prepare(`
                SELECT device, COUNT(*) as count
                FROM analytics a
                JOIN users u ON a.card_user_id = u.id
                WHERE u.enterprise_id = ? AND a.type = 'visit' 
                AND a.created_at >= DATETIME('now', ?)
                GROUP BY device
            `).bind(enterpriseId, currentStart).all();

            const results = deviceRes.results || [];

            results.forEach(r => {
                const type = (r.device || 'Desktop').toLowerCase();
                if (type === 'mobile') deviceData[0] += r.count;
                else if (type === 'desktop') deviceData[1] += r.count;
                else if (type === 'tablet') deviceData[2] += r.count;
                else deviceData[1] += r.count; // Default to desktop if unknown
            });

            // Fallback for visual balance if no data yet (optional, remove if you want strict 0s)
            const sum = deviceData.reduce((a, b) => a + b, 0);
            if (sum === 0 && curTotal > 0) {
                // If we have visits but no device data (old records), estimate
                deviceData = [Math.floor(curTotal * 0.7), Math.floor(curTotal * 0.25), Math.floor(curTotal * 0.05)];
            }
        } catch (e) {
            console.warn("Device Query Failed", e);
        }

        const deviceChart = {
            labels: ['Mobile', 'Desktop', 'Tablet'],
            datasets: [{
                data: deviceData,
                backgroundColor: ['#111', '#f00000', '#eee'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        };

        // Top Products
        let topProducts = { results: [] };
        try {
            topProducts = await env.DB.prepare(`
                SELECT c.full_name, c.slug, COUNT(a.id) as scans
                FROM analytics a
                JOIN cards c ON a.slug = c.slug
                JOIN users u ON a.card_user_id = u.id
                WHERE u.enterprise_id = ? AND a.type = 'visit' 
                AND c.parent_id IS NOT NULL AND c.parent_id != 0 AND c.parent_id != ''
                AND a.created_at >= DATETIME('now', ?)
                GROUP BY c.slug
                ORDER BY scans DESC
                LIMIT 10
            `).bind(enterpriseId, currentStart).all();
        } catch (e) { console.warn("Top Products Query Failed", e); }

        // Top Staff
        let topStaff = { results: [] };
        try {
            topStaff = await env.DB.prepare(`
                SELECT u.full_name as name, u.email, c.avatar_url, c.job_title, 
                (
                    SELECT COUNT(*) FROM analytics a2 
                    LEFT JOIN cards c2 ON a2.slug = c2.slug
                    WHERE a2.card_user_id = u.id 
                    AND a2.type = 'visit' 
                    AND (c2.parent_id IS NULL OR c2.parent_id = '' OR a2.slug IS NULL)
                    AND a2.created_at >= DATETIME('now', ?)
                ) as score
                FROM users u
                LEFT JOIN cards c ON u.id = c.user_id AND (c.parent_id IS NULL OR c.parent_id = '')
                WHERE u.enterprise_id = ? AND (u.role = 'user' OR u.role = 'staff')
                ORDER BY score DESC
                LIMIT 5
            `).bind(currentStart, enterpriseId).all();
        } catch (e) { console.warn("Top Staff Query Failed", e); }

        // --- LOCATIONS ---
        const getLocations = async (start, end = null) => {
            let countryQuery = `
                SELECT country, COUNT(*) as count 
                FROM analytics a
                JOIN users u ON a.card_user_id = u.id
                WHERE u.enterprise_id = ? AND a.type = 'visit' 
                AND a.created_at >= DATETIME('now', ?)
             `;
            let cityQuery = `
                SELECT city, country, latitude, longitude, COUNT(*) as count 
                FROM analytics a
                JOIN users u ON a.card_user_id = u.id
                WHERE u.enterprise_id = ? AND a.type = 'visit' 
                AND a.created_at >= DATETIME('now', ?)
             `;

            const params = [enterpriseId, start];

            if (end) {
                const endClause = " AND a.created_at < DATETIME('now', ?)";
                countryQuery += endClause;
                cityQuery += endClause;
                params.push(end);
            }

            countryQuery += " GROUP BY country ORDER BY count DESC LIMIT 5";
            cityQuery += " GROUP BY city ORDER BY count DESC LIMIT 20";

            try {
                const countries = await env.DB.prepare(countryQuery).bind(...params).all();
                const cities = await env.DB.prepare(cityQuery).bind(...params).all();
                return { countries: countries.results || [], markers: cities.results || [] };
            } catch (e) {
                console.warn("Location Query Failed (Schema likely missing columns yet)", e);
                return { countries: [], markers: [] };
            }
        };
        const locationData = await getLocations(currentStart);

        // Top Device Models
        let topDevices = { results: [] };
        try {
            topDevices = await env.DB.prepare(`
                SELECT COALESCE(device_model, device, 'Unknown Device') as device_model
                FROM analytics a
                JOIN users u ON a.card_user_id = u.id
                WHERE u.enterprise_id = ? 
                ORDER BY a.created_at DESC
                LIMIT 5
            `).bind(enterpriseId).all();

            // If query works but yields no rows, inject a status message 
            // so we know if it's filtering vs logic error.
            if (!topDevices.results || topDevices.results.length === 0) {
                topDevices = { results: [{ device_model: 'No Recent Device Data' }] };
            }
        } catch (e) {
            console.warn("Device Query Error", e);
            topDevices = { results: [{ device_model: 'Query Error' }] };
        }


        return new Response(JSON.stringify({
            overview: {
                profile_visits: curProfile,
                product_visits: curProduct,
                total_actions: curActions,
                engagement_time: engagementTime,
                // TRENDS
                profile_trend: profileTrend,
                product_trend: productTrend,
                actions_trend: actionsTrend,
                engagement_trend: engagementTrend
            },
            traffic_chart: {
                labels: chartLabels.length > 0 ? chartLabels : ['No Data'],
                total_data: totalData.length > 0 ? totalData : [0],
                profile_data: profileData.length > 0 ? profileData : [0],
                product_data: productData.length > 0 ? productData : [0]
            },
            device_chart: deviceChart,
            top_products: topProducts.results || [],
            top_staff: topStaff.results || [],
            locations: locationData,
            top_devices: topDevices.results || []
        }), { headers: { "Content-Type": "application/json" } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
