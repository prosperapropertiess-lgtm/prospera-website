import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isGSCConnected } from "@/lib/google-search-console";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connected = await isGSCConnected();
  return NextResponse.json({ connected });
}
