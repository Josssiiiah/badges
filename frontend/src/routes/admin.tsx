import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
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
import { Toaster } from "@/components/ui/toaster";

type Student = {
  studentId: string;
  name: string;
  email: string;
  hasBadge: boolean;
};

const API_URL = "http://localhost:3000/api/students";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSessionLoading && !session) {
      navigate({
        to: "/login",
        search: {
          redirectTo: "/admin",
        },
      });
    }
  }, [session, isSessionLoading, navigate]);

  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!session) {
    return null; // This will be shown briefly before the redirect happens
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-white">Admin Dashboard</h1>

        <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2 text-white">
              Welcome, {session.user?.email || "Admin"}
            </h2>
            <p className="text-gray-400">This is a protected admin area.</p>
          </div>

          {/* Student Dashboard */}
          <StudentDashboard />

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:bg-gray-600 transition-colors">
              <h3 className="font-medium text-gray-200 mb-2">
                User Management
              </h3>
              <p className="text-sm text-gray-400">
                Manage user accounts and permissions
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:bg-gray-600 transition-colors">
              <h3 className="font-medium text-gray-200 mb-2">
                Content Management
              </h3>
              <p className="text-sm text-gray-400">
                Manage website content and settings
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:bg-gray-600 transition-colors">
              <h3 className="font-medium text-gray-200 mb-2">Analytics</h3>
              <p className="text-sm text-gray-400">
                View site statistics and reports
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:bg-gray-600 transition-colors">
              <h3 className="font-medium text-gray-200 mb-2">
                System Settings
              </h3>
              <p className="text-sm text-gray-400">
                Configure system preferences
              </p>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

function StudentDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState<Student>({
    studentId: "",
    name: "",
    email: "",
    hasBadge: false,
  });
  const { toast } = useToast();

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();

      if (data.students) {
        setStudents(data.students);
      } else {
        // If API not available, use mock data
        setStudents([
          {
            studentId: "STU1001",
            name: "Alice Johnson",
            email: "alice@example.com",
            hasBadge: false,
          },
          {
            studentId: "STU1002",
            name: "Bob Smith",
            email: "bob@example.com",
            hasBadge: true,
          },
          {
            studentId: "STU1003",
            name: "Charlie Brown",
            email: "charlie@example.com",
            hasBadge: false,
          },
          {
            studentId: "STU1004",
            name: "Diana Ross",
            email: "diana@example.com",
            hasBadge: true,
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      // Use mock data if API fails
      setStudents([
        {
          studentId: "STU1001",
          name: "Alice Johnson",
          email: "alice@example.com",
          hasBadge: false,
        },
        {
          studentId: "STU1002",
          name: "Bob Smith",
          email: "bob@example.com",
          hasBadge: true,
        },
        {
          studentId: "STU1003",
          name: "Charlie Brown",
          email: "charlie@example.com",
          hasBadge: false,
        },
        {
          studentId: "STU1004",
          name: "Diana Ross",
          email: "diana@example.com",
          hasBadge: true,
        },
      ]);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to connect to API. Using mock data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleBadge = async (studentId: string) => {
    try {
      const student = students.find((s) => s.studentId === studentId);
      if (!student) return;

      const updatedStudent = { ...student, hasBadge: !student.hasBadge };

      // Optimistic update
      setStudents(
        students.map((s) => (s.studentId === studentId ? updatedStudent : s))
      );

      // API update
      const response = await fetch(`${API_URL}/${studentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedStudent),
      });

      if (!response.ok) {
        throw new Error("Failed to update student");
      }

      toast({
        title: "Success",
        description: `Badge ${updatedStudent.hasBadge ? "assigned to" : "removed from"} ${student.name}`,
      });
    } catch (error) {
      console.error("Error updating badge:", error);
      // Revert on error
      fetchStudents();
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update badge",
      });
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
      const response = await fetch(API_URL, {
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
      const response = await fetch(`${API_URL}/${editingStudent.studentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingStudent),
      });

      if (!response.ok) {
        throw new Error("Failed to update student");
      }

      // Update local state
      setStudents(
        students.map((s) =>
          s.studentId === editingStudent.studentId ? editingStudent : s
        )
      );

      // Reset form
      setEditingStudent(null);

      toast({
        title: "Success",
        description: `${editingStudent.name} updated successfully`,
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
      // API call
      const response = await fetch(`${API_URL}/${studentId}`, {
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
    <div className="mt-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Student Management
        </h2>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="default"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 text-white border-gray-700">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="studentId" className="text-right">
                  Student ID
                </Label>
                <Input
                  id="studentId"
                  value={newStudent.studentId}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, studentId: e.target.value })
                  }
                  className="col-span-3 bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newStudent.name}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, name: e.target.value })
                  }
                  className="col-span-3 bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={newStudent.email}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, email: e.target.value })
                  }
                  className="col-span-3 bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="hasBadge" className="text-right">
                  Has Badge
                </Label>
                <Checkbox
                  id="hasBadge"
                  checked={newStudent.hasBadge}
                  onCheckedChange={(checked) =>
                    setNewStudent({ ...newStudent, hasBadge: checked === true })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={addStudent}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Add Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-900">
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Student ID</TableHead>
                <TableHead className="text-gray-300">Name</TableHead>
                <TableHead className="text-gray-300">Email</TableHead>
                <TableHead className="text-gray-300">Badge</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow
                  key={student.studentId}
                  className="border-gray-700 hover:bg-gray-700"
                >
                  <TableCell className="text-gray-300">
                    {student.studentId}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {student.name}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {student.email}
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={student.hasBadge}
                      onCheckedChange={() => toggleBadge(student.studentId)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                            onClick={() => setEditingStudent(student)}
                          >
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-800 text-white border-gray-700">
                          <DialogHeader>
                            <DialogTitle>Edit Student</DialogTitle>
                          </DialogHeader>
                          {editingStudent && (
                            <>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor="edit-studentId"
                                    className="text-right"
                                  >
                                    Student ID
                                  </Label>
                                  <Input
                                    id="edit-studentId"
                                    value={editingStudent.studentId}
                                    disabled
                                    className="col-span-3 bg-gray-700 border-gray-600 text-white opacity-50"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor="edit-name"
                                    className="text-right"
                                  >
                                    Name
                                  </Label>
                                  <Input
                                    id="edit-name"
                                    value={editingStudent.name}
                                    onChange={(e) =>
                                      setEditingStudent({
                                        ...editingStudent,
                                        name: e.target.value,
                                      })
                                    }
                                    className="col-span-3 bg-gray-700 border-gray-600 text-white"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor="edit-email"
                                    className="text-right"
                                  >
                                    Email
                                  </Label>
                                  <Input
                                    id="edit-email"
                                    value={editingStudent.email}
                                    onChange={(e) =>
                                      setEditingStudent({
                                        ...editingStudent,
                                        email: e.target.value,
                                      })
                                    }
                                    className="col-span-3 bg-gray-700 border-gray-600 text-white"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor="edit-hasBadge"
                                    className="text-right"
                                  >
                                    Has Badge
                                  </Label>
                                  <Checkbox
                                    id="edit-hasBadge"
                                    checked={editingStudent.hasBadge}
                                    onCheckedChange={(checked) =>
                                      setEditingStudent({
                                        ...editingStudent,
                                        hasBadge: checked === true,
                                      })
                                    }
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button
                                    variant="outline"
                                    className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                                  >
                                    Cancel
                                  </Button>
                                </DialogClose>
                                <Button
                                  onClick={updateStudent}
                                  className="bg-indigo-600 hover:bg-indigo-700"
                                >
                                  Save Changes
                                </Button>
                              </DialogFooter>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteStudent(student.studentId)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
