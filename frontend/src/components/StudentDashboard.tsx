import React, { useEffect, useState, useRef } from "react";
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
import { Trash2, PlusCircle, Copy, Share2, Users } from "lucide-react";
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
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

type Badge = {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string;
  imageData: string;
};

type BadgeAssignment = {
  assignmentId: string;
  earnedAt: Date;
  badge: Badge;
};

type Student = {
  studentId: string;
  name: string;
  email: string;
  badges: BadgeAssignment[];
};

export function StudentDashboard({
  students = [],
  badges = [],
}: {
  students?: Student[];
  badges?: Badge[];
}) {
  const queryClient = useQueryClient();
  const [localStudents, setLocalStudents] = useState<Student[]>(students);
  const [loading, setLoading] = useState<boolean>(students.length === 0);
  const [newStudent, setNewStudent] = useState({
    studentId: "",
    name: "",
    email: "",
  });
  const { toast } = useToast();
  const [bulkEmails, setBulkEmails] = useState<string>("");
  const [isBulkImporting, setIsBulkImporting] = useState<boolean>(false);
  const [bulkAssignBadge, setBulkAssignBadge] = useState<boolean>(false);
  const [bulkBadgeId, setBulkBadgeId] = useState<string>("");
  const [isLookingUpUser, setIsLookingUpUser] = useState<boolean>(false);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>("");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [isResending, setIsResending] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

  // Sync local state with prop changes from React Query
  useEffect(() => {
    if (students.length > 0) {
      setLocalStudents(students);
      setLoading(false);
    } else if (localStudents.length === 0) {
      fetchStudents();
    }
  }, [students]); // Re-sync whenever React Query updates the students

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
        // Ensure all students have badges array initialized
        const studentsWithBadges = data.students.map((s: Student) => ({
          ...s,
          badges: s.badges || [],
        }));
        setLocalStudents(studentsWithBadges);
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

      // Reset form
      setNewStudent({
        studentId: "",
        name: "",
        email: "",
      });

      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ["students"] });

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

  const removeBadgeFromStudent = async (
    student: Student,
    assignmentId: string
  ) => {
    try {
      // Delete the specific badge assignment
      const deleteResponse = await fetchWithAuth(
        `badges/remove-assignment/${assignmentId}`,
        { method: "DELETE" }
      );

      if (!deleteResponse.ok) {
        const deleteResult = await deleteResponse.json();
        throw new Error(
          deleteResult.error || "Failed to delete badge assignment"
        );
      }

      // Invalidate and refetch - let React Query handle the state update
      await queryClient.invalidateQueries({ queryKey: ["students"] });

      // Update viewStudent to reflect the change immediately
      const updatedStudent = {
        ...student,
        badges: student.badges.filter((b) => b.assignmentId !== assignmentId),
      };
      setViewStudent(updatedStudent);

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
    if (!viewStudent || !selectedBadgeId) return;

    try {
      // Assign badge to student
      const badgeResponse = await fetchWithAuth("badges/assign-by-email", {
        method: "POST",
        body: JSON.stringify({
          badgeId: selectedBadgeId,
          email: viewStudent.email,
        }),
      });

      const badgeAssignment = await badgeResponse.json();
      if (!badgeResponse.ok || (badgeAssignment && badgeAssignment.error)) {
        throw new Error(badgeAssignment?.error || "Failed to assign badge");
      }

      // If already assigned, just show message
      if (badgeAssignment.alreadyAssigned) {
        toast({
          title: "Already Assigned",
          description: "This student already has this badge",
        });
        setSelectedBadgeId("");
        return;
      }

      // Reset badge selection
      setSelectedBadgeId("");

      // Invalidate and refetch - let React Query handle the state update
      await queryClient.invalidateQueries({ queryKey: ["students"] });

      // Update viewStudent to reflect the change immediately
      const selectedBadgeTemplate = badges.find(
        (badge) => badge.id === selectedBadgeId
      );
      const newBadgeAssignment: BadgeAssignment = {
        assignmentId: badgeAssignment.assignment.id,
        earnedAt: new Date(),
        badge: selectedBadgeTemplate!,
      };
      const updatedStudent = {
        ...viewStudent,
        badges: viewStudent.badges
          ? [...viewStudent.badges, newBadgeAssignment]
          : [newBadgeAssignment],
      };
      setViewStudent(updatedStudent);

      toast({
        variant: "success",
        title: "Success",
        description: `Badge assigned to ${viewStudent.name} successfully`,
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

  const resendBadgeEmail = async (student: Student, assignmentId: string) => {
    try {
      setIsResending(assignmentId);

      const response = await fetchWithAuth("students/resend-badge", {
        method: "POST",
        body: JSON.stringify({
          studentId: student.studentId,
          assignmentId: assignmentId,
        }),
      });

      let result: any = null;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error("Error parsing resend response:", jsonError);
      }

      if (!response.ok || (result && result.error)) {
        const errorMessage =
          (result && result.error) || "Failed to resend badge email";
        throw new Error(errorMessage);
      }

      toast({
        variant: "success",
        title: "Email sent",
        description: `Badge email resent to ${student.email}`,
      });
    } catch (error) {
      console.error("Error resending badge email:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsResending(null);
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

      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ["students"] });

      // Close the view dialog if the deleted student was being viewed
      if (viewStudent?.studentId === studentId) {
        setViewStudent(null);
        setIsViewDialogOpen(false);
      }

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
            addedStudents.forEach((student) => {
              if (!student.badges) student.badges = [];
              student.badges.push({
                assignmentId: nanoid(), // Placeholder - real ID would come from backend
                earnedAt: new Date(),
                badge: selectedBadgeTemplate,
              });
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

      // Reset form
      setBulkEmails("");
      setBulkAssignBadge(false);
      setBulkBadgeId("");

      // Invalidate and refetch to get updated student list
      if (addedStudents.length > 0) {
        await queryClient.invalidateQueries({ queryKey: ["students"] });
      }

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
    <div className="space-y-6 bg-[#ffffff]">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Students</h2>
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
      <div className="bg-[#ffffff] rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-gray-100">
              <TableHead className="text-gray-600 font-medium py-4 px-6">
                Name
              </TableHead>
              <TableHead className="text-gray-600 font-medium py-4 px-6">
                Email
              </TableHead>
              <TableHead className="text-gray-600 font-medium py-4 px-6">
                Badges
              </TableHead>
              <TableHead className="text-right text-gray-600 font-medium py-4 px-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-0">
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-gray-500 py-8"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : localStudents.length === 0 ? (
              <TableRow className="border-0">
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-gray-500 py-8"
                >
                  No students found.
                </TableCell>
              </TableRow>
            ) : (
              localStudents.map((student, index) => (
                <TableRow
                  key={student.studentId}
                  className={cn(
                    "cursor-pointer border-0 hover:bg-gray-50/50 transition-colors",
                    index !== localStudents.length - 1 &&
                      "border-b border-gray-100"
                  )}
                  onClick={() => {
                    setViewStudent(student);
                    setIsViewDialogOpen(true);
                  }}
                >
                  <TableCell className="text-gray-900 py-4 px-6">
                    {student.name}
                  </TableCell>
                  <TableCell className="text-gray-600 py-4 px-6">
                    {student.email}
                  </TableCell>
                  <TableCell className="text-gray-600 py-4 px-6">
                    {student.badges && student.badges.length > 0 ? (
                      <span className="text-sm font-medium text-gray-900">
                        {student.badges.length}{" "}
                        {student.badges.length === 1 ? "badge" : "badges"}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">No badges</span>
                    )}
                  </TableCell>
                  <TableCell
                    onClick={(e) => e.stopPropagation()}
                    className="py-4 px-6"
                  >
                    <div className="flex justify-end gap-2">
                      <AlertDialog
                        open={deleteDialogOpen === student.studentId}
                        onOpenChange={(open) =>
                          setDeleteDialogOpen(open ? student.studentId : null)
                        }
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white border-gray-200 shadow-xl animate-in fade-in-0 zoom-in-95 duration-200">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-gray-900">
                              Delete student?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600">
                              This will permanently delete the student, their
                              associated user account, and all of their badge
                              assignments. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                deleteStudent(student.studentId);
                                setDeleteDialogOpen(null);
                              }}
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
      </div>

      {/* View/Manage Student Badges Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white border border-gray-200 shadow-lg max-h-[80vh] overflow-y-auto [&>button]:hidden">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Manage Badges for {viewStudent?.name}
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-1">{viewStudent?.email}</p>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Badges */}
            {viewStudent &&
            viewStudent.badges &&
            viewStudent.badges.length > 0 ? (
              <div className="space-y-4">
                {viewStudent.badges.map((badgeAssignment, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50/50 transition-colors"
                  >
                    <img
                      src={badgeAssignment.badge.imageData}
                      alt={badgeAssignment.badge.name}
                      className="w-20 h-20 object-contain rounded-md shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {badgeAssignment.badge.name}
                      </h4>
                      <p className="text-xs text-gray-500 mb-3">
                        Earned:{" "}
                        {new Date(
                          badgeAssignment.earnedAt
                        ).toLocaleDateString()}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            resendBadgeEmail(
                              viewStudent,
                              badgeAssignment.assignmentId
                            )
                          }
                          disabled={
                            isResending === badgeAssignment.assignmentId
                          }
                          className="h-8 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-0 disabled:opacity-50"
                        >
                          <Share2 className="h-3 w-3 mr-1.5" />
                          {isResending === badgeAssignment.assignmentId
                            ? "Sending..."
                            : "Resend Email"}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50/50 border-0"
                            >
                              <Trash2 className="h-3 w-3 mr-1.5" />
                              Remove
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white border-gray-200 shadow-xl animate-in fade-in-0 zoom-in-95 duration-200">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-gray-900">
                                Remove this badge?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-600">
                                This will remove the "
                                {badgeAssignment.badge.name}" badge from{" "}
                                {viewStudent.name}. This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  removeBadgeFromStudent(
                                    viewStudent,
                                    badgeAssignment.assignmentId
                                  )
                                }
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No badges assigned yet
              </div>
            )}

            {/* Add New Badge Section */}
            <div className="pt-2">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Assign New Badge
              </h3>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedBadgeId}
                  onValueChange={setSelectedBadgeId}
                >
                  <SelectTrigger className="flex-1 border-gray-300 bg-white hover:bg-gray-50 h-10">
                    <SelectValue placeholder="Choose a badge to assign" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {badges && badges.length > 0 ? (
                      badges.map((badge) => (
                        <SelectItem
                          key={badge.id}
                          value={badge.id}
                          className="hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={badge.imageData}
                              alt={badge.name}
                              className="w-6 h-6 object-contain rounded-sm"
                            />
                            {badge.name}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-4 text-center text-sm text-gray-500">
                        No available badges
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <Button
                  onClick={assignBadgeToStudent}
                  disabled={!selectedBadgeId}
                  className="bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed px-6 h-10"
                >
                  Assign
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
