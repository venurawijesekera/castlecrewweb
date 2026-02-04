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
        <div className="p-8 md:p-16 pb-32 md:pb-16 max-w-6xl mx-auto min-h-full text-slate-900 bg-slate-50/50">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f00000]/10 text-[#f00000] text-[10px] font-black uppercase tracking-widest border border-[#f00000]/20">
                        networking
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 uppercase italic">
                        My <span className="text-[#f00000]">Connections</span>
                    </h1>
                    <p className="text-slate-500 font-medium max-w-md">
                        People who have shared their digital contact details with you through your digital business card.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={loadLeads} className="bg-white text-slate-900 font-black uppercase py-3 px-6 rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all text-[10px] tracking-widest italic flex items-center gap-2">
                        <i className="bi bi-arrow-clockwise text-sm"></i> Refresh List
                    </button>
                </div>
            </header>

            {/* Table Header for Desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-8 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                <div className="col-span-3">Contact Identity</div>
                <div className="col-span-2">Contact Number</div>
                <div className="col-span-3">Email Address</div>
                <div className="col-span-2">Timestamp</div>
                <div className="col-span-2 text-right">Action</div>
            </div>

            <div className="space-y-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                        <div className="w-10 h-10 border-4 border-slate-100 border-t-[#f00000] rounded-full animate-spin mb-4"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest italic">Retrieving leads...</p>
                    </div>
                ) : leads.length === 0 ? (
                    <div className="col-span-full py-24 bg-white border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-400 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <i className="bi bi-people text-4xl"></i>
                        </div>
                        <p className="font-black uppercase tracking-widest text-xs italic">No active connections found</p>
                        <p className="text-[10px] text-slate-300 mt-2 font-bold uppercase tracking-tight">Your network grows when you scan others</p>
                    </div>
                ) : (
                    leads.map((lead: any) => (
                        <div key={lead.id} className="group bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 flex flex-col md:grid md:grid-cols-12 gap-6 items-start md:items-center transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:border-[#f00000]/10 border-l-4 border-l-transparent hover:border-l-[#f00000] relative overflow-hidden">

                            {/* Desktop Message Indicator */}
                            {lead.message && (
                                <div className="absolute top-0 right-0 p-2">
                                    <div className="w-2 h-2 rounded-full bg-[#f00000] shadow-glow animate-pulse"></div>
                                </div>
                            )}

                            <div className="md:col-span-3 w-full">
                                <h3 className="text-slate-900 font-black text-lg md:text-sm uppercase italic leading-tight group-hover:text-[#f00000] transition-colors truncate">{lead.name}</h3>
                                {lead.message && <div className="text-[10px] text-slate-400 mt-1.5 font-medium italic md:hidden border-l-2 border-red-100 pl-3">"{lead.message}"</div>}
                            </div>

                            <div className="md:col-span-2 w-full">
                                <div className="text-[8px] text-slate-400 uppercase md:hidden mb-2 font-black tracking-widest italic">Contact Number</div>
                                <div className="text-slate-600 text-sm font-bold tracking-tight">
                                    <a href={`tel:${lead.phone}`} className="hover:text-[#f00000] transition flex items-center gap-2">
                                        <i className="bi bi-telephone-fill opacity-20 md:hidden"></i>
                                        {lead.phone}
                                    </a>
                                </div>
                            </div>

                            <div className="md:col-span-3 w-full overflow-hidden">
                                <div className="text-[8px] text-slate-400 uppercase md:hidden mb-2 font-black tracking-widest italic">Email Address</div>
                                <div className="text-slate-500 text-sm truncate font-medium" title={lead.email}>
                                    {lead.email ? (
                                        <a href={`mailto:${lead.email}`} className="hover:text-slate-900 transition flex items-center gap-2">
                                            <i className="bi bi-envelope-fill opacity-20 md:hidden"></i>
                                            {lead.email}
                                        </a>
                                    ) : (
                                        <span className="text-slate-300 italic text-[10px] uppercase font-black">Not provided</span>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-2 w-full">
                                <div className="text-[8px] text-slate-400 uppercase md:hidden mb-2 font-black tracking-widest italic">Captured On</div>
                                <div className="text-slate-400 text-[10px] font-black uppercase tracking-tighter">
                                    {new Date(lead.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                            </div>

                            <div className="md:col-span-2 w-full flex md:justify-end mt-4 md:mt-0">
                                <button
                                    onClick={() => saveContact(lead.name, lead.phone, lead.email)}
                                    className="w-full md:w-14 md:h-14 bg-slate-900 text-white rounded-2xl text-[10px] md:text-lg font-black uppercase tracking-widest hover:bg-[#f00000] transition-all flex items-center justify-center gap-3 md:gap-0 shadow-lg hover:shadow-red-200"
                                    title="Export to Contacts"
                                >
                                    <i className="bi bi-download"></i>
                                    <span className="md:hidden">Save to Phone</span>
                                </button>
                            </div>

                            {/* Expanded Message View */}
                            {lead.message && (
                                <div className="hidden md:block col-span-12 text-[10px] text-slate-500 mt-4 pt-4 border-t border-slate-50 w-full group-hover:text-slate-700 transition-colors">
                                    <span className="font-black uppercase tracking-widest italic text-[8px] text-slate-300 mr-3">Attached Insight:</span>
                                    <span className="italic font-medium">"{lead.message}"</span>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
