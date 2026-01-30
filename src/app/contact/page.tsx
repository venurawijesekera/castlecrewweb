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
                            Have a project in mind or want to learn more about our enterprise solutions? Drop us a message or visit our offices.
                        </p>

                        <div className="space-y-10">
                            <div className="flex items-start gap-6">
                                <div className="w-14 h-14 bg-[#121212] flex items-center justify-center rounded-2xl border border-gray-800 shrink-0">
                                    <i className="bi bi-geo-alt-fill text-[#f00000] text-xl"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold uppercase tracking-widest text-xs text-gray-500 mb-2">Offices</h4>
                                    <p className="text-xl font-bold">Colombo, Sri Lanka</p>
                                    <p className="text-xl font-bold">Kandy, Sri Lanka</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6">
                                <div className="w-14 h-14 bg-[#121212] flex items-center justify-center rounded-2xl border border-gray-800 shrink-0">
                                    <i className="bi bi-telephone-fill text-[#f00000] text-xl"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold uppercase tracking-widest text-xs text-gray-500 mb-2">Contact Numbers</h4>
                                    <p className="text-xl font-bold">+94 70 700 0006</p>
                                    <p className="text-xl font-bold">+94 70 600 0006</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6">
                                <div className="w-14 h-14 bg-[#121212] flex items-center justify-center rounded-2xl border border-gray-800 shrink-0">
                                    <i className="bi bi-envelope-fill text-[#f00000] text-xl"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold uppercase tracking-widest text-xs text-gray-500 mb-2">Email Addresses</h4>
                                    <p className="text-xl font-bold">info@castlecrew.cc</p>
                                    <p className="text-xl font-bold">support@castlecrew.cc</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/2">
                        <form className="bg-[#121212] border border-gray-800 p-8 md:p-12 rounded-[2.5rem] space-y-6 shadow-2xl">
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
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Subject</label>
                                <select className="w-full bg-[#050505] border border-gray-800 rounded-xl px-5 py-4 focus:border-[#f00000] outline-none transition text-gray-400">
                                    <option>Select a service...</option>
                                    <option>Smart NFC Cards</option>
                                    <option>Digital Advertising</option>
                                    <option>Custom Solutions</option>
                                    <option>General Inquiry</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Message</label>
                                <textarea rows={4} placeholder="How can we help you?" className="w-full bg-[#050505] border border-gray-800 rounded-xl px-5 py-4 focus:border-[#f00000] outline-none transition resize-none"></textarea>
                            </div>
                            <button className="w-full bg-[#f00000] text-white font-black py-5 rounded-2xl uppercase tracking-widest hover:bg-white hover:text-[#f00000] transition shadow-2xl transform active:scale-95">
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
