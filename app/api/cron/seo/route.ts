/**
 * Combined SEO cron — runs Mon–Fri at noon UTC (8am EST)
 *
 * Mon–Thu → seo-writer  (write new post + optimize 1 + social draft)
 * Fri     → seo-optimizer (optimize 2 existing posts, no new post)
 *
 * Uses 1 cron slot instead of 2.
 */

import { NextRequest } from "next/server";
import { GET as writerHandler } from "@/app/api/cron/seo-writer/route";
import { GET as optimizerHandler } from "@/app/api/cron/seo-optimizer/route";

export async function GET(req: NextRequest) {
  const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon ... 5=Fri, 6=Sat
  if (dayOfWeek === 5) {
    return optimizerHandler(req);
  }
  return writerHandler(req);
}
