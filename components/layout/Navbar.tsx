"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  Building2,
  Users,
  LayoutList,
  BookOpen,
  Info,
  Mail,
  Zap,
  BarChart2,
} from "lucide-react";

const navLinks = [
  { label: "For Landlords", href: "/landlords" },
  { label: "For Tenants", href: "/tenants" },
  { label: "Listings", href: "/listings" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const mobileNavItems = [
  { icon: Home,       label: "Home",           href: "/"              },
  { icon: Building2,  label: "For Landlords",   href: "/landlords"     },
  { icon: Users,      label: "For Tenants",     href: "/tenants"       },
  { icon: LayoutList, label: "Listings",        href: "/listings"      },
  { icon: BookOpen,   label: "Blog",            href: "/blog"          },
  { icon: Info,       label: "About",           href: "/about"         },
  { icon: Mail,       label: "Contact",         href: "/contact"       },
  { icon: BarChart2,  label: "Freedom Score",   href: "/freedom-score" },
  { icon: Zap,        label: "App Waitlist",    href: "/platform", accent: true },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────────────── */}
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
          <Link href="/" className="flex-shrink-0 relative z-50" onClick={() => setMenuOpen(false)}>
            <Image
              src="/logo.png"
              alt="Prospera Properties"
              width={120}
              height={60}
              priority
              sizes="120px"
              style={{ height: "60px", width: "auto", filter: "brightness(0) invert(1)" }}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium tracking-wide transition-colors duration-200 hover:text-white"
                  style={{
                    color: isActive ? "#FFFFFF" : "rgba(250,248,245,0.75)",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:5196971227"
              className="text-xs font-medium transition-opacity hover:opacity-70"
              style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}
            >
              (519) 697-1227
            </a>
            <Link
              href="/platform"
              className="relative flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold uppercase tracking-widest transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: "rgba(139,32,48,0.12)", border: "1px solid rgba(139,32,48,0.3)", color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#8B2030" }} />
              App Waitlist
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 text-xs font-semibold uppercase tracking-widest rounded"
              style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
            >
              Get a Free Quote
            </Link>
          </div>

          {/* Hamburger — 3 white stripes */}
          <button
            className="lg:hidden relative z-50 flex flex-col justify-center items-center gap-[5px] w-10 h-10"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span
              className="block w-6 h-[2px] origin-center transition-all duration-300"
              style={{
                backgroundColor: "#FAF8F5",
                transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="block w-6 h-[2px] transition-all duration-300"
              style={{
                backgroundColor: "#FAF8F5",
                opacity: menuOpen ? 0 : 1,
                transform: menuOpen ? "scaleX(0)" : "none",
              }}
            />
            <span
              className="block w-6 h-[2px] origin-center transition-all duration-300"
              style={{
                backgroundColor: "#FAF8F5",
                transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </div>
      </header>

      {/* ── Mobile overlay ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden flex flex-col pt-24 pb-10 px-8 overflow-y-auto"
            style={{ backgroundColor: "rgba(15,22,30,0.82)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Nav items */}
            <nav className="flex flex-col flex-1">
              {mobileNavItems.map((item, i) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-4 py-4 border-b transition-opacity hover:opacity-70"
                      style={{
                        borderColor: "rgba(250,248,245,0.08)",
                        opacity: isActive ? 1 : 0.85,
                      }}
                    >
                      <span
                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: item.accent
                            ? "#8B2030"
                            : isActive
                              ? "rgba(250,248,245,0.12)"
                              : "rgba(250,248,245,0.06)",
                        }}
                      >
                        <Icon
                          className="w-4 h-4"
                          style={{ color: item.accent ? "#FAF8F5" : isActive ? "#FAF8F5" : "rgba(250,248,245,0.7)" }}
                        />
                      </span>
                      <span
                        className="text-xl font-light"
                        style={{
                          fontFamily: "var(--font-cormorant)",
                          color: item.accent ? "#FAF8F5" : isActive ? "#FAF8F5" : "rgba(250,248,245,0.8)",
                        }}
                      >
                        {item.label}
                      </span>
                      {item.accent && (
                        <span
                          className="ml-auto text-xs font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: "rgba(139,32,48,0.2)", color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}
                        >
                          Waitlist
                        </span>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Bottom CTA */}
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.3 }}
            >
              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className="block w-full py-4 text-center text-sm font-semibold uppercase tracking-widest rounded"
                style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              >
                Get a Free Quote
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
