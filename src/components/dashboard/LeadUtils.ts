// Shared utility for filtering leads
// This logic was previously duplicated in leads.html and product_leads.html

export interface Lead {
    id: number;
    card_user_id: number;
    name: string;
    phone: string;
    email: string | null;
    message: string | null;
    card_slug: string | null;
    created_at: string;
}

export interface Product {
    id: number;
    slug: string;
    template_id: string;
    // ... other fields
}

export const filterLeads = (leads: Lead[], products: Product[], type: 'personal' | 'product') => {
    // Assume the first card (oldest) might be considered the "Main Profile" in some legacy logic,
    // but here we rely on the product list returned by /api/user/products.
    // The legacy code used logic: 
    // "leads.filter(lead => lead.card_slug && productSlugs.has(lead.card_slug.toLowerCase()))" for products.
    // And implicit "everything else" for personal? 
    // Actually leads.html didn't strictly filter in the legacy code snippet provided earlier?
    // Wait, looking at leads.html legacy code provided: 
    // "const productSlugs = new Set(products...); const leads = allLeads.filter(lead => lead.card_slug && productSlugs.has(...));" 
    // It seems the leads.html implementation I read in `Step 553` was actually `product_leads.html` logic? 

    // Let's re-read leads.html carefully from Step 553.
    // HTML Title: "Connections - Castle Cards" (leads.html)
    // Script: It fetches leads, but DOES NOT fetch products. It just displays ALL leads returned by /api/leads.
    // Wait, step 553 output for `leads.html` shows `loadLeads` fetching `/api/leads` and just rendering map.

    // Step 554 output for `product_leads.html`:
    // Fetches `/api/leads` AND `/api/user/products`.
    // Logic: `const productSlugs = new Set(...); const leads = allLeads.filter(lead => lead.card_slug && productSlugs.has(...));`

    // So: 
    // Leads Page (Connections) = ALL leads (or maybe just those NOT in products if we want to separate them? Legacy leads.html seems to show EVERYTHING).
    // Product Leads Page = ONLY leads associated with a Product Card.

    // However, usually users want "Connections" to be their personal card leads.
    // If I look at the legacy `leads.html` again (Step 553), it acts as a "Connections" page and iterates over `leads` directly returned from API.
    // The API `SELECT * FROM leads WHERE card_user_id = ?` returns everything.
    // So `leads.html` shows ALL leads.

    // `product_leads.html` (Step 554) filters to show ONLY product leads.

    // To match legacy exactly:
    // leads/page.tsx should show ALL leads.
    // product-leads/page.tsx should show ONLY product leads.

    // But refined logic suggests: "Connections" usually implies personal networking.
    // If I show product sales leads in "Connections", it might be cluttered.
    // But legacy `leads.html` shows all. I will stick to legacy behavior unless it feels wrong.
    // Actually, `leads.html` is "Connections". `product_leads.html` is "Product Leads".
    // It makes sense that "Connections" is the aggregate or at least the personal ones. 

    if (type === 'product') {
        const productSlugs = new Set(products.map(p => (p.slug || "").toLowerCase()));
        return leads.filter(lead => lead.card_slug && productSlugs.has(lead.card_slug.toLowerCase()));
    }

    // For 'personal' (or default 'all' view in leads.html), we return all? 
    // Or do we filter OUT product leads?
    // Legacy `leads.html` did NOT filter. so it showed everything.
    return leads;
};
