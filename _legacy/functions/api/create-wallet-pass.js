import { getUserIdFromToken } from '../utils/auth';
import jwt from 'jsonwebtoken';

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // 1. Authenticate
        const userId = await getUserIdFromToken(request, env);
        if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

        // 2. Fetch Card Data
        // Prioritize the user's "Signature" card or main profile
        const card = await env.DB.prepare(`
            SELECT cards.*, users.plan, users.email as user_email 
            FROM cards 
            JOIN users ON cards.user_id = users.id 
            WHERE cards.user_id = ? 
            ORDER BY cards.created_at ASC
        `).bind(userId).first();

        if (!card) return new Response(JSON.stringify({ error: "No card found" }), { status: 404 });

        // 3. Load Configuration
        // Expecting GOOGLE_WALLET_CREDENTIALS to be the content of service-account.json
        const credentialsStr = env.GOOGLE_WALLET_CREDENTIALS;
        const issuerId = env.GOOGLE_WALLET_ISSUER_ID;

        if (!credentialsStr || !issuerId) {
            console.error("Missing Google Wallet Configuration");
            return new Response(JSON.stringify({
                error: "Wallet configuration missing. Contact support."
            }), { status: 500 });
        }

        const credentials = JSON.parse(credentialsStr);
        const serviceAccountEmail = credentials.client_email;
        const privateKey = credentials.private_key.replace(/\\n/g, '\n');
        // 4. Define Pass Data (Version 20 - Final Production Ready Layout)
        // NOTE: The "[TEST ONLY]" prefix is added by Google automatically if your account is in Demo Mode.
        // To remove it, you must request "Production Access" in the Google Pay & Wallet Console.
        const classId = `${issuerId}.castle_crew_v20`;
        const objectId = `${issuerId}.user_${userId}_v20`;

        // Image Logic: Handle relative paths
        const defaultLogo = "https://castlecrew.cc/assets/img/logo.png";
        let userAvatar = defaultLogo;

        if (card.avatar_url) {
            if (card.avatar_url.startsWith('http')) {
                userAvatar = card.avatar_url;
            } else if (card.avatar_url.startsWith('/')) {
                userAvatar = `https://castlecrew.cc${card.avatar_url}`;
            }
        }

        // Generic Class Definition
        const genericClass = {
            id: classId
        };

        // Construct Details Text for the "Header" field (Main Body)
        // mimics the visual sections requested: Label \n Value
        let detailsText = "";
        if (card.job_title) detailsText += `Job Title\n${card.job_title}\n\n`;
        if (card.company) detailsText += `Company\n${card.company}`;
        // Append contact info if needed, but prioritize the visual request
        if (!detailsText) detailsText = "Member";

        // Generic Object Definition
        const genericObject = {
            id: objectId,
            classId: classId,
            logo: {
                sourceUri: { uri: userAvatar },
                contentDescription: { defaultValue: { language: "en-US", value: "Profile Picture" } }
            },
            cardTitle: {
                defaultValue: { language: "en-US", value: "Castle Crew" }
            },
            // SUBHEADER: Used for the NAME to appear at the TOP (Label position)
            subheader: {
                defaultValue: { language: "en-US", value: card.full_name || "Castle User" }
            },
            // HEADER: Used for the DETAILS Body (Value position)
            header: {
                defaultValue: { language: "en-US", value: detailsText }
            },
            hexBackgroundColor: "#050505",
            smartTapRedemptionValue: `https://castlecrew.cc/${card.slug || ''}`,

            // Barcode
            barcode: {
                type: "QR_CODE",
                value: `https://castlecrew.cc/${card.slug || ''}`,
                alternateText: "Scan to View"
            },

            // LINKS MODULE
            linksModuleData: {
                uris: [
                    {
                        uri: `https://castlecrew.cc/${card.slug || ''}`,
                        description: "Full Profile",
                        id: "link_profile"
                    }
                ]
            },

            // TEXT MODULES: Kept for "Details" view
            textModulesData: [
                {
                    header: "Phone",
                    body: card.phone || "N/A",
                    id: "phone"
                },
                {
                    header: "Email",
                    body: card.email || "N/A",
                    id: "email"
                },
                {
                    header: "Web",
                    body: card.website || "castlecrew.cc",
                    id: "website"
                }
            ]
        };

        // Dynamically add Links
        if (card.phone) {
            genericObject.linksModuleData.uris.push({
                uri: `tel:${card.phone.replace(/\s+/g, '')}`,
                description: "Call Mobile",
                id: "link_phone"
            });
        }
        if (card.email) {
            genericObject.linksModuleData.uris.push({
                uri: `mailto:${card.email}`,
                description: "Send Email",
                id: "link_email"
            });
        }
        if (card.website) {
            genericObject.linksModuleData.uris.push({
                uri: card.website.startsWith('http') ? card.website : `https://${card.website}`,
                description: "Visit Website",
                id: "link_website"
            });
        }

        // 5. Create JWT Payload
        const claims = {
            iss: serviceAccountEmail,
            aud: "google",
            typ: "savetowallet",
            payload: {
                genericClasses: [genericClass],
                genericObjects: [genericObject]
            }
        };

        // 6. Sign JWT
        const token = jwt.sign(claims, privateKey, { algorithm: 'RS256' });

        const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

        return new Response(JSON.stringify({ saveUrl }), { headers: { "Content-Type": "application/json" } });

    } catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ error: "Failed to generate pass: " + e.message }), { status: 500 });
    }
}
