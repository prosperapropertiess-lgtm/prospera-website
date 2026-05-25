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
  Tag,
  Mail,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { GooeyFilter } from "@/components/ui/gooey-filter";

const navLinks = [
  { label: "For Landlords", href: "/landlords" },
  { label: "For Tenants", href: "/tenants" },
  { label: "Listings", href: "/listings" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const mobileNavItems = [
  { icon: Home,       label: "Home",       href: "/"           },
  { icon: Building2,  label: "Landlords",  href: "/landlords"  },
  { icon: Users,      label: "Tenants",    href: "/tenants"    },
  { icon: LayoutList, label: "Listings",   href: "/listings"   },
  { icon: Tag,        label: "Pricing",    href: "/pricing"    },
  { icon: Mail,       label: "Contact",    href: "/contact"    },
  { icon: Zap,        label: "The App",    href: "/platform",  accent: true },
];

const ITEM_STEP = 56; // px between each item

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // lock body scroll when gooey menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // close on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <>
      {/* ── Desktop + shared header bar ────────────────────────────────────── */}
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
          <Link href="/" className="flex-shrink-0">
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
            <Link
              href="/platform"
              className="relative flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold uppercase tracking-widest transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: "rgba(139,32,48,0.12)", border: "1px solid rgba(139,32,48,0.3)", color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#8B2030" }} />
              The App
            </Link>
            <Link
              href="/contact"
              className="btn-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest rounded"
              style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
            >
              Get a Free Quote
            </Link>
          </div>

          {/* Mobile: placeholder so header stays same height — gooey button is fixed separately */}
          <div className="lg:hidden w-10 h-10" />
        </div>
      </header>

      {/* ── Gooey mobile menu (fixed, outside header so items can overflow) ── */}
      <GooeyFilter id="nav-goo" strength={5} />

      {/* Backdrop */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            style={{ backgroundColor: "rgba(8,12,18,0.55)", backdropFilter: "blur(2px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Gooey menu — anchored top-right */}
      <div className="fixed z-50 lg:hidden" style={{ top: 20, right: 20 }}>

        {/* Text labels — rendered outside the filter so they stay sharp */}
        <AnimatePresence>
          {menuOpen && mobileNavItems.map((item, index) => (
            <motion.div
              key={`label-${item.href}`}
              className="absolute flex items-center justify-end"
              style={{ top: (index + 1) * ITEM_STEP + 8, right: 52 }}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ delay: index * 0.04 + 0.08, duration: 0.18 }}
            >
              <Link
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-xs font-semibold whitespace-nowrap px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: item.accent ? "rgba(139,32,48,0.12)" : "rgba(31,47,58,0.9)",
                  color: item.accent ? "#8B2030" : "rgba(250,248,245,0.85)",
                  border: item.accent ? "1px solid rgba(139,32,48,0.3)" : "1px solid rgba(250,248,245,0.08)",
                  fontFamily: "var(--font-dm-sans)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Gooey blob layer */}
        <div style={{ filter: "url(#nav-goo)" }}>
          {/* Nav item circles */}
          <AnimatePresence>
            {menuOpen && mobileNavItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <motion.div
                  key={item.label}
                  className="absolute w-12 h-12 rounded-full"
                  style={{
                    backgroundColor: item.accent
                      ? "#8B2030"
                      : isActive
                        ? "rgba(250,248,245,0.15)"
                        : "#1F2F3A",
                  }}
                  initial={{ y: 0, opacity: 0 }}
                  animate={{ y: (index + 1) * ITEM_STEP, opacity: 1 }}
                  exit={{
                    y: 0,
                    opacity: 0,
                    transition: {
                      delay: (mobileNavItems.length - 1 - index) * 0.04,
                      duration: 0.35,
                      type: "spring",
                      bounce: 0,
                    },
                  }}
                  transition={{ delay: index * 0.05, duration: 0.4, type: "spring", bounce: 0 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="w-full h-full flex items-center justify-center"
                    aria-label={item.label}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, filter: "blur(8px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, filter: "blur(8px)" }}
                        transition={{ delay: index * 0.04, duration: 0.18 }}
                      >
                        <Icon className="w-5 h-5" style={{ color: "#FAF8F5" }} />
                      </motion.div>
                    </AnimatePresence>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Main trigger button */}
          <motion.button
            className="relative w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#8B2030" }}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle navigation"
            whileTap={{ scale: 0.93 }}
            transition={{ duration: 0.15 }}
          >
            <AnimatePresence mode="wait">
              {menuOpen ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, filter: "blur(8px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(8px)" }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="w-5 h-5" style={{ color: "#FAF8F5" }} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, filter: "blur(8px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(8px)" }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu className="w-5 h-5" style={{ color: "#FAF8F5" }} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </>
  );
}
