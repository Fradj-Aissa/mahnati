export const adminCourses = [
  { id: "c1", title: "أساسيات السباكة", category: "حرف يدوية", students: 124, status: "منشورة", instructor: "أحمد بن علي" },
  { id: "c2", title: "الخياطة العصرية", category: "حرف يدوية", students: 89, status: "منشورة", instructor: "فاطمة الزهراء" },
  { id: "c3", title: "اللغة الإنجليزية للمبتدئين", category: "لغات", students: 312, status: "منشورة", instructor: "سارة محمد" },
  { id: "c4", title: "فن الإلقاء والخطابة", category: "تطوير ذاتي", students: 67, status: "مسودة", instructor: "خالد عمر" },
  { id: "c5", title: "النجارة الحديثة", category: "حرف يدوية", students: 45, status: "منشورة", instructor: "محمود يوسف" },
];

export const adminSessions = [
  { id: "s1", artisan: "أحمد بن علي", craft: "السباكة", student: "يوسف الأمين", date: "2026-05-20 14:00", status: "قادمة" },
  { id: "s2", artisan: "فاطمة الزهراء", craft: "الخياطة", student: "نور الهدى", date: "2026-05-19 10:00", status: "قادمة" },
  { id: "s3", artisan: "محمود يوسف", craft: "النجارة", student: "كريم سعيد", date: "2026-05-15 16:00", status: "مكتملة" },
  { id: "s4", artisan: "أحمد بن علي", craft: "السباكة", student: "ليلى حسن", date: "2026-05-14 09:00", status: "ملغية" },
];

export const adminArtisans = [
  { id: "a1", name: "أحمد بن علي", craft: "السباكة", rating: 4.8, sessions: 42, status: "معتمد" },
  { id: "a2", name: "فاطمة الزهراء", craft: "الخياطة", rating: 4.9, sessions: 67, status: "معتمد" },
  { id: "a3", name: "محمود يوسف", craft: "النجارة", rating: 4.6, sessions: 23, status: "قيد المراجعة" },
];
