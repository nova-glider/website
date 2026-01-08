import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NovaGlider Dashboard",
  description: "Live NovaGlider satellite statistics dashboard.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
