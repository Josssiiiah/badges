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
import { Pencil, Trash2, PlusCircle } from "lucide-react";

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

// Use the environment variable for API URL
const API_URL = `${import.meta.env.VITE_BACKEND_URL}/students`;

export function StudentDashboard({
  initialStudents = [],
  badges = [],
}: {
  initialStudents?: Student[];
  badges?: Badge[];
}) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [loading, setLoading] = useState<boolean>(initialStudents.length === 0);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState<Student>({
    studentId: "",
    name: "",
    email: "",
    hasBadge: false,
  });
  const { toast } = useToast();

  // Update students state when initialStudents prop changes
  useEffect(() => {
    if (initialStudents.length > 0) {
      setStudents(initialStudents);
      setLoading(false);
    } else if (students.length === 0) {
      fetchStudents();
    }
  }, [initialStudents]);

  // Update fetchStudents function to only fetch if we don't have initialStudents
  const fetchStudents = async () => {
    if (initialStudents.length > 0) {
      setStudents(initialStudents);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/all`);
      const data = await response.json();

      if (data.students) {
        setStudents(data.students);
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

  const addStudent = async () => {
    try {
      // Validate form
      if (!newStudent.studentId || !newStudent.name || !newStudent.email) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all required fields",
        });
        return;
      }

      // API call
      const response = await fetch(`${API_URL}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStudent),
      });

      if (!response.ok) {
        throw new Error("Failed to add student");
      }

      const result = await response.json();

      // Update local state
      setStudents([...students, result.student]);

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

      // First update student info
      const response = await fetch(
        `${API_URL}/update/${editingStudent.studentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editingStudent.name,
            email: editingStudent.email,
            hasBadge: editingStudent.hasBadge,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update student");
      }

      const result = await response.json();

      // If badge is being assigned, create a badge assignment
      if (editingStudent.hasBadge && editingStudent.badgeId) {
        const badgeResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/badges/assign`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              badgeId: editingStudent.badgeId,
              userId: editingStudent.studentId,
            }),
          }
        );

        if (!badgeResponse.ok) {
          throw new Error("Failed to assign badge");
        }
      }

      // Update local state
      setStudents(
        students.map((s) =>
          s.studentId === editingStudent.studentId ? result.student : s
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
      const response = await fetch(`${API_URL}/delete/${studentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete student");
      }

      // Update local state
      setStudents(students.filter((s) => s.studentId !== studentId));

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-[var(--main-text)]">
            Student Management
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4 text-[var(--gray)]" />{" "}
                <span className="text-gray-500">Add Student</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="studentId"
                    className="text-right text-gray-500"
                  >
                    Student ID
                  </Label>
                  <Input
                    id="studentId"
                    value={newStudent.studentId}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        studentId: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right text-gray-500">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newStudent.name}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, name: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right text-gray-500">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStudent.email}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, email: e.target.value })
                    }
                    className="col-span-3"
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
        </CardHeader>
      </Card>

      {/* Student Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[var(--main-text)]">
                  Student ID
                </TableHead>
                <TableHead className="text-[var(--main-text)]">Name</TableHead>
                <TableHead className="text-[var(--main-text)]">Email</TableHead>
                <TableHead className="text-[var(--main-text)]">Badge</TableHead>
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
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-[var(--main-text)]/80"
                  >
                    No students found.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.studentId}>
                    <TableCell className="font-medium text-[var(--main-text)]">
                      {student.studentId}
                    </TableCell>
                    <TableCell className="text-[var(--main-text)]">
                      {student.name}
                    </TableCell>
                    <TableCell className="text-[var(--main-text)]">
                      {student.email}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {student.badge ? (
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
                          <DialogContent className="sm:max-w-[425px]">
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
