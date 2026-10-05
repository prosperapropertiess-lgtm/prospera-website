import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: { absolute: "Invite an Agent — Prospera" } };

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
