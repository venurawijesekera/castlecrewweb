
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
                <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-4 mb-20 text-white">
                    <div className="lg:w-1/4">
                        <h4 className="font-bold text-3xl mb-8 leading-tight">ELEVATE YOUR BRAND<br />EXPERIENCE WITH<br />CASTLE CREW
                        </h4>
                        <Link href="/services"
                            className="bg-white text-[#f00000] px-8 py-4 rounded-full text-sm font-bold inline-block hover:bg-black hover:text-white transition shadow-lg uppercase">OUR
                            SERVICES</Link>
                    </div>

                    <div className="lg:w-1/3">
                        <h5 className="font-bold mb-6 text-red-200 text-lg uppercase tracking-wider">Menu</h5>
                        <div className="flex gap-x-8">
                            <ul className="space-y-3 text-base opacity-90">
                                <li><Link href="/" className="hover:underline">Home</Link></li>
                                <li><Link href="/cards" className="hover:underline">Smart Cards</Link></li>
                                <li><Link href="/sculptme" className="hover:underline">Sculpt Me</Link></li>
                                <li><Link href="/shop" className="hover:underline">Shop</Link></li>
                            </ul>
                            <ul className="space-y-3 text-base opacity-90">
                                <li><Link href="/services" className="hover:underline">Services</Link></li>
                                <li><Link href="/about" className="hover:underline">About</Link></li>
                                <li><Link href="/contact" className="hover:underline font-bold">Contact Us</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="lg:w-1/6">
                        <h5 className="font-bold mb-6 text-red-200 text-lg uppercase tracking-wider">Support</h5>
                        <ul className="space-y-3 text-base opacity-90">
                            <li><Link href="/contact" className="hover:underline">Help Center</Link></li>
                            <li><Link href="#" className="hover:underline">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:underline">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div className="lg:w-1/4">
                        <h5 className="font-bold mb-6 text-red-200 text-lg uppercase tracking-wider">Contact Info</h5>
                        <ul className="space-y-5 text-base opacity-90">
                            <li>
                                <p className="font-bold text-red-200 text-xs uppercase tracking-widest mb-1">Locations</p>
                                <p>Colombo, Sri Lanka</p>
                                <p>Kandy, Sri Lanka</p>
                            </li>
                            <li>
                                <p className="font-bold text-red-200 text-xs uppercase tracking-widest mb-1">Contact Numbers</p>
                                <p>+94 70 700 0006</p>
                                <p>+94 70 600 0006</p>
                            </li>
                            <li>
                                <p className="font-bold text-red-200 text-xs uppercase tracking-widest mb-1">Emails</p>
                                <p>info@castlecrew.cc</p>
                                <p>support@castlecrew.cc</p>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-red-400/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-red-100">
                    <p>&copy; {new Date().getFullYear()} Castle Crew.</p>
                    <div className="flex gap-6 font-bold">
                        <Link href="#" className="hover:text-white">Facebook</Link>
                        <Link href="#" className="hover:text-white">Instagram</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
