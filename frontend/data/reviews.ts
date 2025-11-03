export type Review = {
  id: string;
  slug: string; // destination slug
  author: string;
  rating: number; // 0..5
  comment: string;
  date: string; // ISO
};

export const REVIEWS: Review[] = [
  {
    id: "r1",
    slug: "ha-noi",
    author: "Minh",
    rating: 4.6,
    comment: "Ẩm thực phố cổ quá tuyệt, người dân thân thiện.",
    date: "2024-07-12",
  },
  {
    id: "r2",
    slug: "da-nang",
    author: "Lan",
    rating: 4.7,
    comment: "Biển đẹp, thành phố sạch và hiện đại.",
    date: "2024-08-01",
  },
  {
    id: "r3",
    slug: "paris",
    author: "Khoa",
    rating: 4.9,
    comment: "Bảo tàng Louvre và tháp Eiffel không thể bỏ lỡ.",
    date: "2024-06-20",
  },
  {
    id: "r4",
    slug: "bali",
    author: "Linh",
    rating: 4.8,
    comment: "Thiên nhiên tuyệt vời, dịch vụ tốt.",
    date: "2024-05-15",
  },
  {
    id: "r5",
    slug: "tokyo",
    author: "Huy",
    rating: 4.7,
    comment: "Hiện đại nhưng vẫn giữ nét truyền thống.",
    date: "2024-09-09",
  },
];