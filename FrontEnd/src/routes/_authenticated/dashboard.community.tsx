import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, MessageCircle, FileText, HelpCircle, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { communityActivities, type CommunityActivity } from "@/lib/dashboard-data";

export const Route = createFileRoute("/_authenticated/dashboard/community")({
  component: CommunityPage,
  head: () => ({ meta: [{ title: "نشاط المجتمع — مهنتي" }] }),
});

const typeMeta = {
  post: { label: "منشور", icon: FileText, cls: "bg-primary/10 text-primary" },
  comment: { label: "تعليق", icon: MessageCircle, cls: "bg-accent/15 text-accent-foreground" },
  question: { label: "سؤال", icon: HelpCircle, cls: "bg-warning/15 text-warning-foreground" },
};

function CommunityPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {communityActivities.map((a, i) => <ActivityCard key={a.id} activity={a} delay={i * 0.05} />)}
      {communityActivities.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">لا يوجد نشاط بعد</p>
        </div>
      )}
    </div>
  );
}

function ActivityCard({ activity, delay }: { activity: CommunityActivity; delay: number }) {
  const meta = typeMeta[activity.type];
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-card-hover"
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.cls}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{meta.label}</Badge>
            <span className="text-xs text-muted-foreground">في {activity.room}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{activity.time}</span>
          </div>
          <h3 className="mt-2 font-bold text-foreground">{activity.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{activity.excerpt}</p>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {activity.likes}</span>
            <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {activity.replies}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
