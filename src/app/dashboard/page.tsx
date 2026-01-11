"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Initial Auth Check
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/card");
                if (res.status === 401) {
                    router.push("/login");
                    return;
                }
                const data: any = await res.json();
                setUser(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [router]);

    const selectTemplate = async (templateId: string, isPremium: boolean) => {
        if (isPremium && user?.plan === 'starter' && !user?.enterprise_id) {
            alert("Requires PRO plan.");
            return; // or redirect to pricing
        }

        // Logic to update template
        // In legacy: fetched current card, updated template_id, posted back
        try {
            // simplified update call if API supports patch, but we reused generic update
            const payload = { ...user, template_id: templateId };

            // We need to fetch full card data first to not overwrite things with basic user data?
            // The /api/card GET returns everything needed.

            await fetch("/api/card", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            // In legacy it redirected to editor
            // router.push("/editor"); 
            alert("Template Selected (Editor redirection pending migration)");

        } catch (e) {
            alert("Error saving template");
        }
    };

    if (loading) return <div className="p-10 text-white">Loading...</div>;

    return (
        <div className="p-6 md:p-12 pb-32 md:pb-12 max-w-7xl mx-auto h-full text-white">
            <div className="mb-10">
                <h1 className="text-3xl md:text-4xl font-black uppercase mb-2">
                    Choose Your <span className="text-[#f00000]">Look</span>
                </h1>
                <p className="text-gray-400">Select a template to start editing your digital business card.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Real Estate */}
                <div className="group relative bg-[#121212] border border-gray-800 rounded-2xl overflow-hidden hover:border-[#f00000] transition duration-300">
                    <div className="h-64 bg-gray-900 relative p-6 flex flex-col items-center justify-center gap-4">
                        <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-black opacity-50"></div>
                        <div className="relative w-32 h-32 rounded-full bg-gray-700 border-4 border-gray-600 z-10"></div>
                        <div className="relative z-10 w-3/4 h-4 bg-gray-700 rounded"></div>
                    </div>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="text-xl font-bold">Real Estate</h3>
                            <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded font-bold uppercase">Pro</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">Clean, professional, and trust building.</p>
                        <div className="flex gap-2">
                            <button className="flex-1 py-3 border border-gray-700 rounded-lg text-sm font-bold hover:bg-white hover:text-black transition">
                                Preview
                            </button>
                            <button
                                onClick={() => selectTemplate('realestate', true)}
                                className="flex-1 py-3 bg-[#f00000] text-white rounded-lg text-sm font-bold hover:bg-red-700 transition"
                            >
                                Select
                            </button>
                        </div>
                    </div>
                </div>

                {/* Signature */}
                <div className="group relative bg-[#121212] border border-gray-800 rounded-2xl overflow-hidden hover:border-[#f00000] transition duration-300 ring-2 ring-[#f00000]/20">
                    <div className="absolute top-4 right-4 bg-[#f00000] text-white text-[10px] font-bold px-2 py-1 rounded z-20">FREE</div>
                    <div className="h-64 bg-gray-900 relative p-6 flex flex-col items-center justify-center gap-4 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#f00000]/20 to-black"></div>
                        <div className="relative w-full h-full bg-black border border-[#f00000]/30 rounded-xl p-4 flex flex-col justify-end">
                            <div className="w-12 h-12 bg-[#f00000] mb-4 rounded-full"></div>
                            <div className="w-full h-2 bg-gray-800 rounded mb-2"></div>
                        </div>
                    </div>
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-1 text-[#f00000]">Castle Signature</h3>
                        <p className="text-xs text-gray-500 mb-4">High contrast dark mode with vibrant red accents.</p>
                        <button
                            onClick={() => selectTemplate('signature', false)}
                            className="w-full py-3 bg-[#f00000] text-white rounded-lg text-sm font-bold hover:bg-red-700 transition"
                        >
                            Select Template
                        </button>
                    </div>
                </div>

                {/* Creative */}
                <div className="group relative bg-[#121212] border border-gray-800 rounded-2xl overflow-hidden hover:border-[#f00000] transition duration-300">
                    <div className="h-64 bg-gray-900 relative overflow-hidden">
                        {/* Use a placeholder div or Next.js Image if asset available */}
                        <div className="w-full h-full bg-gray-800 opacity-60"></div>
                    </div>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="text-xl font-bold">Creative Portfolio</h3>
                            <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded font-bold uppercase">Pro</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">Full-screen background images. Ideal for artists.</p>
                        <div className="flex gap-2">
                            <button className="flex-1 py-3 border border-gray-700 rounded-lg text-sm font-bold hover:bg-white hover:text-black transition">
                                Preview
                            </button>
                            <button
                                onClick={() => selectTemplate('creative', true)}
                                className="flex-1 py-3 bg-[#f00000] text-white rounded-lg text-sm font-bold hover:bg-red-700 transition"
                            >
                                Select
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
