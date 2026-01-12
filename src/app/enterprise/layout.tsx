"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Removed useSearchParams
import { useEffect, useState, Suspense } from "react";

import EnterpriseHeader from "./EnterpriseHeader";
import EnterpriseSidebar from "@/components/dashboard/EnterpriseSidebar";

export default function EnterpriseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    // Removed searchParams
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    // Removed view calculation

    useEffect(() => {
        // Quick check for auth token, detailed check happens in page
        const token = localStorage.getItem("castle_token");
        if (!token) {
            router.push("/login");
        }
    }, [router]);

    return (
        <div className="flex h-screen overflow-hidden bg-[#f3f4f6] text-sm font-sans text-gray-900">
            {/* Sidebar */}
            <Suspense fallback={<aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col z-20 h-full p-4"><div className="animate-pulse bg-gray-100 h-8 w-32 rounded mb-8"></div></aside>}>
                <EnterpriseSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            </Suspense>

            {/* Mobile Overlay */}
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-10 md:hidden"></div>}

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <EnterpriseHeader />

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
