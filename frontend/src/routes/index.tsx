import * as React from "react";
import { createFileRoute, useLoaderData, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { queryOptions } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  ChevronRight,
  BadgeCheck,
  Upload,
  Share2,
  CheckCircle,
  Blocks,
  Cog,
  UsersRound,
  GraduationCap,
  Computer,
  Award,
  Briefcase,
  DollarSign,
  Zap,
  Palette,
  Megaphone,
  Building,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DemoDashboard } from "@/components/DemoDashboard";

// Animation variants for consistent effects
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
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

const cardVariant = {
  hidden: { opacity: 0, y: 30 },
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
  const [selectedStudent, setSelectedStudent] = React.useState<number | null>(
    null
  );

  if (isPending) {
    return (
      <div className="container mx-auto flex justify-center items-center h-screen">
        <Skeleton className="h-12 w-1/2 bg-slate-400/50" />
      </div>
    );
  }

  // Demo link - update if you have a specific Calendly or booking link
  const demoLink =
    "https://docs.google.com/forms/d/e/1FAIpQLScX8pObxafqTpnPfDg5TYlQ6Oi_-kydt0KzSi1rBUvEv0gKEg/viewform?usp=sharing";
  const contactEmail = "griggsjo@stanford.edu"; // Replace with actual contact email

  return (
    <>
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 md:py-24 lg:py-32 ">
          <div className="container mx-auto px-4 md:px-6 text-center max-w-7xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="space-y-6 md:space-y-8 lg:space-y-10 mb-10 md:mb-12"
            >
              <motion.h1
                variants={fadeIn}
                className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-slate-900 leading-tight"
              >
                The Simple Way to Issue <br /> Digital Credentials.
              </motion.h1>
              <motion.p
                variants={fadeIn}
                className="mx-auto max-w-[700px] text-lg md:text-xl lg:text-2xl text-slate-700"
              >
                Manage, distribute, and showcase digital badges.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="flex flex-wrap justify-center items-center gap-3 md:gap-4 text-sm md:text-base text-slate-600 mb-0 md:mb-16"
            >
              <motion.span
                variants={fadeIn}
                className="hidden md:flex items-center gap-2 md:gap-3 border border-slate-200 rounded-full px-4 py-2 bg-white/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <BadgeCheck className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />{" "}
                Open Badge–compliant
              </motion.span>
              <motion.span
                variants={fadeIn}
                className="hidden md:flex items-center gap-2 md:gap-3 border border-slate-200 rounded-full px-4 py-2 bg-white/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <Cog className="h-4 w-4 md:h-5 md:w-5 text-slate-700" />{" "}
                Intuitive admin dashboard
              </motion.span>
              {/* <motion.span
                variants={fadeIn}
                className="hidden md:flex items-center gap-2 md:gap-3 border border-slate-200 rounded-full px-4 py-2 bg-white/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <Share2 className="h-4 w-4 md:h-5 md:w-5 text-indigo-500" />{" "}
                1-click LinkedIn sharing
              </motion.span> */}
              <motion.span
                variants={fadeIn}
                className="hidden md:flex items-center gap-2 md:gap-3 border border-slate-200 rounded-full px-4 py-2 bg-white/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <Upload className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />{" "}
                Upload existing badges
              </motion.span>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 mb-10"
            >
              <Button
                size="lg"
                asChild
                className="bg-slate-900 text-white hover:bg-slate-700 shadow-lg px-8 py-6 text-base rounded-xl transition-all hover:scale-105"
              >
                <a
                  href={demoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  Book a Demo <ChevronRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </motion.div>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="text-sm md:text-base text-slate-500 font-medium"
            >
              🎓 Built for Programs, Institutions, and Certifiers
            </motion.p>
          </div>
        </section>

        {/* Demo Dashboard Section */}
        <section className="py-16 md:py-24 lg:py-32 bg-[var(--main-bg)]">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-slate-900 mb-4">
                It doesn't have to be complicated.
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                See how easy it is to manage your digital credentials with our
                intuitive dashboard
              </p>
            </motion.div>
            <DemoDashboard />
          </div>
        </section>

        {/* Subheadline */}
        <section className="py-12 md:py-16 lg:py-20 bg-white/70 backdrop-blur-md">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
              className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl text-slate-900"
            >
              Avoid the cost and complexity of bloated credential platforms.
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="mt-3 text-base md:text-lg text-slate-700"
            >
              Start issuing badges in minutes. No training required.
            </motion.p>
          </div>
        </section>

        {/* Who It's For */}
        <section className="py-12 md:py-16 lg:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
              className="text-2xl font-bold tracking-tight text-center mb-8 md:mb-12 sm:text-3xl md:text-4xl text-slate-900"
            >
              Whether you're...
            </motion.h2>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
              className="grid grid-cols-1 gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto"
            >
              <motion.div variants={cardVariant}>
                <Card className="text-center shadow-lg hover:shadow-xl transition-shadow bg-white/70 backdrop-blur-md border border-white/30">
                  <CardHeader className="pb-2 md:pb-4">
                    <GraduationCap className="h-8 w-8 md:h-10 md:w-10 mx-auto text-indigo-700 mb-2 md:mb-3" />
                    <CardTitle className="text-base md:text-lg text-slate-900">
                      A university or continuing ed program
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs md:text-sm text-slate-700 pt-0">
                    looking to formalize credentials
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={cardVariant}>
                <Card className="text-center shadow-lg hover:shadow-xl transition-shadow bg-white/70 backdrop-blur-md border border-white/30">
                  <CardHeader className="pb-2 md:pb-4">
                    <Computer className="h-8 w-8 md:h-10 md:w-10 mx-auto text-indigo-600 mb-2 md:mb-3" />
                    <CardTitle className="text-base md:text-lg text-slate-900">
                      An online course provider or bootcamp
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs md:text-sm text-slate-700 pt-0">
                    needing verified, shareable proof of completion
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={cardVariant}>
                <Card className="text-center shadow-lg hover:shadow-xl transition-shadow bg-white/70 backdrop-blur-md border border-white/30">
                  <CardHeader className="pb-2 md:pb-4">
                    <Award className="h-8 w-8 md:h-10 md:w-10 mx-auto text-indigo-800 mb-2 md:mb-3" />
                    <CardTitle className="text-base md:text-lg text-slate-900">
                      A certifying body or membership organization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs md:text-sm text-slate-700 pt-0">
                    ready to modernize your credentialing
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={cardVariant}>
                <Card className="text-center shadow-lg hover:shadow-xl transition-shadow bg-white/70 backdrop-blur-md border border-white/30">
                  <CardHeader className="pb-2 md:pb-4">
                    <Briefcase className="h-8 w-8 md:h-10 md:w-10 mx-auto text-slate-700 mb-2 md:mb-3" />
                    <CardTitle className="text-base md:text-lg text-slate-900">
                      A skills-based training provider
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs md:text-sm text-slate-700 pt-0">
                    focused on portable recognition
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center text-base md:text-lg text-slate-800 mt-8 md:mt-12 max-w-3xl mx-auto"
            >
              …you can issue credentials confidently, clearly, and at scale.
            </motion.p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-16 lg:py-24 bg-white/70 backdrop-blur-md">
          <div className="container mx-auto px-4 md:px-6">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
              className="text-2xl font-bold tracking-tight text-center mb-8 md:mb-12 sm:text-3xl md:text-4xl text-slate-900"
            >
              Industry-standard features without the complexity
            </motion.h2>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto"
            >
              <motion.div
                variants={cardVariant}
                className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4 md:p-6 border border-slate-100"
              >
                <h3 className="text-lg md:text-xl font-bold text-center mb-4 md:mb-6 text-slate-900">
                  BadgeSpot
                </h3>
                <ul className="space-y-3 md:space-y-4">
                  <motion.li
                    variants={fadeIn}
                    className="flex items-start gap-2 md:gap-3"
                  >
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm md:text-base text-slate-800">
                      Open Badge–compliant (2.0 & 3.0)
                    </span>
                  </motion.li>
                  <motion.li
                    variants={fadeIn}
                    className="flex items-start gap-2 md:gap-3"
                  >
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm md:text-base text-slate-800">
                      Intuitive administrator dashboard
                    </span>
                  </motion.li>
                  <motion.li
                    variants={fadeIn}
                    className="flex items-start gap-2 md:gap-3"
                  >
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm md:text-base text-slate-800">
                      One-click LinkedIn sharing
                    </span>
                  </motion.li>
                  <motion.li
                    variants={fadeIn}
                    className="flex items-start gap-2 md:gap-3"
                  >
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm md:text-base text-slate-800">
                      Separate views for admins and recipients
                    </span>
                  </motion.li>
                  <motion.li
                    variants={fadeIn}
                    className="flex items-start gap-2 md:gap-3"
                  >
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm md:text-base text-slate-800">
                      Clean, modern UI design
                    </span>
                  </motion.li>
                </ul>
              </motion.div>
              <motion.div
                variants={cardVariant}
                className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4 md:p-6 border border-slate-100"
              >
                <h3 className="text-lg md:text-xl font-bold text-center mb-4 md:mb-6 text-slate-900">
                  Credly
                </h3>
                <ul className="space-y-3 md:space-y-4">
                  <motion.li
                    variants={fadeIn}
                    className="flex items-start gap-2 md:gap-3"
                  >
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm md:text-base text-slate-800">
                      Open Badge–compliant (2.0 & 3.0)
                    </span>
                  </motion.li>
                  <motion.li
                    variants={fadeIn}
                    className="flex items-start gap-2 md:gap-3"
                  >
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm md:text-base text-slate-800">
                      Administrator dashboard
                    </span>
                  </motion.li>
                  <motion.li
                    variants={fadeIn}
                    className="flex items-start gap-2 md:gap-3"
                  >
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm md:text-base text-slate-800">
                      LinkedIn profile integration
                    </span>
                  </motion.li>
                  <motion.li
                    variants={fadeIn}
                    className="flex items-start gap-2 md:gap-3"
                  >
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm md:text-base text-slate-800">
                      Separate admin and earner interfaces
                    </span>
                  </motion.li>
                  <motion.li
                    variants={fadeIn}
                    className="flex items-start gap-2 md:gap-3"
                  >
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm md:text-base text-slate-800">
                      Complex enterprise platform
                    </span>
                  </motion.li>
                </ul>
              </motion.div>
            </motion.div>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center mt-6 md:mt-8 text-sm md:text-base text-slate-700 max-w-2xl mx-auto"
            >
              All the essential features of enterprise credentialing platforms—
              <span className="font-medium">
                without the cost and complexity
              </span>
              .
            </motion.p>
          </div>
        </section>

        {/* Why Choose Us Section - already hidden on mobile */}
        {/* <section className="hidden md:block py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
              className="text-3xl font-bold tracking-tight text-center mb-12 md:text-4xl text-slate-900"
            >
              Built for programs that want simplicity & impact
            </motion.h2>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
              className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-4xl mx-auto"
            >
              <motion.div variants={cardVariant}>
                <Card className="bg-white/70 backdrop-blur-md shadow-lg border border-white/30">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <DollarSign className="h-6 w-6 text-slate-700" />
                    <CardTitle className="text-lg text-slate-900">
                      Transparent, budget-friendly pricing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-700">
                    Avoid the cost and complexity of bloated credential
                    platforms.
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={cardVariant}>
                <Card className="bg-white/70 backdrop-blur-md shadow-lg border border-white/30">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <Zap className="h-6 w-6 text-indigo-600" />
                    <CardTitle className="text-lg text-slate-900">
                      No learning curve
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-700">
                    Start issuing badges in minutes. No training required.
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={cardVariant}>
                <Card className="bg-white/70 backdrop-blur-md shadow-lg border border-white/30">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <Palette className="h-6 w-6 text-indigo-700" />
                    <CardTitle className="text-lg text-slate-900">
                      Flexible badge design & metadata
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-700">
                    Match your program's brand and showcase the details that
                    matter.
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={cardVariant}>
                <Card className="bg-white/70 backdrop-blur-md shadow-lg border border-white/30">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <Megaphone className="h-6 w-6 text-slate-800" />
                    <CardTitle className="text-lg text-slate-900">
                      Increased visibility
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-700">
                    Empower recipients to share credentials where it
                    counts—LinkedIn, resumes, email signatures, and more.
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section> */}

        {/* Testimonial Section */}
        {/* <section className="py-16 md:py-24 bg-white/70 backdrop-blur-md">
          <div className="container px-4 md:px-6 max-w-3xl mx-auto text-center">
            <blockquote className="text-xl italic text-slate-800 md:text-2xl">
              "This platform gave us everything we needed to modernize our
              credentialing—without slowing us down."
            </blockquote>
            <p className="mt-4 text-slate-600">
              — Program Director, [Org Name]
            </p>
          </div>
        </section> */}

        {/* Call to Action Section */}
        <section className="py-14 md:py-20 lg:py-28 bg-[var(--main-bg)] text-slate-800">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl mb-4 md:mb-6"
            >
              See how simple credentialing can be
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="mx-auto max-w-[600px] text-sm md:text-base lg:text-lg text-slate-300 mb-6 md:mb-8"
            >
              Book a 15-minute demo to explore how we can help you deliver
              digital credentials that are professional, portable, and easy to
              manage.
            </motion.p>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="flex flex-col sm:flex-row justify-center items-center gap-4"
            >
              <Button size="lg" variant="secondary" asChild>
                <a href={demoLink} target="_blank" rel="noopener noreferrer">
                  Schedule Demo <ChevronRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <span className="text-xs md:text-sm text-slate-400">
                Or contact us:{" "}
                <a
                  href={`mailto:${contactEmail}`}
                  className="font-medium hover:underline text-slate-300 hover:text-white"
                >
                  {contactEmail}
                </a>
              </span>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
