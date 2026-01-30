import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function AboutPage() {
    return (
        <main className="bg-[#050505] min-h-screen text-white">
            <Navigation />

            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1">
                        <h1 className="text-6xl md:text-8xl font-black uppercase mb-8 tracking-tighter leading-none">
                            About <br /><span className="text-[#f00000]">Castle Crew</span>
                        </h1>
                        <p className="text-gray-400 text-lg leading-relaxed mb-6">
                            Founded on the principle of innovation, Castle Crew is a boutique branding agency specializing in the intersection of physical products and digital identities.
                        </p>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            We believe that every connection counts. Our mission is to empower professionals and businesses with tools that make their first impression unforgettable. From our flagship Smart Cards to our creative Sculpt Me project, we blend craftsmanship with technology.
                        </p>
                    </div>
                    <div className="flex-1 relative">
                        <div className="aspect-square bg-gradient-to-br from-[#f00000] to-transparent opacity-20 absolute inset-0 blur-3xl"></div>
                        <img src="/assets/img/nfc-cards01.jpg" className="rounded-[3rem] border border-gray-800 relative z-10" alt="Castle Crew Mission" />
                    </div>
                </div>
            </section>

            <section className="py-20 bg-[#f00000] text-white">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-6xl font-black uppercase mb-12">Driven by Excellence</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div>
                            <h4 className="text-5xl font-black mb-2">Quality</h4>
                            <p className="font-bold opacity-80 uppercase tracking-widest text-sm">Industrial Grade Materials</p>
                        </div>
                        <div>
                            <h4 className="text-5xl font-black mb-2">Innovation</h4>
                            <p className="font-bold opacity-80 uppercase tracking-widest text-sm">Tech-First Networking</p>
                        </div>
                        <div>
                            <h4 className="text-5xl font-black mb-2">Community</h4>
                            <p className="font-bold opacity-80 uppercase tracking-widest text-sm">Growing Global Network</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
