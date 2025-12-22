# Thiết kế Trang "Điểm đến" - Travel Product UX

## 📋 TỔNG QUAN LAYOUT

### Cấu trúc từ trên xuống:

```
┌─────────────────────────────────────────┐
│ 1. HERO SECTION (Search-centered)       │
│    - Search bar (primary action)        │
│    - Quick orientation buttons           │
│    - Popular destinations (cues)        │
├─────────────────────────────────────────┤
│ 2. RESULTS BAR                          │
│    - Count + Clear filters               │
│    - Sort + View toggle                  │
├─────────────────────────────────────────┤
│ 3. FILTER PANEL (Collapsible)           │
│    - Đi đâu / Ngân sách / Đánh giá      │
├─────────────────────────────────────────┤
│ 4. DESTINATION LISTING                  │
│    ┌─────────────────────────────────┐  │
│    │ 4a. Đang hot (nếu không filter) │  │
│    └─────────────────────────────────┘  │
│    ┌─────────────────────────────────┐  │
│    │ 4b. Giá tốt (nếu không filter)  │  │
│    └─────────────────────────────────┘  │
│    ┌─────────────────────────────────┐  │
│    │ 4c. Được yêu thích (nếu không)  │  │
│    └─────────────────────────────────┘  │
│    ┌─────────────────────────────────┐  │
│    │ 4d. Tất cả điểm đến             │  │
│    └─────────────────────────────────┘  │
│    (Hoặc flat list nếu có filter)       │
├─────────────────────────────────────────┤
│ 5. PAGINATION                           │
└─────────────────────────────────────────┘
```

---

## 🎯 UX REASONING CHO TỪNG PHẦN

### 1. HERO SECTION - Search-Centered

**Thiết kế:**
- Background: Trắng, border-bottom nhẹ
- Search bar: Border-2, focus ring, autoFocus
- Quick orientation: Buttons nhỏ, không nổi bật
- Popular destinations: Text links, không quá nổi bật

**UX Reasoning:**
- ✅ **Search là primary action**: Người dùng vào trang muốn tìm điểm đến cụ thể
- ✅ **Giảm cảm giác marketing**: Không gradient, không wave, không animation dư thừa
- ✅ **Quick orientation**: Giúp người dùng không bị "đứng hình" khi chưa biết bắt đầu từ đâu
- ✅ **Popular destinations**: Gợi ý địa danh thật để user click nhanh

**Hành vi người dùng:**
- User có địa danh cụ thể → Search ngay
- User chưa biết → Click "Được yêu thích" hoặc popular destination
- User có ngân sách → Click "Giá tốt"

---

### 2. RESULTS BAR - Compact & Functional

**Thiết kế:**
- Hiển thị: "{total} điểm đến"
- Clear filters button (chỉ khi có filter)
- Sort dropdown: Ngôn ngữ thân thiện
- View toggle: Grid/Map

**UX Reasoning:**
- ✅ **Không dashboard feel**: Không số liệu lớn, không divider dư thừa
- ✅ **Clear filters nổi bật**: Giúp user reset nhanh khi filter sai
- ✅ **Sort thân thiện**: "Được yêu thích" thay vì "Popular", "Giá thấp → cao" thay vì "Price ASC"

**Hành vi người dùng:**
- User muốn xem giá tốt → Sort "Giá thấp → cao"
- User muốn xem đánh giá tốt → Sort "Đánh giá tốt nhất"
- User muốn reset → Click "Xóa bộ lọc"

---

### 3. FILTER PANEL - Travel-Friendly Language

**Thiết kế:**
- Collapsible, compact
- Labels: "Đi đâu", "Ngân sách", "Đánh giá"
- Badge hiển thị số filter đang active

**UX Reasoning:**
- ✅ **Ngôn ngữ tự nhiên**: "Đi đâu" thay vì "Khu vực", "Ngân sách" thay vì "Khoảng giá"
- ✅ **Collapsible**: Không chiếm không gian khi không dùng
- ✅ **Badge count**: User biết đang có bao nhiêu filter active

**Hành vi người dùng:**
- User muốn filter → Click "Lọc theo"
- User muốn xem giá dưới 5M → Nhập "Ngân sách"
- User muốn xem 4.5⭐+ → Chọn "Đánh giá"

---

### 4. DESTINATION LISTING - UX Rhythm

**Thiết kế:**
- **Khi KHÔNG có filter/search**: Grouping với labels
  - "Đang hot" (featured)
  - "Giá tốt" (price < 5M)
  - "Được yêu thích" (rating ≥ 4.5)
  - "Tất cả điểm đến" (rest)
- **Khi CÓ filter/search**: Flat list, không group

**UX Reasoning:**
- ✅ **Tạo nhịp khi scroll**: Không phẳng, có điểm nhấn
- ✅ **Grouping chỉ khi không filter**: Tránh confusion khi user đã filter
- ✅ **Labels rõ ràng**: User hiểu tại sao điểm đến này ở đây
- ✅ **Không section mới**: Chỉ grouping & label, không thêm tính năng

**Hành vi người dùng:**
- User mới vào → Thấy "Đang hot" → Click xem
- User muốn giá tốt → Scroll xuống "Giá tốt"
- User đã filter → Thấy flat list, dễ scan

---

### 5. DESTINATION CARD - Decision-Ready

**Thứ tự thông tin (Travel UX Standard):**

```
1. Hình ảnh lớn (cảm xúc đầu tiên)
   └─ Featured badge (nếu có)
   └─ Like button
   └─ Rating badge

2. Tên điểm đến (thông tin chính)

3. Rating + Review count (trust signal)
   └─ "4.7 • 125 đánh giá"

4. Tags (decision support)
   └─ "Giá tốt", "Cuối tuần", "Gia đình", "Nghỉ dưỡng"

5. Giá + CTA (decision point)
   └─ "Từ 5.900.000 đ" + "Xem tour"
```

**UX Reasoning:**
- ✅ **Hình ảnh là điểm nhấn**: User quyết định dựa trên hình ảnh đầu tiên
- ✅ **Rating + Review count**: Tăng trust, không chỉ rating số
- ✅ **Tags hỗ trợ quyết định**: "Cuối tuần" → Phù hợp đi ngắn ngày
- ✅ **CTA cụ thể**: "Xem tour" thay vì "Xem ngay" chung chung
- ✅ **Giá rõ ràng**: "Từ X đ" → User biết giá tối thiểu

**Hành vi người dùng:**
- User scan hình ảnh → Thấy đẹp → Đọc tên
- User thấy rating cao + nhiều review → Tin tưởng hơn
- User thấy tag "Giá tốt" → Phù hợp ngân sách
- User thấy giá → So sánh với ngân sách → Click "Xem tour"

---

### 6. MAP VIEW - Supporting Role

**Thiết kế:**
- Header: "Vị trí trên bản đồ"
- Nút "Xem danh sách" để quay lại
- Map height: 600px (không quá lớn)

**UX Reasoning:**
- ✅ **Vai trò phụ**: Map chỉ để tham khảo vị trí, không phải trải nghiệm chính
- ✅ **Dễ quay lại**: Nút "Xem danh sách" rõ ràng
- ✅ **Không lấn trải nghiệm**: Map không chiếm quá nhiều không gian

**Hành vi người dùng:**
- User muốn xem vị trí → Click Map view
- User muốn quay lại → Click "Xem danh sách"

---

### 7. ANIMATION - Light & Functional

**Animation được phép:**
- ✅ **FadeInUp cho cards**: 300ms, delay 30ms/card (tối đa 300ms)
- ✅ **Hover card**: Scale image 105%, shadow transition 200ms
- ✅ **Filter expand**: Rotate arrow 200ms

**Animation KHÔNG được phép:**
- ❌ Pulse, infinite animations
- ❌ Decorative animations
- ❌ Loop animations

**UX Reasoning:**
- ✅ **Dẫn mắt**: FadeInUp giúp user scan từng card
- ✅ **Phản hồi hành động**: Hover feedback rõ ràng
- ✅ **Nhẹ, không phân tâm**: Nếu tắt animation mà UX vẫn tốt → đó là animation đúng

---

## ✅ CHECKLIST QUYẾT ĐỊNH THIẾT KẾ

### Priority 1 - Core UX (Đã hoàn thành)
- [x] Hero: Search là trung tâm, không marketing feel
- [x] Hero: Quick orientation buttons
- [x] Hero: Popular destinations (real cues)
- [x] Results bar: Compact, không dashboard feel
- [x] Filter: Ngôn ngữ thân thiện du lịch
- [x] Listing: Grouping khi không filter, flat khi có filter
- [x] Card: Thứ tự thông tin chuẩn travel UX
- [x] Card: Tags hỗ trợ quyết định
- [x] Card: CTA cụ thể ("Xem tour")
- [x] Card: Rating + Review count
- [x] Map: Vai trò phụ, có nút quay lại
- [x] Animation: Chỉ fadeInUp + hover nhẹ

### Priority 2 - Enhancement (Có thể thêm sau)
- [ ] Card: Thêm "từ X đánh giá" nếu reviewCount > 0
- [ ] Filter: Thêm "Gần đây" nếu có history
- [ ] Empty state: Suggestions cụ thể hơn
- [ ] Loading: Skeleton với hình ảnh placeholder

---

## 🎨 NGUYÊN TẮC THIẾT KẾ

1. **Web du lịch, không phải SaaS**
   - Ưu tiên hình ảnh, địa danh, cảm xúc
   - Giảm text, tăng visual

2. **Scan nhanh, quyết định rõ ràng**
   - User hiểu trong 2-3 giây tại sao chọn card này
   - CTA cụ thể, không chung chung

3. **Product thật, không template**
   - Giảm decoration dư thừa
   - Tăng functionality

4. **Animation phục vụ UX**
   - Chỉ khi cần thiết
   - Rất nhẹ, không phân tâm

---

## 📊 METRICS SUCCESS

**Mục tiêu UX:**
- User chọn được điểm đến trong 5-10 giây
- User hiểu rõ tại sao chọn điểm A thay vì B
- User không cảm giác "đứng hình" khi vào trang
- User có cảm giác đang dùng product thật, không phải template

**Indicators:**
- Click rate vào cards tăng
- Time to first click giảm
- Bounce rate giảm
- User scroll nhiều hơn (engagement tốt)

