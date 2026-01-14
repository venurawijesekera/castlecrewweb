
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-[#f00000] pt-24 pb-10 px-6 md:px-12 lg:px-20 overflow-hidden relative w-full">
            <div className="absolute bottom-0 left-0 w-full overflow-hidden select-none pointer-events-none">
                <h1 className="text-[18vw] font-black text-red-800/30 leading-none text-center transform translate-y-1/4">
                    CASTLE
                </h1>
            </div>

            <div className="w-full relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 text-white">
                    <div>
                        <h4 className="font-bold text-3xl mb-8 leading-tight">READY TO TAKE<br />CONTROL OF YOUR<br />NETWORKING?
                        </h4>
                        <Link href="/register"
                            className="bg-white text-[#f00000] px-8 py-4 rounded-full text-sm font-bold inline-block hover:bg-black hover:text-white transition shadow-lg">GET
                            STARTED</Link>
                    </div>

                    <div className="md:pl-10">
                        <h5 className="font-bold mb-6 text-red-200 text-lg">Features</h5>
                        <ul className="space-y-4 text-base opacity-90">
                            <li><Link href="#" className="hover:underline">Analytics</Link></li>
                            <li><Link href="#" className="hover:underline">Collaboration</Link></li>
                            <li><Link href="#" className="hover:underline">Data Management</Link></li>
                            <li><Link href="#" className="hover:underline">Security</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-bold mb-6 text-red-200 text-lg">Castle Crew</h5>
                        <ul className="space-y-4 text-base opacity-90">
                            <li><Link href="#" className="hover:underline">About us</Link></li>
                            <li><Link href="#" className="hover:underline">Blog</Link></li>
                            <li><Link href="#" className="hover:underline">Careers</Link></li>
                            <li><Link href="#" className="hover:underline">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-bold mb-6 text-red-200 text-lg">Support</h5>
                        <ul className="space-y-4 text-base opacity-90">
                            <li><Link href="#" className="hover:underline">Help Center</Link></li>
                            <li><Link href="#" className="hover:underline">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:underline">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-red-400/50 pt-8 flex justify-between items-center text-sm text-red-100">
                    <p>&copy; 2024 Castle Crew.</p>
                    <div className="flex gap-6 font-bold">
                        <Link href="#" className="hover:text-white">X</Link>
                        <Link href="#" className="hover:text-white">LinkedIn</Link>
                        <Link href="#" className="hover:text-white">Instagram</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
