# راهنمای راه‌اندازی (قدم‌به‌قدم)

## بخش ۱: ساخت Firebase (دیتابیس و ورود)
1. به firebase.google.com بروید ← Go to console ← با حساب گوگل وارد شوید.
2. **Add project** ← یک نام بدهید (مثلاً class-app) ← Google Analytics را خاموش کنید ← Create project.
3. منوی چپ: **Build ← Authentication ← Get started ← Email/Password** را روشن (Enable) و Save کنید.
4. منوی چپ: **Build ← Firestore Database ← Create database** ← Next ← (Production mode) ← یک منطقه انتخاب کنید ← Enable.
5. در Firestore روی تب **Rules** بزنید. همه متن آن را پاک کنید، محتوای فایل `firestore.rules` را کپی و جایگزین کنید ← **Publish**.

## بخش ۲: وصل کردن برنامه به Firebase
1. بالا سمت چپ روی چرخ‌دنده ⚙ ← **Project settings**.
2. پایین صفحه، بخش **Your apps** ← آیکون وب `</>` ← یک نام بدهید ← Register app.
3. متنی به نام `firebaseConfig` نشان می‌دهد. چهار مقدار `apiKey`، `authDomain`، `projectId` و `appId` را در فایل **config.js** جایگزین `PASTE_HERE` کنید (داخل گیومه‌ها).

## بخش ۳: ساخت حساب مدیر و معلم (فقط یک‌بار)
1. Authentication ← تب **Users** ← **Add user**:
   - ایمیل: `admin@classapp.example` و یک رمز (حداقل ۶ کاراکتر)
   - دوباره Add user: ایمیل `teacher@classapp.example` و رمز
2. در لیست، **User UID** هر کاربر را کپی کنید.
3. Firestore Database ← **Start collection** ← نام: `users` ← برای مدیر:
   - Document ID: همان UID مدیر
   - فیلدها (همه نوع string): `name` = نام مدیر، `username` = admin، `role` = admin
4. برای معلم یک سند دیگر در همان کالکشن `users` بسازید: Document ID = UID معلم، `name` = نام معلم، `username` = teacher، `role` = teacher

نام کاربری ورود: `admin` و `teacher` (بدون @ و دامنه).

## بخش ۴: آنلاین کردن برنامه
ساده‌ترین راه: سایت **app.netlify.com/drop** را باز کنید و کل پوشه برنامه (فایل‌های html/js/css) را داخل آن بکشید. یک لینک می‌دهد. سه صفحه:
- `لینک/teacher.html` ← معلم
- `لینک/admin.html` ← مدیر
- `لینک/student.html` ← دانش‌آموز

اگر موقع ورود خطای «domain not authorized» دیدید: Firebase ← Authentication ← Settings ← Authorized domains ← دامنه لینک را اضافه کنید.

روی گوشی: لینک را در Chrome باز کنید ← منوی سه‌نقطه ← **Add to Home screen** تا مثل برنامه روی صفحه اصلی بیاید.

## نکته‌ها
- رمز دانش‌آموز حداقل ۶ کاراکتر است. رمز بعد از ساخت قابل دیدن نیست؛ همان لحظه به دانش‌آموز بدهید.
- حذف دانش‌آموز، نام کاربری او را آزاد نمی‌کند. اگر رمزش را فراموش کرد، با یک نام کاربری جدید دوباره بسازید.
