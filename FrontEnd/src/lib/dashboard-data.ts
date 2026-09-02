export interface EnrolledCourse {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  progress: number;
  lastActivity: string;
  status: "in_progress" | "completed" | "saved";
}

export interface ArtisanSession {
  id: string;
  artisan: string;
  specialty: string;
  date: string;
  time: string;
  status: "upcoming" | "completed";
  zoomUrl: string;
  avatar?: string;
}

export interface CommunityActivity {
  id: string;
  type: "post" | "comment" | "question";
  title: string;
  excerpt: string;
  room: string;
  time: string;
  likes: number;
  replies: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: "trophy" | "flame" | "star" | "users" | "graduation" | "zap";
  earned: boolean;
  earnedAt?: string;
  color: string;
}

export const enrolledCourses: EnrolledCourse[] = [
  {
    id: "speaking-basics",
    title: "أساسيات فن الخطابة",
    category: "فن الخطابة",
    thumbnail: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=70",
    progress: 65,
    lastActivity: "منذ ساعتين",
    status: "in_progress",
  },
  {
    id: "french-beginners",
    title: "الفرنسية للمبتدئين",
    category: "اللغات",
    thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=70",
    progress: 30,
    lastActivity: "منذ 3 أيام",
    status: "in_progress",
  },
  {
    id: "plumbing-basics",
    title: "أساسيات السباكة المنزلية",
    category: "السباكة",
    thumbnail: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&q=70",
    progress: 100,
    lastActivity: "منذ أسبوع",
    status: "completed",
  },
  {
    id: "sewing-fashion",
    title: "تصميم وخياطة الأزياء",
    category: "الخياطة",
    thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=70",
    progress: 0,
    lastActivity: "محفوظة",
    status: "saved",
  },
  {
    id: "english-business",
    title: "الإنجليزية لبيئة العمل",
    category: "اللغات",
    thumbnail: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&q=70",
    progress: 45,
    lastActivity: "أمس",
    status: "in_progress",
  },
];

export const sessions: ArtisanSession[] = [
  {
    id: "s1",
    artisan: "أ. محمد العلي",
    specialty: "فن الخطابة",
    date: "20 ماي 2026",
    time: "18:00",
    status: "upcoming",
    zoomUrl: "https://zoom.us/j/123456",
  },
  {
    id: "s2",
    artisan: "م. عبد الرحمن يوسف",
    specialty: "السباكة",
    date: "23 ماي 2026",
    time: "20:30",
    status: "upcoming",
    zoomUrl: "https://zoom.us/j/789012",
  },
  {
    id: "s3",
    artisan: "أ. ليلى بن عمر",
    specialty: "اللغة الفرنسية",
    date: "10 ماي 2026",
    time: "17:00",
    status: "completed",
    zoomUrl: "#",
  },
  {
    id: "s4",
    artisan: "أ. فاطمة الزهراء",
    specialty: "الخياطة",
    date: "5 ماي 2026",
    time: "16:00",
    status: "completed",
    zoomUrl: "#",
  },
];

export const communityActivities: CommunityActivity[] = [
  {
    id: "c1",
    type: "post",
    title: "نصائح للتغلب على رهبة المسرح",
    excerpt: "بعد أن أكملت الدرس الثاني أردت مشاركة ما تعلمته معكم...",
    room: "غرفة فن الخطابة",
    time: "منذ يوم",
    likes: 24,
    replies: 8,
  },
  {
    id: "c2",
    type: "question",
    title: "كيف أختار نوع الخيط المناسب؟",
    excerpt: "أرغب في خياطة قميص قطني، ما هو نوع الخيط الأفضل؟",
    room: "غرفة الخياطة",
    time: "منذ 3 أيام",
    likes: 12,
    replies: 5,
  },
  {
    id: "c3",
    type: "comment",
    title: "تعليق على: دورة الفرنسية للمبتدئين",
    excerpt: "شرح ممتاز جداً، أنصح كل مبتدئ بهذه الدورة!",
    room: "غرفة اللغات",
    time: "منذ أسبوع",
    likes: 6,
    replies: 1,
  },
];

export const achievements: Achievement[] = [
  {
    id: "a1",
    title: "أول دورة مكتملة",
    description: "أكملت أول دورة تعليمية لك",
    icon: "graduation",
    earned: true,
    earnedAt: "10 ماي 2026",
    color: "primary",
  },
  {
    id: "a2",
    title: "أول جلسة مع حرفي",
    description: "حضرت أول جلسة مباشرة",
    icon: "users",
    earned: true,
    earnedAt: "5 ماي 2026",
    color: "accent",
  },
  {
    id: "a3",
    title: "عضو نشط في المجتمع",
    description: "نشرت 10 منشورات في المجتمع",
    icon: "star",
    earned: true,
    earnedAt: "12 ماي 2026",
    color: "success",
  },
  {
    id: "a4",
    title: "متعلم متواصل",
    description: "7 أيام تعلم متتالية",
    icon: "flame",
    earned: true,
    earnedAt: "13 ماي 2026",
    color: "warning",
  },
  {
    id: "a5",
    title: "خبير في تخصص",
    description: "أكمل 5 دورات في نفس التخصص",
    icon: "trophy",
    earned: false,
    color: "primary",
  },
  {
    id: "a6",
    title: "متفاعل سريع",
    description: "أجاب على 20 سؤال في المجتمع",
    icon: "zap",
    earned: false,
    color: "accent",
  },
];

export const dashboardStats = {
  enrolledCourses: 5,
  completedLessons: 28,
  artisanSessions: 4,
  communityPosts: 12,
};
