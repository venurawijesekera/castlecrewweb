"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";

export default function PricingPage() {
    const [view, setView] = useState<"personal" | "enterprise">("personal");

    return (
        <main className="bg-[#050505] min-h-screen text-white">
            <Preloader />
            <Navigation />

            <section id="header-section" className="py-20 px-6 text-center max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-black uppercase mb-6">
                    Choose Your <span className="text-[#f00000]">Weapon</span>
                </h1>
                <p className="text-gray-400 text-lg mb-10">
                    Select the card material that suits your style. Use our free basic software, link directly to your website, or upgrade for premium features.
                </p>

                <div className="inline-flex items-center bg-[#121212] rounded-full p-1 border border-gray-800" id="pricing-toggle">
                    <button
                        onClick={() => setView("personal")}
                        className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 ${view === "personal"
                                ? "bg-[#f00000] text-white shadow-lg"
                                : "text-gray-400 hover:text-white"
                            }`}
                    >
                        Personal
                    </button>
                    <button
                        onClick={() => setView("enterprise")}
                        className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 ${view === "enterprise"
                                ? "bg-[#f00000] text-white shadow-lg"
                                : "text-gray-400 hover:text-white"
                            }`}
                    >
                        Enterprise
                    </button>
                </div>
            </section>

            <section className="pb-24 px-4 md:px-8">
                {view === "personal" ? (
                    <div id="personal-plans-container" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 max-w-[1400px] mx-auto">
                        {/* Digital Only */}
                        <div className="bg-[#121212] border border-gray-800 rounded-3xl p-6 flex flex-col hover:border-[#f00000]/50 transition group h-full">
                            <div className="mb-4">
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Starter</span>
                            </div>
                            <h3 className="text-2xl font-black mb-2">Digital Only</h3>
                            <div className="mb-6">
                                <div className="text-4xl font-bold">LKR 0.00</div>
                                <div className="text-xs text-gray-500 mt-1">Free Forever</div>
                            </div>
                            <p className="text-gray-400 text-xs mb-8 flex-1">
                                Perfect for trying out the platform. Share via QR code or Link.
                            </p>
                            <ul className="space-y-3 mb-8 text-xs font-medium">
                                <li className="flex items-center gap-2"><span className="text-[#f00000]">✓</span> 1 Basic Digital Profile</li>
                                <li className="flex items-center gap-2"><span className="text-[#f00000]">✓</span> Apple Wallet Pass</li>
                                <li className="flex items-center gap-2 text-gray-600">✕ No Physical Card</li>
                                <li className="flex items-center gap-2 text-gray-600">✕ Basic Analytics</li>
                            </ul>
                            <Link href="/register" className="w-full block text-center border border-gray-700 text-white py-3 rounded-xl text-sm font-bold hover:bg-white hover:text-black transition">
                                Create Account
                            </Link>
                        </div>

                        {/* Matte Black */}
                        <div className="bg-[#121212] border-2 border-[#f00000] rounded-3xl p-6 flex flex-col relative transform xl:-translate-y-4 shadow-[0_0_30px_rgba(240,0,0,0.15)] h-full">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f00000] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                Most Popular
                            </div>
                            <div className="mb-4">
                                <span className="text-xs font-bold uppercase tracking-widest text-[#f00000]">Professional</span>
                            </div>
                            <h3 className="text-2xl font-black mb-2">Matte Black</h3>
                            <div className="mb-6">
                                <div className="text-3xl font-bold">LKR 850 - 3,500</div>
                                <div className="text-xs text-gray-400 mt-1">One-time card cost</div>
                                <div className="mt-2 pt-2 border-t border-gray-800">
                                    <div className="text-[10px] text-gray-400 flex justify-between">
                                        <span>Own Link / Basic Template:</span>
                                        <span className="text-white font-bold">FREE</span>
                                    </div>
                                    <div className="text-[10px] text-gray-400 flex justify-between mt-1">
                                        <span>Premium Templates:</span>
                                        <span className="text-[#f00000] font-bold">1000LKR/yr</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-400 text-xs mb-8 flex-1">
                                Durable PVC with a premium soft-touch matte finish. UV Printed logo.
                            </p>
                            <ul className="space-y-3 mb-8 text-xs font-medium">
                                <li className="flex items-center gap-2"><span className="text-[#f00000]">✓</span> <strong>Custom Printed Card</strong></li>
                                <li className="flex items-center gap-2"><span className="text-[#f00000]">✓</span> Unlimited Taps</li>
                                <li className="flex items-center gap-2"><span className="text-[#f00000]">✓</span> Choice of Direct Link or Profile</li>
                            </ul>
                            <Link href="/shop" className="w-full block text-center bg-[#f00000] text-white py-3 rounded-xl text-sm font-bold hover:bg-red-700 transition">
                                Design & Order
                            </Link>
                        </div>

                        {/* Bulk Copies */}
                        <div className="bg-[#121212] border border-gray-800 rounded-3xl p-6 flex flex-col hover:border-white/50 transition group h-full">
                            <div className="mb-4">
                                <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Volume</span>
                            </div>
                            <h3 className="text-2xl font-black mb-2">Bulk Copies</h3>
                            <div className="mb-6">
                                <div className="text-3xl font-bold">Negotiable</div>
                                <div className="text-xs text-gray-400 mt-1">Volume Discounts Available</div>
                                <div className="mt-2 pt-2 border-t border-gray-800">
                                    <div className="text-[10px] text-gray-400 flex justify-between">
                                        <span>Own Link / Basic Template:</span>
                                        <span className="text-white font-bold">FREE</span>
                                    </div>
                                    <div className="text-[10px] text-gray-400 flex justify-between mt-1">
                                        <span>Premium Templates:</span>
                                        <span className="text-[#f00000] font-bold">1000LKR/yr</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-400 text-xs mb-8 flex-1">
                                Need to impress? Buy multiple copies of your card to hand out to VIP clients.
                            </p>
                            <ul className="space-y-3 mb-8 text-xs font-medium">
                                <li className="flex items-center gap-2"><span className="text-white">✓</span> <strong>Same Design, Multiple Cards</strong></li>
                                <li className="flex items-center gap-2"><span className="text-white">✓</span> Giveaways for VIPs</li>
                                <li className="flex items-center gap-2"><span className="text-white">✓</span> Significant Price Breaks</li>
                                <li className="flex items-center gap-2"><span className="text-white">✓</span> Priority Printing</li>
                            </ul>
                            <a href="mailto:hello@castlecrew.cc?subject=Bulk Order Request" className="w-full block text-center bg-white text-black py-3 rounded-xl text-sm font-bold hover:bg-gray-200 transition">
                                Design & Get Quote
                            </a>
                        </div>

                        {/* Metal Hybrid */}
                        <div className="bg-[#121212] border border-gray-800 rounded-3xl p-6 flex flex-col hover:border-[#f00000]/50 transition group h-full">
                            <div className="mb-4">
                                <span className="text-xs font-bold uppercase tracking-widest text-yellow-500">Executive</span>
                            </div>
                            <h3 className="text-2xl font-black mb-2">Metal Hybrid</h3>
                            <div className="mb-6">
                                <div className="text-3xl font-bold">LKR 4,000 - 6,500</div>
                                <div className="text-xs text-gray-400 mt-1">One-time card cost</div>
                                <div className="mt-2 pt-2 border-t border-gray-800">
                                    <div className="text-[10px] text-gray-400 flex justify-between">
                                        <span>Own Link / Basic Template:</span>
                                        <span className="text-white font-bold">FREE</span>
                                    </div>
                                    <div className="text-[10px] text-gray-400 flex justify-between mt-1">
                                        <span>Premium Templates:</span>
                                        <span className="text-[#f00000] font-bold">1000LKR/yr</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-400 text-xs mb-8 flex-1">
                                Heavy stainless steel with laser engraving. The ultimate statement.
                            </p>
                            <ul className="space-y-3 mb-8 text-xs font-medium">
                                <li className="flex items-center gap-2"><span className="text-white">✓</span> <strong>Laser Engraved Metal</strong></li>
                                <li className="flex items-center gap-2"><span className="text-white">✓</span> Luxury Packaging</li>
                                <li className="flex items-center gap-2"><span className="text-white">✓</span> VIP Support</li>
                                <li className="flex items-center gap-2"><span className="text-white">✓</span> All Pro Features</li>
                            </ul>
                            <Link href="/shop" className="w-full block text-center border border-gray-700 text-white py-3 rounded-xl text-sm font-bold hover:bg-white hover:text-black transition">
                                Design & Order
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div id="enterprise-features-container" className="max-w-[1400px] mx-auto pt-4">
                        <div className="bg-[#121212] border-2 border-[#f00000] rounded-3xl p-10 md:p-16 shadow-[0_0_40px_rgba(240,0,0,0.2)]">
                            <h2 className="text-4xl md:text-5xl font-black uppercase mb-4 text-[#f00000]">Enterprise Solutions</h2>
                            <p className="text-gray-300 text-lg mb-10 max-w-4xl">
                                This option is tailored for companies requiring centralized management, high security, and large volume ordering for staff, access, and loyalty programs. **Contact us to negotiate pricing.**
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-gray-400">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <i className="bi bi-shield-lock-fill text-[#f00000] text-2xl"></i>
                                        <div>
                                            <h4 className="font-bold text-lg text-white">High-Security NFC</h4>
                                            <p className="text-sm">Secure NFC card versions (Desfire) for advanced access cards.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <i className="bi bi-person-badge-fill text-[#f00000] text-2xl"></i>
                                        <div>
                                            <h4 className="font-bold text-lg text-white">Staff ID & Access Cards</h4>
                                            <p className="text-sm">Best for company staff IDs, access cards, loyalty cards, gift cards, etc.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <i className="bi bi-server text-[#f00000] text-2xl"></i>
                                        <div>
                                            <h4 className="font-bold text-lg text-white">System Integrations</h4>
                                            <p className="text-sm">Seamless integration with your existing IT infrastructure.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <i className="bi bi-diagram-3-fill text-[#f00000] text-2xl"></i>
                                        <div>
                                            <h4 className="font-bold text-lg text-white">Fleet Control Interface</h4>
                                            <p className="text-sm">Dedicated interface for managing all cards, users, and adding data centrally.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <i className="bi bi-globe text-[#f00000] text-2xl"></i>
                                        <div>
                                            <h4 className="font-bold text-lg text-white">Custom Domain Integration</h4>
                                            <p className="text-sm">Use your own company domain for all card profiles.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <i className="bi bi-hdd-fill text-[#f00000] text-2xl"></i>
                                        <div>
                                            <h4 className="font-bold text-lg text-white">Custom Data Plans</h4>
                                            <p className="text-sm">Tailored data storage and analytics plans.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <i className="bi bi-currency-dollar text-[#f00000] text-2xl"></i>
                                        <div>
                                            <h4 className="font-bold text-lg text-white">Volume Discounts</h4>
                                            <p className="text-sm">Significant bulk card discounts when purchasing cards.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <i className="bi bi-tools text-[#f00000] text-2xl"></i>
                                        <div>
                                            <h4 className="font-bold text-lg text-white">NFC Programming Module</h4>
                                            <p className="text-sm">Module provided for changing card programming in-house.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <i className="bi bi-arrow-repeat text-[#f00000] text-2xl"></i>
                                        <div>
                                            <h4 className="font-bold text-lg text-white">Replacement Discounts</h4>
                                            <p className="text-sm">Discounts provided for misplaced or damaged replacement cards.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 text-center">
                                <a href="mailto:info@castlecrew.cc?subject=Enterprise Pricing Enquiry"
                                    className="bg-white text-[#f00000] px-10 py-4 rounded-full text-base font-bold hover:bg-black hover:text-white transition shadow-lg inline-block">
                                    CONTACT SALES FOR QUOTE
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            <section className="py-20 px-6 border-t border-gray-900 bg-[#0a0a0a]">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold mb-12 text-center uppercase">Common Questions</h2>

                    <div className="space-y-6">
                        <div className="border-b border-gray-800 pb-6">
                            <h4 className="font-bold text-lg mb-2">Is there a recurring monthly fee?</h4>
                            <p className="text-gray-400 text-sm">
                                No. The one-time price covers the physical card. You can use our <strong>Basic Template</strong> or link directly to your own website (e.g. portfolio) for <strong>FREE</strong> forever.
                            </p>
                        </div>
                        <div className="border-b border-gray-800 pb-6">
                            <h4 className="font-bold text-lg mb-2">When do I pay the 1000LKR/year?</h4>
                            <p className="text-gray-400 text-sm">
                                You ONLY pay the yearly fee if you choose to use one of our <strong>Premium Templates</strong> which include advanced design customizations, multiple profiles, and detailed analytics.
                            </p>
                        </div>
                        <div className="border-b border-gray-800 pb-6">
                            <h4 className="font-bold text-lg mb-2">What is the "Bulk Copies" option?</h4>
                            <p className="text-gray-400 text-sm">
                                This is for individuals who want 5, 10, or 50 copies of their <strong>own card</strong> to hand out to VIP clients instead of tapping. We offer significant discounts for volume orders.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
