"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function EditorPageWrapper() {
    return (
        <Suspense fallback={<div className="bg-[#050505] h-screen flex items-center justify-center text-white">Loading Editor...</div>}>
            <EditorContent />
        </Suspense>
    );
}

function EditorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const slugParam = searchParams.get('slug');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [card, setCard] = useState<any>({
        full_name: "", job_title: "", company: "", bio: "",
        email: "", phone: "", website: "", slug: "",
        template_id: "car",
        design: {
            specs: {
                brand: "", year: "", mileage: "", color: "", paint: "#ffffff",
                condition: "Used", trim: "", transmission: "", body: "", fuel: "",
                engine: "", locationName: "", locationUrl: ""
            },
            theme: "dark",
            accent: "#f00000"
        },
        socials: { whatsapp: "", facebook: "", instagram: "", linkedin: "", twitter: "" },
        phones: [],
        emails: [],
        gallery: [null, null, null, null],
        avatar_url: null,
        enterprise_logo: null
    });

    const [isEnterpriseStaff, setIsEnterpriseStaff] = useState(false);
    const [waCountry, setWaCountry] = useState("+94");

    useEffect(() => {
        const load = async () => {
            const token = localStorage.getItem('castle_token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                let url = '/api/card';
                if (slugParam) url += `?slug=${slugParam}`;

                const res = await fetch(url, { headers: { 'Authorization': token } });
                if (!res.ok) throw new Error("Failed to load");
                const data: any = await res.json();

                if (data.id) {
                    // Normalize data
                    let design = typeof data.design === 'string' ? JSON.parse(data.design) : (data.design || {});
                    let socials = typeof data.socials === 'string' ? JSON.parse(data.socials) : (data.socials || {});
                    let phones = [];
                    try { phones = JSON.parse(data.phones || "[]"); } catch (e) { }
                    let emails = [];
                    try { emails = JSON.parse(data.emails || "[]"); } catch (e) { }
                    let gallery = [null, null, null, null];
                    try { gallery = JSON.parse(data.gallery || "[]"); } catch (e) { }
                    // Ensure 4 slots
                    while (gallery.length < 4) gallery.push(null);

                    // Parse Specs
                    if (!design.specs) design.specs = {};

                    setCard({
                        ...data,
                        design,
                        socials,
                        phones,
                        emails,
                        gallery
                    });

                    // Set Enterprise Flag
                    // const isEnt = !!data.enterprise_id; // Logic from legacy might disable this for "Product Cards"
                    // Legacy: isEnterpriseStaff = false; // !!data.enterprise_id;
                    // It seems legacy disabled locking for product editor. I will keep it unlocked for now unless requested.
                    setIsEnterpriseStaff(false);

                    // WA Code Logic
                    if (socials.whatsapp) {
                        // Simple extract if possible, or default
                        // Not critical for migration V1 to exact regex split
                    }

                }
            } catch (e) {
                console.error(e);
                alert("Error loading card data");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [slugParam, router]);

    const handleChange = (field: string, value: any) => {
        setCard((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleDesignChange = (field: string, value: any) => {
        setCard((prev: any) => ({
            ...prev,
            design: {
                ...prev.design,
                specs: {
                    ...prev.design.specs,
                    [field]: value
                }
            }
        }));
    };

    const handleSocialChange = (key: string, value: string) => {
        setCard((prev: any) => ({
            ...prev,
            socials: { ...prev.socials, [key]: value }
        }));
    };

    // Gallery Upload
    const handleGalleryUpload = (index: number, e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event: any) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const maxSize = 800;
                let width = img.width; let height = img.height;
                if (width > height) { if (width > maxSize) { height *= maxSize / width; width = maxSize; } }
                else { if (height > maxSize) { width *= maxSize / height; height = maxSize; } }
                canvas.width = width; canvas.height = height;
                ctx?.drawImage(img, 0, 0, width, height);
                const base64 = canvas.toDataURL('image/jpeg', 0.8);

                const newGallery = [...card.gallery];
                newGallery[index] = base64;
                handleChange('gallery', newGallery);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const removeGallery = (index: number) => {
        const newGallery = [...card.gallery];
        newGallery[index] = null;
        handleChange('gallery', newGallery);
    };

    const save = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('castle_token');
            const res = await fetch('/api/card', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token || ''
                },
                body: JSON.stringify(card)
            });
            const json: any = await res.json();
            if (json.success) {
                alert("Saved successfully!");
            } else {
                alert("Error: " + json.error);
            }
        } catch (e) {
            alert("Save failed");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="bg-[#050505] h-screen flex items-center justify-center text-white">Loading Editor...</div>;

    return (
        <div className="flex flex-col md:flex-row min-h-screen md:h-screen md:overflow-hidden bg-[#050505] text-white font-sans">
            {/* LEFT PANE: EDITOR */}
            <div className="flex-1 flex flex-col h-screen relative z-10">
                {/* Header */}
                <div className="h-16 border-b border-gray-800 flex justify-between items-center px-6 bg-[#050505]">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition flex items-center gap-2">
                            <i className="bi bi-arrow-left"></i> Back
                        </button>
                        <h1 className="font-bold text-lg tracking-tight">Product Editor</h1>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={save} disabled={saving} className="bg-[#f00000] text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition shadow-lg shadow-red-900/20 flex items-center gap-2">
                            {saving ? 'Saving...' : <><i className="bi bi-cloud-upload"></i> PUBLISH</>}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-hide space-y-8">

                    {/* Design Section */}
                    <div className="bg-[#121212] p-5 rounded-xl border border-gray-800">
                        <h3 className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-wider flex items-center gap-2">
                            <i className="bi bi-palette-fill"></i> Design & Color
                        </h3>
                        <div className="mb-4">
                            <label className="block text-xs text-gray-400 mb-2">Accent Color</label>
                            <div className="flex flex-wrap gap-3">
                                {['#f00000', '#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#6B7280', '#FFFFFF', '#000000'].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setCard({ ...card, design: { ...card.design, accent: c } })}
                                        className={`w-8 h-8 rounded-full border border-gray-700 hover:scale-110 transition ${card.design.accent === c ? 'ring-2 ring-white' : ''}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Settings Section */}
                    <div className="bg-[#121212] p-5 rounded-xl border border-gray-800">
                        <h3 className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-wider flex items-center gap-2">
                            <i className="bi bi-gear-fill"></i> Settings
                        </h3>
                        <div className="mb-4">
                            <label className="block text-xs text-gray-400 mb-1">Product Link (Slug)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-mono">castlecrew.cc/</span>
                                <input
                                    type="text"
                                    value={card.slug || ''}
                                    onChange={(e) => handleChange('slug', e.target.value)}
                                    className="w-full bg-black border border-gray-700 rounded px-3 py-2 pl-32 text-sm focus:border-[#f00000] focus:outline-none transition text-white font-bold"
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs text-gray-400 mb-1">Template</label>
                            <select
                                value={card.template_id || 'car'}
                                onChange={(e) => handleChange('template_id', e.target.value)}
                                className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-sm focus:border-[#f00000] text-white appearance-none"
                            >
                                <option value="car">Automotive / Car Theme</option>
                                <option value="realestate">Real Estate</option>
                                <option value="creative">Creative</option>
                            </select>
                        </div>
                    </div>

                    {/* Product Info Section */}
                    <div className="bg-[#121212] p-5 rounded-xl border border-gray-800">
                        <h3 className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-wider flex items-center gap-2">
                            <i className="bi bi-box-seam-fill"></i> Product Info
                        </h3>

                        <label className="block text-xs text-gray-400 mb-2">Product Gallery (Max 4)</label>
                        <div className="grid grid-cols-4 gap-2 mb-6">
                            {card.gallery.map((img: string | null, i: number) => (
                                <div key={i} className={`aspect-square rounded-xl bg-gray-800 border-2 ${img ? 'border-solid border-[#f00000]' : 'border-dashed border-gray-600'} flex items-center justify-center relative overflow-hidden group hover:bg-gray-700 cursor-pointer`}>
                                    {!img && (
                                        <label className="w-full h-full flex items-center justify-center cursor-pointer">
                                            <i className="bi bi-plus-lg text-gray-500 text-xl"></i>
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleGalleryUpload(i, e)} />
                                        </label>
                                    )}
                                    {img && (
                                        <>
                                            <img src={img} className="w-full h-full object-cover" />
                                            <button onClick={() => removeGallery(i)} className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] z-10">
                                                <i className="bi bi-x"></i>
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <i className="bi bi-tag absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                                <input
                                    type="text"
                                    value={card.full_name || ''}
                                    onChange={(e) => handleChange('full_name', e.target.value)}
                                    placeholder="Product Title"
                                    className="w-full bg-black border border-gray-700 rounded px-3 py-2 pl-9 text-sm focus:border-[#f00000] focus:outline-none text-white font-bold"
                                />
                            </div>

                            <div className="relative">
                                <i className="bi bi-currency-dollar absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                                <input
                                    type="text"
                                    value={card.company || ''}
                                    onChange={(e) => handleChange('company', e.target.value)}
                                    placeholder="Price (e.g. $55,000)"
                                    className="w-full bg-black border border-gray-700 rounded px-3 py-2 pl-9 text-sm focus:border-[#f00000] focus:outline-none text-white font-bold"
                                />
                            </div>

                            {/* Specs Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="Brand" value={card.design.specs.brand || ''} onChange={(e) => handleDesignChange('brand', e.target.value)} className="bg-black border border-gray-700 rounded p-2 text-sm text-white" />
                                <input type="text" placeholder="Year" value={card.design.specs.year || ''} onChange={(e) => handleDesignChange('year', e.target.value)} className="bg-black border border-gray-700 rounded p-2 text-sm text-white" />
                                <input type="text" placeholder="Mileage" value={card.design.specs.mileage || ''} onChange={(e) => handleDesignChange('mileage', e.target.value)} className="bg-black border border-gray-700 rounded p-2 text-sm text-white" />
                                <div className="flex bg-black border border-gray-700 rounded px-2 items-center">
                                    <input type="text" placeholder="Color" value={card.design.specs.color || ''} onChange={(e) => handleDesignChange('color', e.target.value)} className="bg-transparent border-none text-sm text-white flex-1 focus:outline-none h-9" />
                                    <input type="color" value={card.design.specs.paint || '#ffffff'} onChange={(e) => handleDesignChange('paint', e.target.value)} className="w-6 h-6 rounded bg-transparent border-none p-0 cursor-pointer" />
                                </div>
                            </div>

                            <textarea
                                rows={4}
                                value={card.bio || ''}
                                onChange={(e) => handleChange('bio', e.target.value)}
                                placeholder="Description..."
                                className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-sm focus:border-[#f00000] focus:outline-none text-white"
                            ></textarea>
                        </div>
                    </div>

                    {/* Socials */}
                    <div className="bg-[#121212] p-5 rounded-xl border border-gray-800">
                        <h3 className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-wider flex items-center gap-2">
                            <i className="bi bi-share-fill"></i> Social Media
                        </h3>
                        <div className="space-y-3">
                            <div className="flex bg-black border border-gray-700 rounded">
                                <div className="w-10 flex items-center justify-center bg-gray-900 border-r border-gray-700 text-[#25D366]"><i className="bi bi-whatsapp"></i></div>
                                <input type="text" value={card.socials.whatsapp || ''} onChange={(e) => handleSocialChange('whatsapp', e.target.value)} placeholder="WhatsApp (e.g. +9477...)" className="flex-1 bg-transparent border-none text-white px-3 py-2 text-sm focus:outline-none" />
                            </div>
                            <div className="flex bg-black border border-gray-700 rounded">
                                <div className="w-10 flex items-center justify-center bg-gray-900 border-r border-gray-700 text-gray-400"><i className="bi bi-instagram"></i></div>
                                <input type="text" value={card.socials.instagram || ''} onChange={(e) => handleSocialChange('instagram', e.target.value)} placeholder="Instagram Username" className="flex-1 bg-transparent border-none text-white px-3 py-2 text-sm focus:outline-none" />
                            </div>
                            {/* Add other socials as needed */}
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANE: PREVIEW */}
            <div className="hidden md:flex flex-1 bg-[#050505] items-center justify-center relative overflow-hidden border-l border-gray-800">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(30,30,30,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(30,30,30,0.5)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>

                {/* Phone Frame */}
                <div className="relative w-[375px] h-[750px] bg-black rounded-[50px] border-[12px] border-gray-900 shadow-2xl flex flex-col overflow-hidden">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-20"></div>

                    {/* Preview Content */}
                    <div className="w-full h-full bg-[#f3f4f6] overflow-y-auto relative p-4 flex items-center justify-center">
                        <div className="w-full max-w-sm bg-white rounded-[24px] shadow-lg overflow-hidden flex flex-col min-h-[500px]">
                            {/* Hero Image */}
                            <div className="relative h-64 bg-gray-100">
                                {card.gallery[0] ? (
                                    <img src={card.gallery[0]} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <i className="bi bi-image text-4xl"></i>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="mb-4">
                                    <h1 className="text-2xl font-black text-gray-900 leading-tight mb-1">{card.full_name || 'Product Title'}</h1>
                                    <p className="text-gray-500 font-medium">{card.design.specs.year} {card.design.specs.brand} {card.design.specs.trim}</p>
                                </div>
                                <div className="mb-auto">
                                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-4">{card.bio || 'Product description...'}</p>
                                </div>

                                <div className="mt-6 flex items-center justify-between">
                                    <div>
                                        <span className="block text-2xl font-black text-gray-900" style={{ color: card.design.accent }}>{card.company || '$0'}</span>
                                    </div>
                                    <button className="text-white px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2" style={{ backgroundColor: 'black' }}>
                                        Get Offer <i className="bi bi-arrow-up-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
