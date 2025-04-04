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
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
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

  // Handle editing student email blur
  const handleEditEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    if (!editingStudent) return;

    const email = e.target.value;
    // Only try to update the name if it wasn't changed by the admin
    const currentName = editingStudent.name || "";
    const originalName =
      localStudents.find((s) => s.studentId === editingStudent.studentId)
        ?.name || "";

    // Only lookup if the name hasn't been manually changed
    if (email && (currentName === originalName || !currentName)) {
      const userName = await lookupUserByEmail(email);
      if (userName) {
        setEditingStudent({
          ...editingStudent,
          name: userName,
        });
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

  const updateStudent = async () => {
    if (!editingStudent) return;

    try {
      // Validate form
      if (!editingStudent.name || !editingStudent.email) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all required fields",
        });
        return;
      }

      // First update student info (but don't update badgeId yet if we're assigning a badge)
      // This prevents the badge template ID from replacing the badge assignment ID
      const response = await fetchWithAuth(
        `students/update/${editingStudent.studentId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: editingStudent.name,
            email: editingStudent.email,
            hasBadge: editingStudent.hasBadge,
            // Only include badgeId if we're not assigning a new badge
            // If assigning, we'll update it after getting assignment ID
            badgeId: !editingStudent.hasBadge ? null : editingStudent.badgeId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update student");
      }

      const result = await response.json();
      // Get the student data from the response
      let updatedStudent = result.student;

      // If badge is being assigned, create a badge assignment
      if (editingStudent.hasBadge && editingStudent.badgeId) {
        const badgeResponse = await fetchWithAuth("badges/assign-by-email", {
          method: "POST",
          body: JSON.stringify({
            badgeId: editingStudent.badgeId, // This is template badge ID for new assignment
            email: editingStudent.email,
          }),
        });

        if (!badgeResponse.ok) {
          throw new Error("Failed to assign badge");
        }

        // Get the badge assignment information including its unique ID
        const badgeAssignment = await badgeResponse.json();

        // Store the badge assignment ID which will be used for unique badge URLs
        if (badgeAssignment && badgeAssignment.assignment) {
          updatedStudent.badgeId = badgeAssignment.assignment.id;

          // Update the student record with the badge assignment ID
          const updateBadgeIdResponse = await fetchWithAuth(
            `students/update/${editingStudent.studentId}`,
            {
              method: "PUT",
              body: JSON.stringify({
                name: editingStudent.name,
                email: editingStudent.email,
                hasBadge: true,
                badgeId: badgeAssignment.assignment.id, // Update with badge assignment ID
              }),
            }
          );

          if (!updateBadgeIdResponse.ok) {
            console.warn("Failed to update student with badge assignment ID");
          }
        }
      }

      // Find the badge details if a badge is assigned
      if (updatedStudent.hasBadge && updatedStudent.badgeId) {
        // Find the badge template data to display badge info (image, name)
        // but preserve the badge assignment ID for URLs
        const selectedBadgeTemplate = badges.find(
          (badge) => badge.id === editingStudent.badgeId // Use template ID to find badge details
        );

        if (selectedBadgeTemplate) {
          // Include badge details in the updatedStudent but keep assignment ID
          updatedStudent = {
            ...updatedStudent,
            badge: selectedBadgeTemplate,
          };
        }
      }

      // Update local state with the complete student information including badge
      setLocalStudents(
        localStudents.map((s) =>
          s.studentId === editingStudent.studentId ? updatedStudent : s
        )
      );

      // Close dialog
      setEditingStudent(null);

      toast({
        title: "Success",
        description: `${result.student.name} updated successfully`,
      });
    } catch (error) {
      console.error("Error updating student:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update student",
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
      // Split by commas, remove whitespace, and filter out empty strings
      const emails = bulkEmails
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      if (emails.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please provide at least one email address",
        });
        return;
      }

      // Create student objects
      const studentsToAdd = emails.map((email) => ({
        studentId: nanoid(8),
        name: email.split("@")[0], // Use email username as name
        email,
        hasBadge: bulkAssignBadge,
        badgeId: bulkAssignBadge ? bulkBadgeId : undefined,
      }));

      // Make API call for each student
      const results = await Promise.all(
        studentsToAdd.map((student) =>
          fetchWithAuth("students/create", {
            method: "POST",
            body: JSON.stringify(student),
          }).then((res) => res.json())
        )
      );

      // Add successful students to the list
      let addedStudents = results
        .filter((result) => result.student)
        .map((result) => result.student);

      // If badge assignment is enabled, assign badges to all students
      if (bulkAssignBadge && bulkBadgeId) {
        // Find the badge template
        const selectedBadgeTemplate = badges.find(
          (badge) => badge.id === bulkBadgeId
        );

        // Assign badge to each student
        const badgeAssignments = await Promise.all(
          addedStudents.map((student) =>
            fetchWithAuth("badges/assign-by-email", {
              method: "POST",
              body: JSON.stringify({
                badgeId: bulkBadgeId,
                email: student.email,
              }),
            }).then((res) => res.json())
          )
        );

        // Update students with badge assignment IDs and badge details
        addedStudents = addedStudents.map((student, index) => {
          const assignment = badgeAssignments[index]?.assignment;
          if (assignment) {
            return {
              ...student,
              badgeId: assignment.id,
              badge: selectedBadgeTemplate,
            };
          }
          return student;
        });

        // Update student records with badge assignment IDs
        await Promise.all(
          addedStudents.map((student) => {
            if (student.badgeId) {
              return fetchWithAuth(`students/update/${student.studentId}`, {
                method: "PUT",
                body: JSON.stringify({
                  name: student.name,
                  email: student.email,
                  hasBadge: true,
                  badgeId: student.badgeId,
                }),
              });
            }
            return Promise.resolve();
          })
        );
      }

      setLocalStudents([...localStudents, ...addedStudents]);

      // Reset form
      setBulkEmails("");
      setBulkAssignBadge(false);
      setBulkBadgeId("");

      toast({
        title: "Success",
        description: `Added ${addedStudents.length} students successfully`,
      });
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
        <h2 className="text-2xl font-bold text-[var(--main-text)]">
          Student Management
        </h2>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4 text-[var(--gray)]" />{" "}
                <span className="text-gray-500">Bulk Import</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white/20 backdrop-filter backdrop-blur-xl border-2 border-white/30 shadow-xl">
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
              <Button>
                <PlusCircle className="mr-2 h-4 w-4 text-[var(--gray)]" />{" "}
                <span className="text-gray-500">Add Student</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white/20 backdrop-filter backdrop-blur-xl border-2 border-white/30 shadow-xl">
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
                <Button onClick={addStudent} type="submit">
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
                <TableHead className="text-right text-[var(--main-text)]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-[var(--main-text)]/80"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : localStudents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => openBadge(student.badgeId!)}
                          >
                            <ExternalLink className="h-3 w-3 text-[var(--gray)]" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[var(--main-text)]/80 text-xs">
                          None
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingStudent(student)}
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4 text-[var(--gray)]" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px] bg-white/20 backdrop-filter backdrop-blur-xl border-2 border-white/30 shadow-xl">
                            <DialogHeader>
                              <DialogTitle>Edit Student</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                  htmlFor="edit-name"
                                  className="text-right text-[var(--main-text)]"
                                >
                                  Name
                                </Label>
                                <Input
                                  id="edit-name"
                                  value={editingStudent?.name || ""}
                                  onChange={(e) =>
                                    setEditingStudent(
                                      editingStudent
                                        ? {
                                            ...editingStudent,
                                            name: e.target.value,
                                          }
                                        : null
                                    )
                                  }
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                  htmlFor="edit-email"
                                  className="text-right text-[var(--main-text)]"
                                >
                                  Email
                                </Label>
                                <Input
                                  id="edit-email"
                                  type="email"
                                  value={editingStudent?.email || ""}
                                  onChange={(e) =>
                                    setEditingStudent(
                                      editingStudent
                                        ? {
                                            ...editingStudent,
                                            email: e.target.value,
                                          }
                                        : null
                                    )
                                  }
                                  onBlur={handleEditEmailBlur}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-[var(--main-text)]">
                                  Badge
                                </Label>
                                <div className="col-span-3 flex items-center space-x-2">
                                  <Checkbox
                                    id={`edit-hasBadge-${student.studentId}`}
                                    checked={editingStudent?.hasBadge || false}
                                    onCheckedChange={(checked) =>
                                      setEditingStudent(
                                        editingStudent
                                          ? {
                                              ...editingStudent,
                                              hasBadge: checked as boolean,
                                              badgeId: checked
                                                ? editingStudent.badgeId
                                                : undefined,
                                            }
                                          : null
                                      )
                                    }
                                  />
                                  <Label
                                    htmlFor={`edit-hasBadge-${student.studentId}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[var(--main-text)]"
                                  >
                                    Assign Badge
                                  </Label>
                                </div>
                              </div>
                              {editingStudent?.hasBadge && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor="edit-badge"
                                    className="text-right text-[var(--main-text)]"
                                  >
                                    Select Badge
                                  </Label>
                                  <Select
                                    value={editingStudent.badgeId}
                                    onValueChange={(value) =>
                                      setEditingStudent(
                                        editingStudent
                                          ? {
                                              ...editingStudent,
                                              badgeId: value,
                                            }
                                          : null
                                      )
                                    }
                                  >
                                    <SelectTrigger className="col-span-3">
                                      <SelectValue placeholder="Select a badge" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {badges?.map((badge) => (
                                        <SelectItem
                                          key={badge.id}
                                          value={badge.id}
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
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                              {editingStudent?.hasBadge &&
                                editingStudent?.badgeId && (
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right text-[var(--main-text)]">
                                      Badge URL
                                    </Label>
                                    <div className="col-span-3 flex items-center gap-2">
                                      <span className="text-xs text-blue-400 truncate max-w-[150px]">
                                        /badges/{editingStudent.badgeId}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() =>
                                          copyBadgeUrl(editingStudent.badgeId!)
                                        }
                                      >
                                        <Copy className="h-3 w-3 text-[var(--gray)]" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button onClick={updateStudent} type="submit">
                                Save Changes
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteStudent(student.studentId)}
                          className="h-8 w-8 text-[var(--gray)] hover:bg-[var(--gray)]/10 hover:text-[var(--gray)]"
                        >
                          <Trash2 className="h-4 w-4 text-[var(--gray)]" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
