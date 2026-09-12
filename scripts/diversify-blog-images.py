#!/usr/bin/env python3
"""One-off: spread blog featuredImage assignments across a much larger,
visually-verified pool so the same stock photo doesn't repeat across dozens
of posts (one legal photo was reused 40 times). Every photo ID below was
downloaded and visually confirmed to match its theme before use.

Assignment: keyword-match each post's slug/category to the most specific
theme bucket available, then pick a stable index within that bucket's pool
by hashing the slug — same post always gets the same image (idempotent),
but different posts in the same bucket spread across the whole pool.
"""
import pathlib
import re

BLOG_DIR = pathlib.Path(__file__).resolve().parent.parent / "content" / "blog"

# Every ID here was downloaded at 300x200 and visually reviewed.
POOLS = {
    "legal_court": [
        "1589829545856-d10d557cf95f",  # Lady Justice statue
        "1589391886645-d51941baf7fb",  # gavel
    ],
    "notice_signing": [
        "1450101499163-c8848c66ca85",  # signing a document
        "1521791055366-0d553872125f",  # pen signing paper
    ],
    "money_rent_tax": [
        "1554224155-6726b3ff858f",     # tax forms + calculator
        "1554224154-26032ffc0d07",     # tax forms + coffee
        "1521791136064-7986c2920216",  # handshake (deal/agreement)
    ],
    "maintenance_repair": [
        "1581578731548-c64695cc6952",  # cleaning a window
        "1558618666-fcd25c85cd64",     # hands-on repair tool
    ],
    "bathroom_reno": [
        "1584622650111-993a426fbf0a",  # bright white bathroom
        "1600566752355-35792bedcfea",  # dark modern bathroom
    ],
    "construction_capital": [
        "1504307651254-35680f356dfd",  # construction site (rebar/workers)
    ],
    "house_exterior": [
        "1570129477492-45c003edd2be",  # classic white house, porch
        "1568605114967-8130f3a36994",  # modern house at dusk
        "1523217582562-09d0def993a6",  # white modern house
        "1600585154340-be6161a56a0c",  # modern house with tree
        "1449844908441-8829872d2607",  # suburban house at dawn
    ],
    "keys_movein": [
        "1560518883-ce09059eeffa",     # keys + model house
    ],
    "apartment_building": [
        "1545324418-cc1a3fa10c00",     # apartment building exterior
        "1554469384-e58fac16e23a",     # glass office/commercial building
    ],
    "interior_living": [
        "1560448204-e02f11c3d0e2",     # bright condo living room
        "1560185007-cde436f6a4d0",     # cozy dining/living room
        "1502672260266-1c1ef2d93688",  # living room with plants
        "1600607687939-ce8a6c25118c",  # skylight living room
        "1616486338812-3dadae4b4ace",  # staged living room
        "1554995207-c18c203602cb",     # orange-couch living room
        "1493809842364-78817add7ffb",  # living room, TV + blue sofa
    ],
    "kitchen": [
        "1484154218962-a197022b5858",  # modern kitchen
    ],
    "pets": [
        "1450778869180-41d0601e046e",  # dog and cat cuddling
    ],
    "screening_meeting": [
        "1454165804606-c3d57bc86b40",  # two people at laptops
        "1573497491208-6b1acb260507",  # two people talking at a table
        "1517245386807-bb43f82c33c4",  # meeting/discussion at desk
    ],
    "admin_paperwork": [
        "1554415707-6e8cfc93fe23",     # laptop + planner, overhead
        "1518481612222-68bbe828ecd1",  # journal + coffee
    ],
}

# Ordered rules: first matching pattern (against slug) wins.
RULES = [
    (r"no-pets|pet-polic", "pets"),
    (r"tenant-damages|property-standards|maintenance-budget|winter-maintenance|rta-section-20", "maintenance_repair"),
    (r"vital-services", "legal_court"),
    (r"^n\d{1,2}-(notice|form)|rta-section|ltb-|l\d-application|overholding|retaliation|consent-order|default-order|written-hearing|duty-counsel|interference-reasonable|rta-section-83|tenant-wont-leave|can-landlord-evict|enforcing-eviction|how-long-does-eviction", "legal_court"),
    (r"lease-renewal|standard-lease|last-month-rent|rent-repayment|deduct", "notice_signing"),
    (r"screening|red-flag|reference-check|credit-check|background-check|application-tenant", "screening_meeting"),
    (r"hst|tax|rent-control|rent-increase|above-guideline|how-much-charge-rent|rent-arrears|stops-paying-rent", "money_rent_tax"),
    (r"agi|capital-improvement|renovation|construction", "construction_capital"),
    (r"buying-property|newcomer|moving-to", "keys_movein"),
    (r"second-unit|basement|zoning|licence|licence-renewal|bylaw|property-standards-bylaw", "apartment_building"),
    (r"neighbourhood|best-neighbourhoods|kitchen", "kitchen"),
    (r"^(property-management|strathroy-landlord|st-thomas-ontario-rental)", "house_exterior"),
    (r"airbnb|short-term", "interior_living"),
]

CATEGORY_FALLBACK = {
    "Renter Guides": "interior_living",
    "Neighbourhood Guides": "interior_living",
    "Newcomers": "keys_movein",
    "Market Updates": "house_exterior",
}


def bucket_for(slug: str, category: str) -> str:
    for pattern, name in RULES:
        if re.search(pattern, slug):
            return name
    return CATEGORY_FALLBACK.get(category, "house_exterior")


def url_for(photo_id: str) -> str:
    return f"https://images.unsplash.com/photo-{photo_id}?w=1200&h=630&fit=crop&auto=format&q=80"


def main():
    posts = []  # (slug, path, category)
    for path in sorted(BLOG_DIR.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        m = re.match(r"^---\n(.*?)\n---", text, re.S)
        if not m:
            continue
        cat_m = re.search(r'^category:\s*"(.+)"', m.group(1), re.M)
        posts.append((path.stem, path, cat_m.group(1) if cat_m else ""))

    # Group by bucket, then assign round-robin in sorted-slug order so each
    # bucket's pool is spread as evenly as possible (deterministic, stable).
    by_bucket: dict[str, list[tuple[str, pathlib.Path]]] = {}
    for slug, path, category in posts:
        bucket = bucket_for(slug, category)
        by_bucket.setdefault(bucket, []).append((slug, path))

    changed = 0
    for bucket, items in by_bucket.items():
        pool = POOLS[bucket]
        for i, (slug, path) in enumerate(sorted(items)):
            new_url = url_for(pool[i % len(pool)])
            text = path.read_text(encoding="utf-8")
            new_text, n = re.subn(
                r'^featuredImage:\s*"[^"]*"',
                f'featuredImage: "{new_url}"',
                text,
                count=1,
                flags=re.M,
            )
            if n and new_text != text:
                path.write_text(new_text, encoding="utf-8")
                changed += 1

    print(f"{changed} files updated")


if __name__ == "__main__":
    main()
