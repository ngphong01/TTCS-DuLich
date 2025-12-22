import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Skeleton from '../../components/Skeleton';
import BlogForm from '../../components/admin/BlogForm';
import {
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

type PageResult = { items: any[]; total: number; page: number; pageSize: number };

export default function AdminBlogs() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const pageSize = 10;

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PageResult>({
    queryKey: ['admin', 'blog', page, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(searchTerm && { search: searchTerm }),
      });
      const token = localStorage.getItem('tg_token');
      const res = await fetch(`/api/blog/admin/list?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('tg_token');
      const res = await fetch(`/api/blog/admin/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Xóa blog thành công');
      queryClient.invalidateQueries({ queryKey: ['admin', 'blog'] });
    },
    onError: () => {
      toast.error('Không thể xóa blog');
    },
  });

  const togglePublishedMutation = useMutation({
    mutationFn: async ({ id, published }: { id: number; published: boolean }) => {
      const token = localStorage.getItem('tg_token');
      const res = await fetch(`/api/blog/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ published }),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Cập nhật trạng thái thành công');
      queryClient.invalidateQueries({ queryKey: ['admin', 'blog'] });
    },
    onError: () => {
      toast.error('Không thể cập nhật trạng thái');
    },
  });

  const total = data?.total || 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-lg">
                <DocumentTextIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Quản Lý Blog
                </h1>
                <p className="text-gray-600 mt-1">Quản lý bài viết và nội dung blog</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Tạo bài viết
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm blog..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        {isLoading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          </div>
        )}

        {!isLoading && data && (
          <>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Tiêu đề</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Tác giả</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Danh mục</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Lượt xem</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Trạng thái</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Ngày tạo</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.items.map((blog: any) => (
                      <tr key={blog.id} className="hover:bg-indigo-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{blog.title}</div>
                          <div className="text-xs text-gray-500">{blog.slug}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">{blog.author || 'TravelGo Team'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                            {blog.category || 'Khác'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <EyeIcon className="h-4 w-4 text-gray-400" />
                            {blog.views || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              togglePublishedMutation.mutate({ id: blog.id, published: !blog.published })
                            }
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                              blog.published
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {blog.published ? 'Đã xuất bản' : 'Bản nháp'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">
                            {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingId(blog.id)}
                              className="p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
                              title="Chỉnh sửa"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Bạn có chắc muốn xóa blog này?')) {
                                  deleteMutation.mutate(blog.id);
                                }
                              }}
                              className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                              title="Xóa"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pageCount > 1 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Trang {page} / {pageCount}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Trước
                    </button>
                    <button
                      onClick={() => setPage((p) => (p < pageCount ? p + 1 : p))}
                      disabled={page >= pageCount}
                      className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && data && data.items.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có bài viết nào</h3>
            <p className="text-gray-600 mb-6">Tạo bài viết đầu tiên để bắt đầu</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all font-semibold"
            >
              Tạo bài viết
            </button>
          </div>
        )}

        {/* Create/Edit Form Modal */}
        {(showCreateForm || editingId !== null) && (
          <BlogForm
            blog={editingId ? data?.items.find((b: any) => b.id === editingId) : undefined}
            onClose={() => {
              setShowCreateForm(false);
              setEditingId(null);
            }}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['admin', 'blog'] });
              setShowCreateForm(false);
              setEditingId(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

