import { renderView, viewMetadata } from "../render";

export const dynamic = "force-dynamic";
export const metadata = viewMetadata;

export default async function ViewHomePage({ params }: { params: Promise<{ home: string }> }) {
  const { home } = await params;
  return renderView(decodeURIComponent(home));
}
