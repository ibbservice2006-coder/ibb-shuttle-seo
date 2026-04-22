# IBB Shuttle Service - Project Summary

## ภาพรวมโปรเจกต์
บริการรถรับส่งสนามบินระดับ Premium ในประเทศไทย รองรับหลายภาษาและหลายสกุลเงิน

---

## หน้าหลัก (Pages)

### 1. หน้าแรก (Index)
- Hero section พร้อมนาฬิกาเวลาไทย
- Features section (ความสะดวก, ความปลอดภัย, รถ Premium)
- Services section (Airport Shuttle, Corporate Travel, Leisure Travel)
- Service Coverage พร้อมแผนที่ประเทศไทย
- Booking Section สำหรับจองรถ
- Pricing preview
- Footer พร้อม social media links

### 2. Pricing Page (/pricing)
- Hero section
- Region Tabs (Bangkok, Pattaya, Hua Hin, Phuket, Chiang Mai, Koh Samui)
- Vehicle Selector (Car, Van, Bus)
- Currency Selector (THB, USD, EUR, GBP, CNY, JPY, KRW)
- Pricing Table แสดงราคาตามโซน
- Pricing Accordion สำหรับรายละเอียดเพิ่มเติม

### 3. Admin Dashboard (/admin)
- Dashboard Overview (สรุปยอด bookings, revenue)
- Bookings Management (จัดการการจอง)
- Drivers Management (จัดการคนขับ)
- Vehicles Management (จัดการรถ)
- Zones & Pricing Management (จัดการโซนและราคา)
- Festival Pricing Management (ราคาช่วงเทศกาล)
- Vouchers Management (จัดการ voucher)
- Partners Management (จัดการพาร์ทเนอร์)
- External Orders Management (ออเดอร์จากแพลตฟอร์มอื่น)
- Notifications Management (จัดการแจ้งเตือน)
- Wallet Management (จัดการ wallet ลูกค้า)
- Fleet Map (แผนที่แสดงตำแหน่งรถ)

### 4. Partner Dashboard (/partner-dashboard)
- Dashboard สำหรับพาร์ทเนอร์ดู commission และ bookings

### 5. Partners Page (/partners)
- Partner Application Form สำหรับสมัครเป็นพาร์ทเนอร์

### 6. Authentication (/auth)
- Login/Signup forms
- Google OAuth
- Password reset
- Show/Hide password toggle

### 7. Balance Page (/balance)
- Wallet Balance Cards
- Deposit Form
- Transaction History

### 8. Tracking Page (/tracking/:bookingNumber)
- Tracking Map (Leaflet)
- Tracking Info (ข้อมูลการเดินทาง)

### 9. Guest Payment (/guest-payment)
- Guest Booking Lookup
- Guest Payment Form
- Cash to Driver Option

### 10. Voucher Redemption (/voucher/:code)
- หน้าใช้งาน voucher

### 11. Reset Password (/reset-password)
- หน้ารีเซ็ตรหัสผ่าน

---

## ฟีเจอร์หลัก

### Multi-language Support
- Thai (TH)
- English (EN)
- Chinese (CN)
- Korean (KR)
- Japanese (JP)

### Currency Support
- THB (Thai Baht)
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- CNY (Chinese Yuan)
- JPY (Japanese Yen)
- KRW (Korean Won)

### Vehicle Types
- Car (รถเก๋ง) - 1-3 คน
- Van (รถตู้) - 4-10 คน
- Bus (รถบัส) - 11+ คน

### Booking Status Flow
1. pending_payment
2. pending
3. pending_assignment
4. confirmed
5. assigned
6. in_progress
7. completed
8. cancelled

### Payment Methods
- Bank Transfer (THB)
- Payoneer
- Wise
- Credit Card
- Crypto
- External Platform
- Cash to Driver

### Membership Levels
- General
- VIP
- VVIP
- Business Partner

### Affiliate Types
- Partner
- Public

---

## Database Tables

### Core Tables
1. **bookings** - ข้อมูลการจอง
2. **profiles** - ข้อมูลผู้ใช้
3. **drivers** - ข้อมูลคนขับ
4. **vehicles** - ข้อมูลรถ
5. **zones** - ข้อมูลโซน/พื้นที่
6. **zone_prices** - ราคาตามโซนและประเภทรถ

### Payment & Wallet
7. **payments** - ข้อมูลการชำระเงิน
8. **wallet_transactions** - ประวัติ wallet
9. **vouchers** - ข้อมูล voucher
10. **voucher_usage** - ประวัติการใช้ voucher

### Affiliate & Partner
11. **affiliates** - ข้อมูล affiliate/partner
12. **affiliate_commissions** - commission ของ affiliate

### Other
13. **guest_users** - ผู้ใช้แบบ guest
14. **notifications** - การแจ้งเตือน
15. **gps_tracking** - ข้อมูล GPS รถ
16. **festival_prices** - ราคาช่วงเทศกาล
17. **external_platform_orders** - ออเดอร์จากแพลตฟอร์มอื่น
18. **user_roles** - บทบาทผู้ใช้ (admin, moderator, user, driver)

---

## Edge Functions

1. **external-webhook** - รับ webhook จากแพลตฟอร์มอื่น
2. **get-tracking-data** - ดึงข้อมูล tracking
3. **guest-booking-lookup** - ค้นหา booking สำหรับ guest
4. **send-notification** - ส่งแจ้งเตือน
5. **update-driver-gps** - อัพเดท GPS คนขับ
6. **validate-voucher** - ตรวจสอบ voucher

---

## Components หลัก

### Layout
- Header (พร้อมนาฬิกาเวลาไทย)
- Navigation
- Footer

### Booking
- BookingSection
- BookingSuccessModal

### Pricing
- PricingHero
- PricingTable
- PricingAccordion
- RegionTabs
- VehicleSelector
- CurrencySelector

### Admin
- AdminSidebar
- DashboardOverview
- BookingsManagement
- BookingDetailsModal
- DriversManagement
- VehiclesManagement
- ZonesPricingManagement
- FestivalPricingManagement
- VouchersManagement
- PartnersManagement
- ExternalOrdersManagement
- NotificationsManagement
- AdminWalletManagement
- AdminFleetMap

### Wallet
- WalletBalanceCards
- DepositForm
- TransactionHistory

### Tracking
- TrackingMap
- TrackingInfo

### Guest
- GuestBookingLookup
- GuestPaymentForm
- CashToDriverOption

### SEO
- JsonLd (structured data)

---

## Regions/Coverage

### Bangkok Area
- Suvarnabhumi Airport (BKK)
- Don Mueang Airport (DMK)
- Bangkok City
- และโซนอื่นๆ

### Pattaya Area
- Pattaya City
- Jomtien
- และพื้นที่ใกล้เคียง

### Hua Hin Area
- Hua Hin City
- Cha-Am
- และพื้นที่ใกล้เคียง

### Phuket Area
- Phuket Airport
- Patong
- Kata/Karon
- และพื้นที่อื่นๆ

### Chiang Mai Area
- Chiang Mai Airport
- Chiang Mai City
- และพื้นที่ใกล้เคียง

### Koh Samui Area
- Samui Airport
- Chaweng
- และพื้นที่อื่นๆ

---

## Social Media Integration
- LINE
- WhatsApp
- WeChat
- KakaoTalk
- Telegram
- Messenger
- Facebook
- Instagram

---

## Tech Stack
- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Supabase (Database, Auth, Edge Functions)
- React Query
- React Router
- Leaflet (Maps)
- Recharts (Charts)
- Framer Motion (Animations)
- React Helmet Async (SEO)

---

## Design Elements
- Thai-style ornaments
- Gold/Navy color scheme
- Analog clock showing Thailand time
- Premium/Luxury aesthetic
- Responsive design (Mobile + Desktop)

---

## Notes
- รองรับ Guest checkout (ไม่ต้อง login)
- มีระบบ Voucher ทั้งแบบ internal และ external platform
- รองรับ Cash to Driver payment
- มี GPS Tracking แบบ realtime
- Admin สามารถ adjust wallet balance ได้
