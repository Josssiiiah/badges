import * as React from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Award,
  Building,
  CheckCircle,
  GraduationCap,
  ChevronLeft,
} from "lucide-react";

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
  const [showStudentDetail, setShowStudentDetail] = React.useState(false);

  const handleStudentClick = (studentId: number) => {
    setSelectedStudent(studentId);
    // On mobile, switch to detail view
    if (window.innerWidth < 1024) {
      setShowStudentDetail(true);
    }
  };

  const handleBackToList = () => {
    setShowStudentDetail(false);
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className="w-full max-w-6xl mx-auto px-4 sm:px-6"
    >
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/30">
        <div className="p-4 sm:p-6 border-b border-white/30">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <Award className="h-4 w-4 text-indigo-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-none">
                {organization.name}
              </h3>
            </div>
            <div className="flex items-center">
              <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full bg-green-100 text-green-700">
                Demo Mode
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <Tabs defaultValue="badges" className="w-full">
            <TabsList className="w-full mx-auto mb-4 sm:mb-6 bg-slate-100/50 p-1 rounded-lg overflow-x-auto no-scrollbar">
              <TabsTrigger
                value="badges"
                className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 data-[state=inactive]:text-slate-600 hover:text-slate-900 text-xs sm:text-sm"
              >
                <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Badges</span>
              </TabsTrigger>
              <TabsTrigger
                value="students"
                className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 data-[state=inactive]:text-slate-600 hover:text-slate-900 text-xs sm:text-sm"
              >
                <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Students</span>
              </TabsTrigger>
              <TabsTrigger
                value="organization"
                className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 data-[state=inactive]:text-slate-600 hover:text-slate-900 text-xs sm:text-sm"
              >
                <Building className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Organization</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="badges" className="mt-4 sm:mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {badges.map((badge) => (
                  <Card
                    key={badge.id}
                    className="group hover:shadow-lg transition-shadow bg-white/70 backdrop-blur-md border border-white/30"
                  >
                    <CardHeader className="pb-2 p-4 sm:p-6">
                      <div className="h-24 sm:h-32 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg mb-3 sm:mb-4 flex items-center justify-center">
                        <Award className="h-10 w-10 sm:h-12 sm:w-12 text-indigo-600" />
                      </div>
                      <CardTitle className="text-base sm:text-lg text-slate-900">
                        {badge.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                      <p className="text-xs sm:text-sm text-slate-700">
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

            <TabsContent value="students" className="mt-4 sm:mt-6">
              <div
                className={`grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 ${showStudentDetail && "lg:hidden"}`}
              >
                <div
                  className={`lg:col-span-1 space-y-3 sm:space-y-4 ${showStudentDetail ? "hidden" : "block"} lg:block`}
                >
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => handleStudentClick(student.id)}
                    >
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs sm:text-sm font-medium text-slate-600">
                          {student.initials}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-slate-900 text-sm sm:text-base truncate">
                          {student.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600">
                          {student.badges.length} badges earned
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  className={`lg:col-span-2 ${showStudentDetail ? "block" : "hidden"} lg:block`}
                >
                  {selectedStudent ? (
                    <Card className="h-full bg-white/70 backdrop-blur-md border border-white/30">
                      <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                        {showStudentDetail && (
                          <button
                            onClick={handleBackToList}
                            className="mb-4 flex items-center text-sm text-slate-600 hover:text-slate-900 lg:hidden"
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back to students
                          </button>
                        )}
                        <div className="flex items-start sm:items-center flex-col sm:flex-row sm:space-x-4">
                          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-slate-200 flex items-center justify-center mb-3 sm:mb-0">
                            <span className="text-lg sm:text-xl font-medium text-slate-600">
                              {
                                students.find((s) => s.id === selectedStudent)
                                  ?.initials
                              }
                            </span>
                          </div>
                          <div>
                            <CardTitle className="text-xl sm:text-2xl text-slate-900">
                              {
                                students.find((s) => s.id === selectedStudent)
                                  ?.name
                              }
                            </CardTitle>
                            <p className="text-sm text-slate-600 break-all sm:break-normal">
                              {
                                students.find((s) => s.id === selectedStudent)
                                  ?.email
                              }
                            </p>
                            <p className="text-xs sm:text-sm text-indigo-600 mt-1 truncate">
                              badgespot.com/users/
                              {students
                                .find((s) => s.id === selectedStudent)
                                ?.name.toLowerCase()
                                .replace(/\s+/g, "-")}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        <div className="space-y-5 sm:space-y-6">
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-slate-900">
                              Earned Badges
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              {students
                                .find((s) => s.id === selectedStudent)
                                ?.badges.map((badge) => (
                                  <div
                                    key={badge.id}
                                    className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-slate-50 rounded-lg"
                                  >
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                                      <Award className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="font-medium text-slate-900 text-sm sm:text-base truncate">
                                        {badge.name}
                                      </h4>
                                      <p className="text-xs sm:text-sm text-slate-600">
                                        Issued on {badge.date}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-slate-900">
                              Achievements
                            </h3>
                            <div className="space-y-2">
                              {students
                                .find((s) => s.id === selectedStudent)
                                ?.achievements.map((achievement, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start sm:items-center space-x-2 text-xs sm:text-sm text-slate-600"
                                  >
                                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mt-0.5 sm:mt-0 flex-shrink-0" />
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
                      <CardContent className="py-8 sm:py-12 text-center">
                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
                        </div>
                        <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-1 sm:mb-2">
                          Select a Student
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600">
                          Choose a student from the list to view their details
                          and achievements
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="organization" className="mt-4 sm:mt-6">
              <div className="w-full mx-auto">
                <Card className="bg-white/70 backdrop-blur-md border border-white/30">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg text-slate-900">
                      Organization Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <Building className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-slate-900 text-sm sm:text-base truncate">
                          {organization.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600">
                          {organization.description}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div className="p-3 sm:p-4 bg-slate-50 rounded-lg">
                        <p className="text-xs sm:text-sm text-slate-600">
                          Total Badges
                        </p>
                        <p className="text-xl sm:text-2xl font-semibold text-slate-900">
                          {organization.stats.totalBadges}
                        </p>
                      </div>
                      <div className="p-3 sm:p-4 bg-slate-50 rounded-lg">
                        <p className="text-xs sm:text-sm text-slate-600">
                          Active Students
                        </p>
                        <p className="text-xl sm:text-2xl font-semibold text-slate-900">
                          {organization.stats.activeStudents}
                        </p>
                      </div>
                      <div className="p-3 sm:p-4 bg-slate-50 rounded-lg">
                        <p className="text-xs sm:text-sm text-slate-600">
                          Courses Offered
                        </p>
                        <p className="text-xl sm:text-2xl font-semibold text-slate-900">
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
