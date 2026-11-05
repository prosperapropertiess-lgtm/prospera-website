import { renderView, viewMetadata } from "./render";

export const dynamic = "force-dynamic";
export const metadata = viewMetadata;

export default async function ViewPage({ searchParams }: { searchParams: Promise<{ home?: string }> }) {
  const { home } = await searchParams;
  return renderView(home);
}
