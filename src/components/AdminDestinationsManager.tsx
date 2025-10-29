"use client";
import { useState } from "react";

type DestinationItem = {
  slug: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  price: number;
  country: string;
  tags: string[];
};

export default function AdminDestinationsManager({ initialItems }: { initialItems: DestinationItem[] }) {
  const normalizeTags = (value: unknown): string[] => {
    if (Array.isArray(value)) return value as string[];
    if (typeof value === "string") return fromCSV(value);
    return [];
  };

  const [items, setItems] = useState<DestinationItem[]>(
    (initialItems || []).map((it: DestinationItem) => ({ ...it, tags: normalizeTags(it?.tags) }))
  );
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<DestinationItem>({
    slug: "",
    name: "",
    description: "",
    image: "",
    rating: 4.5,
    price: 100,
    country: "",
    tags: [],
  });
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const normalizePriceString = (value: string) => {
    const digitsOnly = value.replace(/[^0-9]/g, "");
    const noLeadingZeros = digitsOnly.replace(/^0+(?=\d)/, "");
    return noLeadingZeros === "" ? "0" : noLeadingZeros;
  };

  const resetForm = () => {
    setForm({
      slug: "",
      name: "",
      description: "",
      image: "",
      rating: 4.5,
      price: 100,
      country: "",
      tags: [],
    });
  };

  const toCSV = (arr: string[]) => arr.join(", ");
  const fromCSV = (s: string) =>
    s
      .split(/[,，]/) // support normal and full-width comma
      .map((t) => t.trim())
      .filter(Boolean);

  const createDestination = async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        const normalized = { ...data, tags: normalizeTags((data as { tags?: unknown })?.tags) };
        setItems([...items, normalized]);
        setCreating(false);
        resetForm();
      } else {
        setError("Tạo điểm đến thất bại");
      }
    } catch (e: unknown) {
      const error = e as { message?: string };
      setError(error.message || "Có lỗi xảy ra");
    }
  };

  const updateDestination = async (slug: string, updated: DestinationItem) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/destinations/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const normalized = { ...updated, tags: normalizeTags((updated as { tags?: unknown })?.tags) } as DestinationItem;
        setItems(items.map((item) => (item.slug === slug ? normalized : item)));
        setEditingSlug(null);
      } else {
        setError("Cập nhật điểm đến thất bại");
      }
    } catch (e: unknown) {
      const error = e as { message?: string };
      setError(error.message || "Có lỗi xảy ra");
    }
  };

  const deleteDestination = async (slug: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/destinations/${slug}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems(items.filter((item) => item.slug !== slug));
      } else {
        setError("Xóa điểm đến thất bại");
      }
    } catch (e: unknown) {
      const error = e as { message?: string };
      setError(error.message || "Có lỗi xảy ra");
    }
  };

  const EditableRow = ({ it }: { it: DestinationItem }) => {
    const [local, setLocal] = useState<DestinationItem>(it);
    return (
      <tr className="bg-blue-50 border-b border-gray-200">
        <td className="px-3 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">✏️</span>
            </div>
            <div className="ml-2">
              <div className="text-xs font-mono text-gray-900 truncate max-w-[100px]">{it.slug}</div>
            </div>
          </div>
        </td>
        <td className="px-3 py-4 whitespace-nowrap">
          <input
            className="w-full rounded border border-blue-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={local.name}
            onChange={(e) => setLocal({ ...local, name: e.target.value })}
          />
        </td>
        <td className="px-3 py-4 whitespace-nowrap">
          <input
            className="w-full rounded border border-blue-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={local.country}
            onChange={(e) => setLocal({ ...local, country: e.target.value })}
          />
        </td>
        <td className="px-3 py-4 whitespace-nowrap">
          <input
            className="w-full rounded border border-blue-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={local.image}
            onChange={(e) => setLocal({ ...local, image: e.target.value })}
          />
        </td>
        <td className="px-3 py-4 whitespace-nowrap">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            className="w-20 rounded border border-blue-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={local.price}
            onChange={(e) => {
              const normalized = Number(normalizePriceString(e.target.value));
              setLocal({ ...local, price: normalized });
              // Ensure the UI doesn't keep a leading zero shadow value
              (e.currentTarget as HTMLInputElement).value = String(normalized);
            }}
          />
        </td>
        <td className="px-3 py-4 whitespace-nowrap">
          <input
            type="number"
            step="0.1"
            min="1"
            max="5"
            className="w-16 rounded border border-blue-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={local.rating}
            onChange={(e) => setLocal({ ...local, rating: Number(e.target.value) })}
          />
        </td>
        <td className="px-3 py-4">
          <input
            className="w-full rounded border border-blue-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={toCSV(local.tags)}
            onChange={(e) => setLocal({ ...local, tags: fromCSV(e.target.value) })}
          />
        </td>
        <td className="px-3 py-4 whitespace-nowrap text-right">
          <div className="flex items-center justify-end gap-1">
            <button 
              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors" 
              onClick={() => updateDestination(it.slug, local)}
            >
              ✅
            </button>
            <button 
              className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors" 
              onClick={() => setEditingSlug(null)}
            >
              ❌
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden max-w-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🗺️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Danh sách điểm đến</h2>
          </div>
          <button 
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2" 
            onClick={() => setCreating((v) => !v)}
          >
            <span className="text-lg">{creating ? "✕" : "➕"}</span>
            {creating ? "Đóng form" : "Tạo mới"}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-6 py-3 bg-red-50 border-l-4 border-red-400">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Form */}
      {creating && (
        <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tạo điểm đến mới</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">🔗 Slug (URL)</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="vinh-ha-long"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">🏷️ Tên điểm đến</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Vịnh Hạ Long"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">🌍 Quốc gia</label>
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="Việt Nam"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">🖼️ URL ảnh</label>
              <input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">💰 Giá (VNĐ)</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={form.price}
                onChange={(e) => {
                  const normalized = Number(normalizePriceString(e.target.value));
                  setForm({ ...form, price: normalized });
                  (e.currentTarget as HTMLInputElement).value = String(normalized);
                }}
                placeholder="2000000"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">⭐ Rating (1-5)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                placeholder="4.5"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">📝 Mô tả</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Mô tả chi tiết về điểm đến..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">🏷️ Tags (phân cách bằng dấu phẩy)</label>
              <input
                value={form.tags.join(",")}
                onChange={(e) => setForm({ ...form, tags: fromCSV(e.target.value) })}
                placeholder="biển, núi, di tích, văn hóa"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button 
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2" 
              onClick={createDestination}
            >
              <span className="text-lg">✅</span>
              Tạo điểm đến
            </button>
            <button 
              className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2" 
              onClick={() => { setCreating(false); resetForm(); }}
            >
              <span className="text-lg">❌</span>
              Hủy bỏ
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto max-w-full">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Slug</th>
              <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Tên điểm đến</th>
              <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Quốc gia</th>
              <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Ảnh</th>
              <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Giá</th>
              <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Rating</th>
              <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Tags</th>
              <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) =>
              editingSlug === it.slug ? (
                <EditableRow key={it.slug} it={it} />
              ) : (
                <tr key={it.slug} className="hover:bg-gray-50 transition-colors border-b border-gray-200">
        <td className="px-3 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">🔗</span>
            </div>
            <div className="ml-2">
              <div className="text-xs font-mono text-gray-900 truncate max-w-[100px]">{it.slug}</div>
            </div>
          </div>
        </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">{it.name}</div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm mr-1">🌍</span>
                      <span className="text-xs text-gray-700 truncate max-w-[80px]">{it.country}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-xs text-gray-500 truncate max-w-[180px]">{it.image}</div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-xs font-semibold text-green-600">
                      {it.price.toLocaleString('vi-VN')}đ
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1 text-sm">⭐</span>
                      <span className="text-xs font-semibold text-gray-900">{it.rating}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(normalizeTags((it as { tags?: unknown }).tags)).slice(0, 2).map((tag, index) => (
                        <span key={index} className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                      {normalizeTags((it as { tags?: unknown }).tags).length > 2 && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{normalizeTags((it as { tags?: unknown }).tags).length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors" 
                        onClick={() => setEditingSlug(it.slug)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors" 
                        onClick={() => deleteDestination(it.slug)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
            {items.length === 0 && (
              <tr>
                <td className="px-6 py-12 text-center" colSpan={8}>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🗺️</span>
                    </div>
                    <p className="text-gray-500 font-medium">Chưa có điểm đến nào</p>
                    <p className="text-sm text-gray-400 mt-1">Hãy tạo điểm đến đầu tiên của bạn</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}