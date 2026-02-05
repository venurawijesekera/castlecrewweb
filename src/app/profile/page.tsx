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
                const resCard = await fetch("/api/card", {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (resCard.status === 401) {
                    router.push("/login");
                    return;
                }
                const dataCard: any = await resCard.json();
                setUser(dataCard);

                if (view === "products") {
                    const resProducts = await fetch("/api/user/products", {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
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

    const handleShare = () => {
        if (user?.slug) {
            const url = `https://castlecrew.cc/${user.slug}`;
            navigator.clipboard.writeText(url);
            alert("Link copied to clipboard!");
        }
    };

    const handleAddToWallet = async () => {
        try {
            const token = localStorage.getItem("castle_token");
            const res = await fetch('/api/create-wallet-pass', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data: any = await res.json();

            if (res.ok && data.saveUrl) {
                window.open(data.saveUrl, '_blank');
            } else {
                alert('Failed: ' + (data.error || 'Unknown error'));
            }
        } catch (e) {
            console.error(e);
            alert('Error connecting to wallet service');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen text-slate-400">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div className="text-sm font-medium tracking-tight">Syncing your profile...</div>
            </div>
        </div>
    );

    const canAccessProducts = user?.plan === 'executive' || user?.enterprise_id;
    const isProductsView = view === "products" && canAccessProducts;

    return (
        <div className="p-8 md:p-16 pb-32 md:pb-16 max-w-6xl mx-auto min-h-full text-slate-900 bg-slate-50/50">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f00000]/10 text-[#f00000] text-[10px] font-black uppercase tracking-widest border border-[#f00000]/20">
                        {isProductsView ? "inventory" : "account overview"}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 uppercase italic">
                        My <span className="text-[#f00000]">{isProductsView ? "Products" : "Profile"}</span>
                    </h1>
                    <p className="text-slate-500 font-medium max-w-md">
                        {isProductsView
                            ? "Scale your business with optimized individual product landing pages."
                            : "Easily manage your personal profile, connections, and digital card settings."}
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    {isProductsView ? (
                        <div className="text-right">
                            <div className="text-2xl font-black text-slate-900 leading-none">
                                {licenseInfo.used} <span className="text-slate-300 font-light mx-1">/</span> {licenseInfo.total}
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Available slots</div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-end">
                            <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${(user?.plan !== 'starter' && user?.plan !== 'professional') || user?.enterprise_id ? 'bg-[#f00000] text-white shadow-lg shadow-red-100' : 'bg-slate-100 text-slate-500'}`}>
                                {user?.enterprise_id ? (user?.role === 'super_admin' ? 'Enterprise Admin+' : 'Enterprise Staff') : (user?.plan + " Member")}
                            </div>
                            <div className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : "..."}</div>
                        </div>
                    )}
                </div>
            </header>

            {view === "products" && !canAccessProducts ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm text-center px-6">
                    <div className="w-20 h-20 bg-red-50 text-[#f00000] rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-lg shadow-red-100">
                        <i className="bi bi-shield-lock-fill text-3xl"></i>
                    </div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Feature Restricted</h2>
                    <p className="text-slate-500 max-w-sm mb-8 font-medium">Product cards are exclusive to <b>Executive</b> and <b>Enterprise</b> partners. Upgrade to launch your catalog.</p>
                    <button className="bg-slate-900 text-white font-black uppercase py-4 px-10 rounded-2xl hover:bg-[#f00000] transition-all text-xs tracking-widest italic shadow-xl hover:shadow-red-200">
                        View Upgrade Options
                    </button>
                </div>
            ) : isProductsView ? (
                /* PRODUCTS VIEW */
                <div className="space-y-10">
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => { setIsModalOpen(true); setModalStep("template"); }}
                            className="bg-[#f00000] text-white font-black uppercase py-4 px-8 rounded-2xl shadow-xl shadow-red-100 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs tracking-widest"
                        >
                            <i className="bi bi-plus-lg mr-2"></i> Create New Card
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.length === 0 && (
                            <div className="col-span-full py-20 bg-white border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400">
                                <i className="bi bi-box-seam text-4xl mb-4"></i>
                                <p className="font-bold uppercase tracking-widest text-xs">No product cards launched yet</p>
                            </div>
                        )}
                        {products.map((card: any) => (
                            <div key={card.id} className="group bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200 transition-all duration-300 flex flex-col border-b-4 border-b-transparent hover:border-b-[#f00000]">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1 overflow-hidden">
                                        <h3 className="font-black text-slate-900 text-lg uppercase truncate leading-tight italic">{card.title || 'Untitled'}</h3>
                                        <p className="text-[10px] font-mono font-bold text-[#f00000] tracking-tighter uppercase truncate opacity-70">castlecrew.cc/{card.slug}</p>
                                    </div>
                                    <Link href={`/${card.slug}`} target="_blank" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#f00000] hover:text-white transition-all">
                                        <i className="bi bi-arrow-up-right"></i>
                                    </Link>
                                </div>
                                <div className="flex items-center gap-1.5 p-3 rounded-xl bg-slate-50/50 mb-6 border border-slate-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#f00000] animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Template: <span className="text-slate-900">{card.template_id || 'Signature'}</span></span>
                                </div>
                                <div className="mt-auto pt-4 flex gap-3">
                                    <Link
                                        href={`/editor?slug=${card.slug}`}
                                        className="flex-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl hover:bg-[#f00000] shadow-sm transition-all italic flex items-center justify-center"
                                    >
                                        Edit Card
                                    </Link>
                                    <button onClick={() => handleDelete(card.slug)} className="w-12 h-full bg-slate-50 text-slate-300 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center">
                                        <i className="bi bi-trash3-fill"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* PROFILE VIEW */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Stats & Quick Actions */}
                    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                        <QuickLinkCard
                            icon="bi-people-fill"
                            label="Connections"
                            desc="View leads"
                            onClick={() => router.push("/leads")}
                        />
                        <QuickLinkCard
                            icon="bi-bar-chart-fill"
                            label="Analytics"
                            desc="Monitor growth"
                            onClick={() => router.push("/analytics")}
                        />
                        <QuickLinkCard
                            icon="bi-grid-fill"
                            label="Templates"
                            desc="Design themes"
                            onClick={() => router.push("/dashboard")}
                        />
                        <QuickLinkCard
                            icon="bi-gear-fill"
                            label="Settings"
                            desc="Account config"
                            onClick={() => router.push("/settings")}
                        />
                    </div>

                    {/* Active Card Preview Card */}
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 relative overflow-hidden shadow-sm group">
                        <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                            <i className="bi bi-nfc text-[15rem] text-[#f00000]"></i>
                        </div>

                        <div className="relative z-10 h-full flex flex-col">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="w-3 h-10 bg-[#f00000] rounded-full"></div>
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Active Card</h3>
                            </div>

                            <div className="space-y-8 flex-1">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Public Link</label>
                                    <div className="flex flex-col">
                                        <Link href={user?.slug ? `/${user.slug}` : '#'} target="_blank" className="text-xl md:text-2xl font-black text-[#f00000] hover:underline decoration-white underline-offset-8 transition-all break-all italic">
                                            {user?.slug ? `castlecrew.cc/${user.slug}` : "pending..."}
                                        </Link>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Current Theme</label>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <p className="text-slate-900 font-black uppercase text-sm italic">{user?.template_id || "Standard"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 flex flex-col gap-3">
                                <div className="flex gap-3">
                                    <Link href="/editor" className="flex-1 bg-slate-900 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#f00000] transition-all shadow-lg hover:shadow-red-200 italic flex items-center justify-center">
                                        Edit Card
                                    </Link>
                                    <button onClick={handleShare} className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center group/btn">
                                        <i className="bi bi-share-fill group-hover/btn:text-[#f00000] transition-colors"></i>
                                    </button>
                                </div>
                                <button
                                    onClick={handleAddToWallet}
                                    className="w-full bg-white border border-slate-100 text-slate-900 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-[#f00000] hover:text-[#f00000] transition-all shadow-sm flex items-center justify-center gap-3 italic"
                                >
                                    <i className="bi bi-wallet2 text-lg"></i>
                                    Google Wallet
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal - Modernized */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-6">
                    <div className="bg-white w-full max-w-4xl p-10 rounded-[3rem] shadow-2xl relative border border-slate-100 overflow-hidden">
                        {/* Modal Background Decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#f00000]/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

                        <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-[#f00000] hover:bg-red-50 transition-all flex items-center justify-center z-20">
                            <i className="bi bi-x-lg text-sm"></i>
                        </button>

                        {modalStep === "template" ? (
                            <div className="relative z-10">
                                <div className="mb-10">
                                    <h2 className="text-3xl font-black uppercase italic italic tracking-tighter mb-2 underline underline-offset-8 decoration-[#f00000]/20">Select Baseline</h2>
                                    <p className="text-slate-400 font-medium">Choose a template to start your product card</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <TemplateOption
                                        name="Signature"
                                        type="Standard Profile"
                                        icon="bi-person-badge"
                                        onClick={() => { setSelectedTemplate("signature"); setModalStep("details"); }}
                                    />
                                    <TemplateOption
                                        name="Product"
                                        type="Catalog View"
                                        icon="bi-shop"
                                        onClick={() => { setSelectedTemplate("product"); setModalStep("details"); }}
                                    />
                                    <TemplateOption
                                        name="Luxury"
                                        type="High-End Showcase"
                                        icon="bi-stars"
                                        onClick={() => { setSelectedTemplate("luxury"); setModalStep("details"); }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="relative z-10 max-w-md mx-auto">
                                <button onClick={() => setModalStep("template")} className="mb-8 text-[10px] font-black uppercase tracking-widest text-[#f00000] hover:translate-x-[-4px] transition-transform flex items-center gap-2 italic">
                                    <i className="bi bi-arrow-left"></i> Change Template
                                </button>

                                <div className="mb-10">
                                    <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2 underline underline-offset-8 decoration-[#f00000]/20 text-center">Identity Details</h2>
                                </div>

                                <form onSubmit={handleCreateProduct} className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Product Title</label>
                                        <input type="text" name="title" required placeholder="Ex: Black Carbon Card" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:border-[#f00000] focus:bg-white outline-none transition-all font-bold placeholder:text-slate-300 shadow-sm" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Unique Slug</label>
                                        <div className="relative">
                                            <input type="text" name="slug" required placeholder="carbon-card-2024" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:border-[#f00000] focus:bg-white outline-none transition-all font-mono font-bold placeholder:text-slate-300 shadow-sm lowercase" />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-tighter">Unique URL</div>
                                        </div>
                                    </div>
                                    <button type="submit" disabled={creating} className="w-full bg-[#f00000] text-white font-black py-5 rounded-2xl shadow-xl shadow-red-100 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs tracking-[0.2em] italic">
                                        {creating ? "LAUNCHING..." : "ACTIVATE CARD"}
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

// Helper Components
function QuickLinkCard({ icon, label, desc, onClick }: any) {
    return (
        <button onClick={onClick} className="flex flex-col items-start p-8 bg-white border border-slate-100 rounded-[2rem] hover:shadow-xl hover:shadow-slate-200 hover:border-[#f00000]/20 transition-all group text-left shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#f00000] group-hover:text-white transition-all mb-6 group-hover:rotate-6 shadow-sm">
                <i className={`bi ${icon} text-xl`}></i>
            </div>
            <p className="text-xl font-black uppercase italic tracking-tighter text-slate-900 mb-1">{label}</p>
            <p className="text-xs font-medium text-slate-400 lowercase">{desc}</p>
        </button>
    );
}

function TemplateOption({ name, type, icon, onClick }: any) {
    return (
        <div onClick={onClick} className="cursor-pointer group flex flex-col gap-4">
            <div className="aspect-[4/5] bg-slate-50 border-2 border-slate-100 rounded-3xl overflow-hidden group-hover:border-[#f00000] group-hover:shadow-2xl group-hover:shadow-red-50 transition-all flex flex-col p-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-slate-200/20"></div>
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#f00000] group-hover:text-white transition-all shadow-sm z-10">
                    <i className={`bi ${icon} text-lg`}></i>
                </div>
                <div className="mt-auto z-10">
                    <div className="w-full h-1 bg-slate-200 rounded-full mb-2"></div>
                    <div className="w-2/3 h-1 bg-slate-200 rounded-full"></div>
                </div>
            </div>
            <div className="px-2">
                <h3 className="font-black text-slate-900 group-hover:text-[#f00000] transition-colors uppercase italic tracking-tighter text-lg">{name}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{type}</p>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-slate-400 uppercase font-black tracking-widest text-xs italic">Waking up...</div>}>
            <ProfileContent />
        </Suspense>
    );
}

