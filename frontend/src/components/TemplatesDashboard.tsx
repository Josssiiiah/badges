import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type Badge = {
  id: string;
  name: string;
  description: string | null;
  imageUrl?: string;
  imageData: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export function TemplatesDashboard() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const { toast } = useToast();

  // Fetch all badges
  const { data, isLoading } = useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/badges/all`
      );
      const data = await response.json();
      return data.badges || [];
    },
  });

  // Upload badge mutation
  const uploadBadge = useMutation({
    mutationFn: async () => {
      if (!image) throw new Error("No image selected");
      const formData = new FormData();
      formData.append("name", name);
      if (description) formData.append("description", description);
      formData.append("image", image);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/badges/upload`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.badge;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      setName("");
      setDescription("");
      setImage(null);
      toast({
        title: "Success",
        description: "Badge uploaded successfully!",
      });
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload badge",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImage(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploadBadge.mutate();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-[var(--main-text)]">
        Badge Templates
      </h2>

      {/* Upload Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-[var(--main-text)]">
            Upload New Badge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[var(--main-text)]" htmlFor="name">
                Badge Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white border-[var(--accent-bg)] text-[var(--main-text)]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--main-text)]" htmlFor="description">
                Description (Optional)
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white border-[var(--accent-bg)] text-[var(--main-text)]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--main-text)]" htmlFor="image">
                Badge Image
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/png,image/jpeg,image/gif"
                onChange={handleFileChange}
                required
                className="bg-white border-[var(--accent-bg)] text-[var(--main-text)]"
              />
            </div>
            <Button
              type="submit"
              disabled={uploadBadge.isPending}
              className="bg-[var(--accent-bg)] text-[var(--main-text)] hover:bg-[var(--accent-bg)]/90"
            >
              {uploadBadge.isPending ? "Uploading..." : "Upload Badge"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Badge Grid */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-[var(--main-text)]">
          Available Badge Templates
        </h3>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-bg)]"></div>
          </div>
        ) : data?.length === 0 ? (
          <div className="bg-[var(--main-bg)] rounded-lg p-6 text-center border border-[var(--accent-bg)]">
            <p className="text-[var(--main-text)]/80">
              No badge templates available yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.map((badge: Badge) => (
              <Card
                key={badge.id}
                className="overflow-hidden flex border border-[var(--accent-bg)] bg-[var(--main-bg)] hover:bg-[var(--accent-bg)]/10 transition-colors"
              >
                <CardContent className="p-0">
                  <div className="w-full aspect-square bg-[var(--accent-bg)]/10 flex items-center justify-center overflow-hidden">
                    <img
                      src={badge.imageData}
                      alt={badge.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </CardContent>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg font-medium text-[var(--main-text)]">
                    {badge.name}
                  </CardTitle>
                  {badge.description && (
                    <p className="text-sm text-[var(--main-text)]/80 mt-1">
                      {badge.description}
                    </p>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
