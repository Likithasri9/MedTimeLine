"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Pill, TriangleAlert, CircleAlert, Share2, Siren, Stethoscope,
} from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/records", label: "Medical Records", icon: FileText },
  { href: "/health/medications", label: "Medications", icon: Pill },
  { href: "/health/allergies", label: "Allergies", icon: TriangleAlert },
  { href: "/health/conditions", label: "Conditions", icon: CircleAlert },
  { href: "/share", label: "Shared Access", icon: Share2 },
  { href: "/emergency", label: "Emergency", icon: Siren },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-full border-b bg-white p-4 md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r">
      <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
        <Stethoscope className="h-7 w-7" /> MedTimeline
      </Link>
      <p className="mt-1 text-sm text-gray-500">Your Health Hub</p>
      <nav className="mt-5 flex flex-wrap gap-1 md:flex-col">
        {items.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                active ? "bg-gray-950 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-5 w-5" /> {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}