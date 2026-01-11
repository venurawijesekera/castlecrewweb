
import { getUserIdFromToken } from '../../utils/auth';

export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        if (!env.DB) throw new Error("Database binding 'DB' is missing");

        // 1. Auth & Get Enterprise ID
        // Reuse logic or helper. Since we need to verify Super Admin, let's copy the check or use a helper if available.
        // dashboard.js logic:
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

        if (!user || !user.enterprise_id || user.role !== 'super_admin') {
            return new Response(JSON.stringify({ error: "Unauthorized: Super Admin access required" }), { status: 403 });
        }

        const enterpriseId = user.enterprise_id;

        // 2. Parse Data
        // Expecting JSON for Name, but if uploading file, probably FormData?
        // Let's support JSON for name update first, or FormData if logo is included.
        // The prompt implies one form. "Change name AND upload logo".
        // Let's try parsing FormData.

        let name = null;
        let logoBase64 = null;

        const contentType = request.headers.get("content-type") || "";
        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            name = formData.get("name");
            const file = formData.get("logo");

            if (file && file instanceof File) {
                if (file.size > 1024 * 100) { // 100KB Limit
                    return new Response(JSON.stringify({ error: "Logo file too large (Max 100KB)" }), { status: 400 });
                }
                // Convert to Base64
                const arrayBuffer = await file.arrayBuffer();
                const bytes = new Uint8Array(arrayBuffer);
                let binary = '';
                for (let i = 0; i < bytes.byteLength; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                logoBase64 = btoa(binary);
                // Prepend Data URI scheme? "data:image/png;base64,"
                // We'll rely on frontend to handle or store standard base64?
                // Better to store full Data URI?
                // Let's assume standard base64 string.
                logoBase64 = `data:${file.type};base64,${logoBase64}`;
            }
        } else {
            const body = await request.json();
            name = body.name;
        }

        if (!name && !logoBase64) {
            return new Response(JSON.stringify({ error: "No changes provided" }), { status: 400 });
        }

        // 3. Update DB
        // Build query dynamically
        let query = "UPDATE enterprises SET ";
        let params = [];
        let updates = [];

        if (name) {
            updates.push("name = ?");
            params.push(name);
        }
        if (logoBase64) {
            updates.push("logo = ?");
            params.push(logoBase64);
        }

        query += updates.join(", ");
        query += " WHERE id = ?";
        params.push(enterpriseId);

        await env.DB.prepare(query).bind(...params).run();

        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
