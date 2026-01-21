import Link from "next/link";
import Navigation from "@/components/Navigation";
import Preloader from "@/components/Preloader";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Preloader />
      <Navigation />

      <header className="px-4 md:px-6 mb-20">
        <div className="relative w-full h-[80vh] rounded-[2rem] overflow-hidden border border-gray-800">
          <img src="/assets/img/banner.png"
            className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>

          <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase mb-4 leading-none tracking-tight">
              Elevate Your <br /> <span className="text-[#f00000]">Brand.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-sm md:text-base text-gray-400 font-medium mb-8">
              Castle Crew specializes in creating custom branded products that help businesses promote their
              identity. From concept to delivery, we craft unique items tailored to your branding needs.
            </p>
            <Link href="#sculpt-me"
              className="bg-white text-black px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#f00000] hover:text-white transition">
              Explore Products
            </Link>
          </div>
        </div>
      </header>

      <section className="px-4 md:px-6 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[600px]">

          <div
            className="lg:col-span-2 relative rounded-[2rem] overflow-hidden img-zoom-container group h-[400px] lg:h-full">
            <img src="/assets/img/nfc-cards01.jpg" className="w-full h-full object-cover transform transition duration-700 ease group-hover:scale-105" />

            <div className="absolute bottom-0 left-0 bg-[#050505] pt-6 pr-8 rounded-tr-[3rem] z-10">
              <div className="relative z-20 pl-8 pb-8">
                <span
                  className="bg-[#f00000] text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">Flagship
                  Product</span>
                <h2 className="text-4xl md:text-6xl font-black uppercase text-white mt-4 mb-2">Smart Cards</h2>
                <Link href="/cards"
                  className="text-gray-300 text-sm border-b border-gray-500 pb-1 hover:text-white hover:border-white transition">View
                  Collection ↗</Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 h-full">
            <div
              className="bg-[#121212] border border-gray-800 px-8 py-6 rounded-[2rem] flex flex-col justify-center flex-1 relative group">
              <span
                className="inline-block px-3 py-1 border border-gray-700 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#f00000] w-fit mb-2">
                New Feature
              </span>
              <h3 className="text-3xl font-bold mb-2 uppercase">Free Digital <br /> Business Card.</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-12">
                Create your professional digital profile in seconds. Share your contact info, social links, and
                portfolio instantly, no app needed.
              </p>
              <Link href="/register"
                className="absolute bottom-6 right-8 h-10 w-40 group-hover:w-10 bg-white text-black rounded-full text-xs font-bold uppercase tracking-widest group-hover:bg-[#f00000] group-hover:text-white transition-all duration-500 shadow-lg flex items-center justify-center overflow-hidden">
                <span
                  className="group-hover:opacity-0 group-hover:translate-x-full transition-all duration-300 whitespace-nowrap absolute">Create
                  Account</span>
                <i
                  className="bi bi-arrow-up-right opacity-0 -translate-x-full group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 text-lg"></i>
              </Link>
            </div>

            <div
              className="relative rounded-[2rem] overflow-hidden img-zoom-container flex-1 h-[250px] lg:h-auto border border-gray-800 group cursor-pointer">
              <img src="/assets/img/templates.png"
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

              <div className="absolute top-4 left-4">
                <span
                  className="bg-[#f00000] text-white border border-[#f00000]/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Premium
                </span>
              </div>

              <div className="absolute bottom-6 left-6 pr-16 z-10">
                <h3 className="text-3xl font-black uppercase text-white mb-2 leading-none">1000 LKR <br /> Yearly.
                </h3>
                <p className="text-xs text-gray-300 font-medium max-w-[200px]">More professional templates
                  available.</p>
              </div>

              <div
                className="absolute bottom-4 right-4 bg-white text-black w-10 h-10 rounded-full flex items-center justify-center text-lg group-hover:bg-[#f00000] group-hover:text-white transition shadow-lg z-10">
                ↗
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="sculpt-me" className="px-4 md:px-6 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[600px]">

          <div
            className="lg:col-span-2 relative rounded-[2rem] overflow-hidden img-zoom-container group h-[400px] lg:h-full border border-[#f00000]/50">

            <img src="/assets/img/front-sculpt-banner.png"
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100"
              alt="Sculpt Me Figurine Kit" />

            <div className="absolute bottom-0 left-0 bg-[#050505] pt-6 pr-8 rounded-tr-[3rem] z-10">
              <div className="relative z-20 pl-8 pb-8">
                <span
                  className="bg-[#f00000] text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">New Product Line</span>
                <h2 className="text-4xl md:text-6xl font-black uppercase text-white mt-4 mb-2">Sculpt Me</h2>
                <p className="text-gray-300 text-sm max-w-lg">
                  Upload a photo and receive a premium SLA 3D-printed miniature of yourself, ready to paint!
                </p>
                <Link href="#"
                  className="mt-4 inline-block bg-[#f00000] text-white px-6 py-3 rounded-full text-xs font-bold uppercase hover:bg-red-700 transition">
                  Create Your Mini ↗
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 h-full">
            <div
              className="bg-[#121212] border border-gray-800 px-8 py-6 rounded-[2rem] flex flex-col justify-center flex-1 relative group">
              <span
                className="inline-block px-3 py-1 border border-gray-700 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#f00000] w-fit mb-2">
                Customize
              </span>
              <h3 className="text-3xl font-bold mb-2 uppercase">Custom or <br /> Pre-Made Characters.</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-12">
                Choose to upload your own image or select from a library of unpainted pre-made characters.
              </p>
              <div
                className="absolute bottom-6 right-8 h-10 w-10 bg-white text-black rounded-full text-xs font-bold uppercase transition-all duration-500 shadow-lg flex items-center justify-center overflow-hidden">
                <i className="bi bi-person-circle text-lg"></i>
              </div>
            </div>

            <div
              className="relative rounded-[2rem] overflow-hidden img-zoom-container flex-1 h-[250px] lg:h-auto border border-gray-800 group cursor-pointer">
              <img src="/assets/img/color-pallet.png"
                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

              <div className="absolute top-4 left-4">
                <span
                  className="bg-[#f00000] text-white border border-[#f00000]/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Creative Kit
                </span>
              </div>

              <div className="absolute bottom-6 left-6 pr-16 z-10">
                <h3 className="text-3xl font-black uppercase text-white mb-2 leading-none">Mini Paint <br /> Palette Included.
                </h3>
                <p className="text-xs text-gray-300 font-medium max-w-[200px]">Brushes and colors included in every kit.</p>
              </div>

              <div
                className="absolute bottom-4 right-4 bg-white text-black w-10 h-10 rounded-full flex items-center justify-center text-lg group-hover:bg-[#f00000] group-hover:text-white transition shadow-lg z-10">
                <i className="bi bi-palette-fill"></i>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-10 border-t border-gray-900 border-b mb-32">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <h4 className="text-4xl md:text-5xl font-black mb-2 text-white">500+</h4>
            <p className="text-xs uppercase tracking-widest text-[#f00000] font-bold">Brands Served</p>
          </div>
          <div>
            <h4 className="text-4xl md:text-5xl font-black mb-2 text-white">20+</h4>
            <p className="text-xs uppercase tracking-widest text-gray-500">Countries</p>
          </div>
          <div>
            <h4 className="text-4xl md:text-5xl font-black mb-2 text-white">50+</h4>
            <p className="text-xs uppercase tracking-widest text-gray-500">Products</p>
          </div>
          <div>
            <h4 className="text-4xl md:text-5xl font-black mb-2 text-white">1st</h4>
            <p className="text-xs uppercase tracking-widest text-gray-500">In Quality</p>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-6 mb-32">
        <div className="flex justify-between items-end mb-12 px-2">
          <h2 className="text-4xl md:text-6xl font-black uppercase leading-tight">Explore Our <br /> Products</h2>
          <Link href="#"
            className="hidden md:block bg-[#121212] border border-gray-700 text-white px-6 py-3 rounded-full text-xs font-bold uppercase hover:bg-white hover:text-black transition">View
            All Products</Link>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-4 gap-4 space-y-4">

          <Link href="/cards"
            className="group relative block break-inside-avoid rounded-[2rem] overflow-hidden bg-gray-900 h-[450px] mb-4">
            <img src="/assets/img/nfc-card.png"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-90 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80">
            </div>
            <div className="absolute bottom-8 left-8 text-white text-3xl font-bold tracking-tight">
              Smart Cards
            </div>
            <div
              className="absolute bottom-8 right-8 w-12 h-12 bg-white text-black rounded-full flex items-center justify-center transition transform group-hover:scale-110 shadow-lg">
              <i className="bi bi-arrow-up-right text-xl"></i>
            </div>
          </Link>

          <div
            className="group relative break-inside-avoid rounded-[2rem] overflow-hidden bg-gray-900 cursor-pointer h-[300px] mb-4">
            <img src="/assets/img/Lightbox.png"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-80 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60">
            </div>
            <div className="absolute bottom-6 left-6 text-white text-xl font-bold tracking-tight">
              Signage
            </div>
            <div
              className="absolute bottom-6 right-6 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center transition transform group-hover:scale-110 shadow-lg">
              <i className="bi bi-arrow-up-right"></i>
            </div>
          </div>

          <div
            className="group relative break-inside-avoid rounded-[2rem] overflow-hidden bg-gray-900 cursor-pointer h-[380px] mb-4">
            <img src="/assets/img/hoodie.png"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-80 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60">
            </div>
            <div className="absolute bottom-6 left-6 text-white text-xl font-bold tracking-tight">
              Brand Merch
            </div>
            <div
              className="absolute bottom-6 right-6 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center transition transform group-hover:scale-110 shadow-lg">
              <i className="bi bi-arrow-up-right"></i>
            </div>
          </div>

          <div
            className="group relative break-inside-avoid rounded-[2rem] overflow-hidden bg-gray-900 cursor-pointer h-[450px] mb-4">
            <img src="/assets/img/box.png"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-80 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60">
            </div>
            <div className="absolute bottom-6 left-6 text-white text-xl font-bold tracking-tight">
              Packaging
            </div>
            <div
              className="absolute bottom-6 right-6 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center transition transform group-hover:scale-110 shadow-lg">
              <i className="bi bi-arrow-up-right"></i>
            </div>
          </div>

          <div
            className="group relative break-inside-avoid rounded-[2rem] overflow-hidden bg-gray-900 cursor-pointer h-[300px] mb-4">
            <img src="/assets/img/mug.png"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-80 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60">
            </div>
            <div className="absolute bottom-6 left-6 text-white text-xl font-bold tracking-tight">
              Custom Mugs
            </div>
            <div
              className="absolute bottom-6 right-6 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center transition transform group-hover:scale-110 shadow-lg">
              <i className="bi bi-arrow-up-right"></i>
            </div>
          </div>

          <div
            className="group relative break-inside-avoid rounded-[2rem] overflow-hidden bg-gray-900 cursor-pointer h-[350px] mb-4">
            <img src="/assets/img/coaster.png"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-80 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60">
            </div>
            <div className="absolute bottom-6 left-6 text-white text-xl font-bold tracking-tight">
              Custom Coasters
            </div>
            <div
              className="absolute bottom-6 right-6 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center transition transform group-hover:scale-110 shadow-lg">
              <i className="bi bi-arrow-up-right"></i>
            </div>
          </div>

          <div
            className="group relative break-inside-avoid rounded-[2rem] overflow-hidden bg-gray-900 cursor-pointer h-[420px] mb-4">
            <img src="/assets/img/sticker.png"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-60 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60">
            </div>
            <div className="absolute bottom-6 left-6 text-white text-xl font-bold tracking-tight">
              Custom Stickers
            </div>
            <div
              className="absolute bottom-6 right-6 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center transition transform group-hover:scale-110 shadow-lg">
              <i className="bi bi-arrow-up-right"></i>
            </div>
          </div>

          <div
            className="group relative break-inside-avoid rounded-[2rem] overflow-hidden bg-gray-900 cursor-pointer h-[380px] mb-4">
            <img src="/assets/img/kiosk.png"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-80 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80">
            </div>
            <div className="absolute bottom-8 left-8 text-white text-2xl font-bold tracking-tight">
              Kiosk Advertising
            </div>
            <div
              className="absolute bottom-8 right-8 w-12 h-12 bg-white text-black rounded-full flex items-center justify-center transition transform group-hover:scale-110 shadow-lg">
              <i className="bi bi-arrow-up-right text-xl"></i>
            </div>
          </div>

        </div>
      </section>
      <Footer />
    </main>
  );
}
