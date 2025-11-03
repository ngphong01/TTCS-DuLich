
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  MapPinIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  CreditCardIcon,
  StarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

const navigation = [
  {
    name: "Tổng quan",
    href: "/admin",
    icon: HomeIcon,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
  },
  {
    name: "Quản lý Tour",
    href: "/admin/destinations",
    icon: MapPinIcon,
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
  },
  {
    name: "Đặt chỗ",
    href: "/admin/bookings",
    icon: ClipboardDocumentListIcon,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
  },
  {
    name: "Workflow",
    href: "/admin/bookings/workflow",
    icon: ClipboardDocumentListIcon,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
  },
  {
    name: "Người dùng",
    href: "/admin/users",
    icon: UsersIcon,
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
  },
  {
    name: "Phân quyền",
    href: "/admin/users/roles",
    icon: UsersIcon,
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
  },
  {
    name: "Đối tác",
    href: "/admin/partners",
    icon: MapPinIcon,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
  },
  {
    name: "Nội dung",
    href: "/admin/content",
    icon: StarIcon,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
  },
  {
    name: "Thanh toán",
    href: "/admin/payments",
    icon: CreditCardIcon,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
  },
  {
    name: "Cổng thanh toán",
    href: "/admin/payments/gateways",
    icon: CreditCardIcon,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
  },
  {
    name: "Đánh giá",
    href: "/admin/reviews",
    icon: StarIcon,
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
  },
  {
    name: "Báo cáo",
    href: "/admin/reports",
    icon: ChartBarIcon,
    color: "from-indigo-500 to-purple-500",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
  },
  {
    name: "Chat",
    href: "/admin/chat",
    icon: ChatBubbleLeftRightIcon,
    color: "from-rose-500 to-pink-500",
    bgColor: "bg-rose-50",
    textColor: "text-rose-700",
  },
  {
    name: "Bảo mật",
    href: "/admin/security",
    icon: Cog6ToothIcon,
    color: "from-red-500 to-orange-500",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
  },
  {
    name: "Cài đặt",
    href: "/admin/settings",
    icon: Cog6ToothIcon,
    color: "from-gray-500 to-slate-500",
    bgColor: "bg-gray-50",
    textColor: "text-gray-700",
  },
];

export default function AdminSidebar() {
  const pathname = useLocation().pathname;

  return (
    <div className="fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-white via-gray-50 to-white shadow-2xl border-r border-gray-200/50 backdrop-blur-sm">
      {/* Header */}
      <div className="h-20 flex items-center px-6 border-b border-gray-200/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl shadow-lg overflow-hidden">
            <img
              src="https://png.pngtree.com/png-clipart/20250314/original/pngtree-travel-go-logo-blue-and-yellow-design-png-image_20197838.png"
              alt="TravelGo Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              TravelGo
            </h1>
            <p className="text-xs text-gray-500 font-medium">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-4 py-6 flex-1 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group relative flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? `${item.bgColor} ${item.textColor} shadow-lg transform scale-[1.02]`
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md hover:transform hover:scale-[1.01]"
                }`}
              >
                {/* Icon with gradient background */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isActive 
                    ? `bg-gradient-to-r ${item.color} shadow-lg` 
                    : "bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-gray-200 group-hover:to-gray-300"
                }`}>
                  <item.icon className={`h-4 w-4 transition-colors duration-200 ${
                    isActive ? "text-white" : "text-gray-600 group-hover:text-gray-800"
                  }`} />
                </div>
                
                {/* Text */}
                <span className="flex-1">{item.name}</span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${item.color} shadow-sm`} />
                )}
                
                {/* Hover effect */}
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-200`} />
              </Link>
            );
          })}
        </div>
        
        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200/50">
          <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <SparklesIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">Premium Features</p>
                <p className="text-xs text-gray-600">Unlock advanced tools</p>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
