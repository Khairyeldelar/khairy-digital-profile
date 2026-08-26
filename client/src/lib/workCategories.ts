export type WorkCategory = "applications" | "tutorials" | "videos";

export const workCategories: Array<{ id: WorkCategory; labelEn: string; labelAr: string }> = [
  { id: "applications", labelEn: "Applications", labelAr: "تطبيقاتي" },
  { id: "tutorials", labelEn: "Tutorials and Information", labelAr: "شروحات ومعلومات" },
  { id: "videos", labelEn: "Videos", labelAr: "فيديوهاتي" },
];

export function filterProjectsByCategory<T extends { category: WorkCategory }>(projects: T[], category: WorkCategory): T[] {
  return projects.filter((project) => project.category === category);
}
