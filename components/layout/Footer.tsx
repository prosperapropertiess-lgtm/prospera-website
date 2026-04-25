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

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#0A1628", color: "#FAF8F5" }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
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
            {/* Social links — replace # with real URLs when ready */}
            <div className="flex items-center gap-4">
              {/* YouTube — replace href with actual channel URL */}
              <a
                href="https://www.youtube.com/@jaizonebin"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube — 17 videos and growing"
                className="footer-link"
                title="Watch on YouTube"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
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

          {/* Column 4: Contact */}
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
                  href="mailto:prosperapropertiess@gmail.com"
                  className="text-sm footer-link"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  prosperapropertiess@gmail.com
                </a>
              </li>
              <li
                className="text-sm footer-link"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                London &nbsp;·&nbsp; St. Thomas &nbsp;·&nbsp; Strathroy
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
