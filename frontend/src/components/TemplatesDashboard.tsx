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
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Loader2 } from "lucide-react";
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

export function TemplatesDashboard({ badges = [] }: { badges: Badge[] }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [issuedBy, setIssuedBy] = useState("");
  const [courseLink, setCourseLink] = useState("");
  const [skills, setSkills] = useState("");
  const [earningCriteria, setEarningCriteria] = useState("");
  const [image, setImage] = useState<File | null>(null);
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
      setName("");
      setDescription("");
      setIssuedBy("");
      setCourseLink("");
      setSkills("");
      setEarningCriteria("");
      setImage(null);
      const fileInput = document.getElementById("image") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

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

  const handleSubmit = (e: React.FormEvent) => {
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-[var(--main-text)]">
        Badges
      </h2>

      {/* Upload Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[var(--main-text)]">
            Upload New Badge
          </CardTitle>
          <CardDescription className="text-[var(--main-text)]/80">
            Create a new badge template by providing the required information.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[var(--main-text)]">
                  Badge Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Python Master"
                  required
                  disabled={uploadBadge.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issuedBy" className="text-[var(--main-text)]">
                  Issued By
                </Label>
                <Input
                  id="issuedBy"
                  value={issuedBy}
                  onChange={(e) => setIssuedBy(e.target.value)}
                  placeholder="e.g., Code Academy"
                  required
                  disabled={uploadBadge.isPending}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-[var(--main-text)]">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description of the badge"
                disabled={uploadBadge.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseLink" className="text-[var(--main-text)]">
                Course Link
              </Label>
              <Input
                id="courseLink"
                value={courseLink}
                onChange={(e) => setCourseLink(e.target.value)}
                placeholder="https://example.com/course"
                disabled={uploadBadge.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills" className="text-[var(--main-text)]">
                Skills
              </Label>
              <Input
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g., Python, Data Structures, Algorithms"
                disabled={uploadBadge.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="earningCriteria"
                className="text-[var(--main-text)]"
              >
                Earning Criteria
              </Label>
              <Input
                id="earningCriteria"
                value={earningCriteria}
                onChange={(e) => setEarningCriteria(e.target.value)}
                placeholder="e.g., Complete all course modules with 80% or higher"
                disabled={uploadBadge.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image" className="text-[var(--main-text)]">
                Badge Image
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/png, image/jpeg, image/gif"
                onChange={handleFileChange}
                required
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
                disabled={uploadBadge.isPending}
              />
              {image && (
                <p className="text-sm text-[var(--main-text)]/80">
                  Selected: {image.name}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={uploadBadge.isPending || !image || !name || !issuedBy}
            >
              {uploadBadge.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-[var(--main-text)]/80" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload Badge
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Badge Grid Card */}
      <Card>
        <CardHeader>
          <CardTitle>Available Templates</CardTitle>
          <CardDescription>
            Browse the existing badge templates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {badges.length === 0 ? (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 text-center">
              <p className="text-[var(--main-text)]/80">
                No badge templates available yet. Upload one above to get
                started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {badges.map((badge: Badge) => (
                <Card key={badge.id} className="overflow-hidden group">
                  <CardContent className="p-0 aspect-square flex items-center justify-center bg-muted/40 group-hover:bg-muted/80 transition-colors">
                    <img
                      src={badge.imageData}
                      alt={`Badge for ${badge.name}`}
                      className="max-w-[75%] max-h-[75%] object-contain transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  </CardContent>
                  <CardHeader className="p-3">
                    <CardTitle
                      className="text-base font-medium truncate text-[var(--main-text)]"
                      title={badge.name}
                    >
                      {badge.name}
                    </CardTitle>
                    <p className="text-sm text-[var(--main-text)]/80">
                      Issued by: {badge.issuedBy}
                    </p>
                    {badge.description && (
                      <CardDescription
                        className="text-xs mt-1 line-clamp-2 text-[var(--main-text)]/80"
                        title={badge.description}
                      >
                        {badge.description}
                      </CardDescription>
                    )}
                    {badge.skills && (
                      <p className="text-xs mt-1 text-[var(--main-text)]/80">
                        Skills: {badge.skills}
                      </p>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
