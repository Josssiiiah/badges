import * as React from "react";
import { createFileRoute, useLoaderData, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronRight,
  ShieldCheck,
  BadgeCheck,
  Users,
  Clock,
  BarChart3,
  CheckCircle,
  School,
  KeyRound,
} from "lucide-react";

// Import dashboard images
import badgeDashboardImg from "../public/badgeDashboard.png";
import adminDashboardImg from "../public/adminDashboard.png";
import studentDashboardImg from "../public/studentDashboard.png";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  loader: async () => {
    return {
      // Empty loader that can be expanded later
      emptyLoader: queryOptions({
        queryKey: ["empty"],
        queryFn: async () => {
          return {
            message: "Hello world",
          };
        },
      }),
    };
  },
});

function HomeComponent() {
  const { emptyLoader } = useLoaderData({ from: "/" });
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-12 w-[250px] mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-4/5 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[180px] w-full rounded-lg" />
            <Skeleton className="h-[180px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-b from-white to-slate-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-12">
              <Badge
                variant="outline"
                className="mb-4 text-sm font-medium py-1 px-3 bg-blue-50 text-blue-700 border-blue-200"
              >
                Powered by AI
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6">
                Smart Badge Management for Modern Education
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Streamline access control and authentication across your campus
                with our intelligent badge system designed for both
                administrators and students.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-[var(--accent-bg)] hover:bg-[var(--light-gray)]"
                >
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLScX8pObxafqTpnPfDg5TYlQ6Oi_-kydt0KzSi1rBUvEv0gKEg/viewform?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    Get Started <ChevronRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 mt-12 md:mt-0">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--main-text)] to-[var(--violet-light)] rounded-lg opacity-75 blur"></div>
                <div className="relative bg-white p-6 rounded-lg shadow-xl">
                  <div className="aspect-video rounded-md overflow-hidden">
                    <img
                      src={badgeDashboardImg}
                      alt="Badge Management Dashboard"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="mb-4 text-sm font-medium py-1 px-3 bg-[var(--accent-bg)] text-[var(--main-text)] border-[var(--light-gray)]"
            >
              Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--main-text)] mb-4">
              Streamlined badge management
            </h2>
            <p className="text-xl text-[var(--gray)] max-w-3xl mx-auto">
              Our intuitive system makes badge management simple for both
              administrators and students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center mb-4">
                  <BadgeCheck className="h-6 w-6 text-[var(--main-text)]" />
                </div>
                <CardTitle className="text-xl">Digital Credentials</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--gray)]">
                  Issue and verify digital badges and credentials that students
                  can showcase in their portfolios.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-[var(--main-text)]" />
                </div>
                <CardTitle className="text-xl">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--gray)]">
                  Easily manage student and staff profiles, permissions, and
                  access levels through an intuitive interface.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-[var(--main-text)]" />
                </div>
                <CardTitle className="text-xl">Real-time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--gray)]">
                  Monitor building access, track attendance, and generate
                  comprehensive reports with our analytics dashboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Administrators & Students Sections */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          {/* For Administrators */}
          <div className="flex flex-col md:flex-row items-center mb-24">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-12">
              <Badge
                variant="outline"
                className="mb-4 text-sm font-medium py-1 px-3 bg-[var(--accent-bg)] text-[var(--main-text)] border-[var(--light-gray)]"
              >
                For Administrators
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--main-text)] mb-6">
                Simple tools for effortless management
              </h2>
              <p className="text-lg text-[var(--gray)] mb-6">
                Manage your institution's access with an intuitive interface
                designed for ease of use, no technical expertise required.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex">
                  <div className="mr-3 text-[var(--violet-light)]">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <span className="text-[var(--dark-gray)]">
                    Quick and easy badge issuance
                  </span>
                </li>
                <li className="flex">
                  <div className="mr-3 text-[var(--violet-light)]">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <span className="text-[var(--dark-gray)]">
                    Straightforward access control
                  </span>
                </li>
                <li className="flex">
                  <div className="mr-3 text-[var(--violet-light)]">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <span className="text-[var(--dark-gray)]">
                    User-friendly approval workflows
                  </span>
                </li>
                <li className="flex">
                  <div className="mr-3 text-[var(--violet-light)]">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <span className="text-[var(--dark-gray)]">
                    Clear reporting and analytics
                  </span>
                </li>
              </ul>
              <Button className="bg-[var(--accent-bg)] hover:bg-[var(--light-gray)]">
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLScX8pObxafqTpnPfDg5TYlQ6Oi_-kydt0KzSi1rBUvEv0gKEg/viewform?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn More for Administrators
                </a>
              </Button>
            </div>
            <div className="md:w-1/2">
              <div className="bg-white p-6 rounded-xl shadow-xl">
                <div className="aspect-video rounded-md overflow-hidden">
                  <img
                    src={adminDashboardImg}
                    alt="Administrator Dashboard View"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* For Students */}
          <div className="flex flex-col md:flex-row-reverse items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pl-12">
              <Badge
                variant="outline"
                className="mb-4 text-sm font-medium py-1 px-3 bg-[var(--accent-bg)] text-[var(--main-text)] border-[var(--light-gray)]"
              >
                For Students
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--main-text)] mb-6">
                Hassle-free access for students
              </h2>
              <p className="text-lg text-[var(--gray)] mb-6">
                A seamless, user-friendly experience that makes campus access a
                breeze for students of all technical abilities.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex">
                  <div className="mr-3 text-[var(--violet-light)]">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <span className="text-[var(--dark-gray)]">
                    One simple badge for everything
                  </span>
                </li>
                <li className="flex">
                  <div className="mr-3 text-[var(--violet-light)]">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <span className="text-[var(--dark-gray)]">
                    Tap-and-go smartphone access
                  </span>
                </li>
                <li className="flex">
                  <div className="mr-3 text-[var(--violet-light)]">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <span className="text-[var(--dark-gray)]">
                    Quick badge renewal process
                  </span>
                </li>
                <li className="flex">
                  <div className="mr-3 text-[var(--violet-light)]">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <span className="text-[var(--dark-gray)]">
                    Easy access history tracking
                  </span>
                </li>
              </ul>
              <Button className="bg-[var(--accent-bg)] hover:bg-[var(--light-gray)]">
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLScX8pObxafqTpnPfDg5TYlQ6Oi_-kydt0KzSi1rBUvEv0gKEg/viewform?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn More for Students
                </a>
              </Button>
            </div>
            <div className="md:w-1/2">
              <div className="bg-white p-6 rounded-xl shadow-xl">
                <div className="aspect-video rounded-md overflow-hidden">
                  <img
                    src={studentDashboardImg}
                    alt="Student Dashboard View"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[var(--main-text)] to-[var(--violet-light)] py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to simplify your campus access management?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join educational institutions already enjoying our hassle-free
              badge management platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-[var(--main-text)] hover:bg-blue-50"
              >
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLScX8pObxafqTpnPfDg5TYlQ6Oi_-kydt0KzSi1rBUvEv0gKEg/viewform?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Request a Demo
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
