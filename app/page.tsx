import Link from "next/link";

const btn = "rounded border px-5 py-3 font-semibold";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-4xl font-bold">MedTimeline</h1>
      <p className="mt-3 text-lg text-gray-600">
        Your medical records in one timeline, shared only with the doctor you choose, for only as long as you choose.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/dashboard" className={`${btn} border-blue-600 bg-blue-600 text-white`}>Try demo patient</Link>
        <Link href="/upload" className={btn}>Upload a record</Link>
        <Link href="/emergency" className={`${btn} border-red-300 text-red-600`}>Emergency view</Link>
      </div>
      <ul className="mt-10 space-y-3 text-gray-700">
        <li>📄 <b>One timeline.</b> Prescriptions, labs and discharge summaries extracted from photos and PDFs. You confirm every fact.</li>
        <li>🔐 <b>Scoped, expiring links.</b> Share only diabetes history, for 24 hours, and revoke any time. Every view is logged.</li>
        <li>⚠️ <b>Safety checks.</b> Overlapping prescriptions from different doctors and repeat-test nudges.</li>
      </ul>
      <p className="mt-10 text-xs text-gray-500">
        Demo uses synthetic data. A record-keeping aid, not a diagnostic tool.
      </p>
    </main>
  );
}