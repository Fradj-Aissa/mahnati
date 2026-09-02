# SkillBridge Hub

تصرف كمهندس برمجيات Full Stack خبير في بناء منتجات SaaS تعليمية، ومتخصص في React وFirebase وUX UI Design.



أريد بناء منصة تعليمية رقمية حديثة موجهة للشباب، تجمع بين التعلم النظري والتطبيقي في مجالات مثل الخطابة واللغات والسباكة والخياطة، مع دعم التربصات الميدانية.



المطلوب إنشاء تطبيق كامل Production-ready باستخدام:



Frontend: React مع Next.js App Router Tailwind CSS ShadCN UI



Backend: Firebase (Authentication, Firestore, Storage, Functions)



ركز على الأداء العالي، تجربة المستخدم الممتازة، وقابلية التوسع.





---



المميزات الأساسية:



1. نظام المصادقة تسجيل الدخول باستخدام email وGoogle إدارة المستخدمين عبر Firebase Auth حماية الصفحات باستخدام route guards تخزين بيانات المستخدم في Firestore





2. الصفحة الرئيسية Hero section يحتوي على عنوان قوي يوضح قيمة المنصة محرك بحث ذكي مع auto suggestions عرض التخصصات بشكل جذاب إحصائيات مثل عدد المستخدمين والدورات تصميم حديث مع responsive كامل





3. نظام الدورات عرض التخصصات على شكل Cards كل تخصص يحتوي على دورات كل دورة تحتوي على: عنوان وصف صورة دروس (فيديو + PDF) مؤشر وجود تربص





4. صفحة التعلم Video player (YouTube embed) عرض ملفات PDF Sidebar يحتوي على قائمة الدروس حفظ تقدم المستخدم تلقائيا في Firestore إظهار نسبة التقدم





5. لوحة المستخدم عرض الدورات المسجل فيها Progress tracking نظام شارات وإنجازات حالة طلب التربص





6. لوحة المدير إدارة المستخدمين إضافة وتعديل الدورات رفع فيديوهات وروابط رفع ملفات PDF إلى Firebase Storage Dashboard يحتوي على إحصائيات Charts لنشاط المستخدمين









---



تصميم UX UI:



استخدم تصميم حديث ونظيف ألوان: Primary أزرق Secondary رمادي فاتح Background أبيض Accent أخضر أو برتقالي



Typography: Inter أو Poppins



مكونات: Cards بحواف مستديرة Shadows خفيفة Spacing مريح Animations باستخدام Framer Motion





---



قاعدة البيانات Firestore:



صمم هيكل احترافي يشمل:



users: id name email role progress badges



courses: id title description category hasInternship



lessons: id courseId type video أو pdf contentUrl order



internships: userId courseId status





---



وظائف إضافية مهمة:



نظام توصيات للدورات نظام تقييم ومراجعات Notifications بحث متقدم Pagination Lazy loading Caching باستخدام React Query





---



متطلبات الكود:



إنشاء المشروع بهيكل احترافي تقسيم إلى: components features lib hooks services



استخدام reusable components كتابة clean code تطبيق best practices تحسين الأداء (SEO + loading speed)

اسم الموقع مهنتي

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://digital-forge-84.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c9fd74dc-ea6a-48b1-b3ed-9bc35aae88eb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
