import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "MedTimeline",
  description: "Patient-owned health timeline with scoped, revocable sharing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        <div className="flex min-h-screen flex-col md:flex-row">
          <Sidebar />
          <div className="flex-1 bg-white p-6 md:p-10">{children}</div>
        </div>
      </body>
    </html>
  );
}