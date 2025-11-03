import { Link, useLocation } from "react-router-dom";
import { UserIcon, ClipboardDocumentListIcon, CreditCardIcon, HeartIcon, BellIcon, ChatBubbleLeftRightIcon, TrophyIcon, Cog6ToothIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

const groups = [
  {
    title: "Tài khoản của tôi",
    items: [
      { href: "/account", label: "Hồ sơ & bảo mật", Icon: UserIcon },
      { href: "/account/settings", label: "Cài đặt", Icon: Cog6ToothIcon },
    ],
  },
  {
    title: "Hoạt động du lịch",
    items: [
      { href: "/account/bookings", label: "Đơn đặt chỗ", Icon: ClipboardDocumentListIcon },
      { href: "/account/payments", label: "Thanh toán & hóa đơn", Icon: CreditCardIcon },
    ],
  },
  {
    title: "Cá nhân hóa",
    items: [
      { href: "/account/wishlist", label: "Yêu thích", Icon: HeartIcon },
    ],
  },
  {
    title: "Tương tác",
    items: [
      { href: "/account/reviews", label: "Đánh giá & hỗ trợ", Icon: ChatBubbleLeftRightIcon },
      { href: "/account/notifications", label: "Thông báo", Icon: BellIcon },
    ],
  },
  {
    title: "Thành viên & điểm thưởng",
    items: [
      { href: "/account/loyalty", label: "Thành viên", Icon: TrophyIcon },
    ],
  },
];

export default function AccountSidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="rounded-2xl border border-gray-200 p-4 bg-white">
      <nav className="space-y-5">
        {groups.map((group) => (
          <div key={group.title}>
            <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {group.title}
            </div>
            <div className="grid gap-1">
              {group.items.map(({ href, label, Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    to={href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 ${
                      active ? "bg-gradient-to-r from-teal-50 to-purple-50 text-gray-900 border border-teal-200" : "hover:bg-gray-50"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? "text-teal-600" : "text-gray-500"}`} />
                    <span className="font-medium">{label}</span>
                    {active && <ShieldCheckIcon className="h-4 w-4 text-teal-600 ml-auto" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}


