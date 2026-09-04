import { MetadataRoute } from "next";

const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // AI crawlers: only block true admin/API paths — let them read all public content
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/api/", "/admin/"],
      })),
      // All other bots: keep portal and form sections private
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/owners/", "/tenants/", "/onboard/", "/agents/", "/apply/", "/market-comp/", "/vendor/"],
      },
    ],
    sitemap: "https://www.prosperaproperties.co/sitemap.xml",
  };
}
