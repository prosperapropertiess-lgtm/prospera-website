import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#0A1628] text-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo + Tagline */}
        <div className="md:col-span-1">
          <Image
            src="/logo.png"
            alt="Prospera Properties"
            width={140}
            height={56}
            className="h-14 w-auto brightness-0 invert mb-4"
          />
          <p className="text-sm text-gray-400 leading-relaxed">
            Property management that actually cares. Serving London, St. Thomas, and Sarnia.
          </p>
          <div className="flex gap-4 mt-5">
            <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-[#FAF8F5] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>
            </a>
            <a href="#" aria-label="YouTube" className="text-gray-400 hover:text-[#FAF8F5] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-5">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            {[
              { label: "Home", href: "/" },
              { label: "About Us", href: "/about" },
              { label: "Listings", href: "/listings" },
              { label: "Blog", href: "/blog" },
              { label: "Contact", href: "/contact" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-gray-300 hover:text-[#FAF8F5] transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* For Landlords */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-5">For Landlords</h4>
          <ul className="space-y-3 text-sm">
            {[
              { label: "Why Choose Us", href: "/landlords" },
              { label: "Our Services", href: "/landlords#services" },
              { label: "Pricing", href: "/pricing" },
              { label: "Landlord Portal", href: "https://prosperaproperties.buildiumapp.com" },
            ].map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="text-gray-300 hover:text-[#FAF8F5] transition-colors"
                  {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-5">Contact</h4>
          <ul className="space-y-3 text-sm text-gray-300">
            <li>
              <a href="tel:5196971227" className="hover:text-[#FAF8F5] transition-colors">
                (519) 697-1227
              </a>
            </li>
            <li>
              <a href="mailto:prosperapropertiess@gmail.com" className="hover:text-[#FAF8F5] transition-colors">
                prosperapropertiess@gmail.com
              </a>
            </li>
            <li className="text-[#7B1C1C] font-medium">
              London · St. Thomas · Sarnia
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Prospera Properties. All rights reserved.</p>
          <p>Built with care in Ontario.</p>
        </div>
      </div>
    </footer>
  );
}
