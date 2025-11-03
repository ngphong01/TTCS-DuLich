import { useMemo, useState } from 'react';
import Table from '../../components/Table';
import Skeleton from '../../components/Skeleton';
import { createDestination, deleteDestination, getDestinationsPaged, updateDestination } from '../../services/destination';
import toast from 'react-hot-toast';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().optional(),
  featured: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

type PageResult<T = any> = { items: T[]; total: number; page: number; pageSize: number };

export default function AdminDestinations() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, refetch } = useQuery<PageResult>({
    queryKey: ['admin', 'destinations', page, pageSize],
    queryFn: () => getDestinationsPaged(page, pageSize),
    placeholderData: keepPreviousData,
  });

  const total = data?.total || 0;
  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', description: '', featured: false },
  });

  async function onCreate(values: FormData) {
    try {
      await createDestination(values);
      toast.success('Destination created');
      reset();
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create');
    }
  }

  async function onUpdate(id: number, patch: Partial<FormData>) {
    try {
      await updateDestination(id, patch);
      toast.success('Updated');
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Update failed');
    }
  }

  async function onDelete(id: number) {
    if (!confirm('Delete this destination?')) return;
    try {
      await deleteDestination(id);
      toast.success('Deleted');
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Destinations</h2>

      <form onSubmit={handleSubmit(onCreate)} className="grid md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Name</label>
          <input className="border rounded px-3 py-2 w-full" {...register('name')} />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Slug</label>
          <input className="border rounded px-3 py-2 w-full" {...register('slug')} />
          {errors.slug && <p className="text-xs text-red-600 mt-1">{errors.slug.message}</p>}
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Description</label>
          <input className="border rounded px-3 py-2 w-full" {...register('description')} />
        </div>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('featured')} />
            Featured
          </label>
          <button disabled={isSubmitting} type="submit" className="px-4 py-2 rounded bg-sky-500 text-white disabled:opacity-50">
            {isSubmitting ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      )}

      {!isLoading && data && data.items.length === 0 && (
        <div className="text-sm text-gray-500">No destinations.</div>
      )}

      {!isLoading && data && data.items.length > 0 && (
        <>
          <Table headers={['ID', 'Name', 'Slug', 'Featured', 'Actions']}>
            {data.items.map((d: any) => (
              <tr key={d.id} className="border-t">
                <td className="px-3 py-2">{d.id}</td>
                <td className="px-3 py-2">
                  <InlineEdit value={d.name} onSave={(v) => onUpdate(d.id, { name: v })} />
                </td>
                <td className="px-3 py-2">
                  <InlineEdit value={d.slug} onSave={(v) => onUpdate(d.id, { slug: v })} />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={!!d.featured}
                    onChange={(e) => onUpdate(d.id, { featured: e.target.checked })}
                  />
                </td>
                <td className="px-3 py-2">
                  <button className="text-red-600 text-sm" onClick={() => onDelete(d.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </Table>

          <div className="flex items-center gap-2 mt-3">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span className="text-sm">{page} / {Math.max(1, Math.ceil((data.total || 0) / pageSize))}</span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage((p) => (p < pageCount ? p + 1 : p))}
              disabled={page >= pageCount}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function InlineEdit({ value, onSave }: { value: string; onSave: (v: string) => Promise<void> | void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  return editing ? (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSave(val);
        setEditing(false);
      }}
      className="flex items-center gap-2"
    >
      <input className="border rounded px-2 py-1 text-sm" value={val} onChange={(e) => setVal(e.target.value)} />
      <button className="text-sm text-sky-600" type="submit">Save</button>
      <button className="text-sm text-gray-500" type="button" onClick={() => { setVal(value); setEditing(false); }}>Cancel</button>
    </form>
  ) : (
    <button className="text-left w-full" onClick={() => setEditing(true)}>
      {value}
    </button>
  );
}