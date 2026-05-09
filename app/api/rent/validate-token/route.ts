import { NextRequest, NextResponse } from "next/server";
import { validateRentToken } from "@/lib/rent-intelligence";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const tokenRow = await validateRentToken(token);

  if (!tokenRow) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({
    valid: true,
    email: tokenRow.email,
    name: tokenRow.name,
    city: tokenRow.city,
    bedrooms: tokenRow.bedrooms,
    submitter_role: tokenRow.submitter_role ?? null,
  });
}
