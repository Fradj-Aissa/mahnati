import catSpeaking from "@/assets/cat-speaking.png";
import catLanguages from "@/assets/cat-languages.png";
import catPlumbing from "@/assets/cat-plumbing.png";
import catSewing from "@/assets/cat-sewing.png";

export interface Category {
  id: string;
  title: string;
  description: string;
  image: string;
  courseCount: number;
  color: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryTitle: string;
  lessonsCount: number;
  duration: string;
  level: "مبتدئ" | "متوسط" | "متقدم";
  hasInternship: boolean;
  rating: number;
  studentsCount: number;
  instructor: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  type: "video" | "pdf";
  contentUrl: string;
  duration: string;
  order: number;
  completed?: boolean;
}

export const categories: Category[] = [
  {
    id: "speaking",
    title: "فن الخطابة",
    description: "تعلم مهارات التحدث أمام الجمهور والإقناع والتأثير",
    image: catSpeaking,
    courseCount: 8,
    color: "bg-primary/10",
  },
  {
    id: "languages",
    title: "اللغات",
    description: "تعلم اللغات الأجنبية بأسلوب تفاعلي وعملي",
    image: catLanguages,
    courseCount: 12,
    color: "bg-accent/10",
  },
  {
    id: "plumbing",
    title: "السباكة",
    description: "إتقان أساسيات ومتقدمات مهنة السباكة",
    image: catPlumbing,
    courseCount: 6,
    color: "bg-success/10",
  },
  {
    id: "sewing",
    title: "الخياطة والتفصيل",
    description: "تعلم فنون الخياطة من البداية إلى الاحتراف",
    image: catSewing,
    courseCount: 10,
    color: "bg-warning/10",
  },
];

export const courses: Course[] = [
  {
    id: "speaking-basics",
    title: "أساسيات فن الخطابة",
    description: "تعلم كيف تتحدث بثقة أمام الجمهور وتوصل أفكارك بوضوح وتأثير. دورة شاملة للمبتدئين.",
    categoryId: "speaking",
    categoryTitle: "فن الخطابة",
    lessonsCount: 12,
    duration: "8 ساعات",
    level: "مبتدئ",
    hasInternship: true,
    rating: 4.8,
    studentsCount: 234,
    instructor: "أ. محمد العلي",
  },
  {
    id: "speaking-advanced",
    title: "الإقناع والتأثير المتقدم",
    description: "استراتيجيات متقدمة للإقناع والتفاوض والتأثير في الآخرين.",
    categoryId: "speaking",
    categoryTitle: "فن الخطابة",
    lessonsCount: 15,
    duration: "10 ساعات",
    level: "متقدم",
    hasInternship: false,
    rating: 4.9,
    studentsCount: 156,
    instructor: "د. سارة أحمد",
  },
  {
    id: "french-beginners",
    title: "الفرنسية للمبتدئين",
    description: "تعلم أساسيات اللغة الفرنسية من الصفر مع تمارين تفاعلية ومحادثات يومية.",
    categoryId: "languages",
    categoryTitle: "اللغات",
    lessonsCount: 20,
    duration: "15 ساعة",
    level: "مبتدئ",
    hasInternship: false,
    rating: 4.7,
    studentsCount: 412,
    instructor: "أ. ليلى بن عمر",
  },
  {
    id: "english-business",
    title: "الإنجليزية لبيئة العمل",
    description: "إتقان اللغة الإنجليزية في السياق المهني: اجتماعات، عروض، مراسلات.",
    categoryId: "languages",
    categoryTitle: "اللغات",
    lessonsCount: 18,
    duration: "12 ساعة",
    level: "متوسط",
    hasInternship: true,
    rating: 4.6,
    studentsCount: 289,
    instructor: "د. خالد محمود",
  },
  {
    id: "plumbing-basics",
    title: "أساسيات السباكة المنزلية",
    description: "تعلم إصلاح وصيانة الأنابيب والصنابير والمراحيض بنفسك.",
    categoryId: "plumbing",
    categoryTitle: "السباكة",
    lessonsCount: 10,
    duration: "7 ساعات",
    level: "مبتدئ",
    hasInternship: true,
    rating: 4.5,
    studentsCount: 178,
    instructor: "م. عبد الرحمن يوسف",
  },
  {
    id: "sewing-fashion",
    title: "تصميم وخياطة الأزياء",
    description: "من الباترون إلى المنتج النهائي: تعلم تصميم وتنفيذ قطع الملابس.",
    categoryId: "sewing",
    categoryTitle: "الخياطة والتفصيل",
    lessonsCount: 16,
    duration: "14 ساعة",
    level: "متوسط",
    hasInternship: true,
    rating: 4.8,
    studentsCount: 321,
    instructor: "أ. فاطمة الزهراء",
  },
];

export const sampleLessons: Lesson[] = [
  { id: "l1", courseId: "speaking-basics", title: "مقدمة في فن الخطابة", type: "video", contentUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "15 دقيقة", order: 1, completed: true },
  { id: "l2", courseId: "speaking-basics", title: "التغلب على رهبة المسرح", type: "video", contentUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "20 دقيقة", order: 2, completed: true },
  { id: "l3", courseId: "speaking-basics", title: "لغة الجسد والتواصل البصري", type: "pdf", contentUrl: "#", duration: "10 دقائق", order: 3, completed: false },
  { id: "l4", courseId: "speaking-basics", title: "بناء الخطاب المؤثر", type: "video", contentUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "25 دقيقة", order: 4, completed: false },
  { id: "l5", courseId: "speaking-basics", title: "تقنيات الإلقاء", type: "video", contentUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "18 دقيقة", order: 5, completed: false },
  { id: "l6", courseId: "speaking-basics", title: "التعامل مع الأسئلة", type: "pdf", contentUrl: "#", duration: "12 دقيقة", order: 6, completed: false },
];

export const stats = [
  { label: "طالب نشط", value: 2500, icon: "users" },
  { label: "دورة متاحة", value: 36, icon: "book" },
  { label: "تربص ميداني", value: 15, icon: "briefcase" },
  { label: "مدرب معتمد", value: 24, icon: "award" },
];
