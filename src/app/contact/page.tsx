import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function ContactPage() {
    return (
        <main className="bg-[#050505] min-h-screen text-white">
            <Navigation />

            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
                    <div className="lg:w-1/2">
                        <h1 className="text-6xl md:text-8xl font-black uppercase mb-8 tracking-tighter leading-none">
                            Get In <br /><span className="text-[#f00000]">Touch</span>
                        </h1>
                        <p className="text-gray-400 text-lg mb-12">
                            Have a project in mind or want to learn more about our enterprise solutions? Drop us a message.
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 bg-[#121212] flex items-center justify-center rounded-xl border border-gray-800">
                                    <i className="bi bi-geo-alt-fill text-[#f00000]"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold uppercase tracking-widest text-sm text-gray-500 mb-1">Office</h4>
                                    <p className="text-xl">Colombo, Sri Lanka</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 bg-[#121212] flex items-center justify-center rounded-xl border border-gray-800">
                                    <i className="bi bi-envelope-fill text-[#f00000]"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold uppercase tracking-widest text-sm text-gray-500 mb-1">Email</h4>
                                    <p className="text-xl">support@castlecrew.cc</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/2">
                        <form className="bg-[#121212] border border-gray-800 p-8 md:p-12 rounded-[2rem] space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">First Name</label>
                                    <input type="text" placeholder="John" className="w-full bg-[#050505] border border-gray-800 rounded-xl px-5 py-4 focus:border-[#f00000] outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Last Name</label>
                                    <input type="text" placeholder="Doe" className="w-full bg-[#050505] border border-gray-800 rounded-xl px-5 py-4 focus:border-[#f00000] outline-none transition" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Email Address</label>
                                <input type="email" placeholder="john@example.com" className="w-full bg-[#050505] border border-gray-800 rounded-xl px-5 py-4 focus:border-[#f00000] outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Message</label>
                                <textarea rows={4} placeholder="Tell us about your project..." className="w-full bg-[#050505] border border-gray-800 rounded-xl px-5 py-4 focus:border-[#f00000] outline-none transition resize-none"></textarea>
                            </div>
                            <button className="w-full bg-[#f00000] text-white font-black py-5 rounded-xl uppercase tracking-widest hover:bg-white hover:text-[#f00000] transition shadow-2xl">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
