import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/owners/", "/tenants/", "/onboard/", "/agents/", "/apply/", "/market-comp/", "/vendor/"],
    },
    sitemap: "https://www.prosperaproperties.co/sitemap.xml",
  };
}
