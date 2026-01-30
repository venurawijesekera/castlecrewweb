import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function ServicesPage() {
    const services = [
        {
            title: "Digital Business Cards",
            description: "Go paperless with our premium NFC-enabled smart cards. Instant sharing, real-time updates, and powerful analytics.",
            icon: "bi-card-heading"
        },
        {
            title: "Custom 3D Minis",
            description: "Transform your photos into high-quality SLA 3D printed miniatures with our Sculpt Me service.",
            icon: "bi-person-bounding-box"
        },
        {
            title: "Brand Strategy",
            description: "Scale your brand with our custom design and identity services tailored for modern businesses.",
            icon: "bi-rocket-takeoff"
        },
        {
            title: "Enterprise Solutions",
            description: "Scalable smart card management for teams and large organizations with central administration.",
            icon: "bi-buildings"
        }
    ];

    return (
        <main className="bg-[#050505] min-h-screen text-white">
            <Navigation />

            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-6xl md:text-8xl font-black uppercase mb-6 tracking-tighter">
                        Our <span className="text-[#f00000]">Services</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        We provide cutting-edge solutions for modern networking and personal branding.
                    </p>
                </div>
            </section>

            <section className="pb-32 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    {services.map((service, index) => (
                        <div key={index} className="bg-[#121212] border border-gray-800 p-10 rounded-[2rem] hover:border-[#f00000] transition group">
                            <i className={`bi ${service.icon} text-5xl text-[#f00000] mb-6 block`}></i>
                            <h3 className="text-3xl font-bold mb-4 uppercase">{service.title}</h3>
                            <p className="text-gray-400 leading-relaxed mb-6 italic">
                                "{service.description}"
                            </p>
                            <div className="w-12 h-1 bg-gray-800 group-hover:bg-[#f00000] transition"></div>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </main>
    );
}
