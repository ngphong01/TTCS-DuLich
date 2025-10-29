import { z } from "zod";

export const DestinationsQuerySchema = z.object({
  q: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  countries: z.string().optional(), // comma
  tags: z.string().optional(),      // comma
  priceMin: z.string().optional(),
  priceMax: z.string().optional(),
  ratingMin: z.string().optional(),
  sort: z.enum(["", "price-asc", "price-desc", "rating-desc", "name-asc"]).optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
});

export const ReviewCreateSchema = z.object({
  slug: z.string().min(1),
  author: z.string().optional(),
  rating: z.number().min(0).max(5),
  comment: z.string().min(1),
});

export const BookingCreateSchema = z.object({
  destination: z.string().optional(),
  destinationName: z.string().optional(),
  guests: z.number().min(1),
  from: z.string().optional(),
  to: z.string().optional(),
  name: z.string().min(1),
  email: z.string().email(),
  // Digits only, exactly 13 numbers
  phone: z
    .string()
    .regex(/^[0-9]{13}$/i, { message: "Số điện thoại phải gồm đúng 13 số" })
    .optional(),
  note: z.string().optional(),
  price: z.number().min(0),
  // Payment breakdown (optional; server will compute sensible defaults)
  paymentMethod: z.string().optional(),
  couponCode: z.string().optional(),
  discountAmount: z.number().min(0).optional(),
  serviceFee: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  totalAmount: z.number().min(0).optional(),
});