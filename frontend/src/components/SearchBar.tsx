import { useNavigate, useSearchParams } from 'react-router-dom';
import { FormEvent, useState } from "react";

export default function SearchBar() {
  const router = useNavigate();
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    router(`/destinations?${params.toString()}`);
  };

  return (
    <form onSubmit={onSubmit} className="w-full bg-white dark:bg-black/40 rounded-xl border border-black/[.08] dark:border-white/[.145] p-4 grid gap-4 sm:grid-cols-4">
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium mb-1">Bạn muốn đi đâu?</label>
        <input
          type="text"
          placeholder="Hà Nội, Đà Nẵng, Paris..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded border border-black/[.08] dark:border-white/[.145] bg-transparent px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Ngày đi</label>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="w-full rounded border border-black/[.08] dark:border-white/[.145] bg-transparent px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Ngày về</label>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full rounded border border-black/[.08] dark:border-white/[.145] bg-transparent px-3 py-2"
        />
      </div>
      <div className="sm:col-span-4 flex justify-end">
        <button type="submit" className="rounded-full bg-foreground text-background px-6 py-2 hover:opacity-90">
          Tìm kiếm
        </button>
      </div>
    </form>
  );
}