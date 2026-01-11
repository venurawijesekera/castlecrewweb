"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";

export default function LeadsPage() {
    const router = useRouter();
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadLeads = async () => {
        const token = localStorage.getItem('castle_token');
        if (!token) return router.push('/login');

        try {
            setLoading(true);
            const res = await fetch('/api/leads', { headers: { 'Authorization': token } });
            if (res.status === 401) return router.push('/login');

            const data: any[] = await res.json();
            setLeads(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLeads();
    }, []);

    const saveContact = (name: string, phone: string, email: string) => {
        const vcard = [
            "BEGIN:VCARD", "VERSION:3.0",
            `FN:${name}`, `TEL;TYPE=CELL:${phone}`, `EMAIL;TYPE=WORK:${email}`,
            "END:VCARD"
        ].join("\n");
        const blob = new Blob([vcard], { type: "text/vcard" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = name.replace(' ', '_') + ".vcf";
        a.href = url;
        a.click();
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen md:h-screen md:overflow-hidden bg-[#0f0f0f]">
            <Sidebar />
            <main className="flex-1 relative overflow-y-auto bg-[#050505]">
                <div className="p-6 md:p-12 pb-32 md:pb-12 max-w-6xl mx-auto h-full">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h1 className="text-3xl font-black uppercase text-white mb-1">My <span className="text-[#f00000]">Connections</span></h1>
                            <p className="text-gray-400 text-sm">People who shared their details with you.</p>
                        </div>
                        <button onClick={loadLeads} className="text-xs bg-gray-800 px-3 py-2 rounded hover:bg-gray-700 text-white transition flex items-center gap-2">
                            <i className="bi bi-arrow-clockwise"></i> Refresh
                        </button>
                    </div>

                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <div className="col-span-3">Name</div>
                        <div className="col-span-2">Phone</div>
                        <div className="col-span-3">Email</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-2 text-right">Action</div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center text-gray-600 py-10">Loading connections...</div>
                        ) : leads.length === 0 ? (
                            <div className="text-center py-12 border border-gray-800 rounded-xl border-dashed">
                                <i className="bi bi-people text-4xl text-gray-700 mb-2 block"></i>
                                <span className="text-gray-500 text-sm">No connections yet.</span>
                            </div>
                        ) : (
                            leads.map((lead: any) => (
                                <div key={lead.id} className="bg-[#121212] border border-gray-800 rounded-xl p-5 flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center transition hover:border-gray-700 group">
                                    <div className="md:col-span-3 w-full">
                                        <div className="text-white font-bold text-lg md:text-sm">{lead.name}</div>
                                        {lead.message && <div className="text-xs text-gray-400 mt-1 italic md:hidden">"{lead.message}"</div>}
                                    </div>
                                    <div className="md:col-span-2 w-full">
                                        <div className="text-[10px] text-gray-500 uppercase md:hidden mb-1 font-bold">Phone</div>
                                        <div className="text-gray-300 text-sm font-mono">
                                            <a href={`tel:${lead.phone}`} className="hover:text-[#f00000] transition underline decoration-gray-700 underline-offset-2 md:no-underline">{lead.phone}</a>
                                        </div>
                                    </div>
                                    <div className="md:col-span-3 w-full overflow-hidden">
                                        <div className="text-[10px] text-gray-500 uppercase md:hidden mb-1 font-bold">Email</div>
                                        <div className="text-gray-300 text-sm truncate" title={lead.email}>
                                            {lead.email ? <a href={`mailto:${lead.email}`} className="hover:text-white transition">{lead.email}</a> : <span className="text-gray-600">-</span>}
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 w-full">
                                        <div className="text-[10px] text-gray-500 uppercase md:hidden mb-1 font-bold">Connected</div>
                                        <div className="text-gray-500 text-xs">{new Date(lead.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div className="md:col-span-2 w-full flex md:justify-end mt-2 md:mt-0">
                                        <button onClick={() => saveContact(lead.name, lead.phone, lead.email)} className="w-full md:w-auto bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2 shadow-sm">
                                            <i className="bi bi-person-plus-fill"></i> Save
                                        </button>
                                    </div>
                                    {lead.message && <div className="hidden md:block col-span-12 text-xs text-gray-500 mt-2 pt-2 border-t border-gray-800 w-full">Message: "{lead.message}"</div>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
