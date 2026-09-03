import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getPbAdmin } from "@/integrations/pocketbase/client.server";

const searchInput = z.object({ query: z.string().trim().max(100) });

export type SearchResult =
  | {
      id: string;
      kind: "course";
      title: string;
      summary: string;
      meta: string;
    }
  | {
      id: string;
      kind: "artisan";
      title: string;
      summary: string;
      meta: string;
    };

/** A small, public catalogue search used by the navigation search box. */
export const searchCatalog = createServerFn({ method: "GET" })
  .validator(searchInput)
  .handler(async ({ data }): Promise<SearchResult[]> => {
    if (data.query.length < 2) return [];

    const pb = await getPbAdmin();
    const filter = pb.filter(
      "title ~ {:query} || description ~ {:query} || category ~ {:query}",
      { query: data.query },
    );
    const artisanFilter = pb.filter("name ~ {:query} || craft ~ {:query} || bio ~ {:query}", {
      query: data.query,
    });

    const [courses, artisans] = await Promise.all([
      pb.collection("courses").getList(1, 5, {
        filter: `status = "published" && (${filter})`,
        sort: "-created",
        fields: "id,title,description,category,instructor",
      }),
      pb.collection("artisans").getList(1, 5, {
        filter: `status = "approved" && (${artisanFilter})`,
        sort: "-created",
        fields: "id,name,craft,bio",
      }),
    ]);

    const courseResults: SearchResult[] = courses.items.map((record) => ({
      id: record.id,
      kind: "course",
      title: String(record.title),
      summary: String(record.description ?? "دورة عملية لتطوير مهاراتك المهنية"),
      meta: String(record.category ?? record.instructor ?? "دورة تدريبية"),
    }));
    const artisanResults: SearchResult[] = artisans.items.map((record) => ({
      id: record.id,
      kind: "artisan",
      title: String(record.name),
      summary: String(record.bio ?? "خدمة مهنية متاحة عبر منصة مهنتي"),
      meta: String(record.craft ?? "حرفي"),
    }));

    return [...courseResults, ...artisanResults];
  });
