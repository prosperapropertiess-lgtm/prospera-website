"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "For Landlords", href: "/landlords" },
  { label: "For Tenants", href: "/tenants" },
  { label: "Listings", href: "/listings" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const BUILDIUM_URL = "https://prosperaproperties.buildiumapp.com";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? "#FAF8F5" : "transparent",
          boxShadow: scrolled ? "0 1px 20px rgba(10,22,40,0.08)" : "none",
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
              style={{
                height: "60px",
                width: "auto",
                filter: scrolled ? "none" : "brightness(0) invert(1)",
                mixBlendMode: scrolled ? "multiply" : "normal",
                transition: "filter 0.3s",
              }}
            />
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium tracking-wide transition-colors duration-200"
                style={{
                  color: scrolled ? "#0A1628" : "#FAF8F5",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop login buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={BUILDIUM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-all duration-200 rounded-lg"
              style={{
                border: `1px solid ${scrolled ? "#0A1628" : "rgba(250,248,245,0.5)"}`,
                color: scrolled ? "#0A1628" : "#FAF8F5",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              Landlord Login
            </a>
            <a
              href={BUILDIUM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-semibold uppercase tracking-widest bg-[#7B1C1C] text-[#FAF8F5] transition-all duration-200 hover:bg-[#9B2E2E] rounded-lg"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Tenant Login
            </a>
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
                  backgroundColor: scrolled || menuOpen ? "#0A1628" : "#FAF8F5",
                  transform,
                  opacity: i === 1 && menuOpen ? 0 : 1,
                }}
              />
            ))}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-40 flex flex-col pt-24 px-8 pb-8 bg-[#FAF8F5]"
          >
            <nav className="flex flex-col gap-6 flex-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.25 }}
                >
                  <Link
                    href={link.href}
                    className="text-2xl font-light block py-1 text-[#0A1628]"
                    style={{ fontFamily: "var(--font-cormorant)" }}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="flex flex-col gap-3 mt-8">
              <a
                href={BUILDIUM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 text-center text-sm font-semibold uppercase tracking-widest border border-[#0A1628] text-[#0A1628] rounded-lg"
                style={{ fontFamily: "var(--font-dm-sans)" }}
                onClick={() => setMenuOpen(false)}
              >
                Landlord Login
              </a>
              <a
                href={BUILDIUM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 text-center text-sm font-semibold uppercase tracking-widest bg-[#7B1C1C] text-[#FAF8F5] rounded-lg"
                style={{ fontFamily: "var(--font-dm-sans)" }}
                onClick={() => setMenuOpen(false)}
              >
                Tenant Login
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
