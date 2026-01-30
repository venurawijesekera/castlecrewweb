import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function ServicesPage() {
    const services = [
        {
            title: "Brand Starter Kit",
            description: "Everything you need to kickstart your professional identity in one premium bundle.",
            image: "/assets/img/banner.png",
            className: "md:col-span-2 md:row-span-2"
        },
        {
            title: "Smart NFC Cards",
            description: "The next generation of networking. Share your details with a single tap.",
            image: "/assets/img/nfc-cards01.jpg",
            className: "md:col-span-1 md:row-span-1"
        },
        {
            title: "Custom Packaging",
            description: "Bespoke packaging solutions that reflect your brand's quality and attention to detail.",
            image: "/assets/img/box.png",
            className: "md:col-span-1 md:row-span-1"
        },
        {
            title: "LightUp Signs",
            description: "High-impact illuminated signage to make your business stand out day or night.",
            image: "/assets/img/Lightbox.png",
            className: "md:col-span-1 md:row-span-2"
        },
        {
            title: "Custom Apparel",
            description: "Premium quality branded clothing designed for comfort and style.",
            image: "/assets/img/hoodie.png",
            className: "md:col-span-1 md:row-span-1"
        },
        {
            title: "Advertising Displays",
            description: "Physical advertising structures built to capture attention in any environment.",
            image: "/assets/img/templates.png",
            className: "md:col-span-1 md:row-span-1"
        },
        {
            title: "Digital Displays",
            description: "Cloud-managed smart screens for dynamic real-time content delivery.",
            image: "/assets/img/analytics.png",
            className: "md:col-span-1 md:row-span-1"
        },
        {
            title: "Kiosk Displays",
            description: "Interactive digital kiosks for malls, showrooms, and public spaces.",
            image: "/assets/img/kiosk.png",
            className: "md:col-span-1 md:row-span-2"
        },
        {
            title: "Custom Stickers",
            description: "High-quality custom vinyl stickers and decals for your brand.",
            image: "/assets/img/sticker.png",
            className: "md:col-span-1 md:row-span-1"
        },
        {
            title: "Printing Services",
            description: "High-end industrial printing for all your corporate and creative needs.",
            image: "/assets/img/sticker.png",
            className: "md:col-span-2 md:row-span-1"
        }
    ];

    return (
        <main className="bg-[#050505] min-h-screen text-white">
            <Navigation />

            <section className="pt-12 pb-16 px-6">
                <div className="max-w-[95%] mx-auto">
                    <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-4">
                        Our <span className="text-[#f00000]">Services</span>
                    </h1>
                    <p className="text-gray-400 max-w-xl text-lg font-medium">
                        Premium branding solutions tailored for the modern era. From digital identity to physical presence.
                    </p>
                </div>
            </section>

            <section className="pb-32 px-4 md:px-6">
                <div className="max-w-[95%] mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[400px]">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className={`group relative bg-[#121212] rounded-[2.5rem] overflow-hidden border border-gray-800 flex flex-col justify-end hover:border-gray-700 hover:shadow-2xl hover:shadow-[#f00000]/10 transition-all duration-500 ${service.className}`}
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0 z-0">
                                <img
                                    src={service.image}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 opacity-80 group-hover:opacity-100"
                                    alt={service.title}
                                />
                                {/* Targeted Bottom Gradient for Text Legibility */}
                                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                            </div>

                            <div className="relative z-10 p-8 md:p-10">
                                <h3 className="text-3xl font-black mb-2 tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] leading-tight">{service.title}</h3>
                                <p className="text-gray-300 text-sm leading-relaxed mb-6 font-medium drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]">
                                    {service.description}
                                </p>
                                <Link href="/contact" className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 text-[#f00000] drop-shadow-lg group-hover:gap-4 transition-all">
                                    Explore category <i className="bi bi-arrow-right"></i>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </main>
    );
}
