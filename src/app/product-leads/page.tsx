"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";

export default function ProductLeadsPage() {
    const router = useRouter();
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        const token = localStorage.getItem('castle_token');
        if (!token) return router.push('/login');

        try {
            setLoading(true);
            const [resLeads, resProducts] = await Promise.all([
                fetch('/api/leads', { headers: { 'Authorization': token } }),
                fetch('/api/user/products', { headers: { 'Authorization': token } })
            ]);

            if (resLeads.status === 401) return router.push('/login');

            const allLeads: any[] = await resLeads.json();
            const productsData: any = await resProducts.json();
            const products = productsData.cards || [];

            // Identify Product Cards (assume all cards except main profile?)
            // Legacy logic: "Assume the first card (oldest) is the Main Profile... SHOW leads for everything ELSE"
            let mainSlug = "";
            if (products.length > 0) {
                mainSlug = (products[0].slug || "").toLowerCase();
            }

            const productSlugs = new Set(products
                .map((p: any) => (p.slug || "").toLowerCase())
                .filter((s: string) => s !== mainSlug)
            );

            // Filter
            const filtered = allLeads.filter(lead => lead.card_slug && productSlugs.has(lead.card_slug.toLowerCase()));
            setLeads(filtered);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Grouping
    const groups: { [key: string]: any[] } = {};
    leads.forEach(lead => {
        const key = lead.card_slug ? `Product: /${lead.card_slug}` : 'Unknown Product';
        if (!groups[key]) groups[key] = [];
        groups[key].push(lead);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => a.localeCompare(b));

    return (
        <div className="flex flex-col md:flex-row min-h-screen md:h-screen md:overflow-hidden bg-[#0f0f0f]">
            <Sidebar />
            <main className="flex-1 relative overflow-y-auto bg-[#050505]">
                <div className="p-6 md:p-12 pb-32 md:pb-12 max-w-6xl mx-auto h-full">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h1 className="text-3xl font-black uppercase text-white mb-1">Product <span className="text-[#f00000]">Leads</span></h1>
                            <p className="text-gray-400 text-sm">Inquiries generated from your Product Cards.</p>
                        </div>
                        <button onClick={loadData} className="text-xs bg-gray-800 px-3 py-2 rounded hover:bg-gray-700 text-white transition flex items-center gap-2">
                            <i className="bi bi-arrow-clockwise"></i> Refresh
                        </button>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center text-gray-600 py-10">Loading leads...</div>
                        ) : leads.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">No product leads found.</div>
                        ) : (
                            sortedKeys.map(groupName => (
                                <div key={groupName} className="mb-8">
                                    <h3 className="text-sm font-bold text-[#f00000] uppercase mb-3 flex items-center gap-2">
                                        <i className="bi bi-folder-fill"></i> {groupName}
                                        <span className="bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded-full ml-auto border border-gray-700">{groups[groupName].length}</span>
                                    </h3>
                                    <div className="bg-[#121212] border border-gray-800 rounded-xl overflow-hidden">
                                        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-black/20 border-b border-gray-800">
                                            <div className="col-span-3">Name</div>
                                            <div className="col-span-3">Phone</div>
                                            <div className="col-span-4">Email / Message</div>
                                            <div className="col-span-2 text-right">Date</div>
                                        </div>
                                        <div className="divide-y divide-gray-800">
                                            {groups[groupName].map((lead: any) => (
                                                <div key={lead.id} className="p-5 md:grid md:grid-cols-12 gap-4 items-center hover:bg-gray-800/20 transition">
                                                    <div className="col-span-3 font-bold text-white truncate" title={lead.name}>{lead.name}</div>
                                                    <div className="col-span-3 text-xs text-[#f00000] font-mono"><a href={`tel:${lead.phone}`}>{lead.phone}</a></div>
                                                    <div className="col-span-4 text-xs text-gray-400 truncate" title={lead.message || lead.email}>{lead.message || lead.email || <span className="opacity-30">-</span>}</div>
                                                    <div className="col-span-2 text-[10px] text-gray-500 text-right font-mono">{new Date(lead.created_at).toLocaleDateString()}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
