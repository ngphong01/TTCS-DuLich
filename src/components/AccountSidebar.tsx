"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserIcon, ClipboardDocumentListIcon, CreditCardIcon, HeartIcon, BellIcon, ChatBubbleLeftRightIcon, TrophyIcon } from "@heroicons/react/24/outline";

const items = [
  { href: "/account", label: "Trang cá nhân", Icon: UserIcon },
  { href: "/account/bookings", label: "Đơn đặt chỗ", Icon: ClipboardDocumentListIcon },
  { href: "/account/payments", label: "Thanh toán", Icon: CreditCardIcon },
  { href: "/account/wishlist", label: "Yêu thích", Icon: HeartIcon },
  { href: "/account/notifications", label: "Thông báo", Icon: BellIcon },
  { href: "/account/reviews", label: "Đánh giá & hỗ trợ", Icon: ChatBubbleLeftRightIcon },
  { href: "/account/loyalty", label: "Thành viên", Icon: TrophyIcon },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  return (
    <aside className="rounded-2xl border border-black/[.08] dark:border-white/[.145] p-4 bg-white dark:bg-black/40">
      <nav className="grid gap-1">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 ${active ? "bg-gray-100 dark:bg-white/10 font-semibold" : ""}`}
            >
              <Icon className="h-5 w-5 text-gray-500" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}


