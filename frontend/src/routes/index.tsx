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
  ArrowRight,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DemoDashboard } from "@/components/DemoDashboard";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { cn } from "@/lib/utils";

// Animation variants for consistent effects
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.08,
      duration: 0.3,
    },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
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
  const { isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="container mx-auto flex justify-center items-center h-screen">
        <Skeleton className="h-12 w-1/2 bg-gray/50" />
      </div>
    );
  }

  // Demo link - update if you have a specific Calendly or booking link
  const demoLink =
    "https://docs.google.com/forms/d/e/1FAIpQLScX8pObxafqTpnPfDg5TYlQ6Oi_-kydt0KzSi1rBUvEv0gKEg/viewform?usp=sharing";
  const contactEmail = "griggsjo@stanford.edu"; // Replace with actual contact email

  return (
    <>
      <main className="flex-grow overflow-hidden">
        {/* Hero Section */}
        <section className="py-16 md:py-20 lg:py-24">
          <div className="container mx-auto px-4 md:px-6 text-center max-w-6xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="space-y-5 md:space-y-6 mb-10 md:mb-14"
            >
              <motion.div variants={fadeIn} className="inline-block mb-2">
                <Badge
                  variant="outline"
                  className="bg-surface-accent/40 px-3 py-1 text-primary font-medium border-primary/20"
                >
                  Open Badge 2.0 & 3.0 Compliant
                </Badge>
              </motion.div>
              <motion.h1
                variants={fadeIn}
                className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-text leading-none md:leading-tight"
              >
                The Simple Way to Issue <br /> Digital Credentials.
              </motion.h1>
              <motion.p
                variants={fadeIn}
                className="mx-auto max-w-[700px] text-lg md:text-xl lg:text-2xl text-text-muted font-light"
              >
                Manage, distribute, and showcase digital badges with confidence.
              </motion.p>
            </motion.div>

            {/* test */}

            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="flex flex-wrap justify-center items-center gap-3 md:gap-4 text-sm md:text-base text-text-muted mb-10 md:mb-16"
            >
              <motion.span
                variants={fadeIn}
                className="flex items-center gap-2 md:gap-3 border border-gray-light/20 rounded-full px-4 py-2 bg-surface/90 shadow-md hover:shadow-lg transition-all duration-300 hover:bg-surface hover:border-primary/20 group"
              >
                <BadgeCheck className="h-4 w-4 md:h-5 md:w-5 text-primary group-hover:scale-110 transition-transform duration-300" />{" "}
                <span className="font-medium">Fully compliant</span>
              </motion.span>
              <motion.span
                variants={fadeIn}
                className="flex items-center gap-2 md:gap-3 border border-gray-light/20 rounded-full px-4 py-2 bg-surface/90 shadow-md hover:shadow-lg transition-all duration-300 hover:bg-surface hover:border-gray-dark/20 group"
              >
                <Cog className="h-4 w-4 md:h-5 md:w-5 text-gray-dark group-hover:rotate-45 transition-transform duration-500" />{" "}
                <span className="font-medium">Intuitive dashboard</span>
              </motion.span>
              <motion.span
                variants={fadeIn}
                className="flex items-center gap-2 md:gap-3 border border-gray-light/20 rounded-full px-4 py-2 bg-surface/90 shadow-md hover:shadow-lg transition-all duration-300 hover:bg-surface hover:border-gray/20 group"
              >
                <Upload className="h-4 w-4 md:h-5 md:w-5 text-gray group-hover:translate-y-[-2px] transition-transform duration-300" />{" "}
                <span className="font-medium">Easy badge uploads</span>
              </motion.span>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6 mb-12"
            >
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-medium px-6"
                asChild
              >
                <a
                  href={demoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Book a Demo <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="default"
                className="border-gray-light/30 bg-surface/80"
                asChild
              >
                <a href="#features" className="flex items-center gap-2">
                  Learn More <ChevronRight className="h-4 w-4" />
                </a>
              </Button>
            </motion.div>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="text-sm md:text-base text-text-muted font-medium"
            >
              🎓 Built for Programs, Institutions, and Certifiers
            </motion.p>
          </div>
        </section>

        {/* Demo Dashboard Section */}
        <section className="py-16 md:py-20 lg:py-24 bg-[var(--color-surface-secondary)] relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-surface-secondary)] opacity-40"></div>
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
              className="text-center mb-10 md:mb-14"
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-text mb-4">
                It doesn't have to be complicated.
              </h2>
              <p className="text-lg text-text-muted max-w-2xl mx-auto">
                See how easy it is to manage your digital credentials with our
                intuitive dashboard
              </p>
            </motion.div>

            <DemoDashboard />
          </div>
        </section>

        {/* Subheadline */}
        <section className="py-16 md:py-20 lg:py-24 bg-surface/90 backdrop-blur-md">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <motion.h2
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
                className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl text-text"
              >
                Avoid the cost and complexity of bloated credential platforms.
              </motion.h2>
              <motion.p
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="mt-3 text-base md:text-lg text-text-muted"
              >
                Start issuing badges in minutes. No training required.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section
          id="features"
          className="py-16 md:py-20 lg:py-24 bg-gradient-to-b from-surface to-surface-secondary/50"
        >
          <div className="container mx-auto px-4 md:px-6">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
              className="text-2xl font-bold tracking-tight text-center mb-10 md:mb-14 sm:text-3xl md:text-4xl text-text"
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
                <Card className="text-center shadow-lg hover:shadow-xl transition-all duration-300 bg-surface border-0 hover:translate-y-[-4px] h-64 flex flex-col">
                  <CardHeader className="pb-2 md:pb-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-base md:text-lg text-text">
                      A university or continuing ed program
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs md:text-sm text-text-muted pt-0 flex-grow">
                    looking to formalize credentials
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={cardVariant}>
                <Card className="text-center shadow-lg hover:shadow-xl transition-all duration-300 bg-surface border-0 hover:translate-y-[-4px] h-64 flex flex-col">
                  <CardHeader className="pb-2 md:pb-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Computer className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-base md:text-lg text-text">
                      An online course provider or bootcamp
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs md:text-sm text-text-muted pt-0 flex-grow">
                    needing verified, shareable proof of completion
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={cardVariant}>
                <Card className="text-center shadow-lg hover:shadow-xl transition-all duration-300 bg-surface border-0 hover:translate-y-[-4px] h-64 flex flex-col">
                  <CardHeader className="pb-2 md:pb-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Award className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-base md:text-lg text-text">
                      A certifying body or membership organization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs md:text-sm text-text-muted pt-0 flex-grow">
                    ready to modernize your credentialing
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={cardVariant}>
                <Card className="text-center shadow-lg hover:shadow-xl transition-all duration-300 bg-surface border-0 hover:translate-y-[-4px] h-64 flex flex-col">
                  <CardHeader className="pb-2 md:pb-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-base md:text-lg text-text">
                      A skills-based training provider
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs md:text-sm text-text-muted pt-0 flex-grow">
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
              className="text-center text-base md:text-lg text-text mt-10 md:mt-14 max-w-3xl mx-auto"
            >
              …you can issue credentials confidently, clearly, and at scale.
            </motion.p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-20 lg:py-24 bg-surface-accent/30 backdrop-blur-md">
          <div className="container mx-auto px-4 md:px-6">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
              className="text-2xl font-bold tracking-tight text-center mb-10 md:mb-14 sm:text-3xl md:text-4xl text-text"
            >
              Everything they have and more
            </motion.h2>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
            >
              <motion.div
                variants={cardVariant}
                className="bg-surface shadow-lg rounded-xl p-6 border-t-4 border border-green-500"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-text">BadgeSpot</h3>
                </div>
                <ul className="space-y-4">
                  <motion.li
                    variants={fadeIn}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-base text-text">
                      Open Badge–compliant (2.0 & 3.0)
                    </span>
                  </motion.li>
                  <motion.li
                    variants={fadeIn}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-base text-text">
                      Intuitive administrator dashboard
                    </span>
                  </motion.li>
                  <motion.li
                    variants={fadeIn}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-base text-text">
                      One-click LinkedIn sharing
                    </span>
                  </motion.li>
                  <motion.li
                    variants={fadeIn}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-base text-text">
                      Separate views for admins and recipients
                    </span>
                  </motion.li>
                  <motion.li
                    variants={fadeIn}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-base text-text">
                      Clean, modern UI design
                    </span>
                  </motion.li>
                </ul>
              </motion.div>
              <motion.div
                variants={cardVariant}
                className="bg-surface shadow-lg rounded-xl p-6 border-t-4 border-indigo-400/70"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-text">Credly</h3>
                  <Badge
                    variant="outline"
                    className="bg-indigo-400/10 text-indigo-400 border-indigo-400/20"
                  >
                    Alternative
                  </Badge>
                </div>
                <ul className="space-y-4">
                  <motion.li
                    variants={fadeIn}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span className="text-base text-text">
                      Open Badge–compliant (2.0 & 3.0)
                    </span>
                  </motion.li>
                  <motion.li
                    variants={fadeIn}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span className="text-base text-text">
                      Administrator dashboard
                    </span>
                  </motion.li>
                  <motion.li
                    variants={fadeIn}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span className="text-base text-text">
                      LinkedIn profile integration
                    </span>
                  </motion.li>
                  <motion.li
                    variants={fadeIn}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span className="text-base text-text">
                      Separate admin and earner interfaces
                    </span>
                  </motion.li>
                  <motion.li
                    variants={fadeIn}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span className="text-base text-text">
                      Complex enterprise platform
                    </span>
                  </motion.li>
                </ul>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-b from-surface-secondary/80 to-surface relative">
          <div className="absolute inset-0 bg-[url('/cta-pattern.svg')] opacity-5"></div>
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="max-w-2xl mx-auto"
            >
              <motion.h2
                variants={fadeIn}
                className="text-2xl text-text font-bold tracking-tight sm:text-3xl md:text-4xl mb-4 md:mb-6"
              >
                See how simple credentialing can be
              </motion.h2>
              <motion.p
                variants={fadeIn}
                className="mx-auto max-w-[600px] text-sm md:text-base lg:text-lg text-text-muted mb-8 md:mb-10"
              >
                Book a 15-minute demo to explore how we can help you deliver
                digital credentials that are professional, portable, and easy to
                manage.
              </motion.p>
              <motion.div
                variants={fadeIn}
                className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6"
              >
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white px-6 font-medium"
                  asChild
                >
                  <a
                    href={demoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Schedule Demo <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <div className="text-sm md:text-base text-text-muted">
                  Or contact us:{" "}
                  <a
                    href={`mailto:${contactEmail}`}
                    className="font-medium hover:underline text-primary hover:text-primary/90"
                  >
                    {contactEmail}
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
