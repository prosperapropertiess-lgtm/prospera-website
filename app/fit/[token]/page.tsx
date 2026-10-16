"use client";
import { useParams } from "next/navigation";
import FitForm from "@/components/fit/FitForm";

export default function FitTokenPage() {
  const { token } = useParams<{ token: string }>();
  return <FitForm token={token} />;
}
