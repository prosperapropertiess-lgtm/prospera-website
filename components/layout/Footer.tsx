import Link from "next/link";
import Image from "next/image";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "For Landlords", href: "/landlords" },
  { label: "For Tenants", href: "/tenants" },
  { label: "Listings", href: "/listings" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const landlordLinks = [
  { label: "Get a Free Quote", href: "/contact" },
  { label: "Pricing", href: "/pricing" },
  { label: "How It Works", href: "/landlords#how-it-works" },
  { label: "Free Resources", href: "/resources" },
];

const areaLinks = [
  { label: "London, Ontario", href: "/areas/london" },
  { label: "St. Thomas, Ontario", href: "/areas/st-thomas" },
  { label: "Strathroy, Ontario", href: "/areas/strathroy" },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#0A1628", color: "#FAF8F5" }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Column 1: Logo + tagline */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <Image
                src="/logo.png"
                alt="Prospera Properties"
                width={120}
                height={60}
                style={{ height: "60px", width: "auto", filter: "brightness(0) invert(1)" }}
              />
            </div>
            <p
              className="text-xs uppercase tracking-widest mb-2 footer-link"
              style={{ fontFamily: "var(--font-dm-sans)", color: "rgba(250,248,245,0.35)" }}
            >
              For landlords with 1–5 doors.
            </p>
            <p
              className="text-sm leading-relaxed mb-5 footer-link"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Property management built for small landlords across London, St. Thomas, and Strathroy.
            </p>
            <div className="flex items-center gap-4">
              {/* YouTube */}
              <a href="https://www.youtube.com/@jaizonebin" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="footer-link" title="Watch on YouTube">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://www.instagram.com/prosperaproperties.co/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer-link" title="Follow on Instagram">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
              {/* Facebook */}
              <a href="https://www.facebook.com/p/Prospera-Properties-61562311157583/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="footer-link" title="Follow on Facebook">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="https://www.linkedin.com/company/105607541" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="footer-link" title="Connect on LinkedIn">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              {/* Google */}
              <a href="https://share.google/6dnxCrZ6UWnMSyPA2" target="_blank" rel="noopener noreferrer" aria-label="Google Reviews" className="footer-link" title="See us on Google">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
              </a>
            </div>

          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-widest mb-5"
              style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
            >
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm footer-link"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: For Landlords */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-widest mb-5"
              style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
            >
              For Landlords
            </h3>
            <ul className="space-y-3">
              {landlordLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm footer-link"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Service Areas */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-widest mb-5"
              style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
            >
              Service Areas
            </h3>
            <ul className="space-y-3">
              {areaLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm footer-link"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Contact */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-widest mb-5"
              style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
            >
              Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+15196971227"
                  className="text-sm footer-link"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  (519) 697-1227
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@prosperaproperties.co"
                  className="text-sm footer-link"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  hello@prosperaproperties.co
                </a>
              </li>
              <li className="text-sm footer-link" style={{ fontFamily: "var(--font-dm-sans)" }}>
                <Link href="/areas/london" className="footer-link">London</Link>
                {" · "}
                <Link href="/areas/st-thomas" className="footer-link">St. Thomas</Link>
                {" · "}
                <Link href="/areas/strathroy" className="footer-link">Strathroy</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(250,248,245,0.1)" }}
        >
          <p
            className="text-xs footer-link"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            &copy; {new Date().getFullYear()} Prospera Properties. All rights reserved.
          </p>
          <p
            className="text-xs footer-link"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Built with care in Ontario
          </p>
        </div>
      </div>
    </footer>
  );
}
