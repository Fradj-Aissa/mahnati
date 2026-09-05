import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "@/integrations/pocketbase/client";
import { useAuth } from "@/hooks/use-auth";

export type EnrollmentRecord = {
  id: string;
  user: string;
  course: string;
  progress: number;
  status: "in_progress" | "completed" | "saved";
  created: string;
  updated: string;
  expand?: {
    course?: Record<string, unknown>;
  };
};

export function useEnrollment(courseId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["enrollment", user?.id, courseId],
    enabled: Boolean(user?.id && courseId),
    queryFn: async (): Promise<EnrollmentRecord | null> => {
      try {
        return await pb.collection("enrollments").getFirstListItem(
          `user = "${user!.id}" && course = "${courseId}"`,
          { expand: "course" },
        ) as EnrollmentRecord;
      } catch (error) {
        if (error && typeof error === "object" && "status" in error && error.status === 404) return null;
        throw error;
      }
    },
  });
}

export function useEnrollInCourse() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user?.id) throw new Error("يجب تسجيل الدخول أولاً");
      try {
        return await pb.collection("enrollments").create({
          user: user.id,
          course: courseId,
          progress: 0,
          status: "in_progress",
        });
      } catch (error) {
        if (error && typeof error === "object" && "status" in error && error.status === 400) {
          throw new Error("أنت مسجل في هذه الدورة بالفعل");
        }
        throw error;
      }
    },
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: ["enrollment", user?.id, courseId] });
      queryClient.invalidateQueries({ queryKey: ["enrollments", user?.id] });
    },
  });
}

export function useEnrolledCourses() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["enrollments", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => await pb.collection("enrollments").getFullList({
      filter: `user = "${user!.id}"`,
      expand: "course",
      sort: "-updated",
    }) as EnrollmentRecord[],
  });
}

export function useCompleteCourse() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user?.id) throw new Error("يجب تسجيل الدخول أولاً");
      // Find the enrollment record first
      const enrollment = await pb.collection("enrollments").getFirstListItem(
        `user = "${user.id}" && course = "${courseId}"`,
      ) as EnrollmentRecord;
      // Patch status and progress
      return await pb.collection("enrollments").update(enrollment.id, {
        status: "completed",
        progress: 100,
      });
    },
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: ["enrollment", user?.id, courseId] });
      queryClient.invalidateQueries({ queryKey: ["enrollments", user?.id] });
    },
  });
}

export function useMySessions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["sessions", "mine", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => await pb.collection("sessions").getFullList({
      filter: `student = "${user!.id}"`,
      sort: "-scheduled_at",
    }),
  });
}
