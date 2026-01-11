"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

// Component to handle Search Params
function ProfileContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const view = searchParams.get("view");

    const [user, setUser] = useState<any>(null);
    const [products, setProducts] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const [licenseInfo, setLicenseInfo] = useState<any>({ used: 0, total: 0 });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStep, setModalStep] = useState<"template" | "details">("template");
    const [selectedTemplate, setSelectedTemplate] = useState("signature");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const token = localStorage.getItem("castle_token");
                if (!token) {
                    router.push("/login");
                    return;
                }

                // Fetch Main User Data
                const resCard = await fetch("/api/card");
                if (resCard.status === 401) {
                    router.push("/login"); // Middleware should handle, but verify
                    return;
                }
                const dataCard: any = await resCard.json();
                setUser(dataCard);

                if (view === "products") {
                    const resProducts = await fetch("/api/user/products");
                    const dataProducts: any = await resProducts.json();
                    const productCards = dataProducts.cards ? dataProducts.cards.filter((c: any) => c.parent_id) : [];
                    setProducts(productCards);

                    let used = productCards.length;
                    let total = dataProducts.sub_license_count;
                    // Enterprise override logic could be here (see legacy code)
                    if (dataProducts.enterprise) {
                        // If enterprise limit is stricter? Legacy logic was check both.
                        // For display we'll stick to user quota unless enterprise blocked.
                    }
                    setLicenseInfo({ used, total });
                }

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [view, router]);

    const handleCreateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCreating(true);
        const formData = new FormData(e.currentTarget);
        const title = formData.get("title");
        const slug = formData.get("slug");

        try {
            const res = await fetch("/api/user/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, slug, template_id: selectedTemplate })
            });
            const data: any = await res.json();
            if (res.ok) {
                alert("Product Created");
                setIsModalOpen(false);
                // Refresh or Redirect
                // In legacy: window.location.href = `product_editor.html?slug=${slug}`;
                // We don't have editor page yet.
                router.refresh();
                // reload products
                const resProducts = await fetch("/api/user/products");
                const dataProducts: any = await resProducts.json();
                setProducts(dataProducts.cards ? dataProducts.cards.filter((c: any) => c.parent_id) : []);


            } else {
                alert(data.error || "Failed");
            }
        } catch (err) {
            alert("Error creating product");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (slug: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/user/products?slug=${slug}`, { method: "DELETE" });
            if (res.ok) {
                setProducts(products.filter((p: any) => p.slug !== slug));
            } else {
                alert("Failed to delete");
            }
        } catch (e) {
            alert("Error deleting");
        }
    };

    if (loading) return <div className="p-10 text-white">Loading...</div>;

    const isProductsView = view === "products";

    return (
        <div className="p-6 md:p-12 pb-32 md:pb-12 max-w-4xl mx-auto h-full text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-8 border-b border-gray-800">
                <div>
                    <h1 className="text-3xl font-black uppercase mb-1">My <span className="text-[#f00000]">{isProductsView ? "Products" : "Profile"}</span></h1>
                    <p className="text-gray-400 text-sm">{isProductsView ? "Manage your individual product cards." : "Manage your account and card settings."}</p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                    {isProductsView ? (
                        <>
                            <div className="text-xl font-bold text-white">{licenseInfo.used} / {licenseInfo.total}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider">Licenses Used</div>
                        </>
                    ) : (
                        <>
                            <div className={`inline-block text-xs font-bold px-3 py-1 rounded uppercase tracking-wider ${user?.plan !== 'starter' || user?.enterprise_id ? 'bg-[#f00000]' : 'bg-gray-800'}`}>
                                {user?.enterprise_id ? (user?.role === 'super_admin' ? 'Enterprise Super Admin' : 'Enterprise Staff') : (user?.plan + " Member")}
                            </div>
                            <div className="mt-2 text-xs text-gray-500">Member since {user?.created_at ? new Date(user.created_at).getFullYear() : "..."}</div>
                        </>
                    )}
                </div>
            </div>

            {isProductsView ? (
                // PRODUCTS VIEW
                <div>
                    <div className="mb-8">
                        <button
                            onClick={() => { setIsModalOpen(true); setModalStep("template"); }}
                            className="bg-white text-black font-bold uppercase py-3 px-6 rounded hover:bg-gray-200 transition text-sm"
                        >
                            + Create Product Card
                        </button>
                        {/* Quota warning logic here if needed */}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.length === 0 && <div className="col-span-full text-center text-gray-500">No product cards found.</div>}
                        {products.map((card: any) => (
                            <div key={card.id} className="bg-[#121212] border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-lg truncate pr-4">{card.title || 'Untitled'}</h3>
                                    <Link href={`/${card.slug}`} target="_blank" className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400 hover:text-white">
                                        <i className="bi bi-box-arrow-up-right"></i> ↗
                                    </Link>
                                </div>
                                <p className="text-xs text-gray-500 mb-2 font-mono">/{card.slug}</p>
                                <div className="mt-auto flex gap-2">
                                    {/* Edit link pending */}
                                    <button className="flex-1 bg-white text-black text-xs font-bold py-2 rounded">EDIT</button>
                                    <button onClick={() => handleDelete(card.slug)} className="px-3 bg-red-900/20 text-red-500 rounded"><i className="bi bi-trash"></i> 🗑</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                // PROFILE VIEW
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Quick Links Grid */}
                    <div className="bg-[#121212] border border-gray-800 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#f00000] transition group cursor-pointer" onClick={() => router.push("/leads")}>
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-[#f00000] text-gray-400 group-hover:text-white transition">
                            <i className="bi bi-people-fill text-lg"></i> 👥
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-white uppercase tracking-wider">Connections</span>
                    </div>
                    {/* ... other grid items (Templates, Analytics, Settings) ... */}

                    {/* Active Card Preview */}
                    <div className="bg-[#121212] border border-gray-800 rounded-2xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-50"><i className="bi bi-nfc text-6xl text-[#f00000]/20"></i></div>
                        <h3 className="text-lg font-bold mb-6">Active Card</h3>
                        <div className="mb-6">
                            <p className="text-gray-500 text-xs uppercase font-bold mb-1">Your Link</p>
                            <Link href={user?.slug ? `/${user.slug}` : '#'} target="_blank" className="text-xl font-mono text-[#f00000] hover:underline">
                                castlecrew.cc/{user?.slug || "..."}
                            </Link>
                        </div>
                        <div className="mb-8">
                            <p className="text-gray-500 text-xs uppercase font-bold mb-1">Current Theme</p>
                            <p className="text-white font-bold capitalize">{user?.template_id || "..."}</p>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            {/* Edit Button */}
                            <button className="bg-white text-black px-6 py-3 rounded-lg text-sm font-bold hover:bg-gray-200 transition">Edit Card</button>
                            {/* Share Button logic here */}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[#111] w-full max-w-4xl p-6 rounded-2xl border border-gray-800 shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>

                        {modalStep === "template" ? (
                            <div>
                                <h2 className="text-xl font-bold mb-2">Select a Template</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                                    <div onClick={() => { setSelectedTemplate("signature"); setModalStep("details"); }} className="cursor-pointer group">
                                        <div className="bg-gray-900 border border-gray-800 rounded-xl h-48 mb-3 overflow-hidden group-hover:border-[#f00000] transition flex items-center justify-center">
                                            Person Icon
                                        </div>
                                        <h3 className="font-bold text-sm group-hover:text-[#f00000]">Standard Profile</h3>
                                    </div>
                                    {/* More templates */}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center gap-2 mb-6">
                                    <button onClick={() => setModalStep("template")} className="text-gray-500 hover:text-white">← Back</button>
                                    <h2 className="text-xl font-bold ml-auto mr-auto pr-10">Card Details</h2>
                                </div>
                                <form onSubmit={handleCreateProduct} className="space-y-4 max-w-sm mx-auto">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Product Title</label>
                                        <input type="text" name="title" required placeholder="e.g. BMW X5" className="w-full bg-[#121212] border border-gray-800 rounded px-3 py-2 text-white focus:border-[#f00000] outline-none" />
                                    </div>
                                    <div className="pb-4">
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">URL Slug</label>
                                        <input type="text" name="slug" required placeholder="bmw-x5-offer" className="w-full bg-[#121212] border border-gray-800 rounded px-3 py-2 text-white focus:border-[#f00000] outline-none" />
                                    </div>
                                    <button type="submit" disabled={creating} className="w-full bg-[#f00000] text-white font-bold py-3 rounded-lg hover:bg-red-700 transition">
                                        {creating ? "CREATING..." : "CREATE CARD"}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="p-10 text-white">Loading...</div>}>
            <ProfileContent />
        </Suspense>
    );
}
