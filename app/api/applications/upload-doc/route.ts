import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { ALL_DOC_TYPES } from "@/lib/application-requirements";
import crypto from "crypto";

// Hands the browser a one-time signed upload URL so the file goes straight to
// Supabase Storage. Posting files through this route instead would hit
// Vercel's 4.5MB request body limit on ordinary bank-statement PDFs.

const MAX_SIZE = 15 * 1024 * 1024; // 15MB
const EXT: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(req: NextRequest) {
  try {
    const { doc_type, content_type, size } = await req.json();

    if (!ALL_DOC_TYPES.includes(doc_type)) {
      return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
    }
    if (!EXT[content_type]) {
      return NextResponse.json({ error: "Please upload a PDF or a photo (JPG or PNG)." }, { status: 400 });
    }
    if (typeof size !== "number" || size <= 0 || size > MAX_SIZE) {
      return NextResponse.json({ error: "That file is over 15MB. Try a smaller scan or a phone photo." }, { status: 400 });
    }

    const path = `temp/${Date.now()}-${crypto.randomBytes(8).toString("hex")}-${doc_type}.${EXT[content_type]}`;
    const { data, error } = await supabaseAdmin.storage
      .from("applications")
      .createSignedUploadUrl(path);

    if (error || !data) {
      console.error("Signed upload URL error:", error);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    return NextResponse.json({ storage_path: data.path, token: data.token });
  } catch (err) {
    console.error("upload-doc error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
