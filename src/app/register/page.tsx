"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const full_name = formData.get("full_name");
        const email = formData.get("email");
        const password = formData.get("password");

        if (!full_name || !email || !password) {
            setError("Please fill in all fields");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ full_name, email, password }),
            });
            const data: any = await res.json();

            if (data.success) {
                alert("Account created! Please log in.");
                router.push("/login");
            } else {
                setError(data.error || "Registration Failed");
            }
        } catch (err) {
            setError("System Error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex overflow-hidden">
            {/* Left Visual */}
            <div className="hidden lg:flex w-1/2 bg-[#121212] relative items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                <div className="relative z-10 text-center px-10">
                    <h2 className="text-5xl font-black uppercase mb-4 tracking-tight">Join the <br /> <span className="text-[#f00000]">Crew</span></h2>
                    <p className="text-gray-400 max-w-sm mx-auto">Create your digital legacy today.</p>
                </div>
            </div>

            {/* Right Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 relative bg-[#050505]">
                <div className="w-full max-w-md">
                    <Link href="/" className="text-sm text-gray-500 hover:text-white mb-8 inline-block">← Back</Link>
                    <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                    <p className="text-gray-400 mb-8 text-sm">Start building your profile for free.</p>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
                            <input type="text" name="full_name" placeholder="John Doe" className="w-full bg-[#121212] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#f00000] focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
                            <input type="email" name="email" placeholder="name@company.com" className="w-full bg-[#121212] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#f00000] focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Password</label>
                            <input type="password" name="password" placeholder="••••••••" className="w-full bg-[#121212] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#f00000] focus:outline-none" />
                        </div>

                        {error && <div className="text-red-500 text-sm font-bold">{error}</div>}

                        <button type="submit" disabled={loading} className={`w-full bg-[#f00000] text-white font-bold py-3 rounded-lg hover:bg-red-700 transition mt-4 ${loading ? 'opacity-50' : ''}`}>
                            {loading ? "CREATING..." : "CREATE ACCOUNT"}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-500">
                        Already have an account? <Link href="/login" className="text-white font-bold hover:underline">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
