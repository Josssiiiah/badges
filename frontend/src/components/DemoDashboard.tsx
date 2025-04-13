import * as React from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Building, CheckCircle, GraduationCap } from "lucide-react";

// Animation variants for consistent effects
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

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

// Sample data
const students = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    initials: "AJ",
    badges: [
      {
        id: 1,
        name: "Digital Marketing Fundamentals",
        date: "Mar 15, 2024",
        description: "Completed digital marketing course with distinction",
      },
      {
        id: 2,
        name: "Content Strategy",
        date: "Feb 10, 2024",
        description: "Mastered content strategy and planning",
      },
      {
        id: 3,
        name: "Social Media Management",
        date: "Jan 5, 2024",
        description: "Expert level social media management skills",
      },
    ],
    achievements: [
      "Completed 8 professional courses",
      "Earned 3 specialized badges",
      "Active member since 2023",
      "Top 5% in program performance",
    ],
  },
  {
    id: 2,
    name: "Taylor Smith",
    email: "taylor.smith@example.com",
    initials: "TS",
    badges: [
      {
        id: 1,
        name: "Project Management",
        date: "Mar 20, 2024",
        description: "Certified in project management methodologies",
      },
      {
        id: 2,
        name: "Agile Development",
        date: "Feb 15, 2024",
        description: "Advanced Agile practices and tools",
      },
    ],
    achievements: [
      "Completed 6 professional courses",
      "Earned 2 professional certifications",
      "Active member since 2023",
      "Led 3 successful projects",
    ],
  },
  {
    id: 3,
    name: "Jordan Williams",
    email: "jordan.williams@example.com",
    initials: "JW",
    badges: [
      {
        id: 1,
        name: "Web Development",
        date: "Mar 25, 2024",
        description: "Full-stack web development expertise",
      },
      {
        id: 2,
        name: "UI/UX Design",
        date: "Feb 20, 2024",
        description: "User-centered design principles",
      },
      {
        id: 3,
        name: "Frontend Development",
        date: "Jan 15, 2024",
        description: "Advanced frontend development skills",
      },
    ],
    achievements: [
      "Completed 7 development courses",
      "Earned 3 specialized badges",
      "Active member since 2023",
      "Built 5 production applications",
    ],
  },
];

const badges = [
  {
    id: 1,
    name: "Digital Marketing Fundamentals",
    description: "Master digital marketing concepts and applications",
    category: "Marketing",
  },
  {
    id: 2,
    name: "Project Management",
    description: "Design and implement project management solutions",
    category: "Business",
  },
  {
    id: 3,
    name: "Web Development",
    description: "Build complete web applications",
    category: "Technology",
  },
];

const organization = {
  name: "Badgespot Continuing Studies",
  description:
    "Leading provider of professional education and digital credentials",
  stats: {
    totalBadges: 15,
    activeStudents: 42,
    coursesOffered: 8,
  },
};

export function DemoDashboard() {
  const [selectedStudent, setSelectedStudent] = React.useState<number | null>(
    null
  );

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className="max-w-6xl mx-auto"
    >
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/30">
        <div className="p-6 border-b border-white/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <Award className="h-4 w-4 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                {organization.name}
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
                Demo Mode
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="badges" className="w-full">
            <TabsList className="w-full max-w-md mx-auto mb-6 bg-slate-100/50 p-1 rounded-lg">
              <TabsTrigger
                value="badges"
                className="flex-1 flex items-center justify-center gap-2 py-3 transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 data-[state=inactive]:text-slate-600 hover:text-slate-900"
              >
                <Award className="h-4 w-4" />
                <span>Badges</span>
              </TabsTrigger>
              <TabsTrigger
                value="students"
                className="flex-1 flex items-center justify-center gap-2 py-3 transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 data-[state=inactive]:text-slate-600 hover:text-slate-900"
              >
                <GraduationCap className="h-4 w-4" />
                <span>Students</span>
              </TabsTrigger>
              <TabsTrigger
                value="organization"
                className="flex-1 flex items-center justify-center gap-2 py-3 transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 data-[state=inactive]:text-slate-600 hover:text-slate-900"
              >
                <Building className="h-4 w-4" />
                <span>Organization</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="badges" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {badges.map((badge) => (
                  <Card
                    key={badge.id}
                    className="group hover:shadow-lg transition-shadow bg-white/70 backdrop-blur-md border border-white/30"
                  >
                    <CardHeader className="pb-2">
                      <div className="h-32 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg mb-4 flex items-center justify-center">
                        <Award className="h-12 w-12 text-indigo-600" />
                      </div>
                      <CardTitle className="text-lg text-slate-900">
                        {badge.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700">
                        {badge.description}
                      </p>
                      <div className="mt-2">
                        <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600">
                          {badge.category}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="students" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => setSelectedStudent(student.id)}
                    >
                      <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-slate-600">
                          {student.initials}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">
                          {student.name}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {student.badges.length} badges earned
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="lg:col-span-2">
                  {selectedStudent ? (
                    <Card className="h-full bg-white/70 backdrop-blur-md border border-white/30">
                      <CardHeader className="pb-4">
                        <div className="flex items-center space-x-4">
                          <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center">
                            <span className="text-xl font-medium text-slate-600">
                              {
                                students.find((s) => s.id === selectedStudent)
                                  ?.initials
                              }
                            </span>
                          </div>
                          <div>
                            <CardTitle className="text-2xl text-slate-900">
                              {
                                students.find((s) => s.id === selectedStudent)
                                  ?.name
                              }
                            </CardTitle>
                            <p className="text-slate-600">
                              {
                                students.find((s) => s.id === selectedStudent)
                                  ?.email
                              }
                            </p>
                            <p className="text-sm text-indigo-600 mt-1">
                              badgespot.com/users/
                              {students
                                .find((s) => s.id === selectedStudent)
                                ?.name.toLowerCase()
                                .replace(/\s+/g, "-")}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold mb-3 text-slate-900">
                              Earned Badges
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {students
                                .find((s) => s.id === selectedStudent)
                                ?.badges.map((badge) => (
                                  <div
                                    key={badge.id}
                                    className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg"
                                  >
                                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
                                      <Award className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-slate-900">
                                        {badge.name}
                                      </h4>
                                      <p className="text-sm text-slate-600">
                                        Issued on {badge.date}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold mb-3 text-slate-900">
                              Achievements
                            </h3>
                            <div className="space-y-2">
                              {students
                                .find((s) => s.id === selectedStudent)
                                ?.achievements.map((achievement, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center space-x-2 text-slate-600"
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>{achievement}</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="h-full flex items-center justify-center bg-white/70 backdrop-blur-md border border-white/30">
                      <CardContent className="py-12 text-center">
                        <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                          <GraduationCap className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-2">
                          Select a Student
                        </h3>
                        <p className="text-slate-600">
                          Choose a student from the list to view their details
                          and achievements
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="organization" className="mt-6">
              <div className="max-w-2xl mx-auto">
                <Card className="bg-white/70 backdrop-blur-md border border-white/30">
                  <CardHeader>
                    <CardTitle className="text-slate-900">
                      Organization Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Building className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">
                          {organization.name}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {organization.description}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600">Total Badges</p>
                        <p className="text-2xl font-semibold text-slate-900">
                          {organization.stats.totalBadges}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600">
                          Active Students
                        </p>
                        <p className="text-2xl font-semibold text-slate-900">
                          {organization.stats.activeStudents}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600">
                          Courses Offered
                        </p>
                        <p className="text-2xl font-semibold text-slate-900">
                          {organization.stats.coursesOffered}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}
