"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    userAvatar: string | null;
    userRole: string | null;
}

export default function MobileMenu({ isOpen, onClose, userAvatar, userRole }: MobileMenuProps) {
    const pathname = usePathname();

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const getLinkClass = (path: string) => {
        const isActive = pathname === path || (path !== "/" && pathname.startsWith(path));
        return `text-2xl font-black uppercase tracking-wider transition-colors ${isActive ? "text-[#f00000]" : "text-white hover:text-[#f00000]"}`;
    };

    return (
        <div
            className={`fixed inset-0 z-[60] bg-[#050505] flex flex-col justify-center items-center transition-all duration-300 ease-in-out ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                }`}
        >
            <button
                onClick={onClose}
                className="absolute top-8 right-6 text-white p-2 hover:text-[#f00000] transition"
                aria-label="Close Menu"
            >
                <i className="bi bi-x-lg text-3xl"></i>
            </button>

            <div className="flex flex-col items-center gap-8 mb-12">
                <Link href="/" className={getLinkClass("/")} onClick={onClose}>
                    Home
                </Link>
                <Link href="/cards" className={getLinkClass("/cards")} onClick={onClose}>
                    Smart Cards
                </Link>
                <Link href="/sculptme" className={getLinkClass("/sculptme")} onClick={onClose}>
                    Sculpt Me
                </Link>
                <Link href="/shop" className={getLinkClass("/shop")} onClick={onClose}>
                    Shop
                </Link>
                <Link href="/services" className={getLinkClass("/services")} onClick={onClose}>
                    Services
                </Link>
                <Link href="/about" className={getLinkClass("/about")} onClick={onClose}>
                    About
                </Link>
                <Link href="/contact" className={getLinkClass("/contact")} onClick={onClose}>
                    Contact Us
                </Link>
            </div>

            <div className="mt-4">
                {userAvatar ? (
                    <Link
                        href={(userRole === 'admin' || userRole === 'super_admin') ? "/enterprise/dashboard" : "/profile"}
                        className="flex flex-col items-center gap-2 group"
                        onClick={onClose}
                    >
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-[#f00000] transition">
                            {userAvatar !== "default" ? (
                                <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                                    <i className="bi bi-person-fill text-2xl"></i>
                                </div>
                            )}
                        </div>
                        <span className="text-sm font-bold uppercase tracking-widest text-[#f00000]">My Profile</span>
                    </Link>
                ) : (
                    <Link
                        href="/login"
                        className="bg-[#f00000] text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black transition"
                        onClick={onClose}
                    >
                        Client Login
                    </Link>
                )}
            </div>
        </div>
    );
}
