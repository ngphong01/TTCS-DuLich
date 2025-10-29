"use client";
import Link from "next/link";
import { MapPinIcon, TagIcon, ChatBubbleLeftRightIcon, InformationCircleIcon, EnvelopeIcon, CreditCardIcon } from "@heroicons/react/24/outline";

export default function Footer() {
  const item = (href: string, label: string, Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>) => (
    <Link href={href} className="hover:underline hover:underline-offset-4 flex items-center gap-1.5">
      {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
      {label}
    </Link>
  );

  return (
    <footer className="w-full border-t border-black/[.08] dark:border-white/[.145] mt-16 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-pink-50/50">
      <div className="container py-8 grid gap-6 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-bold text-lg mb-2">
            <img src="https://tse4.mm.bing.net/th/id/OIP.i4FXQvp2T9s6GqnYYGx2CAHaHa?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3" alt="Logo" className="w-8 h-8 rounded-md object-cover" />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">TravelGo</span>
          </div>
          <p className="text-sm/6 text-foreground/80">
            Nền tảng du lịch giúp bạn khám phá, lên kế hoạch và đặt chỗ cho những hành trình tuyệt vời.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Điều hướng</h3>
          <ul className="text-sm/6 space-y-1">
            <li>{item("/destinations", "Điểm đến", MapPinIcon)}</li>
            <li>{item("/checkout", "Đặt chỗ", CreditCardIcon)}</li>
            <li>{item("/deals", "Ưu đãi", TagIcon)}</li>
            <li>{item("/#stories", "Câu chuyện", ChatBubbleLeftRightIcon)}</li>
            <li>{item("/about", "Giới thiệu", InformationCircleIcon)}</li>
            <li>{item("/contact", "Liên hệ", EnvelopeIcon)}</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Liên hệ</h3>
          <ul className="text-sm/6 space-y-1">
            <li>Email: phong@triennguyen.com</li>
            <li>Hotline: 1900 1234</li>
            <li>Địa chỉ: 123 Trần Phú, Hà Nội</li>
          </ul>
        </div>
      </div>
      <div className="container py-4 text-xs/6 text-center text-foreground/60">
        © {new Date().getFullYear()} TravelGo. All rights reserved.
      </div>
    </footer>
  );
}