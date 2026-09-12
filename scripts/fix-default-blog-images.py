#!/usr/bin/env python3
"""One-off: replace broken /blog-images/default.jpg featuredImage references
(that file never existed in public/) with real, already-verified Unsplash
photos matching each post's topic, reusing exact URLs already live on
thematically similar posts for consistency."""
import pathlib

MAP = {
    "buying-property-with-existing-tenants-ontario": "1449824913935-59a10b8d2000",
    "city-of-london-rental-unit-licence-renewal": "1581578731548-c64695cc6952",
    "can-landlord-evict-tenant-ontario-2026": "1589829545856-d10d557cf95f",
    "hst-residential-rental-property-ontario": "1554224155-6726b3ff858f",
    "city-of-london-second-unit-registration": "1581578731548-c64695cc6952",
    "london-ontario-zoning-rental-property": "1581578731548-c64695cc6952",
    "ltb-consent-order-ontario": "1589829545856-d10d557cf95f",
    "ltb-default-order-ontario": "1589829545856-d10d557cf95f",
    "ltb-written-hearing-ontario": "1589829545856-d10d557cf95f",
    "london-ontario-property-standards-bylaw": "1581578731548-c64695cc6952",
    "ltb-duty-counsel-ontario": "1589829545856-d10d557cf95f",
    "no-pets-clause-ontario-rental": "1504307651254-35680f356dfd",
    "rta-section-22-interference-reasonable-enjoyment-ontario": "1589829545856-d10d557cf95f",
    "st-thomas-ontario-rental-bylaws-landlord-guide": "1449824913935-59a10b8d2000",
    "rta-section-20-maintenance-obligations-ontario": "1581578731548-c64695cc6952",
    "strathroy-landlord-guide-ontario": "1449824913935-59a10b8d2000",
    "tenant-wont-leave-after-lease-ends-ontario": "1589829545856-d10d557cf95f",
    "what-to-do-if-tenant-stops-paying-rent-ontario": "1554224155-6726b3ff858f",
}

OLD = 'featuredImage: "/blog-images/default.jpg"'
BLOG_DIR = pathlib.Path(__file__).resolve().parent.parent / "content" / "blog"

fixed = 0
for slug, photo_id in MAP.items():
    path = BLOG_DIR / f"{slug}.md"
    if not path.exists():
        print(f"MISSING FILE: {path}")
        continue
    text = path.read_text(encoding="utf-8")
    new_url = f'featuredImage: "https://images.unsplash.com/photo-{photo_id}?w=1200&h=630&fit=crop&auto=format&q=80"'
    if OLD not in text:
        print(f"NO MATCH (already changed?): {slug}")
        continue
    path.write_text(text.replace(OLD, new_url, 1), encoding="utf-8")
    fixed += 1
    print(f"fixed: {slug} -> {photo_id}")

print(f"\n{fixed} files fixed")
