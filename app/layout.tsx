import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRIGGZ // AI CODE LAB",
  description: "An unrestricted multi-platform AI IDE and creative coding companion."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
