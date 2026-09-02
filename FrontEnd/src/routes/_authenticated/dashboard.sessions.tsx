import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Video, Calendar, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { sessions, type ArtisanSession } from "@/lib/dashboard-data";

export const Route = createFileRoute("/_authenticated/dashboard/sessions")({
  component: SessionsPage,
  head: () => ({ meta: [{ title: "الجلسات — مهنتي" }] }),
});

function SessionsPage() {
  const upcoming = sessions.filter((s) => s.status === "upcoming");
  const completed = sessions.filter((s) => s.status === "completed");

  return (
    <div className="mx-auto max-w-7xl">
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">القادمة ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="completed">المكتملة ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcoming.map((s, i) => <SessionCard key={s.id} session={s} delay={i * 0.05} />)}
          {upcoming.length === 0 && <Empty msg="لا توجد جلسات قادمة" />}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completed.map((s, i) => <SessionCard key={s.id} session={s} delay={i * 0.05} />)}
          {completed.length === 0 && <Empty msg="لم تحضر أي جلسات بعد" />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SessionCard({ session, delay }: { session: ArtisanSession; delay: number }) {
  const isUpcoming = session.status === "upcoming";
  const initials = session.artisan.split(" ").slice(-2).map((s) => s[0]).join("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-card-hover sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14 border border-border">
          <AvatarFallback className="bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-bold text-foreground">{session.artisan}</h3>
          <p className="text-sm text-muted-foreground">{session.specialty}</p>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {session.date}</span>
            <span>{session.time}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {isUpcoming ? (
          <>
            <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">قادمة</Badge>
            <Button asChild className="gradient-accent border-0 text-primary-foreground">
              <a href={session.zoomUrl} target="_blank" rel="noopener noreferrer">
                <Video className="h-4 w-4" /> الانضمام لزووم
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </>
        ) : (
          <Badge className="bg-success/10 text-success border-success/20" variant="outline">
            <CheckCircle2 className="ml-1 h-3 w-3" /> مكتملة
          </Badge>
        )}
      </div>
    </motion.div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
      <Video className="h-8 w-8 text-muted-foreground" />
      <p className="mt-3 text-sm text-muted-foreground">{msg}</p>
    </div>
  );
}
