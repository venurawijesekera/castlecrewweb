
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Preloader from "@/components/Preloader";
import Footer from "@/components/Footer";

export default function SmartCardsPage() {
    const [activeFeature, setActiveFeature] = useState(1);
    const [featureImage, setFeatureImage] = useState("/assets/img/templates.png");
    const [avatars, setAvatars] = useState<string[]>([]);
    const [loadingAvatars, setLoadingAvatars] = useState(true);

    const features = [
        {
            id: 1,
            title: "01. Choose Your Template",
            desc: "Select from 6 premium digital templates upon login.",
            img: "/assets/img/templates.png"
        },
        {
            id: 2,
            title: "02. Edit Real-Time",
            desc: "Changed jobs? Update your dashboard and your card updates instantly.",
            img: "/assets/img/edit.png"
        },
        {
            id: 3,
            title: "03. Track Analytics",
            desc: "See how many people are viewing your profile.",
            img: "/assets/img/analytics.png"
        },
        {
            id: 4,
            title: "04. Compatible Everywhere",
            desc: "Works on iPhone, Android, and any samrt device.",
            img: "/assets/img/templates.png" // Reusing templates or check if there was a separate image for everywhere? Logic said img not provided for 4th
        }
    ];

    // 4th item in original HTML didn't change image explicitly in switchFeature logic block for all 4?
    // Wait, original HTML:
    // 1 -> templates.png
    // 2 -> edit.png
    // 3 -> analytics.png
    // 4 -> Missing onclick handler in source snippet?
    // Let me check line 954 in viewer.
    // Line 954: <div class="feature-item ..."> 04. Compatible Everywhere </div>
    // It has NO onclick handler in the snippet provided!
    // So it defaults to not changing anything? Or maybe it's just static text?
    // I will set it to keep current image or maybe templates.png default.

    const handleFeatureClick = (id: number, img: string) => {
        setActiveFeature(id);
        const imgElement = document.getElementById('feature-img');
        if (imgElement) {
            imgElement.style.opacity = '0';
            setTimeout(() => {
                setFeatureImage(img);
                imgElement.style.opacity = '1';
            }, 200);
        } else {
            setFeatureImage(img);
        }
    };

    useEffect(() => {
        // Fetch Avatars
        const loadAvatars = async () => {
            try {
                const res = await fetch('/api/random-avatars');
                if (res.ok) {
                    const data = await res.json() as string[];
                    setAvatars(data);
                }
            } catch (e) {
                console.error("Failed to load avatars", e);
            } finally {
                setLoadingAvatars(false);
            }
        };
        loadAvatars();
    }, []);

    return (
        <main className="bg-[#050505] min-h-screen text-white">
            <Preloader />
            <Navigation />

            <section className="relative pt-12 pb-20 px-6 md:px-12 lg:px-20 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="z-10">
                    <h1 className="text-5xl md:text-7xl xl:text-8xl font-black leading-[1.1] tracking-tight mb-6 uppercase">
                        Secure Your <br />
                        <span className="text-[#f00000]">Digital</span> <br />
                        Legacy
                    </h1>
                    <p className="text-gray-400 text-lg mb-8 max-w-lg">
                        Custom NFC business cards by Castle Crew. One tap to share your contact info, portfolio, and socials. No
                        app required.
                    </p>

                    <div className="flex flex-wrap gap-4 items-center">
                        <Link href="/pricing" className="bg-[#f00000] text-white px-8 py-3 rounded-full text-base font-bold uppercase hover:bg-red-700 transition flex items-center gap-2 shadow-lg shadow-red-900/40 relative overflow-hidden group">
                            <span className="relative z-10 flex items-center gap-2">
                                GET YOUR CARD <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-xs">↗</span>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-0 group-hover:opacity-100 transition duration-300"></div>
                        </Link>

                        <div className="flex flex-col ml-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 bg-[#f00000] rounded-full animate-pulse"></span>
                                <span className="text-xs font-bold uppercase text-gray-500">Active Members</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-2xl font-bold">15k+</h3>
                                {loadingAvatars ? (
                                    <div className="text-gray-500 text-sm">Loading...</div>
                                ) : (
                                    <div className="flex -space-x-2 pl-2">
                                        {avatars.slice(0, 3).map((url, i) => (
                                            <img key={i} src={url} className="w-8 h-8 rounded-full object-cover border-2 border-black relative z-[3]" style={{ zIndex: 3 - i }} alt="User" />
                                        ))}
                                        {avatars.length === 0 && (
                                            <>
                                                <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-black"></div>
                                                <div className="w-8 h-8 rounded-full bg-gray-600 border-2 border-black"></div>
                                                <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-black"></div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center lg:justify-center w-full">
                    <div className="relative w-full max-w-2xl">
                        <div className="absolute -top-10 -right-10 text-[#f00000] text-6xl opacity-80 z-0">✦</div>
                        <div className="absolute -bottom-10 -left-10 text-white opacity-20 text-4xl z-0">★</div>

                        <img id="hero-img" src="/assets/img/hero-cards.png" alt="Castle Cards Stack"
                            className="w-full h-auto object-contain relative z-10 transform hover:scale-105 transition duration-500 drop-shadow-2xl" />

                        <div className="absolute top-10 -right-12 hidden xl:flex flex-col gap-4 text-xs font-mono text-gray-400 text-right z-20">
                            <div className="flex items-center gap-2 justify-end">
                                <span>Select Template</span> <span className="text-white">↗</span>
                            </div>
                            <div className="w-32 h-[1px] bg-gray-700 ml-auto"></div>
                            <div className="flex items-center gap-2 justify-end">
                                <span>Edit Profile</span> <span className="text-white">→</span>
                            </div>
                            <div className="w-24 h-[1px] bg-gray-700 ml-auto"></div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-10 px-6 md:px-12 lg:px-20 w-full">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-gray-800 pb-8">
                    <h2 className="text-3xl md:text-4xl font-bold uppercase max-w-lg leading-none">
                        Getting to know <br /> Castle Cards
                    </h2>
                    <p className="text-sm text-gray-400 max-w-xl text-right mt-4 md:mt-0">
                        We are more than just a printing service; Castle Crew provides the digital infrastructure to manage your
                        professional identity securely.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    <div className="bg-gradient-to-br from-[#f00000] to-[#b00000] p-8 rounded-xl min-h-[18rem] flex flex-col justify-between relative overflow-hidden group transition-all duration-500 hover:-translate-y-2 shadow-lg hover:shadow-red-900/20">
                        <div className="flex items-center gap-2 relative z-10">
                            <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center backdrop-blur-sm">👤</div>
                            <span className="font-bold text-white tracking-wide">Users</span>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-6xl md:text-7xl font-black mb-2 text-white tracking-tighter">50k</h3>
                            <p className="text-sm text-white/80 font-medium">Professionals networking smarter.</p>
                        </div>
                        <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition duration-700"></div>
                        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                    </div>

                    <div className="bg-[#080808] border border-gray-800 p-8 rounded-xl min-h-[18rem] flex flex-col justify-between group transition-all duration-500 hover:-translate-y-2 hover:border-[#f00000]/30 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[#f00000]/5 opacity-0 group-hover:opacity-100 transition duration-500 blur-xl"></div>
                        <div className="flex items-center gap-2 relative z-10">
                            <div className="w-8 h-8 bg-[#f00000]/10 rounded-full flex items-center justify-center text-[#f00000] font-bold">⚡</div>
                            <span className="text-[#f00000] font-bold tracking-wide">Speed</span>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-6xl md:text-7xl font-black mb-2 text-white tracking-tighter">0.1s</h3>
                            <p className="text-gray-400 text-sm">Instant NFC transfer speed.</p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#111] to-black border border-gray-800 p-8 rounded-xl min-h-[18rem] flex flex-col justify-between group transition-all duration-500 hover:-translate-y-2 hover:border-green-500/30">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center text-sm">♻</div>
                            <span className="font-bold text-green-500 tracking-wide">Eco-Friendly</span>
                        </div>
                        <div>
                            <h3 className="text-6xl md:text-7xl font-black mb-2 text-white tracking-tighter">100<span className="text-3xl align-top text-green-500">%</span></h3>
                            <p className="text-gray-400 text-sm">Reduction in paper waste.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 md:px-12 lg:px-20 w-full my-10">
                <div className="bg-gradient-to-br from-[#111] to-black text-white rounded-3xl p-8 md:p-16 w-full border border-gray-800 shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 w-full">
                        <div className="flex flex-col justify-center">
                            <h2 className="text-4xl md:text-5xl font-black uppercase mb-6">All-In-One Platform<br />For Networking</h2>
                            <p className="text-gray-400 mb-12 max-w-lg">Simplify your professional life by securely connecting your
                                accounts and automatically updating your details.</p>

                            <div className="space-y-6">
                                {features.map((feature) => (
                                    <div key={feature.id}
                                        onClick={() => handleFeatureClick(feature.id, feature.img)}
                                        className={`feature-item group cursor-pointer border-l-4 pl-6 py-2 transition rounded-r-lg ${activeFeature === feature.id ? 'border-[#f00000] bg-white/5' : 'border-transparent hover:bg-white/5 hover:border-gray-700'}`}>
                                        <h4 className={`text-xl font-bold mb-1 transition ${activeFeature === feature.id ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>{feature.title}</h4>
                                        <p className={`text-sm transition ${activeFeature === feature.id ? 'text-gray-400' : 'text-gray-500 group-hover:text-gray-400'}`}>{feature.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative w-full flex items-center justify-center">
                            <div className="relative bg-[#050505] rounded-2xl shadow-2xl border border-gray-800 w-full max-w-2xl overflow-hidden group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-[#f00000] to-purple-600 opacity-20 blur-lg group-hover:opacity-30 transition duration-1000"></div>

                                <div className="relative w-full">
                                    <img id="feature-img" src={featureImage}
                                        className="w-full h-auto object-cover hover:scale-105 transition-all duration-500"
                                        alt="UI Templates" />
                                </div>

                                <div className={`absolute bottom-0 inset-x-0 z-10 transition-opacity duration-300 flex justify-center py-0 ${featureImage.includes('templates.png') ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                                    id="browse-btn-container">
                                    <Link href="/templates"
                                        className="w-full mx-0 bg-[#f00000] text-white py-4 px-6 flex items-center justify-center gap-2 font-bold uppercase hover:bg-red-700 transition">
                                        <span className="text">Browse Templates</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 md:px-12 lg:px-20 w-full flex flex-col md:flex-row items-center gap-16">
                <div className="w-full md:w-1/2 flex justify-center">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-[#f00000] blur-2xl opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <img src="/assets/img/card.png" alt="Custom NFC Card"
                            className="relative z-10 w-full max-w-lg transform rotate-[-12deg] group-hover:rotate-0 transition duration-500 ease-out" />
                    </div>
                </div>

                <div className="w-full md:w-1/2 pl-0 md:pl-10">
                    <h5 className="text-[#f00000] font-bold text-sm tracking-widest mb-2">BENEFITS</h5>
                    <h2 className="text-4xl md:text-6xl font-black uppercase mb-8 leading-tight">
                        Networking on <br /> International
                    </h2>

                    <ul className="space-y-8">
                        <li className="flex gap-6">
                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-[#f00000] font-bold text-lg flex-shrink-0">1</div>
                            <div>
                                <h4 className="font-bold text-xl mb-1">QR Code Backup</h4>
                                <p className="text-gray-400 text-base">Every card comes with a custom QR code for older devices.</p>
                            </div>
                        </li>
                        <li className="flex gap-6">
                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-[#f00000] font-bold text-lg flex-shrink-0">2</div>
                            <div>
                                <h4 className="font-bold text-xl mb-1">Custom Designs</h4>
                                <p className="text-gray-400 text-base">Upload your logo and we laser print it on matte black or metal cards.</p>
                            </div>
                        </li>
                        <li className="flex gap-6">
                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-[#f00000] font-bold text-lg flex-shrink-0">3</div>
                            <div>
                                <h4 className="font-bold text-xl mb-1">Secure & Private</h4>
                                <p className="text-gray-400 text-base">Bank-grade encryption for your data. You control what you share.</p>
                            </div>
                        </li>
                    </ul>

                    <div className="mt-10 flex gap-4">
                        <Link href="#" className="bg-[#f00000] text-white px-8 py-4 rounded-full text-base font-bold hover:bg-red-700 transition">Design Card</Link>
                        <Link href="#" className="w-14 h-14 rounded-full border border-gray-600 flex items-center justify-center hover:bg-white hover:text-black transition text-xl">↗</Link>
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 md:px-12 lg:px-20 w-full border-t border-gray-900">
                <div className="flex flex-col md:flex-row justify-between items-start mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold uppercase max-w-lg">
                        Real-Time <br /> Digital Wallet
                    </h2>
                    <p className="text-gray-400 text-base max-w-xl mt-6 md:mt-0">
                        Compatible with the ecosystem you already use. Save your digital card directly to Apple Wallet or Google
                        Pay for card-less sharing.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-[#121212] p-8 rounded-2xl flex flex-col justify-end min-h-[18rem]">
                        <h3 className="text-7xl font-bold mb-2">98<span className="text-4xl">%</span></h3>
                        <p className="text-gray-400 text-sm">Users prefer adding our cards to their mobile wallets.</p>
                    </div>

                    <div className="flex items-center justify-center min-h-[18rem] transition relative overflow-hidden group rounded-2xl">
                        <img src="/assets/img/Apple_Wallet_Icon.svg" alt="Apple Wallet" className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" />
                    </div>

                    <div className="flex items-center justify-center min-h-[18rem] transition relative overflow-hidden group rounded-2xl">
                        <img src="/assets/img/google_Wallet_Icon.svg" alt="Google Wallet" className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" />
                    </div>

                    <div className="bg-[#121212] p-8 rounded-2xl flex flex-col justify-between min-h-[18rem]">
                        <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center text-[#f00000] text-2xl font-bold">⚡</div>
                        <div>
                            <h4 className="font-bold uppercase mb-4 text-xl">Creating Lasting<br />Connections</h4>
                            <Link href="/register" className="inline-block bg-white text-black px-6 py-3 rounded-full text-xs font-bold mt-2 hover:bg-gray-200">LETS WORK TOGETHER</Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="pt-20 pb-10 px-6 md:px-12 lg:px-20 w-full bg-gray-50 text-black rounded-t-[3rem] mt-20">
                <div className="w-full">
                    <p className="text-[#f00000] text-sm font-bold mb-6 tracking-widest">WHAT THEY SAY ABOUT US</p>
                    <h3 className="text-3xl md:text-6xl font-bold leading-tight mb-12 max-w-5xl">
                        "Castle Cards has completely transformed the way I network. The real-time updates and sleek card design
                        always impress clients."
                    </h3>
                    <div className="flex items-center justify-between border-t border-gray-300 pt-10">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden">
                                <img src="/assets/img/active-users.png" className="w-full h-full object-cover" alt="User" />
                            </div>
                            <div>
                                <h5 className="font-bold text-lg">Kelly Williams</h5>
                                <p className="text-sm text-gray-500">Head of Design, Layers</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button className="w-14 h-14 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white transition text-xl">←</button>
                            <button className="w-14 h-14 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white transition text-xl">→</button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
