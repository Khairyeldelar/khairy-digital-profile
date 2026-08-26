import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { AdminNoticeBanner } from "@/components/AdminNoticeBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAdminNotice } from "@/lib/adminNotifications";
import { trpc } from "@/lib/trpc";
import { Loader2, Save, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const emptyProject = {
  titleEn: "",
  titleAr: "",
  descriptionEn: "",
  descriptionAr: "",
  typeEn: "",
  typeAr: "",
  href: "https://",
  imageKey: null as string | null,
  sortOrder: 0,
  isPublished: true,
};

type ProjectDraft = typeof emptyProject;

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
  const [notice, setNotice] = useState<{ message: string; kind: "success" | "error" } | null>(null);
  const showNotice = (message: string, kind: "success" | "error" = "success") => {
    setNotice({ message, kind });
    if (kind === "success") toast.success(message);
    else toast.error(message);
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
  }, [contentQuery.data?.profile]);

  const saveProfile = trpc.admin.updateProfile.useMutation({
    onSuccess: () => {
      showNotice(getAdminNotice("profileSave", "success"));
      void utils.admin.content.invalidate();
    },
    onError: () => showNotice(getAdminNotice("profileSave", "error"), "error"),
  });
  const createProject = trpc.admin.createProject.useMutation({
    onSuccess: () => {
      setNewProject(emptyProject);
      showNotice(getAdminNotice("projectCreate", "success"));
      void utils.admin.content.invalidate();
    },
    onError: () => showNotice(getAdminNotice("projectCreate", "error"), "error"),
  });
  const updateProject = trpc.admin.updateProject.useMutation({
    onSuccess: () => {
      showNotice(getAdminNotice("projectUpdate", "success"));
      void utils.admin.content.invalidate();
    },
    onError: () => showNotice(getAdminNotice("projectUpdate", "error"), "error"),
  });
  const uploadProjectAsset = trpc.admin.uploadAsset.useMutation({
    onSuccess: (result, variables) => {
      if (variables.projectId) updateProject.mutate({ id: variables.projectId, data: { imageKey: result.key } });
      showNotice(getAdminNotice("projectImageUpload", "success"));
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

  const deleteProject = trpc.admin.deleteProject.useMutation({
    onSuccess: () => {
      showNotice(getAdminNotice("projectDelete", "success"));
      void utils.admin.content.invalidate();
    },
    onError: () => showNotice(getAdminNotice("projectDelete", "error"), "error"),
  });
  const updateSocialLink = trpc.admin.updateSocialLink.useMutation({
    onSuccess: () => {
      showNotice(getAdminNotice("socialUpdate", "success"));
      void utils.admin.content.invalidate();
    },
    onError: () => showNotice(getAdminNotice("socialUpdate", "error"), "error"),
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
          {notice && <AdminNoticeBanner message={notice.message} kind={notice.kind} />}
        </div>

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

        <section className="space-y-3">
          <div><p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Selected work</p><h2 className="mt-1 text-2xl font-semibold">Projects</h2></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.projects.map((project) => (
              <Card key={project.id}>
                <CardHeader><CardTitle className="flex items-center justify-between text-base"><span>{project.titleEn}</span><span className="text-xs text-muted-foreground">#{project.sortOrder}</span></CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Input defaultValue={project.titleEn} onBlur={(e) => updateProject.mutate({ id: project.id, data: { titleEn: e.target.value } })} placeholder="Title · English" />
                  <Input dir="rtl" defaultValue={project.titleAr} onBlur={(e) => updateProject.mutate({ id: project.id, data: { titleAr: e.target.value } })} placeholder="العنوان · العربية" />
                  <Textarea defaultValue={project.descriptionEn} onBlur={(e) => updateProject.mutate({ id: project.id, data: { descriptionEn: e.target.value } })} placeholder="Description · English" />
                  <Textarea dir="rtl" defaultValue={project.descriptionAr} onBlur={(e) => updateProject.mutate({ id: project.id, data: { descriptionAr: e.target.value } })} placeholder="الوصف · العربية" />
                  <Input defaultValue={project.href} onBlur={(e) => updateProject.mutate({ id: project.id, data: { href: e.target.value } })} placeholder="Project URL" />
                  <Input defaultValue={project.imageKey ?? ""} onBlur={(e) => updateProject.mutate({ id: project.id, data: { imageKey: e.target.value || null } })} placeholder="Managed image key (optional)" />
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground"><Upload className="h-3.5 w-3.5" />Upload project image<input className="sr-only" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleProjectUpload(file, project.id); }} /></label>
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
                <Textarea value={newProject.descriptionEn} onChange={(e) => setNewProject({ ...newProject, descriptionEn: e.target.value })} placeholder="Description · English" />
                <Textarea dir="rtl" value={newProject.descriptionAr} onChange={(e) => setNewProject({ ...newProject, descriptionAr: e.target.value })} placeholder="الوصف · العربية" />
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
          <CardContent className="space-y-3">
            {data.socialLinks.map((link) => (
              <div key={link.id} className="grid gap-2 rounded-lg border p-3 md:grid-cols-[120px_1fr_1fr_2fr_auto] md:items-center">
                <strong>{link.platform}</strong>
                <Input defaultValue={link.handleEn} onBlur={(e) => updateSocialLink.mutate({ id: link.id, data: { handleEn: e.target.value, handleAr: link.handleAr, href: link.href, sortOrder: link.sortOrder, isPublished: link.isPublished } })} placeholder="Label · English" />
                <Input dir="rtl" defaultValue={link.handleAr} onBlur={(e) => updateSocialLink.mutate({ id: link.id, data: { handleEn: link.handleEn, handleAr: e.target.value, href: link.href, sortOrder: link.sortOrder, isPublished: link.isPublished } })} placeholder="التسمية · العربية" />
                <Input defaultValue={link.href} onBlur={(e) => updateSocialLink.mutate({ id: link.id, data: { handleEn: link.handleEn, handleAr: link.handleAr, href: e.target.value, sortOrder: link.sortOrder, isPublished: link.isPublished } })} placeholder="URL" />
                <span className="text-xs text-muted-foreground">{link.isPublished ? "Published" : "Hidden"}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
