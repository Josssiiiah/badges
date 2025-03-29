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
import { Pencil, Trash2 } from "lucide-react";

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
  }, [initialStudents, students]);

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

      // API call
      const response = await fetch(
        `${API_URL}/update/${editingStudent.studentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingStudent),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update student");
      }

      const result = await response.json();

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
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Students</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Student</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white" htmlFor="studentId">
                  Student ID
                </Label>
                <Input
                  id="studentId"
                  value={newStudent.studentId}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, studentId: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white" htmlFor="name">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newStudent.name}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white" htmlFor="email">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, email: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={addStudent}>Add Student</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border ">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Badge</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.studentId}>
                  <TableCell>{student.studentId}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      {student.badge && (
                        <img
                          src={student.badge.imageData}
                          alt={student.badge.name}
                          className="w-8 h-8 object-contain"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingStudent(student)}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Student</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-name">Name</Label>
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
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-email">Email</Label>
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
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Badge Status</Label>
                              <div className="flex items-center gap-4">
                                <Checkbox
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
                                <span className="text-sm text-gray-500">
                                  Has Badge
                                </span>
                              </div>
                            </div>
                            {editingStudent?.hasBadge && (
                              <div className="space-y-2">
                                <Label>Select Badge</Label>
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
                                  <SelectTrigger>
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
                                            className="w-6 h-6 object-contain"
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
                          <DialogFooter className="mt-16">
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button onClick={updateStudent}>
                              Save Changes
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteStudent(student.studentId)}
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
