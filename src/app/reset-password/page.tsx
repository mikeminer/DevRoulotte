import type { Metadata } from "next";
import { ResetPasswordPanel } from "@/components/reset-password-panel";

export const metadata: Metadata = {
  title: "Reimposta password | DevRoulotte",
};

export default function ResetPasswordPage() {
  return <ResetPasswordPanel />;
}
