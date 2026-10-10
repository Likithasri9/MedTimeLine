import Link from "next/link";

export default function Nav() {
  return (
    <nav className="flex flex-wrap items-center gap-4 border-b px-6 py-3 text-sm">
      <Link href="/" className="font-bold">MedTimeline</Link>
      <Link href="/dashboard">Timeline</Link>
      <Link href="/upload">Add record</Link>
      <Link href="/share">Share</Link>
      <Link href="/emergency" className="text-red-600">Emergency</Link>
    </nav>
  );
}