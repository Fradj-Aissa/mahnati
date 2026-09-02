import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/HeroSection";
import { ContinueLearning } from "@/components/ContinueLearning";
import { CategoriesSection } from "@/components/CategoriesSection";
import { FeaturedCourses } from "@/components/FeaturedCourses";
import { StatsSection } from "@/components/StatsSection";
import { CTASection } from "@/components/CTASection";
import { ContactSection } from "@/components/ContactSection";
import { InstagramFeed } from "@/components/InstagramFeed";
import { HomePageSkeleton } from "@/components/skeletons/HomePageSkeleton";

export const Route = createFileRoute("/")({
  pendingComponent: HomePageSkeleton,
  head: () => ({
    meta: [
      { title: "مهنتي — منصة التعلم المهني الرقمية" },
      { name: "description", content: "منصة تعليمية رقمية تجمع بين التعلم النظري والتطبيقي في مجالات الخطابة واللغات والسباكة والخياطة مع دعم التربصات الميدانية" },
      { property: "og:title", content: "مهنتي — منصة التعلم المهني الرقمية" },
      { property: "og:description", content: "ابنِ مهنتك من هنا. تعلم مهارات مهنية حقيقية مع دعم التربصات الميدانية." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div>
      <HeroSection />
      <ContinueLearning />
      <StatsSection />
      <CategoriesSection />
      <FeaturedCourses />
      <CTASection />
      <InstagramFeed />
      <ContactSection />
    </div>
  );
}
