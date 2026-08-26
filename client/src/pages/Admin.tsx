import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { AdminNoticeBanner } from "@/components/AdminNoticeBanner";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAdminNotice } from "@/lib/adminNotifications";
import { bindUploadedProjectImage } from "@/lib/projectUploadSync";
import { trpc } from "@/lib/trpc";
import { Github, ImagePlus, Loader2, Save, Trash2, Upload, Youtube } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const workCategoryOptions = [
  { value: "applications", label: "Applications / تطبيقاتي" },
  { value: "tutorials", label: "Tutorials and Information / شروحات ومعلومات" },
  { value: "videos", label: "Videos / فيديوهاتي" },
] as const;

const emptyProject = {
  titleEn: "",
  titleAr: "",
  descriptionEn: "",
  descriptionAr: "",
  typeEn: "",
  typeAr: "",
  category: "applications" as "applications" | "tutorials" | "videos",
  articleBodyEn: "",
  articleBodyAr: "",
  href: "https://",
  imageKey: null as string | null,
  sortOrder: 0,
  isPublished: true,
};

type ProjectDraft = typeof emptyProject;

const emptySocial = {
  platformEn: "",
  platformAr: "",
  handleEn: "",
  handleAr: "",
  href: "https://",
  sortOrder: 0,
  isPublished: true,
};

type SocialDraft = typeof emptySocial;

type ProfileDraft = {
  name: string;
  roleEn: string;
  roleAr: string;
  bioEn: string;
  bioAr: string;
  locationEn: string;
  locationAr: string;
  portraitKey: string;
  coverKey: string;
};

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const utils = trpc.useUtils();
  const ownerCheck = trpc.ownerCheck.useQuery(undefined, { enabled: Boolean(user) });
  const contentQuery = trpc.admin.content.useQuery(undefined, { enabled: ownerCheck.data === true });
  const [profile, setProfile] = useState<ProfileDraft | null>(null);
  const [newProject, setNewProject] = useState<ProjectDraft>(emptyProject);
  const [newSocial, setNewSocial] = useState<SocialDraft>(emptySocial);
  const [autoGithubSync, setAutoGithubSync] = useState(false);
  const [activeContentType, setActiveContentType] = useState<"all" | "applications" | "tutorials" | "videos">("all");
  const [mediaDrafts, setMediaDrafts] = useState<Record<number, { source: string; placement: "start" | "middle" | "end" }>>({});
  const [notice, setNotice] = useState<{ message: string; kind: "success" | "error" } | null>(null);
  const showNotice = (message: string, kind: "success" | "error" = "success") => {
    setNotice({ message, kind });
    if (kind === "success") toast.success(message);
    else toast.error(message);
  };
  type AutoSyncResult = { autoGithubSync?: boolean; githubSync?: unknown; githubSyncError?: string };
  const showSaveNotice = (action: Parameters<typeof getAdminNotice>[0], result?: unknown) => {
    const syncResult = result as AutoSyncResult | undefined;
    if (syncResult?.githubSyncError) return showNotice(getAdminNotice("githubAutoSyncRun", "error"), "error");
    if (syncResult?.autoGithubSync && syncResult.githubSync) return showNotice(getAdminNotice("githubAutoSyncRun", "success"));
    return showNotice(getAdminNotice(action, "success"));
  };

  const uploadAsset = trpc.admin.uploadAsset.useMutation({
    onSuccess: (result, variables) => {
      setProfile((current) => current ? { ...current, [`${variables.target}Key`]: result.key } : current);
      showNotice(getAdminNotice("assetUpload", "success"));
    },
    onError: () => showNotice(getAdminNotice("assetUpload", "error"), "error"),
  });

  const handleUpload = (file: File, target: "portrait" | "cover") => {
    const reader = new FileReader();
    reader.onload = () => {
      const encoded = String(reader.result).split(",")[1];
      if (encoded) uploadAsset.mutate({ fileName: file.name, mimeType: file.type || "application/octet-stream", data: encoded, target });
      else showNotice("The selected image could not be read.", "error");
    };
    reader.onerror = () => showNotice("The selected image could not be read.", "error");
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!contentQuery.data?.profile) return;
    const item = contentQuery.data.profile;
    setAutoGithubSync(contentQuery.data.autoGithubSync);
    setProfile({
      name: item.name,
      roleEn: item.roleEn,
      roleAr: item.roleAr,
      bioEn: item.bioEn,
      bioAr: item.bioAr,
      locationEn: item.locationEn,
      locationAr: item.locationAr,
      portraitKey: item.portraitKey ?? "",
      coverKey: item.coverKey ?? "",
    });
  }, [contentQuery.data?.profile, contentQuery.data?.autoGithubSync]);

  const saveProfile = trpc.admin.updateProfile.useMutation({
    onSuccess: (result) => {
      showSaveNotice("profileSave", result);
      void utils.admin.content.invalidate();
    },
    onError: () => showNotice(getAdminNotice("profileSave", "error"), "error"),
  });
  const createProject = trpc.admin.createProject.useMutation({
    onSuccess: (result) => {
      setNewProject(emptyProject);
      showSaveNotice("projectCreate", result);
      void utils.admin.content.invalidate();
    },
    onError: () => showNotice(getAdminNotice("projectCreate", "error"), "error"),
  });
  const updateProject = trpc.admin.updateProject.useMutation({
    onSuccess: (result) => {
      showSaveNotice("projectUpdate", result);
      void utils.admin.content.invalidate();
    },
    onError: () => showNotice(getAdminNotice("projectUpdate", "error"), "error"),
  });
  const uploadProjectAsset = trpc.admin.uploadAsset.useMutation({
    onSuccess: async (result, variables) => {
      if (variables.projectId) {
        const saveResult = await bindUploadedProjectImage({
          projectId: variables.projectId,
          imageKey: result.key,
          updateProject: (input) => updateProject.mutateAsync(input),
          caches: { admin: utils.admin, public: utils.content },
        });
        showSaveNotice("projectImageUpload", saveResult);
      } else {
        await Promise.all([utils.admin.content.invalidate(), utils.content.invalidate()]);
        showNotice(getAdminNotice("projectImageUpload", "success"));
      }
    },
    onError: () => showNotice(getAdminNotice("projectImageUpload", "error"), "error"),
  });

  const handleProjectUpload = (file: File, projectId: number) => {
    const reader = new FileReader();
    reader.onload = () => {
      const encoded = String(reader.result).split(",")[1];
      if (encoded) uploadProjectAsset.mutate({ fileName: file.name, mimeType: file.type || "application/octet-stream", data: encoded, target: "project", projectId });
      else showNotice("The selected project image could not be read.", "error");
    };
    reader.onerror = () => showNotice("The selected project image could not be read.", "error");
    reader.readAsDataURL(file);
  };

  const createProjectMedia = trpc.admin.createProjectMedia.useMutation({
    onSuccess: (result) => {
      showSaveNotice("projectUpdate", result);
      void Promise.all([utils.admin.content.invalidate(), utils.content.invalidate()]);
    },
    onError: () => showNotice("Could not add the article media. Please try again.", "error"),
  });
  const deleteProjectMedia = trpc.admin.deleteProjectMedia.useMutation({
    onSuccess: (result) => {
      showSaveNotice("projectUpdate", result);
      void Promise.all([utils.admin.content.invalidate(), utils.content.invalidate()]);
    },
    onError: () => showNotice("Could not remove the article media. Please try again.", "error"),
  });
  const uploadArticleAsset = trpc.admin.uploadAsset.useMutation({
    onSuccess: async (result, variables) => {
      if (!variables.projectId) return;
      const draft = mediaDrafts[variables.projectId] ?? { source: "", placement: "middle" as const };
      await createProjectMedia.mutateAsync({ projectId: variables.projectId, kind: "image", source: result.key, placement: draft.placement, captionEn: "", captionAr: "", sortOrder: 0 });
    },
    onError: () => showNotice("The article image could not be uploaded.", "error"),
  });
  const handleArticleMediaUpload = (file: File, projectId: number) => {
    const reader = new FileReader();
    reader.onload = () => {
      const encoded = String(reader.result).split(",")[1];
      if (encoded) uploadArticleAsset.mutate({ fileName: file.name, mimeType: file.type || "application/octet-stream", data: encoded, target: "article", projectId });
      else showNotice("The selected image could not be read.", "error");
    };
    reader.onerror = () => showNotice("The selected image could not be read.", "error");
    reader.readAsDataURL(file);
  };

  const deleteProject = trpc.admin.deleteProject.useMutation({
    onSuccess: (result) => {
      showSaveNotice("projectDelete", result);
      void utils.admin.content.invalidate();
    },
    onError: () => showNotice(getAdminNotice("projectDelete", "error"), "error"),
  });
  const createSocialLink = trpc.admin.createSocialLink.useMutation({
    onSuccess: (result) => {
      setNewSocial(emptySocial);
      showSaveNotice("socialUpdate", result);
      void utils.admin.content.invalidate();
    },
    onError: () => showNotice("Could not add the social link. Check the URL and try again.", "error"),
  });
  const updateSocialLink = trpc.admin.updateSocialLink.useMutation({
    onSuccess: (result) => {
      showSaveNotice("socialUpdate", result);
      void utils.admin.content.invalidate();
    },
    onError: () => showNotice(getAdminNotice("socialUpdate", "error"), "error"),
  });
  const deleteSocialLink = trpc.admin.deleteSocialLink.useMutation({
    onSuccess: (result) => {
      showSaveNotice("socialUpdate", result);
      void utils.admin.content.invalidate();
    },
    onError: () => showNotice("Could not remove the social link. Please try again.", "error"),
  });
  const syncGithub = trpc.admin.syncGithub.useMutation({
    onSuccess: () => showNotice(getAdminNotice("githubSync", "success")),
    onError: () => showNotice(getAdminNotice("githubSync", "error"), "error"),
  });
  const updateAutoSync = trpc.admin.setAutoGithubSync.useMutation({
    onSuccess: (enabled) => {
      setAutoGithubSync(enabled);
      showNotice(getAdminNotice("githubAutoSync", "success"));
      void utils.admin.content.invalidate();
    },
    onError: () => {
      setAutoGithubSync((current) => !current);
      showNotice(getAdminNotice("githubAutoSync", "error"), "error");
    },
  });

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  if (!user) {
    return <DashboardLayout><div className="mx-auto flex min-h-[50vh] max-w-md items-center justify-center text-center"><p className="text-muted-foreground">Sign in to access the control room.</p></div></DashboardLayout>;
  }

  if (ownerCheck.isLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  if (ownerCheck.isError || ownerCheck.data !== true) {
    return <div className="flex min-h-screen items-center justify-center bg-muted/20 p-6 text-center"><div><h1 className="text-2xl font-semibold">Owner access required</h1><p className="mt-2 text-muted-foreground">This control room is private to the designated site owner.</p></div></div>;
  }

  if (contentQuery.isError) {
    return <div className="flex min-h-screen items-center justify-center bg-muted/20 p-6 text-center"><div><h1 className="text-2xl font-semibold">Owner access required</h1><p className="mt-2 text-muted-foreground">This control room is private to the designated site owner.</p></div></div>;
  }

  if (contentQuery.isLoading || !contentQuery.data || !profile) {
    return <DashboardLayout><div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="animate-spin" /></div></DashboardLayout>;
  }

  const data = contentQuery.data;
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Khairy Eid Aly / Admin</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Content control room</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Update the public card without touching code. Only the authenticated owner can access these controls.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {notice && <AdminNoticeBanner message={notice.message} kind={notice.kind} />}
            <Button type="button" variant="outline" onClick={() => syncGithub.mutate()} disabled={syncGithub.isPending}>
              {syncGithub.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Github className="mr-2 h-4 w-4" />}
              {syncGithub.isPending ? "Syncing…" : "Sync with GitHub"}
            </Button>
          </div>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium">Automatic GitHub sync</p>
              <p className="text-sm text-muted-foreground">After every successful save, publish the latest content snapshot automatically.</p>
            </div>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border bg-background px-3 text-sm font-medium">
              <input
                type="checkbox"
                checked={autoGithubSync}
                disabled={updateAutoSync.isPending}
                onChange={(event) => {
                  const enabled = event.target.checked;
                  setAutoGithubSync(enabled);
                  updateAutoSync.mutate({ enabled });
                }}
              />
              {updateAutoSync.isPending ? "Saving…" : autoGithubSync ? "Enabled" : "Disabled"}
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Profile and visual identity</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {([
              ["name", "Name"], ["roleEn", "Role · English"], ["roleAr", "المسمى · العربية"],
              ["locationEn", "Location · English"], ["locationAr", "الموقع · العربية"],
              ["portraitKey", "Portrait storage key"], ["coverKey", "Cover storage key"],
            ] as const).map(([key, label]) => (
              <label key={key} className="grid gap-1.5 text-sm font-medium">
                {label}
                <Input value={profile[key]} onChange={(event) => setProfile({ ...profile, [key]: event.target.value })} />
              </label>
            ))}
            <label className="grid gap-1.5 text-sm font-medium">Bio · English<Textarea rows={4} value={profile.bioEn} onChange={(event) => setProfile({ ...profile, bioEn: event.target.value })} /></label>
            <label className="grid gap-1.5 text-sm font-medium">النبذة · العربية<Textarea dir="rtl" rows={4} value={profile.bioAr} onChange={(event) => setProfile({ ...profile, bioAr: event.target.value })} /></label>
            <div className="md:col-span-2 grid gap-3 sm:grid-cols-2">
              {(["portrait", "cover"] as const).map((target) => (
                <label key={target} className="flex cursor-pointer items-center justify-between rounded-lg border border-dashed p-3 text-sm text-muted-foreground hover:border-primary">
                  <span className="flex items-center gap-2"><Upload className="h-4 w-4" />Upload {target}</span>
                  <input className="sr-only" type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) handleUpload(file, target); }} />
                </label>
              ))}
            </div>
            <div className="md:col-span-2"><Button onClick={() => saveProfile.mutate({ ...profile, portraitKey: profile.portraitKey || null, coverKey: profile.coverKey || null })} disabled={saveProfile.isPending}><Save className="mr-2 h-4 w-4" />Save profile</Button></div>
          </CardContent>
        </Card>

        <section className="space-y-4" aria-labelledby="simple-editor-title">
          <div><p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Blogger-style editor</p><h2 id="simple-editor-title" className="mt-1 text-2xl font-semibold">Write once, then choose where it appears</h2><p className="mt-1 max-w-3xl text-sm text-muted-foreground">Create the title, cover, summary, and full content in one place. Choose the public section only when you are ready to publish.</p></div>
          <Card className="border-primary/20">
            <CardContent className="space-y-4 p-5">
              <div className="grid gap-3 md:grid-cols-2"><label className="grid gap-1.5 text-sm font-medium">عنوان المحتوى<input className="h-10 rounded-md border bg-background px-3" dir="rtl" value={newProject.titleAr} onChange={(event) => setNewProject({ ...newProject, titleAr: event.target.value })} placeholder="عنوان المقال أو اللعبة أو الفيديو" /></label><label className="grid gap-1.5 text-sm font-medium">English title <Input value={newProject.titleEn} onChange={(event) => setNewProject({ ...newProject, titleEn: event.target.value })} placeholder="Optional English title" /></label></div>
              <label className="grid gap-1.5 text-sm font-medium">وصف مختصر للبطاقة والنافذة العائمة<Textarea dir="rtl" rows={3} value={newProject.descriptionAr} onChange={(event) => setNewProject({ ...newProject, descriptionAr: event.target.value })} placeholder="وصف قصير يظهر في البطاقة ثم في نافذة التفاصيل" /></label>
              <label className="grid gap-1.5 text-sm font-medium">Short description · English<Textarea rows={3} value={newProject.descriptionEn} onChange={(event) => setNewProject({ ...newProject, descriptionEn: event.target.value })} placeholder="Optional English summary" /></label>
              <label className="grid gap-1.5 text-sm font-medium">نص المقال والمحتوى الكامل<RichTextEditor value={newProject.articleBodyAr} onChange={(articleBodyAr) => setNewProject({ ...newProject, articleBodyAr })} placeholder="اكتب المحتوى هنا… استخدم شريط الأدوات للعناوين والتنسيق والقوائم والروابط والصور والفيديو." dir="rtl" /></label>
              <label className="grid gap-1.5 text-sm font-medium">Full content · English<RichTextEditor value={newProject.articleBodyEn} onChange={(articleBodyEn) => setNewProject({ ...newProject, articleBodyEn })} placeholder="Optional English content…" dir="ltr" /></label>
              <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground"><strong className="text-foreground">صورة الغلاف:</strong> انشر المقال أولًا، ثم استخدم زر <em>Upload cover</em> بجواره في قائمة المنشورات أدناه. الصور والفيديوهات داخل النص تُضاف من شريط المحرر.</div>
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"><label className="grid gap-1.5 text-sm font-medium">القسم عند النشر<select className="h-10 rounded-md border bg-background px-3 text-sm" value={newProject.category} onChange={(event) => setNewProject({ ...newProject, category: event.target.value as ProjectDraft["category"] })}>{workCategoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label className="grid gap-1.5 text-sm font-medium">رابط إضافي أو مصدر (اختياري)<Input value={newProject.href} onChange={(event) => setNewProject({ ...newProject, href: event.target.value })} placeholder="https://…" /></label><Button className="self-end" onClick={() => createProject.mutate({ ...newProject, titleEn: newProject.titleEn || newProject.titleAr, descriptionEn: newProject.descriptionEn || newProject.descriptionAr, typeEn: "Content", typeAr: "محتوى", href: newProject.href.startsWith("http") ? newProject.href : "https://khairyeldelar.github.io/khairy-digital-profile/" })} disabled={createProject.isPending || !newProject.titleAr.trim() || !newProject.descriptionAr.trim()}>{createProject.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Publish</Button></div>
            </CardContent>
          </Card>
          <Card><CardHeader><CardTitle className="text-base">Published content</CardTitle></CardHeader><CardContent className="divide-y">{data.projects.map((project) => <div key={project.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-medium">{project.titleAr || project.titleEn}</p><p className="text-xs text-muted-foreground">{workCategoryOptions.find((option) => option.value === project.category)?.label}</p></div><div className="flex flex-wrap gap-2"><label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-xs"><Upload className="h-3.5 w-3.5" />Upload cover<input className="sr-only" type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) handleProjectUpload(file, project.id); }} /></label><Button type="button" variant="outline" size="sm" onClick={() => updateProject.mutate({ id: project.id, data: { isPublished: !project.isPublished } })}>{project.isPublished ? "Hide" : "Publish"}</Button><Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => deleteProject.mutate({ id: project.id })}><Trash2 className="mr-1 h-3.5 w-3.5" />Delete</Button></div></div>)}</CardContent></Card>
        </section>

        <section className="hidden" aria-hidden="true">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Content studio</p><h2 className="mt-1 text-2xl font-semibold">Articles, applications, and videos</h2><p className="mt-1 text-sm text-muted-foreground">Choose a workflow, then update its cover, title, details, destination, and published state.</p></div><div className="flex flex-wrap gap-2">{([{ value: "all", label: "All" }, ...workCategoryOptions] as const).map((option) => <Button type="button" key={option.value} size="sm" variant={activeContentType === option.value ? "default" : "outline"} onClick={() => setActiveContentType(option.value)}>{option.label}</Button>)}</div></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.projects.filter((project) => activeContentType === "all" || project.category === activeContentType).map((project) => (
              <Card key={project.id}>
                <CardHeader><CardTitle className="flex items-center justify-between text-base"><span>{workCategoryOptions.find((option) => option.value === project.category)?.label} · {project.titleEn}</span><span className="text-xs text-muted-foreground">#{project.sortOrder}</span></CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Input defaultValue={project.titleEn} onBlur={(e) => updateProject.mutate({ id: project.id, data: { titleEn: e.target.value } })} placeholder="Title · English" />
                  <Input dir="rtl" defaultValue={project.titleAr} onBlur={(e) => updateProject.mutate({ id: project.id, data: { titleAr: e.target.value } })} placeholder="العنوان · العربية" />
                  <label className="grid gap-1.5 text-sm font-medium">Work category
                    <select className="h-10 rounded-md border bg-background px-3 text-sm" value={project.category === "tutorials" || project.category === "videos" ? project.category : "applications"} onChange={(e) => updateProject.mutate({ id: project.id, data: { category: e.target.value as "applications" | "tutorials" | "videos" } })}>
                      {workCategoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </label>
                  <Textarea defaultValue={project.descriptionEn} onBlur={(e) => updateProject.mutate({ id: project.id, data: { descriptionEn: e.target.value } })} placeholder="Description · English" />
                  <Textarea dir="rtl" defaultValue={project.descriptionAr} onBlur={(e) => updateProject.mutate({ id: project.id, data: { descriptionAr: e.target.value } })} placeholder="الوصف · العربية" />
                  {project.category === "tutorials" && <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                    <div><p className="text-sm font-semibold">Article editor / محرر المقال</p><p className="text-xs text-muted-foreground">The title and cover appear first, then the body and your selected inline media.</p></div>
                    <Textarea defaultValue={project.articleBodyEn} onBlur={(e) => updateProject.mutate({ id: project.id, data: { articleBodyEn: e.target.value } })} placeholder="Article body · English" rows={8} />
                    <Textarea dir="rtl" defaultValue={project.articleBodyAr} onBlur={(e) => updateProject.mutate({ id: project.id, data: { articleBodyAr: e.target.value } })} placeholder="نص المقال · العربية" rows={8} />
                    <div className="space-y-2 rounded-md border bg-background p-3"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Inline media / صور وفيديو داخل المقال</p>
                      {(project.media ?? []).map((media) => <div key={media.id} className="flex items-center justify-between gap-2 rounded border p-2 text-xs"><span>{media.kind} · {media.placement}</span><Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => deleteProjectMedia.mutate({ id: media.id })}><Trash2 className="mr-1 h-3.5 w-3.5" />Remove</Button></div>)}
                      <div className="grid gap-2 sm:grid-cols-[1fr_auto]"><Input value={mediaDrafts[project.id]?.source ?? ""} onChange={(event) => setMediaDrafts((current) => ({ ...current, [project.id]: { source: event.target.value, placement: current[project.id]?.placement ?? "middle" } }))} placeholder="YouTube URL for an inline video" /><Button type="button" variant="outline" size="sm" disabled={!mediaDrafts[project.id]?.source} onClick={() => createProjectMedia.mutate({ projectId: project.id, kind: "youtube", source: mediaDrafts[project.id]?.source ?? "", placement: mediaDrafts[project.id]?.placement ?? "middle", captionEn: "", captionAr: "", sortOrder: 0 })}><Youtube className="mr-1 h-3.5 w-3.5" />Add video</Button></div>
                      <div className="flex flex-wrap items-center gap-2"><select className="h-9 rounded-md border bg-background px-2 text-xs" value={mediaDrafts[project.id]?.placement ?? "middle"} onChange={(event) => setMediaDrafts((current) => ({ ...current, [project.id]: { source: current[project.id]?.source ?? "", placement: event.target.value as "start" | "middle" | "end" } }))}><option value="start">Start / بداية</option><option value="middle">Middle / وسط</option><option value="end">End / نهاية</option></select><label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground"><ImagePlus className="h-3.5 w-3.5" />Upload inline image<input className="sr-only" type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) handleArticleMediaUpload(file, project.id); }} /></label></div>
                    </div>
                  </div>}
                  {project.category === "applications" && <p className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">Application card: cover image and title on the grid. The public details dialog uses the description below and this link as the download or store action.</p>}
                  {project.category === "videos" && <p className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">Video card: cover image and title on the grid. Paste a YouTube link below; opening the card goes to a dedicated video page.</p>}
                  <Input defaultValue={project.href} onBlur={(e) => updateProject.mutate({ id: project.id, data: { href: e.target.value } })} placeholder={project.category === "videos" ? "YouTube video URL" : project.category === "applications" ? "Store or download URL" : "Source URL"} />
                  <Input defaultValue={project.imageKey ?? ""} onBlur={(e) => updateProject.mutate({ id: project.id, data: { imageKey: e.target.value || null } })} placeholder="Managed image key (optional)" />
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground"><Upload className="h-3.5 w-3.5" />Upload {project.category === "tutorials" ? "article cover" : project.category === "videos" ? "video cover" : "application cover"}<input className="sr-only" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleProjectUpload(file, project.id); }} /></label>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" defaultChecked={project.isPublished} onChange={(e) => updateProject.mutate({ id: project.id, data: { isPublished: e.target.checked } })} /> Show on public card</label>
                  <div className="flex justify-end"><Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteProject.mutate({ id: project.id })}><Trash2 className="mr-2 h-4 w-4" />Delete</Button></div>
                </CardContent>
              </Card>
            ))}
            <Card className="border-dashed">
              <CardHeader><CardTitle className="text-base">Add project</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input value={newProject.titleEn} onChange={(e) => setNewProject({ ...newProject, titleEn: e.target.value })} placeholder="Title · English" />
                <Input dir="rtl" value={newProject.titleAr} onChange={(e) => setNewProject({ ...newProject, titleAr: e.target.value })} placeholder="العنوان · العربية" />
                <label className="grid gap-1.5 text-sm font-medium">Work category
                  <select className="h-10 rounded-md border bg-background px-3 text-sm" value={newProject.category} onChange={(e) => setNewProject({ ...newProject, category: e.target.value as ProjectDraft["category"] })}>
                    {workCategoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <Textarea value={newProject.descriptionEn} onChange={(e) => setNewProject({ ...newProject, descriptionEn: e.target.value })} placeholder="Description · English" />
                <Textarea dir="rtl" value={newProject.descriptionAr} onChange={(e) => setNewProject({ ...newProject, descriptionAr: e.target.value })} placeholder="الوصف · العربية" />
                {newProject.category === "tutorials" && (
                  <>
                    <Textarea value={newProject.articleBodyEn} onChange={(e) => setNewProject({ ...newProject, articleBodyEn: e.target.value })} placeholder="Article body · English" rows={6} />
                    <Textarea dir="rtl" value={newProject.articleBodyAr} onChange={(e) => setNewProject({ ...newProject, articleBodyAr: e.target.value })} placeholder="نص المقال · العربية" rows={6} />
                  </>
                )}
                <Input value={newProject.typeEn} onChange={(e) => setNewProject({ ...newProject, typeEn: e.target.value })} placeholder="Type · English" />
                <Input dir="rtl" value={newProject.typeAr} onChange={(e) => setNewProject({ ...newProject, typeAr: e.target.value })} placeholder="النوع · العربية" />
                <Input value={newProject.href} onChange={(e) => setNewProject({ ...newProject, href: e.target.value })} placeholder="Project URL" />
                <Button onClick={() => createProject.mutate(newProject)} disabled={createProject.isPending || !newProject.titleEn || !newProject.titleAr}>Add project</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <Card>
          <CardHeader><CardTitle>Social links</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-dashed p-4">
              <p className="mb-3 text-sm font-medium">Add a custom platform</p>
              <div className="grid gap-3 md:grid-cols-2">
                <Input value={newSocial.platformEn} onChange={(e) => setNewSocial({ ...newSocial, platformEn: e.target.value })} placeholder="Platform name · English" />
                <Input dir="rtl" value={newSocial.platformAr} onChange={(e) => setNewSocial({ ...newSocial, platformAr: e.target.value })} placeholder="اسم المنصة · العربية" />
                <Input value={newSocial.href} onChange={(e) => setNewSocial({ ...newSocial, href: e.target.value })} placeholder="https://platform.example/your-name" />
                <Input value={newSocial.handleEn} onChange={(e) => setNewSocial({ ...newSocial, handleEn: e.target.value })} placeholder="Short description · English" />
                <Input dir="rtl" value={newSocial.handleAr} onChange={(e) => setNewSocial({ ...newSocial, handleAr: e.target.value })} placeholder="نبذة قصيرة · العربية" />
                <Input type="number" min={0} value={newSocial.sortOrder} onChange={(e) => setNewSocial({ ...newSocial, sortOrder: Number(e.target.value) || 0 })} placeholder="Display order" />
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={newSocial.isPublished} onChange={(e) => setNewSocial({ ...newSocial, isPublished: e.target.checked })} /> Published on public profile</label>
              </div>
              <Button className="mt-3" onClick={() => createSocialLink.mutate(newSocial)} disabled={createSocialLink.isPending || !newSocial.platformEn.trim() || !newSocial.platformAr.trim() || !newSocial.handleEn.trim() || !newSocial.handleAr.trim() || !newSocial.href.trim()}>
                {createSocialLink.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Add platform
              </Button>
            </div>
            {data.socialLinks.map((link) => (
              <div key={link.id} className="grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr_1fr_1fr_1fr_2fr_auto_auto] md:items-center">
                <Input defaultValue={link.platformEn || link.platform} onBlur={(e) => updateSocialLink.mutate({ id: link.id, data: { platformEn: e.target.value, platformAr: link.platformAr || link.platform, handleEn: link.handleEn, handleAr: link.handleAr, href: link.href, sortOrder: link.sortOrder, isPublished: link.isPublished } })} placeholder="Platform name · English" />
                <Input dir="rtl" defaultValue={link.platformAr || link.platformEn || link.platform} onBlur={(e) => updateSocialLink.mutate({ id: link.id, data: { platformEn: link.platformEn || link.platform, platformAr: e.target.value, handleEn: link.handleEn, handleAr: link.handleAr, href: link.href, sortOrder: link.sortOrder, isPublished: link.isPublished } })} placeholder="اسم المنصة · العربية" />
                <Input defaultValue={link.handleEn} onBlur={(e) => updateSocialLink.mutate({ id: link.id, data: { platformEn: link.platformEn || link.platform, platformAr: link.platformAr || link.platform, handleEn: e.target.value, handleAr: link.handleAr, href: link.href, sortOrder: link.sortOrder, isPublished: link.isPublished } })} placeholder="Short description · English" />
                <Input dir="rtl" defaultValue={link.handleAr} onBlur={(e) => updateSocialLink.mutate({ id: link.id, data: { platformEn: link.platformEn || link.platform, platformAr: link.platformAr || link.platform, handleEn: link.handleEn, handleAr: e.target.value, href: link.href, sortOrder: link.sortOrder, isPublished: link.isPublished } })} placeholder="نبذة قصيرة · العربية" />
                <Input defaultValue={link.href} onBlur={(e) => updateSocialLink.mutate({ id: link.id, data: { platformEn: link.platformEn || link.platform, platformAr: link.platformAr || link.platform, handleEn: link.handleEn, handleAr: link.handleAr, href: e.target.value, sortOrder: link.sortOrder, isPublished: link.isPublished } })} placeholder="URL" />
                <span className="text-xs text-muted-foreground">{link.isPublished ? "Published" : "Hidden"}</span>
                <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => deleteSocialLink.mutate({ id: link.id })} aria-label={`Delete ${link.platformEn || link.platform}`}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
