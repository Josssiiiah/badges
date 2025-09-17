import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pencil,
  Trash2,
  PlusCircle,
  Copy,
  ExternalLink,
  Share2,
  Users,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api-client";
import { nanoid } from "nanoid";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Badge = {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string;
  imageData: string;
};

type Student = {
  studentId: string;
  name: string;
  email: string;
  hasBadge: boolean;
  badgeId?: string;
  badge?: Badge;
};

export function StudentDashboard({
  students = [],
  badges = [],
}: {
  students?: Student[];
  badges?: Badge[];
}) {
  const [localStudents, setLocalStudents] = useState<Student[]>(students);
  const [loading, setLoading] = useState<boolean>(students.length === 0);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isBadgeDialogOpen, setIsBadgeDialogOpen] = useState<boolean>(false);
  const [newStudent, setNewStudent] = useState<Student>({
    studentId: "",
    name: "",
    email: "",
    hasBadge: false,
  });
  const { toast } = useToast();
  const [bulkEmails, setBulkEmails] = useState<string>("");
  const [isBulkImporting, setIsBulkImporting] = useState<boolean>(false);
  const [bulkAssignBadge, setBulkAssignBadge] = useState<boolean>(false);
  const [bulkBadgeId, setBulkBadgeId] = useState<string>("");
  const [isLookingUpUser, setIsLookingUpUser] = useState<boolean>(false);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>("");

  // Update students state when students prop changes
  useEffect(() => {
    if (students.length > 0) {
      // Preserve the badge assignment ID from students and only enrich with badge metadata
      const enhancedStudents = students.map((student) => {
        if (
          student.hasBadge &&
          student.badgeId &&
          !student.badge &&
          badges.length > 0
        ) {
          // Find the badge TEMPLATE from badges prop if it's missing
          // This only adds badge details (name, image) but preserves the assignment ID
          const matchingBadge = badges.find(
            (badge) => badge.id === student.badge?.id
          );
          if (matchingBadge) {
            return {
              ...student,
              badge: matchingBadge,
            };
          }
        }
        return student;
      });

      setLocalStudents(enhancedStudents);
      setLoading(false);
    } else if (localStudents.length === 0) {
      fetchStudents();
    }
  }, [students, badges]);

  // Update fetchStudents function to enrich students with badge data if needed
  const fetchStudents = async () => {
    if (students.length > 0) {
      setLocalStudents(students);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetchWithAuth("students/all");
      const data = await response.json();

      if (data.students) {
        // Important: preserve the badgeId from the API - this is the badge assignment ID
        // Only add badge metadata like image and name
        const enhancedStudents = data.students.map((student: Student) => {
          // badgeId from API is the badge assignment ID - preserve it
          return student;
        });

        setLocalStudents(enhancedStudents);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch students",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to look up a user by email
  const lookupUserByEmail = async (email: string) => {
    if (!email) return;

    try {
      setIsLookingUpUser(true);
      // Make API call to look up user by email in the users table
      const response = await fetchWithAuth(
        `users/by-email?email=${encodeURIComponent(email)}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.user && data.user.name) {
          // If user found, use their name
          return data.user.name;
        }
      }
      // If no user found or response not ok, return null
      return null;
    } catch (error) {
      console.error("Error looking up user:", error);
      return null;
    } finally {
      setIsLookingUpUser(false);
    }
  };

  // Handle email change for the new student form
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setNewStudent({ ...newStudent, email });
  };

  // Handle email blur to lookup user info
  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value;
    if (email && !newStudent.name) {
      const userName = await lookupUserByEmail(email);
      if (userName) {
        setNewStudent((prev) => ({
          ...prev,
          name: userName,
        }));
      }
    }
  };

  const addStudent = async () => {
    try {
      // Only validate email now, generate ID if needed
      if (!newStudent.email) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please provide an email address",
        });
        return;
      }

      // Auto-generate student ID if not provided
      const studentToAdd = {
        ...newStudent,
        studentId: newStudent.studentId || nanoid(8),
        // Only use email as name if name isn't provided after lookup
        name: newStudent.name || newStudent.email.split("@")[0],
      };

      // API call
      const response = await fetchWithAuth("students/create", {
        method: "POST",
        body: JSON.stringify(studentToAdd),
      });

      if (!response.ok) {
        throw new Error("Failed to add student");
      }

      const result = await response.json();
      if (!response.ok || (result && result.error)) {
        throw new Error(result?.error || "Failed to update student");
      }

      // Update local state
      setLocalStudents([...localStudents, result.student]);

      // Reset form
      setNewStudent({
        studentId: "",
        name: "",
        email: "",
        hasBadge: false,
      });

      toast({
        variant: "success",
        title: "Success",
        description: `${result.student.name} added successfully`,
      });
    } catch (error) {
      console.error("Error adding student:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add student",
      });
    }
  };

  const removeBadgeFromStudent = async (student: Student) => {
    try {
      // First, delete the badge assignment from the badges table
      const deleteResponse = await fetchWithAuth(
        `badges/remove-assignment-by-email/${encodeURIComponent(student.email)}`,
        {
          method: "DELETE",
        }
      );

      if (!deleteResponse.ok) {
        const deleteResult = await deleteResponse.json();
        console.error("Failed to delete badge assignment:", deleteResult.error);
      }

      // Then update the student record to remove the badge reference
      const response = await fetchWithAuth(
        `students/update/${student.studentId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: student.name,
            email: student.email,
            hasBadge: false,
            // Don't include badgeId when removing
          }),
        }
      );

      const result = await response.json();
      if (!response.ok || (result && result.error)) {
        throw new Error(result?.error || "Failed to remove badge");
      }

      // Update local state
      setLocalStudents(
        localStudents.map((s) =>
          s.studentId === student.studentId
            ? { ...s, hasBadge: false, badgeId: undefined, badge: undefined }
            : s
        )
      );

      toast({
        variant: "success",
        title: "Success",
        description: `Badge removed from ${student.name}`,
      });
    } catch (error) {
      console.error("Error removing badge:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove badge",
      });
    }
  };

  const assignBadgeToStudent = async () => {
    if (!selectedStudent || !selectedBadgeId) return;

    try {
      // Assign badge to student
      const badgeResponse = await fetchWithAuth("badges/assign-by-email", {
        method: "POST",
        body: JSON.stringify({
          badgeId: selectedBadgeId, // This is template badge ID for new assignment
          email: selectedStudent.email,
        }),
      });

      // Get the badge assignment information including its unique ID
      const badgeAssignment = await badgeResponse.json();
      if (!badgeResponse.ok || (badgeAssignment && badgeAssignment.error)) {
        throw new Error(badgeAssignment?.error || "Failed to assign badge");
      }

      let updatedStudent = { ...selectedStudent };

      // Store the badge assignment ID which will be used for unique badge URLs
      if (badgeAssignment && badgeAssignment.assignment) {
        updatedStudent.badgeId = badgeAssignment.assignment.id;

        // Update the student record with the badge assignment ID
        const updateBadgeIdResponse = await fetchWithAuth(
          `students/update/${selectedStudent.studentId}`,
          {
            method: "PUT",
            body: JSON.stringify({
              name: selectedStudent.name,
              email: selectedStudent.email,
              hasBadge: true,
              badgeId: badgeAssignment.assignment.id, // Update with badge assignment ID
            }),
          }
        );

        const updateBadgeIdResult = await updateBadgeIdResponse.json();
        if (
          !updateBadgeIdResponse.ok ||
          (updateBadgeIdResult && updateBadgeIdResult.error)
        ) {
          throw new Error(
            updateBadgeIdResult?.error ||
              "Failed to persist badge assignment to student"
          );
        }
      }

      // Find the badge template data to display badge info (image, name)
      const selectedBadgeTemplate = badges.find(
        (badge) => badge.id === selectedBadgeId
      );

      if (selectedBadgeTemplate) {
        updatedStudent = {
          ...updatedStudent,
          hasBadge: true,
          badge: selectedBadgeTemplate,
        };
      }

      // Update local state
      setLocalStudents(
        localStudents.map((s) =>
          s.studentId === selectedStudent.studentId ? updatedStudent : s
        )
      );

      // Close dialog and reset
      setIsBadgeDialogOpen(false);
      setSelectedStudent(null);
      setSelectedBadgeId("");

      toast({
        variant: "success",
        title: "Success",
        description: `Badge assigned to ${updatedStudent.name} successfully`,
      });
    } catch (error) {
      console.error("Error assigning badge:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to assign badge",
      });
    }
  };

  const deleteStudent = async (studentId: string) => {
    try {
      const response = await fetchWithAuth(`students/delete/${studentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete student");
      }

      // Update local state
      setLocalStudents(localStudents.filter((s) => s.studentId !== studentId));

      toast({
        variant: "success",
        title: "Success",
        description: "Student deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting student:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete student",
      });
    }
  };

  // Copy badge URL to clipboard
  const copyBadgeUrl = (badgeId: string) => {
    if (!badgeId) return;

    const url = `${window.location.origin}/badges/${badgeId}`;
    navigator.clipboard.writeText(url);
    toast({
      variant: "success",
      title: "URL Copied",
      description: "Badge URL copied to clipboard",
    });
  };

  // Open badge in new tab
  const openBadge = (badgeId: string) => {
    if (!badgeId) return;

    window.open(`/badges/${badgeId}`, "_blank");
  };

  const addBulkStudents = async () => {
    try {
      setIsBulkImporting(true);

      // Split by commas or newlines, remove whitespace, and filter out empty strings
      const emailList = bulkEmails
        .split(/[,\n]+/)
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      if (emailList.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please provide at least one email address",
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emailList.filter(
        (email) => !emailRegex.test(email)
      );
      if (invalidEmails.length > 0) {
        toast({
          variant: "destructive",
          title: "Invalid Email(s)",
          description: `Invalid email format: ${invalidEmails.join(", ")}`,
        });
        return;
      }

      const addedStudents = [];
      const failedStudents = [];

      // Create all students first
      for (const email of emailList) {
        try {
          // Create student object
          const studentData = {
            studentId: nanoid(8),
            name: email.split("@")[0], // Use email username as default name
            email,
            hasBadge: false,
          };

          // Create the student
          const response = await fetchWithAuth("students/create", {
            method: "POST",
            body: JSON.stringify(studentData),
          });

          const result = await response.json();

          if (result.student) {
            addedStudents.push(result.student);
          } else {
            failedStudents.push(email);
            console.error(`Failed to create student ${email}:`, result.error);
          }
        } catch (error) {
          failedStudents.push(email);
          console.error(`Error creating student ${email}:`, error);
        }
      }

      // If badge assignment is enabled and we have students, do bulk badge assignment
      if (bulkAssignBadge && bulkBadgeId && addedStudents.length > 0) {
        try {
          const studentEmails = addedStudents.map((student) => student.email);

          // Use bulk badge assignment endpoint
          const bulkBadgeResponse = await fetchWithAuth("badges/assign-bulk", {
            method: "POST",
            body: JSON.stringify({
              badgeId: bulkBadgeId,
              emails: studentEmails,
            }),
          });

          const bulkResult = await bulkBadgeResponse.json();

          if (bulkResult.success) {
            console.log(
              `Bulk badge assignment completed: ${bulkResult.assignments} assignments, ${bulkResult.magicLinksSent} magic links sent`
            );

            // Find the badge template for display
            const selectedBadgeTemplate = badges.find(
              (badge) => badge.id === bulkBadgeId
            );

            // Update local student objects to reflect badge assignments
            // Note: In a production app, you'd want to fetch the updated data from the server
            // For now, we'll mark all as having badges since the bulk operation succeeded
            addedStudents.forEach((student) => {
              student.hasBadge = true;
              student.badge = selectedBadgeTemplate;
            });

            if (bulkResult.failed && bulkResult.failed.length > 0) {
              console.warn("Some badge assignments failed:", bulkResult.failed);
            }
          } else {
            console.error("Bulk badge assignment failed:", bulkResult.error);
          }
        } catch (bulkError) {
          console.error("Error in bulk badge assignment:", bulkError);
        }
      }

      // Update local state with all successfully added students
      if (addedStudents.length > 0) {
        setLocalStudents([...localStudents, ...addedStudents]);
      }

      // Reset form
      setBulkEmails("");
      setBulkAssignBadge(false);
      setBulkBadgeId("");

      // Show results
      if (addedStudents.length > 0 && failedStudents.length === 0) {
        toast({
          variant: "success",
          title: "Success",
          description: `Added ${addedStudents.length} student${addedStudents.length > 1 ? "s" : ""} successfully`,
        });
      } else if (addedStudents.length > 0 && failedStudents.length > 0) {
        toast({
          variant: "warning",
          title: "Partial Success",
          description: `Added ${addedStudents.length} student${addedStudents.length > 1 ? "s" : ""}. Failed: ${failedStudents.join(", ")}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add any students",
        });
      }
    } catch (error) {
      console.error("Error adding students in bulk:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add students in bulk",
      });
    } finally {
      setIsBulkImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--main-text)]">Students</h2>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="">
                <Users className="mr-2 h-4 w-4 text-[var(--gray)]" />{" "}
                <span className="text-gray-500">Bulk Import</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] backdrop-filter backdrop-blur-xl border-2 border-white/30 shadow-xl">
              <DialogHeader>
                <DialogTitle>Add Multiple Students</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="bulkEmails"
                    className="text-right text-gray-500"
                  >
                    Emails
                  </Label>
                  <div className="col-span-3">
                    <Textarea
                      id="bulkEmails"
                      value={bulkEmails}
                      onChange={(e) => setBulkEmails(e.target.value)}
                      className="min-h-[100px]"
                      placeholder="student1@example.com, student2@example.com, student3@example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter comma-separated email addresses
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-gray-500">Badge</Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Checkbox
                      id="bulk-assign-badge"
                      checked={bulkAssignBadge}
                      onCheckedChange={(checked) =>
                        setBulkAssignBadge(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="bulk-assign-badge"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-500"
                    >
                      Assign same badge to all students
                    </Label>
                  </div>
                </div>

                {bulkAssignBadge && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="bulk-badge"
                      className="text-right text-gray-500"
                    >
                      Select Badge
                    </Label>
                    <Select value={bulkBadgeId} onValueChange={setBulkBadgeId}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a badge" />
                      </SelectTrigger>
                      <SelectContent>
                        {badges?.map((badge) => (
                          <SelectItem key={badge.id} value={badge.id}>
                            <div className="flex items-center gap-2">
                              <img
                                src={badge.imageData}
                                alt={badge.name}
                                className="w-6 h-6 object-contain rounded-sm"
                              />
                              {badge.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={addBulkStudents} disabled={isBulkImporting}>
                  {isBulkImporting ? "Importing..." : "Import Students"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <PlusCircle className="h-4 w-4 text-[var(--gray)]" />{" "}
                <span className="text-white">Add Student</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] backdrop-filter backdrop-blur-xl border-2 border-white/30 shadow-xl">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right text-gray-500">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStudent.email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    className="col-span-3"
                    placeholder="student@example.com"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right text-gray-500">
                    Name{" "}
                    {isLookingUpUser && (
                      <span className="text-xs">(looking up...)</span>
                    )}
                  </Label>
                  <Input
                    id="name"
                    value={newStudent.name}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, name: e.target.value })
                    }
                    className="col-span-3"
                    placeholder="Will use email if left blank"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={addStudent}
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Add Student
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Student Table */}
      <Card className="bg-white/10 backdrop-filter backdrop-blur-md border border-white/20 shadow-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                <TableHead className="text-[var(--main-text)]">Name</TableHead>
                <TableHead className="text-[var(--main-text)]">Email</TableHead>
                <TableHead className="text-[var(--main-text)]">Badge</TableHead>
                <TableHead className="text-[var(--main-text)]">
                  Badge URL
                </TableHead>
                <TableHead className="text-[var(--main-text)]">
                  Badge Assignment
                </TableHead>
                <TableHead className="text-right text-[var(--main-text)]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-[var(--main-text)]/80"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : localStudents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-[var(--main-text)]/80"
                  >
                    No students found.
                  </TableCell>
                </TableRow>
              ) : (
                localStudents.map((student) => (
                  <TableRow key={student.studentId}>
                    <TableCell className="text-[var(--main-text)]">
                      {student.name}
                    </TableCell>
                    <TableCell className="text-[var(--main-text)]">
                      {student.email}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {student.badge?.imageData ? (
                          <img
                            src={student.badge.imageData}
                            alt={student.badge.name}
                            className="w-8 h-8 object-contain rounded-sm mr-2"
                          />
                        ) : (
                          <span className="text-[var(--main-text)]/80 text-sm">
                            No Badge
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-[var(--main-text)]">
                      {student.badgeId ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs truncate max-w-[100px] text-blue-400">
                            /badges/{student.badgeId}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyBadgeUrl(student.badgeId!)}
                          >
                            <Copy className="h-3 w-3 text-[var(--gray)]" />
                          </Button>
                          {/* <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => openBadge(student.badgeId!)}
                          >
                            <ExternalLink className="h-3 w-3 text-[var(--gray)]" />
                          </Button> */}
                        </div>
                      ) : (
                        <span className="text-[var(--main-text)]/80 text-xs">
                          None
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStudent(student);
                          setSelectedBadgeId(student.badge?.id || "");
                          setIsBadgeDialogOpen(true);
                        }}
                        className="h-8"
                      >
                        {student.hasBadge ? "Manage Badge" : "Add Badge"}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-[var(--gray)] hover:bg-[var(--gray)]/10 hover:text-[var(--gray)]"
                            >
                              <Trash2 className="h-4 w-4 text-[var(--gray)]" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete student?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the student, their
                                associated user account, and all of their badge
                                assignments. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteStudent(student.studentId)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Badge Management Dialog */}
      <Dialog open={isBadgeDialogOpen} onOpenChange={setIsBadgeDialogOpen}>
        <DialogContent className="sm:max-w-[425px] backdrop-filter backdrop-blur-xl border-2 border-white/30 shadow-xl">
          <DialogHeader>
            <DialogTitle>Manage Badge for {selectedStudent?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedStudent?.hasBadge && (
              <div className="p-3 bg-gray-100 rounded-lg">
                <Label className="text-sm text-gray-600">Current Badge</Label>
                <div className="flex items-center gap-2 mt-2">
                  <img
                    src={selectedStudent.badge?.imageData}
                    alt={selectedStudent.badge?.name}
                    className="w-8 h-8 object-contain rounded-sm"
                  />
                  <span className="font-medium text-gray-900">
                    {selectedStudent.badge?.name}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="badge-select"
                className="text-right text-[var(--main-text)]"
              >
                {selectedStudent?.hasBadge ? "Change to" : "Select Badge"}
              </Label>
              <Select
                value={selectedBadgeId}
                onValueChange={setSelectedBadgeId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Choose a badge" />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    const availableBadges =
                      badges?.filter((badge) => {
                        // Show all badges except the current one if changing
                        if (
                          selectedStudent?.hasBadge &&
                          selectedStudent?.badge
                        ) {
                          return badge.id !== selectedStudent.badge.id;
                        }
                        return true;
                      }) || [];

                    if (availableBadges.length === 0) {
                      return (
                        <div className="px-2 py-4 text-center text-sm text-gray-500">
                          No available badges
                        </div>
                      );
                    }

                    return availableBadges.map((badge) => (
                      <SelectItem key={badge.id} value={badge.id}>
                        <div className="flex items-center gap-2">
                          <img
                            src={badge.imageData}
                            alt={badge.name}
                            className="w-6 h-6 object-contain rounded-sm"
                          />
                          {badge.name}
                        </div>
                      </SelectItem>
                    ));
                  })()}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {selectedStudent?.hasBadge && (
                <Button
                  variant="outline"
                  onClick={() => {
                    removeBadgeFromStudent(selectedStudent);
                    setIsBadgeDialogOpen(false);
                    setSelectedStudent(null);
                    setSelectedBadgeId("");
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove Badge
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={assignBadgeToStudent}
                disabled={!selectedBadgeId}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {selectedStudent?.hasBadge ? "Change Badge" : "Assign Badge"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
