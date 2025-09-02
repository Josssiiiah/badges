import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Loader2, Plus, Pencil, Trash } from "lucide-react";
import { fetchWithAuth } from "@/lib/api-client";

type Badge = {
  id: string;
  issuedBy: string;
  name: string;
  description: string | null;
  imageData: string;
  courseLink: string | null;
  skills: string | null;
  earningCriteria: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export function BadgesDashboard({ badges = [] }: { badges: Badge[] }) {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [issuedBy, setIssuedBy] = useState("");
  const [courseLink, setCourseLink] = useState("");
  const [skills, setSkills] = useState("");
  const [earningCriteria, setEarningCriteria] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const { toast } = useToast();

  // Upload badge mutation
  const uploadBadge = useMutation<Badge, Error, void>({
    mutationFn: async () => {
      if (!image) throw new Error("No image selected");
      const formData = new FormData();
      formData.append("name", name);
      formData.append("issuedBy", issuedBy);
      if (description) formData.append("description", description);
      if (courseLink) formData.append("courseLink", courseLink);
      if (skills) formData.append("skills", skills);
      if (earningCriteria) formData.append("earningCriteria", earningCriteria);
      formData.append("image", image);

      const response = await fetchWithAuth("badges/upload", {
        method: "POST",
        body: formData,
        headers: {}, // Remove Content-Type to let browser set it with boundary for FormData
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to upload badge");
      }
      return data.badge;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      resetForm();
      setIsCreateOpen(false);

      toast({
        title: "Success",
        description: `Badge '${data.name}' uploaded successfully!`,
      });
    },
    onError: (error: Error) => {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload Error",
        description:
          error.message || "Failed to upload badge. Please try again.",
      });
    },
  });

  // Edit badge mutation (reusing the same endpoint for now, but could be modified for PUT requests)
  const editBadge = useMutation<Badge, Error, void>({
    mutationFn: async () => {
      if (!editingBadge) throw new Error("No badge selected for editing");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("issuedBy", issuedBy);
      if (description) formData.append("description", description);
      if (courseLink) formData.append("courseLink", courseLink);
      if (skills) formData.append("skills", skills);
      if (earningCriteria) formData.append("earningCriteria", earningCriteria);

      // Only append image if a new one was selected
      if (image) {
        formData.append("image", image);
      }

      const response = await fetchWithAuth(`badges/update/${editingBadge.id}`, {
        method: "PUT",
        body: formData,
        headers: {}, // Remove Content-Type to let browser set it with boundary for FormData
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to update badge");
      }
      return data.badge;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      resetForm();
      setIsEditOpen(false);
      setEditingBadge(null);

      toast({
        title: "Success",
        description: `Badge '${data.name}' updated successfully!`,
      });
    },
    onError: (error: Error) => {
      console.error("Update error:", error);
      toast({
        variant: "destructive",
        title: "Update Error",
        description:
          error.message || "Failed to update badge. Please try again.",
      });
    },
  });

  // Delete badge mutation
  const deleteBadge = useMutation<void, Error, string>({
    mutationFn: async (badgeId: string) => {
      const response = await fetchWithAuth(`badges/delete/${badgeId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to delete badge");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      setIsEditOpen(false);
      setIsDeleteConfirmVisible(false);
      setEditingBadge(null);

      toast({
        title: "Success",
        description: "Badge deleted successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Delete error:", error);
      toast({
        variant: "destructive",
        title: "Delete Error",
        description:
          error.message || "Failed to delete badge. Please try again.",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please select an image file (PNG, JPG, GIF).",
        });
        setImage(null);
        e.target.value = "";
        return;
      }
      setImage(file);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !image) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide a badge name and select an image.",
      });
      return;
    }
    uploadBadge.mutate();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide a badge name.",
      });
      return;
    }
    editBadge.mutate();
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setIssuedBy("");
    setCourseLink("");
    setSkills("");
    setEarningCriteria("");
    setImage(null);
    const fileInput = document.getElementById("image") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const openEditDialog = (badge: Badge) => {
    setEditingBadge(badge);
    setName(badge.name);
    setDescription(badge.description || "");
    setIssuedBy(badge.issuedBy);
    setCourseLink(badge.courseLink || "");
    setSkills(badge.skills || "");
    setEarningCriteria(badge.earningCriteria || "");
    setIsEditOpen(true);
  };

  const handleDeleteClick = () => {
    if (editingBadge) {
      setIsDeleteConfirmVisible(true);
    }
  };

  const confirmDelete = () => {
    if (editingBadge) {
      deleteBadge.mutate(editingBadge.id);
    }
  };

  const cancelDelete = () => {
    setIsDeleteConfirmVisible(false);
  };

  const renderBadgeForm = (
    isEdit = false,
    onSubmit: (e: React.FormEvent) => void,
  ) => {
    const isPending = isEdit ? editBadge.isPending : uploadBadge.isPending;
    const isDeleting = deleteBadge.isPending;

    return (
      <form onSubmit={onSubmit}>
        <div className="space-y-4 py-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Badge Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Python Master"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issuedBy">
                Issued By
              </Label>
              <Input
                id="issuedBy"
                value={issuedBy}
                onChange={(e) => setIssuedBy(e.target.value)}
                placeholder="e.g., Code Academy"
                required
                disabled={isPending}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description of the badge"
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="courseLink">
              Course Link
            </Label>
            <Input
              id="courseLink"
              value={courseLink}
              onChange={(e) => setCourseLink(e.target.value)}
              placeholder="https://example.com/course"
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skills">
              Skills
            </Label>
            <Input
              id="skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g., Python, Data Structures, Algorithms"
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="earningCriteria">
              Earning Criteria
            </Label>
            <Input
              id="earningCriteria"
              value={earningCriteria}
              onChange={(e) => setEarningCriteria(e.target.value)}
              placeholder="e.g., Complete all course modules with 80% or higher"
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">
              Badge Image
            </Label>
            <Input
              id="image"
              type="file"
              accept="image/png, image/jpeg, image/gif"
              onChange={handleFileChange}
              required={!isEdit || !editingBadge?.imageData}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
              disabled={isPending}
            />
            {editingBadge && !image && isEdit && (
              <p className="text-sm text-text-muted">
                Using existing image. Upload a new one to replace it.
              </p>
            )}
            {image && (
              <p className="text-sm text-text-muted">
                Selected: {image.name}
              </p>
            )}
          </div>
        </div>
        <DialogFooter className={isEdit ? "justify-between" : ""}>
          {isEdit && (
            <>
              {!isDeleteConfirmVisible ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash className="mr-2 h-4 w-4" />
                  )}
                  Delete Badge
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-destructive font-medium mr-2">
                    Confirm delete?
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={cancelDelete}
                    className="h-8"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="h-8"
                  >
                    {isDeleting ? (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    ) : (
                      <Trash className="mr-2 h-3 w-3" />
                    )}
                    Confirm
                  </Button>
                </div>
              )}
            </>
          )}
          <div className="flex space-x-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={
                isPending || (!isEdit && (!image || !name || !issuedBy))
              }
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? "Updating..." : "Uploading..."}
                </>
              ) : (
                <>
                  {isEdit ? (
                    <>
                      <Pencil className="mr-2 h-4 w-4" />
                      Update Badge
                    </>
                  ) : (
                    <>
                      <UploadCloud className="mr-2 h-4 w-4" />
                      Create Badge
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-text">
        Badges
      </h2>

      {/* Create Badge Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px] bg-surface border border-gray-light">
          <DialogHeader>
            <DialogTitle>
              Create New Badge
            </DialogTitle>
            <DialogDescription>
              Create a new badge by providing the required information.
            </DialogDescription>
          </DialogHeader>
          {renderBadgeForm(false, handleCreateSubmit)}
        </DialogContent>
      </Dialog>

      {/* Edit Badge Dialog */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setIsDeleteConfirmVisible(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] bg-surface border border-gray-light">
          <DialogHeader>
            <DialogTitle>
              Edit Badge
            </DialogTitle>
            <DialogDescription>
              Update the badge information.
            </DialogDescription>
          </DialogHeader>
          {renderBadgeForm(true, handleEditSubmit)}
        </DialogContent>
      </Dialog>

      {/* Badge Grid Card */}
      <Card className="bg-surface-accent/50 border-gray-light">
        <CardHeader>
          <CardTitle>Available Badges</CardTitle>
          <CardDescription>
            Browse and manage your badge templates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Create New Badge Card */}
            <Card
              className="overflow-hidden border-dashed border-2 border-gray-light cursor-pointer group h-full flex flex-col bg-surface-accent/30 hover:bg-surface-accent/60 transition-all hover:shadow-lg hover:scale-[1.02]"
              onClick={() => {
                resetForm();
                setIsCreateOpen(true);
              }}
            >
              <CardContent className="p-0 flex-1 aspect-square flex items-center justify-center bg-muted/10 group-hover:bg-muted/20 transition-colors">
                <div className="flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                  <Plus className="h-12 w-12 mb-2 text-text-muted" />
                  <p className="text-sm font-medium text-text-muted">
                    Create New Badge
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Existing Badges */}
            {badges.map((badge: Badge) => (
              <Card
                key={badge.id}
                className="overflow-hidden border border-gray-light group cursor-pointer h-full bg-surface hover:bg-surface-accent transition-all hover:shadow-lg hover:scale-[1.02]"
                onClick={() => openEditDialog(badge)}
              >
                <CardContent className="p-4 aspect-square flex items-center justify-center bg-surface-accent/30 group-hover:bg-surface-accent/50 transition-colors relative">
                  <img
                    src={badge.imageData}
                    alt={`Badge for ${badge.name}`}
                    className="max-w-[100%] max-h-[100%] object-contain transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil className="h-8 w-8 text-white drop-shadow-lg" />
                  </div>
                </CardContent>
                <CardHeader className="p-3">
                  <CardTitle
                    className="text-base font-medium truncate text-text"
                    title={badge.name}
                  >
                    {badge.name}
                  </CardTitle>
                  {/* <p className="text-sm text-[var(--main-text)]/80">
                    Issued by: {badge.issuedBy}
                  </p> */}
                  {badge.description && (
                    <CardDescription
                      className="text-xs mt-1 line-clamp-1 text-text-muted"
                      title={badge.description}
                    >
                      {badge.description.split(" ").slice(0, 20).join(" ")}
                      {badge.description.split(" ").length > 20 ? "..." : ""}
                    </CardDescription>
                  )}
                  {/* {badge.skills && (
                    <p className="text-xs mt-1 text-[var(--main-text)]/80">
                      Skills: {badge.skills}
                    </p>
                  )} */}
                </CardHeader>
              </Card>
            ))}

            {badges.length === 0 && (
              <div className="col-span-full rounded-lg bg-surface-accent/30 border border-gray-light p-6 text-center">
                <p className="text-text-muted">
                  No badge templates available yet. Click the "Create New Badge"
                  card to get started.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
