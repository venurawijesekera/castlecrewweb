"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");

        if (!email || !password) {
            setError("Please fill in all fields");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data: any = await res.json();

            if (data.success) {
                // Store for client-side usage (optional if moving fully to cookies)
                localStorage.setItem("castle_token", data.token);
                localStorage.setItem("castle_user_id", data.user_id);
                if (data.enterprise_id) {
                    localStorage.setItem("castle_enterprise_id", data.enterprise_id);
                }

                // Redirect based on role
                if (data.role === "super_admin") {
                    // Pending migration of these pages
                    router.push("/enterprise/dashboard");
                } else if (data.role === "admin") {
                    // Pending
                    router.push("/enterprise/dashboard");
                } else {
                    // Standard user
                    router.push("/profile");
                }
            } else {
                setError(data.error || "Login Failed");
            }
        } catch (err) {
            setError("System Error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex overflow-hidden">
            {/* Left Side: Visual */}
            <div className="hidden lg:flex w-1/2 bg-[#121212] relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#f00000] blur-[120px] opacity-20 rounded-full"></div>

                <div className="relative z-10 text-center px-10">
                    <div className="mb-6 flex justify-center">
                        <div className="w-16 h-16 bg-[#f00000] rotate-45 animate-pulse"></div>
                    </div>
                    <h2 className="text-5xl font-black uppercase mb-4 tracking-tight">
                        Welcome <br /> Back
                    </h2>
                    <p className="text-gray-400 max-w-sm mx-auto">
                        Manage your digital identity, update your details, and track your networking performance.
                    </p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 md:px-12 relative bg-[#050505]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#f00000] blur-[100px] opacity-10 lg:hidden pointer-events-none"></div>

                <div className="w-full max-w-md">
                    <Link href="/" className="text-sm text-gray-500 hover:text-white mb-8 inline-block transition">
                        ← Back to Home
                    </Link>

                    <h1 className="text-3xl font-bold mb-2">Sign In</h1>
                    <p className="text-gray-400 mb-8 text-sm">Enter your credentials to access your dashboard.</p>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="name@company.com"
                                className="w-full bg-[#121212] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#f00000] focus:ring-1 focus:ring-[#f00000] transition placeholder-gray-700"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                className="w-full bg-[#121212] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#f00000] focus:ring-1 focus:ring-[#f00000] transition placeholder-gray-700"
                            />
                        </div>

                        <div className="flex justify-end">
                            <Link href="#" className="text-xs text-[#f00000] hover:text-red-400">
                                Forgot password?
                            </Link>
                        </div>

                        {error && <div className="text-red-500 text-sm font-bold">{error}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-[#f00000] text-white font-bold py-3 rounded-lg hover:bg-red-700 transition transform hover:scale-[1.02] ${loading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            {loading ? "Signing in..." : "SIGN IN"}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-500">
                        Don't have an account yet?{" "}
                        <Link href="/register" className="text-white font-bold hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
