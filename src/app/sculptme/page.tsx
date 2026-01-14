
"use client";

import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function SculptMePage() {
    return (
        <main className="bg-[#050505] min-h-screen text-white">
            <Navigation />

            <header className="relative w-full mb-20 h-[80vh] bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/assets/img/sculpt-banner.png')" }}>
                <div className="absolute inset-0 bg-black/50 backdrop-brightness-75"></div>

                <div className="relative max-w-7xl mx-auto h-full flex items-center p-6 md:p-12">
                    <div className="w-full lg:w-1/2 z-10">
                        <p className="text-[#f00000] font-bold text-sm tracking-widest mb-4 uppercase">
                            New Product Line
                        </p>
                        <h1 className="text-6xl md:text-8xl font-black leading-[1.1] tracking-tight mb-4 uppercase">
                            Your Image. <br />
                            Your <span className="text-[#f00000]">Miniature.</span>
                        </h1>
                        <h2 className="text-4xl font-black mb-6">Sculpt Me</h2>
                        <p className="text-gray-400 text-lg mb-8 max-w-lg">
                            Turn your favorite photos into a detailed, custom SLA 3D-printed figurine kit, complete with paints
                            and brushes, ready for your artistic touch.
                        </p>

                        <div className="flex flex-wrap gap-4 items-center">
                            <Link href="#options"
                                className="bg-[#f00000] text-white px-8 py-4 rounded-full text-base font-bold hover:bg-red-700 transition shadow-lg">
                                START CREATING <span className="text-xs ml-1">↗</span>
                            </Link>
                            <Link href="#characters"
                                className="border border-white/50 text-white px-8 py-4 rounded-full text-base font-bold hover:bg-white hover:text-black transition">
                                Browse Characters
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <section className="py-20 px-4 md:px-6 w-full border-t border-gray-900">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-black uppercase text-center mb-16">
                        How It Works
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-[#121212] p-8 rounded-3xl border border-gray-800 transition hover:scale-105 hover:shadow-[0_10px_30px_rgba(240,0,0,0.2)]">
                            <div className="w-12 h-12 rounded-full bg-[#f00000] flex items-center justify-center text-xl font-black mb-4">1</div>
                            <h3 className="text-2xl font-bold mb-2">Upload & Model</h3>
                            <p className="text-gray-400">
                                Upload your high-resolution image. Our system models your likeness into a 3D printable file.
                            </p>
                            <p className="text-sm text-gray-500 mt-4">Select your desired height (7.5cm, 10cm, or 15cm).</p>
                        </div>

                        <div className="bg-[#121212] p-8 rounded-3xl border border-gray-800 transition hover:scale-105 hover:shadow-[0_10px_30px_rgba(240,0,0,0.2)]">
                            <div className="w-12 h-12 rounded-full bg-[#f00000] flex items-center justify-center text-xl font-black mb-4">2</div>
                            <h3 className="text-2xl font-bold mb-2">Precision Printing</h3>
                            <p className="text-gray-400">
                                We use **SLA 3D printing** technology to ensure your figurine has a smooth surface and captures fine details.
                            </p>
                            <p className="text-sm text-gray-500 mt-4">The figure is then cured and cleaned, ready for shipping.</p>
                        </div>

                        <div className="bg-[#121212] p-8 rounded-3xl border border-gray-800 transition hover:scale-105 hover:shadow-[0_10px_30px_rgba(240,0,0,0.2)]">
                            <div className="w-12 h-12 rounded-full bg-[#f00000] flex items-center justify-center text-xl font-black mb-4">3</div>
                            <h3 className="text-2xl font-bold mb-2">Paint Your Mini</h3>
                            <p className="text-gray-400">
                                Receive your unpainted figurine bundled with a mini color palette and brushes to bring your creation to life.
                            </p>
                            <p className="text-sm text-gray-500 mt-4">Your own unique, hand-painted masterpiece.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="options" className="py-20 px-4 md:px-6 w-full bg-[#0a0a0a] border-y border-gray-900">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-black uppercase mb-16 text-center">
                        Choose Your Sculpture
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                        <div className="bg-[#121212] p-8 rounded-3xl border-2 border-[#f00000]/50 shadow-xl transition hover:scale-105">
                            <span className="bg-[#f00000] text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide mb-4 inline-block">Personalized</span>
                            <h3 className="text-4xl font-black uppercase mb-4">Custom Miniature</h3>
                            <p className="text-gray-400 mb-6">
                                The ultimate personalized gift or collectible. Upload your headshot, select the size, and we'll create a miniature model based on your likeness.
                            </p>

                            <ul className="space-y-2 text-sm text-gray-300 mb-8">
                                <li className="flex items-center gap-3"><i className="bi bi-check-circle-fill text-[#f00000]"></i> Includes 3 size options.</li>
                                <li className="flex items-center gap-3"><i className="bi bi-check-circle-fill text-[#f00000]"></i> Delivered with a full paint kit.</li>
                                <li className="flex items-center gap-3"><i className="bi bi-check-circle-fill text-[#f00000]"></i> Premium SLA printing quality.</li>
                            </ul>

                            <button className="bg-[#f00000] text-white px-6 py-3 rounded-full text-sm font-bold uppercase hover:bg-red-700 transition">
                                UPLOAD MY IMAGE
                            </button>
                        </div>

                        <div id="characters" className="bg-[#121212] p-8 rounded-3xl border border-gray-800 transition hover:scale-105">
                            <span className="bg-gray-700 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide mb-4 inline-block">Pre-made</span>
                            <h3 className="text-4xl font-black uppercase mb-4">Character Mini</h3>
                            <p className="text-gray-400 mb-6">
                                Choose from our gallery of unpainted figurines featuring known characters, ready to be customized with your own color scheme.
                            </p>

                            <ul className="space-y-2 text-sm text-gray-300 mb-8">
                                <li className="flex items-center gap-3"><i className="bi bi-star-fill text-[#f00000]"></i> Wide selection of popular figures.</li>
                                <li className="flex items-center gap-3"><i className="bi bi-star-fill text-[#f00000]"></i> Perfect for collectors and hobbyists.</li>
                                <li className="flex items-center gap-3"><i className="bi bi-star-fill text-[#f00000]"></i> Includes DIY painting kit.</li>
                            </ul>

                            <button className="border border-white text-white px-6 py-3 rounded-full text-sm font-bold uppercase hover:bg-white hover:text-black transition">
                                BROWSE GALLERY
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 px-4 md:px-6 w-full">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-black uppercase text-center mb-12">
                        Choose Your Height
                    </h2>
                    <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto text-center">

                        <div className="bg-[#121212] p-6 rounded-2xl border border-gray-800">
                            <h4 className="text-4xl font-black text-[#f00000]">7.5 cm</h4>
                            <p className="text-sm text-gray-400 mb-2">(approx 3 in)</p>
                            <p className="text-xs uppercase font-bold text-white">Small</p>
                        </div>

                        <div className="bg-[#121212] p-6 rounded-2xl border-2 border-[#f00000]">
                            <h4 className="text-5xl font-black text-[#f00000]">10 cm</h4>
                            <p className="text-sm text-gray-400 mb-2">(approx 4 in)</p>
                            <p className="text-xs uppercase font-bold text-white">Medium</p>
                        </div>

                        <div className="bg-[#121212] p-6 rounded-2xl border border-gray-800">
                            <h4 className="text-6xl font-black text-[#f00000]">15 cm</h4>
                            <p className="text-sm text-gray-400 mb-2">(approx 6 in)</p>
                            <p className="text-xs uppercase font-bold text-white">Large</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 px-4 md:px-6 w-full">
                <div className="max-w-7xl mx-auto bg-[#f00000] p-12 md:p-20 rounded-3xl text-center">
                    <h2 className="text-4xl md:text-6xl font-black uppercase text-white mb-4">Ready to Sculpt Your Story?</h2>
                    <p className="text-red-100 mb-8 max-w-2xl mx-auto">
                        Start your journey into miniature creation today. Perfect for unique gifts, personal branding, or a creative weekend project.
                    </p>
                    <a href="#options" className="bg-white text-[#f00000] px-8 py-4 rounded-full text-base font-bold hover:bg-black hover:text-white transition shadow-lg inline-block">
                        GET STARTED NOW
                    </a>
                </div>
            </section>

            <Footer />
        </main>
    );
}
