#!/usr/bin/env python3
"""One-off backfill: add a post-specific `newsletterHook` frontmatter field
to every landlord-facing blog post, so the Almost Passive CTA quotes the
post's own real hook instead of a generic rotating line.

Grounds every hook in the post's OWN already-written excerpt (never invents
new facts) — the excerpts already lead with a specific pain/fact per the
site's own SEO writer instructions, so the post's own first sentence *is*
the hook. A small set of connector phrases (rotated deterministically per
post, not randomly) ties that fact back to Almost Passive without repeating
the same sentence 100+ times.
"""
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
BLOG_DIR = pathlib.Path(__file__).resolve().parent.parent / "content" / "blog"

# Same exclusion list as lib/blog-audience.ts — keep in sync.
TENANT_FACING_CATEGORIES = {"Renter Guides", "Tenant Tips", "Renter Resources"}
TENANT_FACING_SLUGS = {
    "can-landlord-evict-tenant-ontario-2026",
    "moving-to-london-ontario-newcomer-rental-guide",
    "best-neighbourhoods-london-ontario-renters",
}

CONNECTORS = [
    "That's exactly the kind of thing Almost Passive covers every week.",
    "Almost Passive tracks changes like this before they cost you a month's rent.",
    "I write about exactly this kind of thing in Almost Passive, every week.",
    "This is the kind of rule Almost Passive flags before it becomes a problem.",
    "Almost Passive covers exactly this — what's actually changing for Ontario landlords.",
    "Almost Passive exists so you catch things like this before they cost you.",
    "That's the kind of local, practical detail that goes in Almost Passive every week.",
    "Almost Passive is where I cover exactly this stuff — free, once a week.",
]

MAX_FACT_LEN = 220


def is_landlord_post(category: str, slug: str) -> bool:
    if slug in TENANT_FACING_SLUGS:
        return False
    if category in TENANT_FACING_CATEGORIES:
        return False
    return True


def extract_fact(excerpt: str) -> str:
    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", excerpt.strip()) if s.strip()]
    fact = sentences[0] if sentences else excerpt.strip()
    if len(fact) > MAX_FACT_LEN and len(sentences) > 1:
        # first sentence ran long — the second is often shorter and self-contained
        fact = sentences[1]
    if len(fact) > MAX_FACT_LEN:
        # last resort: trim at the last clause boundary (comma/dash) before the
        # limit, never mid-phrase — a slightly short fact beats a mangled one
        window = fact[:MAX_FACT_LEN]
        cut = max(window.rfind(", "), window.rfind(" — "), window.rfind(" - "))
        fact = (window[:cut] if cut > 40 else window.rsplit(" ", 1)[0]).rstrip(",;:—- ")
    if not fact.endswith((".", "?", "!")):
        fact += "."
    return fact


def main():
    posts = []
    for path in sorted(BLOG_DIR.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        m = re.match(r"^---\n(.*?)\n---", text, re.S)
        if not m:
            continue
        fm = m.group(1)
        cat_m = re.search(r'^category:\s*"(.+)"', fm, re.M)
        exc_m = re.search(r'^excerpt:\s*"(.+)"', fm, re.M)
        category = cat_m.group(1) if cat_m else ""
        excerpt = exc_m.group(1) if exc_m else ""
        posts.append((path.stem, path, category, excerpt))

    changed, skipped_tenant, skipped_no_excerpt = 0, 0, 0
    for i, (slug, path, category, excerpt) in enumerate(posts):
        if not is_landlord_post(category, slug):
            skipped_tenant += 1
            continue
        if not excerpt:
            skipped_no_excerpt += 1
            continue

        fact = extract_fact(excerpt)
        connector = CONNECTORS[i % len(CONNECTORS)]
        hook = f"{fact} {connector}"
        hook_escaped = hook.replace('"', '\\"')

        text = path.read_text(encoding="utf-8")
        if re.search(r"^newsletterHook:", text, re.M):
            continue  # already has one — don't overwrite a hand-edited hook

        # Insert right after the excerpt line, inside the frontmatter block.
        new_text, n = re.subn(
            r'(^excerpt:\s*".+"\n)',
            r'\1newsletterHook: "' + hook_escaped + '"\n',
            text,
            count=1,
            flags=re.M,
        )
        if n:
            path.write_text(new_text, encoding="utf-8")
            changed += 1

    print(f"{changed} posts given a newsletterHook")
    print(f"{skipped_tenant} tenant-facing posts skipped")
    print(f"{skipped_no_excerpt} posts skipped (no excerpt found)")


if __name__ == "__main__":
    main()
