import Link from "next/link";
import Navbar from "@/src/components/Navbar";
import { ShoppingBag } from "lucide-react";

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      <main className="relative py-20">
        <div
          className="absolute inset-0 bg-contain md:bg-cover bg-no-repeat bg-center"
          style={{ backgroundImage: "url('/images/home-page/hero.png')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent"></div>
          <div className="relative z-20">
            <Navbar />
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-24 min-h-[90vh] flex items-end">
          <div className="w-full md:w-2/3 text-white">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-medium leading-tight tracking-tight max-w-3xl">
                Performance Meets Everyday Style.
              </h1>

              <Link
                href="/products"
                className="flex items-center gap-4 px-8 py-3 rounded-full 
                bg-white/20 backdrop-blur-lg border border-white/30 
                text-white text-sm sm:text-base font-medium 
                hover:bg-white/30 hover:scale-105 transition-all duration-300 
                self-start md:self-end whitespace-nowrap"
              >
                <span className="opacity-90">Go Product</span>

                <div className="bg-white/20 p-2 rounded-full">
                  <ShoppingBag size={18} />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <section id="our-story" className="bg-white min-h-screen py-20">
        <div className="container mx-auto px-4">
          <p className="text-center text-neutral-500 border-2 border-neutral-500 rounded-full py-2 max-w-[130px] mx-auto">
            Our Story
          </p>
          <div className="relative py-12 flex justify-center">
            <h2 className="text-center text-4xl sm:text-5xl md:text-6xl text-neutral-700 max-w-4xl leading-tight mx-auto">
              TeeLab was created for a new generation of golfers{" "}
              <img
                src="/images/golfers.png"
                alt="Golfers"
                className="inline-block ml-4 w-[90px] sm:w-[110px] md:w-[130px] object-contain align-middle"
              />{" "}
              <span className="text-neutral-400 px-2">
                who see the game as more than just a sport it's a lifestyle !.{" "}
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-10 py-20">
            <img src="/images/ourimage1.png" alt="" className="h-90" />
            <img src="/images/ourimage.png" alt="" className="h-90" />
          </div>
        </div>
      </section>

      <section id="nearby" className="bg-white min-h-[800px] py-20">
        <div className="container mx-auto px-4">
          <p className="text-center text-neutral-500 border-2 border-neutral-500 rounded-full py-2 max-w-[130px]">
            Nearby
          </p>
          <h1 className="text-neutral-700 text-right text-3xl max-w-2xl ml-auto">
            Because golf isn't just about the{" "}
            <span className="text-neutral-400">
              swing. It's about how you carry yourself, wherever you go.
            </span>
          </h1>
          <div className="flex items-center gap-10 py-20 justify-center">
            <img src="/images/nearby1.png" alt="" className="w-[460px]" />
            <img src="/images/nearby.png" alt="" className="w-[547px]" />
            <img src="/images/nearby2.png" alt="" className="w-[480px]" />
          </div>
        </div>
      </section>

      <section id="category" className="bg-white min-h-[800px] py-10">
        <div className="container mx-auto px-4">
          <p className="text-center text-neutral-500 border-2 border-neutral-500 rounded-full py-2 max-w-[130px] mb-8">
            Category
          </p>
          <h2 className="text-4xl font-bold text-neutral-700 mb-2">
            Top-Quality Golf Equipment for
          </h2>
          <h3 className="text-4xl font-bold text-green-600 mb-12">
            Every Game!
          </h3>
          <Link
            href="/products"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition"
          >
            Browse All Products
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-white text-xl font-bold mb-6">Contact Us</h3>
              <div className="space-y-4">
                <p>Phone: +62 851-6101-9999</p>
                <p>Email: teelab@gmail.com</p>
                <p>Address: Jawa Timur, Indonesia</p>
              </div>
            </div>
            <div>
              <h3 className="text-white text-xl font-bold mb-6">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/" className="block hover:text-white">
                  Home
                </Link>
                <Link href="/products" className="block hover:text-white">
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-neutral-800 mt-8 pt-8 text-center">
            <p className="text-sm">© 2024 TeeLab - Where golf meets everyday lifestyle</p>
          </div>
        </div>
      </footer>
    </div>
  );
}