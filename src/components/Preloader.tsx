"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
    const [show, setShow] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const timer1 = setTimeout(() => setFadeOut(true), 800);
        const timer2 = setTimeout(() => setShow(false), 1500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    if (!show) return null;

    return (
        <div
            id="preloader"
            className={`fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center transition-opacity duration-700 ease-out ${fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
        >
            <div className="flex flex-col items-center gap-6">
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 bg-[#f00000] opacity-50 blur-xl rounded-full animate-pulse-glow"></div>
                    <img
                        src="assets/img/logo.png"
                        alt="Castle Crew Logo"
                        className="relative w-12 h-12 z-10"
                    />
                </div>
                <div className="font-black text-xl tracking-[0.2em] text-white animate-pulse">
                    CASTLE CREW
                </div>
            </div>
        </div>
    );
}
