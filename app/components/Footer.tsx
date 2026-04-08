'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          
          {/* Contact Section */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Contact Us</h2>
    
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-lime-500/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-lime-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.334 3 6c0-1.012-.03-1.4-.252-1.8" />
                  </svg>
                </div>
                <p className="text-neutral-300">+62 234 4567 899</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-lime-500/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-lime-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <a href="mailto:teelabapp@gmail.com" className="text-neutral-300 hover:text-lime-400 transition-colors">
                  teelabapp@gmail.com
                </a>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-lime-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-lime-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-neutral-300 leading-relaxed">
                  <p className="font-medium text-white">TeeLab Store Bandung</p>
                  <p className="text-sm">Driving Range Siliwangi Golf</p>
                  <p className="text-sm">Jl. Lombok No. 10, Merdeka</p>
                  <p className="text-sm">Kota Bandung, Jawa Barat</p>
                </div>
              </div>
            </div>
          </div>

          {/* Get In Touch Section */}
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Get In Touch</h2>
              <p className="text-neutral-300 leading-relaxed max-w-md">
                Have questions, feedback, or collaboration ideas? We'd love to hear from you.
              </p>
            </div>

            <div className="flex flex-wrap gap-8 mt-8 md:mt-12">
              <Link 
                href="/landingpage" 
                className="text-neutral-400 hover:text-lime-400 transition-colors font-medium"
              >
                Home
              </Link>
              <button 
                onClick={() => document.getElementById('our-story')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-neutral-400 hover:text-lime-400 transition-colors font-medium"
              >
                Our Story
              </button>
              <Link 
                href="/products" 
                className="text-neutral-400 hover:text-lime-400 transition-colors font-medium"
              >
                Shop
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo.png"
                alt="TeeLab"
                className="h-6 w-auto"
              />
              <span className="text-neutral-500 text-sm">© 2026 TeeLab.</span>
            </div>
            <p className="text-neutral-500 text-sm text-center md:text-right">
              Where golf meets modern lifestyle.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}