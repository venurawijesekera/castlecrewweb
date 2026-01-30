"use client";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useState } from "react";

export default function ContactPage() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "General Inquiry",
        message: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setStatus("success");
                setFormData({ firstName: "", lastName: "", email: "", phone: "", subject: "General Inquiry", message: "" });
            } else {
                setStatus("error");
            }
        } catch (err) {
            setStatus("error");
        }
    };

    return (
        <main className="bg-[#050505] min-h-screen text-white">
            <Navigation />

            <section className="pt-12 pb-20 px-6">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
                    <div className="lg:w-1/2">
                        <h1 className="text-6xl md:text-8xl font-black uppercase mb-8 tracking-tighter leading-none">
                            Get In <span className="text-[#f00000]">Touch</span>
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
                        <form onSubmit={handleSubmit} className="bg-[#121212] border border-gray-800 p-8 md:p-12 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden">
                            {status === "success" && (
                                <div className="absolute inset-0 bg-[#121212]/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
                                    <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                                        <i className="bi bi-check-lg text-4xl"></i>
                                    </div>
                                    <h3 className="text-2xl font-black uppercase mb-2">Message Sent!</h3>
                                    <p className="text-gray-400 mb-8">We've received your inquiry and will get back to you shortly.</p>
                                    <button
                                        type="button"
                                        onClick={() => setStatus("idle")}
                                        className="text-[#f00000] font-bold uppercase tracking-widest text-xs hover:underline"
                                    >
                                        Send another message
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">First Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="John"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full bg-[#050505] border border-gray-800 rounded-xl px-5 py-4 focus:border-[#f00000] outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        placeholder="Doe"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full bg-[#050505] border border-gray-800 rounded-xl px-5 py-4 focus:border-[#f00000] outline-none transition"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-[#050505] border border-gray-800 rounded-xl px-5 py-4 focus:border-[#f00000] outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Contact Number</label>
                                <input
                                    required
                                    type="tel"
                                    placeholder="+94 7X XXX XXXX"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-[#050505] border border-gray-800 rounded-xl px-5 py-4 focus:border-[#f00000] outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Subject</label>
                                <select
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full bg-[#050505] border border-gray-800 rounded-xl px-5 py-4 focus:border-[#f00000] outline-none transition text-gray-400"
                                >
                                    <option>General Inquiry</option>
                                    <option>Smart NFC Cards</option>
                                    <option>Digital Advertising</option>
                                    <option>Custom Solutions</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Message</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="How can we help you?"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full bg-[#050505] border border-gray-800 rounded-xl px-5 py-4 focus:border-[#f00000] outline-none transition resize-none"
                                ></textarea>
                            </div>
                            <button
                                disabled={status === "loading"}
                                className="w-full bg-[#f00000] text-white font-black py-5 rounded-2xl uppercase tracking-widest hover:bg-white hover:text-[#f00000] transition shadow-2xl transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {status === "loading" ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Sending...
                                    </>
                                ) : "Send Message"}
                            </button>
                            {status === "error" && (
                                <p className="text-red-500 text-xs font-bold text-center mt-4">Something went wrong. Please try again.</p>
                            )}
                        </form>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
