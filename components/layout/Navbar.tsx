"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "For Landlords", href: "/landlords" },
  { label: "For Tenants", href: "/tenants" },
  { label: "Listings", href: "/listings" },
  { label: "Pricing", href: "/pricing" },
  { label: "The App", href: "/platform", highlight: true },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const mobileSecondaryLinks = [
  { label: "Resources", href: "/resources" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor: "#1F2F3A",
          boxShadow: scrolled ? "0 1px 12px rgba(0,0,0,0.12)" : "none",
          transition: "box-shadow 250ms cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0" onClick={() => setMenuOpen(false)}>
            <Image
              src="/logo.png"
              alt="Prospera Properties"
              width={120}
              height={60}
              priority
              sizes="120px"
              style={{
                height: "60px",
                width: "auto",
                filter: "brightness(0) invert(1)",
              }}
            />
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium tracking-wide transition-colors duration-200 hover:text-white"
                  style={{
                    color: link.highlight
                      ? "#8B2030"
                      : isActive
                        ? "#FFFFFF"
                        : "rgba(250,248,245,0.75)",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Contact CTA */}
          <div className="hidden lg:flex items-center">
            <Link
              href="/contact"
              className="btn-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest rounded"
              style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
            >
              Get a Free Quote
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="lg:hidden flex flex-col justify-center items-center gap-1.5 w-10 h-10 relative z-50"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {[
              menuOpen ? "translateY(3.5px) rotate(45deg)" : "",
              "",
              menuOpen ? "translateY(-3.5px) rotate(-45deg)" : "",
            ].map((transform, i) => (
              <span
                key={i}
                className="block w-6 h-px transition-all duration-300 origin-center"
                style={{
                  backgroundColor: "#FAF8F5",
                  transform,
                  opacity: i === 1 && menuOpen ? 0 : 1,
                }}
              />
            ))}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className="fixed inset-0 z-40 flex flex-col pt-24 px-8 pb-8 lg:hidden"
        style={{
          backgroundColor: "#1F2F3A",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transform: menuOpen ? "translateY(0)" : "translateY(-12px)",
        }}
      >
        <nav className="flex flex-col gap-5 flex-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className="text-2xl font-light block py-1 transition-colors"
                style={{
                  fontFamily: "var(--font-cormorant)",
                  color: isActive ? "#FAF8F5" : "rgba(250,248,245,0.7)",
                }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="border-t pt-4 flex gap-6" style={{ borderColor: "rgba(250,248,245,0.12)" }}>
            {mobileSecondaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm transition-colors"
                style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="flex flex-col gap-3 mt-8">
          <Link
            href="/contact"
            className="btn-primary w-full py-3 text-center text-sm font-semibold uppercase tracking-widest rounded"
            style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
            onClick={() => setMenuOpen(false)}
          >
            Get a Free Quote
          </Link>
        </div>
      </div>
    </>
  );
}
