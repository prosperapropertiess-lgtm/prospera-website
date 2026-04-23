"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "For Landlords", href: "/landlords" },
  { label: "For Tenants", href: "/tenants" },
  { label: "Listings", href: "/listings" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#FAF8F5] shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo.png"
            alt="Prospera Properties"
            width={160}
            height={64}
            className="h-16 w-auto"
            style={{ mixBlendMode: "multiply" }}
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#0A1628] hover:text-[#7B1C1C] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Login Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href="https://prosperaproperties.buildiumapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium px-4 py-2 border border-[#0A1628] text-[#0A1628] rounded hover:bg-[#0A1628] hover:text-[#FAF8F5] transition-colors"
          >
            Landlord Login
          </a>
          <a
            href="https://prosperaproperties.buildiumapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium px-4 py-2 bg-[#7B1C1C] text-[#FAF8F5] rounded hover:bg-[#9B2E2E] transition-colors"
          >
            Tenant Login
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="lg:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-[#0A1628] transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-[#0A1628] transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-[#0A1628] transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[#FAF8F5] border-t border-gray-100 px-6 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#0A1628] hover:text-[#7B1C1C] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
            <a
              href="https://prosperaproperties.buildiumapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium px-4 py-2 border border-[#0A1628] text-[#0A1628] rounded text-center hover:bg-[#0A1628] hover:text-[#FAF8F5] transition-colors"
            >
              Landlord Login
            </a>
            <a
              href="https://prosperaproperties.buildiumapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium px-4 py-2 bg-[#7B1C1C] text-[#FAF8F5] rounded text-center hover:bg-[#9B2E2E] transition-colors"
            >
              Tenant Login
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
