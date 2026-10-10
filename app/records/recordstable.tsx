"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Download } from "lucide-react";

export type Row = {
  id: number; date: string; type: string; description: string;
  doctor: string; status: string; hasFile: boolean;
};

export default function RecordsTable({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const types = ["All", ...Array.from(new Set(rows.map(r => r.type)))];
  const shown = rows.filter(
    r =>
      (type === "All" || r.type === type) &&
      `${r.description} ${r.doctor} ${r.type}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Medical Records</h1>
          <p className="mt-1 text-gray-500">View and manage your medical records</p>
        </div>
        <Link href="/upload" className="flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" /> Add Record
        </Link>
      </div>

      <div className="mt-6 flex gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl border bg-gray-50 px-4 py-3">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search records..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <select value={type} onChange={e => setType(e.target.value)} className="rounded-xl border bg-gray-50 px-4 text-sm">
          {types.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              {["Date", "Type", "Description", "Doctor", "Status", "Actions"].map(h => (
                <th key={h} className="px-5 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map(r => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-5 py-4">{r.date}</td>
                <td className="px-5 py-4">
                  <span className="rounded-md bg-blue-50 px-3 py-1 text-blue-700">{r.type}</span>
                </td>
                <td className="px-5 py-4">{r.description}</td>
                <td className="px-5 py-4">{r.doctor}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-md px-3 py-1 ${r.status === "Confirmed" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {r.hasFile ? (
                    <span className="flex gap-3 text-gray-500">
                      <a href={`/api/doc/${r.id}`} target="_blank" title="View"><Eye className="h-4 w-4" /></a>
                      <a href={`/api/doc/${r.id}`} download title="Download"><Download className="h-4 w-4" /></a>
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Demo data</span>
                  )}
                </td>
              </tr>
            ))}
            {!shown.length && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}