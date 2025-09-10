import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BadgeCheck,
  Building,
  Check,
  ChevronRight,
  Copy,
  GraduationCap,
  Pencil,
  Plus,
  Search,
  Shield,
  Trash,
  Upload,
  User,
  Users,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

// Mock data
const mockBadges = [
  {
    id: "1",
    name: "Python Master",
    issuedBy: "Code Academy",
    description: "Advanced Python programming skills",
    imageData: "/python.png",
  },
  {
    id: "2",
    name: "Web Development",
    issuedBy: "Dev Bootcamp",
    description: "Full-stack web development certification",
    imageData: "/web.png",
  },
  {
    id: "3",
    name: "Data Science",
    issuedBy: "Data Institute",
    description: "Proficiency in data analysis and visualization",
    imageData: "/data.png",
  },
];

const mockStudents = [
  {
    studentId: "s1",
    name: "Alex Johnson",
    email: "alex@example.com",
    hasBadge: true,
    badgeId: "1",
    badge: mockBadges[0],
  },
  {
    studentId: "s2",
    name: "Jamie Smith",
    email: "jamie@example.com",
    hasBadge: true,
    badgeId: "2",
    badge: mockBadges[1],
  },
  {
    studentId: "s3",
    name: "Taylor Brown",
    email: "taylor@example.com",
    hasBadge: false,
  },
];

const mockOrganizationUsers = [
  {
    id: "u1",
    name: "Admin User",
    email: "admin@example.org",
    role: "administrator",
    createdAt: "2023-05-15T10:30:00Z",
  },
  {
    id: "u2",
    name: "Staff Member",
    email: "staff@example.org",
    role: "staff",
    createdAt: "2023-06-20T14:45:00Z",
  },
];

const organization = {
  id: "org1",
  name: "Demo Academy",
  short_code: "DEMO123",
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      duration: 0.4,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

export function DemoDashboard() {
  const [activeTab, setActiveTab] = useState("badges");
  const [showBadgeDetails, setShowBadgeDetails] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<
    (typeof mockBadges)[0] | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedShortCode, setCopiedShortCode] = useState(false);

  const handleBadgeClick = (badge: (typeof mockBadges)[0]) => {
    setSelectedBadge(badge);
    setShowBadgeDetails(true);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setShowBadgeDetails(false);
  };

  const handleCopyShortCode = () => {
    setCopiedShortCode(true);
    setTimeout(() => setCopiedShortCode(false), 2000);
  };

  const handleCloseDetails = () => {
    setShowBadgeDetails(false);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl border border-black/5 dark:border-white/10 bg-surface dark:shadow-2xl dark:shadow-black/30">
      {/* Demo header with message that this is a demo */}
      <div className="bg-surface/40 dark:bg-surface-secondary/40 py-3 px-6 flex justify-between items-center border-b border-black/5 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-primary">Admin Dashboard</span>
        </div>
        <Badge className="bg-primary/10 text-green-400 border-green-400">
          Demo Mode
        </Badge>
      </div>

      <div className="p-6">
        <Tabs
          defaultValue="badges"
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-6 bg-surface-secondary/50 dark:bg-surface-secondary p-1 rounded-lg">
            <TabsTrigger
              value="badges"
              className="data-[state=active]:bg-surface data-[state=active]:text-text data-[state=active]:shadow-sm dark:data-[state=active]:shadow-md dark:data-[state=active]:shadow-black/20 text-text-muted"
            >
              <BadgeCheck className="mr-2 h-4 w-4" />
              Badges
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className="data-[state=active]:bg-surface data-[state=active]:text-text data-[state=active]:shadow-sm dark:data-[state=active]:shadow-md dark:data-[state=active]:shadow-black/20 text-text-muted"
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger
              value="organization"
              className="data-[state=active]:bg-surface data-[state=active]:text-text data-[state=active]:shadow-sm dark:data-[state=active]:shadow-md dark:data-[state=active]:shadow-black/20 text-text-muted"
            >
              <Building className="mr-2 h-4 w-4" />
              Organization
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {/* Badge Dashboard Content */}
            <TabsContent value="badges" className="relative">
              {!showBadgeDetails ? (
                <motion.div
                  key="badge-list"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={containerVariants}
                >
                  <Card className="bg-surface shadow-sm dark:shadow-md dark:shadow-black/20 border border-black/5 dark:border-white/10">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Available Badges</CardTitle>
                          <CardDescription>
                            Browse and manage your badge templates
                          </CardDescription>
                        </div>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-white"
                          onClick={() => {}}
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Create Badge
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {mockBadges.map((badge) => (
                          <motion.div
                            key={badge.id}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                          >
                            <Card
                              className="overflow-hidden border border-black/5 cursor-pointer hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/30 transition-all h-full bg-surface dark:bg-surface-secondary"
                              onClick={() => handleBadgeClick(badge)}
                            >
                              <div className="aspect-square flex items-center justify-center bg-surface-secondary/30 dark:bg-black/20 relative">
                                <img
                                  src={badge.imageData}
                                  alt={`Badge for ${badge.name}`}
                                  className="max-w-[80%] max-h-[80%] object-contain"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 dark:bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                                  <Pencil className="h-6 w-6 text-white" />
                                </div>
                              </div>
                              <CardHeader className="p-3">
                                <CardTitle className="text-base font-medium truncate">
                                  {badge.name}
                                </CardTitle>
                                <CardDescription className="text-xs line-clamp-1">
                                  {badge.description}
                                </CardDescription>
                              </CardHeader>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="badge-details"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="bg-surface shadow-sm dark:shadow-md dark:shadow-black/20 border border-black/5 dark:border-white/10">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCloseDetails}
                            className="h-8 w-8 p-0 rounded-full hover:bg-surface-secondary/70 dark:hover:bg-surface-accent/30"
                          >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                          </Button>
                          <CardTitle>Badge Details</CardTitle>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30 dark:border-red-800/30"
                          >
                            <Trash className="mr-1 h-4 w-4" />
                            Delete
                          </Button>
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-white"
                          >
                            <Pencil className="mr-1 h-4 w-4" />
                            Edit Badge
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {selectedBadge && (
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="flex flex-col items-center">
                            <div className="aspect-square w-full max-w-[240px] flex items-center justify-center bg-surface-secondary/30 dark:bg-black/20 rounded-lg p-4 mb-4 border border-black/5 dark:border-white/10">
                              <img
                                src={selectedBadge.imageData}
                                alt={`Badge for ${selectedBadge.name}`}
                                className="max-w-[90%] max-h-[90%] object-contain"
                              />
                            </div>
                            <Button
                              variant="default"
                              className="w-full border border-text-muted"
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Upload New Image
                            </Button>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-sm font-medium text-text-muted mb-1">
                                Badge Name
                              </h3>
                              <p className="text-text">{selectedBadge.name}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-text-muted mb-1">
                                Issuing Organization
                              </h3>
                              <p className="text-text">
                                {selectedBadge.issuedBy}
                              </p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-text-muted mb-1">
                                Description
                              </h3>
                              <p className="text-text">
                                {selectedBadge.description}
                              </p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-text-muted mb-1">
                                Skills
                              </h3>
                              <div className="flex flex-wrap gap-1">
                                {[
                                  "Programming",
                                  "Problem Solving",
                                  "Algorithms",
                                ].map((skill) => (
                                  <Badge
                                    key={skill}
                                    className="bg-surface-secondary text-text-muted border-none dark:bg-surface-accent/40"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            {/* Student Dashboard Content */}
            <TabsContent value="students">
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={containerVariants}
              >
                <Card className="bg-surface shadow-sm dark:shadow-md dark:shadow-black/20 border border-black/5 dark:border-white/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Student Management</CardTitle>
                        <CardDescription>
                          View and manage student credentials
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-primary/20 text-primary hover:bg-primary/5 dark:border-primary/40 dark:hover:bg-primary/20"
                        >
                          <Upload className="mr-1 h-4 w-4" />
                          Import CSV
                        </Button>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-white"
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Add Student
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
                      <Input
                        placeholder="Search students..."
                        className="pl-9 bg-surface-secondary/30 dark:bg-surface-secondary/50 border-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="rounded-lg border border-black/5 dark:border-white/10 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-surface-secondary/30 dark:bg-surface-secondary/70">
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Badge Status</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockStudents.map((student) => (
                            <TableRow
                              key={student.studentId}
                              className="dark:border-white/5"
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-2">
                                    <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20">
                                      {student.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  {student.name}
                                </div>
                              </TableCell>
                              <TableCell>{student.email}</TableCell>
                              <TableCell>
                                {student.hasBadge ? (
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300 border-none">
                                    <Check className="mr-1 h-3 w-3" />
                                    Issued
                                  </Badge>
                                ) : (
                                  <Badge className="bg-surface-secondary text-text-muted border-none dark:bg-surface-secondary/70">
                                    Not Issued
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {student.hasBadge ? (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 text-primary hover:text-primary/90 hover:bg-primary/5 dark:hover:bg-primary/20"
                                    >
                                      View Badge
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 text-primary hover:text-primary/90 hover:bg-primary/5 dark:hover:bg-primary/20"
                                    >
                                      Assign Badge
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-text-muted hover:text-text hover:bg-surface-secondary/50 dark:hover:bg-surface-secondary"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Organization Dashboard Content */}
            <TabsContent value="organization">
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={containerVariants}
              >
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <motion.div variants={itemVariants}>
                    <Card className="bg-surface shadow-sm dark:shadow-md dark:shadow-black/20 border border-black/5 dark:border-white/10 h-full">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-surface-accent/20 dark:bg-surface-accent/40">
                            <Building className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              Organization Profile
                            </CardTitle>
                            <CardDescription>
                              Basic organization details
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 rounded-lg bg-surface-secondary/30 dark:bg-surface-secondary/60 border border-black/5 dark:border-white/5">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-text-muted" />
                              <span className="text-sm font-medium text-text-muted">
                                Organization
                              </span>
                            </div>
                            <span className="text-base font-medium text-text">
                              {organization.name}
                            </span>
                          </div>

                          <div className="flex justify-between items-center p-3 rounded-lg bg-surface-secondary/30 dark:bg-surface-secondary/60 border border-black/5 dark:border-white/5">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-text-muted" />
                              <span className="text-sm font-medium text-text-muted">
                                Organization Code
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-medium text-text">
                                {organization.short_code}
                              </span>
                              <button
                                onClick={handleCopyShortCode}
                                className="p-1 rounded-md hover:bg-surface-accent/20 dark:hover:bg-surface-accent/40 transition-colors"
                                aria-label="Copy organization code"
                              >
                                {copiedShortCode ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4 text-text-muted" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Card className="bg-surface shadow-sm dark:shadow-md dark:shadow-black/20 border border-black/5 dark:border-white/10 h-full">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-surface-accent/20 dark:bg-surface-accent/40">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              Member Statistics
                            </CardTitle>
                            <CardDescription>
                              Overview of organization members
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="p-3 rounded-lg bg-surface-secondary/30 dark:bg-surface-secondary/60 border border-black/5 dark:border-white/5 flex flex-col items-center justify-center">
                            <div className="text-2xl font-bold text-primary">
                              {
                                mockOrganizationUsers.filter(
                                  (u) => u.role === "administrator"
                                ).length
                              }
                            </div>
                            <div className="flex items-center gap-1 text-sm text-text-muted">
                              <Shield className="h-3.5 w-3.5" />
                              <span>Administrators</span>
                            </div>
                          </div>

                          <div className="p-3 rounded-lg bg-surface-secondary/30 dark:bg-surface-secondary/60 border border-black/5 dark:border-white/5 flex flex-col items-center justify-center">
                            <div className="text-2xl font-bold text-primary">
                              {mockStudents.length}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-text-muted">
                              <GraduationCap className="h-3.5 w-3.5" />
                              <span>Students</span>
                            </div>
                          </div>
                        </div>

                        {/* <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                          <User className="h-4 w-4 mr-2" />
                          Invite New Administrator
                        </Button> */}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                <motion.div variants={itemVariants}>
                  <Card className="bg-surface shadow-sm dark:shadow-md dark:shadow-black/20 border border-black/5 dark:border-white/10">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-surface-accent/20 dark:bg-surface-accent/40">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle>Organization Members</CardTitle>
                          <CardDescription>
                            Manage your organization's users
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg border border-black/5 dark:border-white/10 overflow-hidden">
                        <Table>
                          <TableHeader className="bg-surface-secondary/30 dark:bg-surface-secondary/70">
                            <TableRow>
                              <TableHead className="w-12"></TableHead>
                              <TableHead>User</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Join Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mockOrganizationUsers.map((user) => (
                              <TableRow
                                key={user.id}
                                className="dark:border-white/5"
                              >
                                <TableCell className="font-medium">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20">
                                      {user.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-medium text-text">
                                      {user.name}
                                    </span>
                                    <span className="text-sm text-text-muted">
                                      {user.email}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      user.role === "administrator"
                                        ? "bg-primary/10 text-primary border-none dark:bg-primary/20"
                                        : "bg-surface-secondary/70 text-text-muted border-none dark:bg-surface-secondary"
                                    }
                                  >
                                    {user.role === "administrator" ? (
                                      <Shield className="inline h-3 w-3 mr-1" />
                                    ) : (
                                      <User className="inline h-3 w-3 mr-1" />
                                    )}
                                    {user.role}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {new Date(user.createdAt).toLocaleDateString(
                                    undefined,
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
