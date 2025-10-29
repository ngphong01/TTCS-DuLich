import { DESTINATIONS } from "../../data/destinations";
import EnhancedCheckoutForm from "../../components/EnhancedCheckoutForm";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams?: Promise<{ destination?: string; guests?: string; from?: string; to?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const destSlug = resolvedSearchParams?.destination || "";
  const d = DESTINATIONS.find((x) => x.slug === destSlug);
  const guests = Math.max(1, Number(resolvedSearchParams?.guests || 2));

  return (
    <main className="container">
      <h1 className="text-2xl sm:text-3xl font-bold mt-8">Xác nhận đặt chỗ</h1>

      <div className="mt-6">
        <EnhancedCheckoutForm
          destinationSlug={d?.slug}
          destinationName={d?.name}
          basePrice={d?.price ?? 0}
          guests={guests}
          from={resolvedSearchParams?.from}
          to={resolvedSearchParams?.to}
        />
      </div>
    </main>
  );
}