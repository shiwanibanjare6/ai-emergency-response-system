"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  Hospital,
  MapPinned,
  ShieldCheck,
  Siren,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Powered Emergency Analysis",
    description: "Instant emergency assessment powered by AI.",
  },
  {
    icon: Hospital,
    title: "Hospital Coordination",
    description: "Find the nearest suitable hospital instantly.",
  },
  {
    icon: MapPinned,
    title: "Live Location Tracking",
    description: "Track emergency location in real time.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Command Center",
    description: "Role-based authentication with JWT security.",
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-32 h-96 w-96 -translate-x-1/2 rounded-full bg-red-600/20 blur-[140px]" />
        <div className="absolute right-10 top-20 h-72 w-72 rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-12">

        {/* Logo */}

        <motion.div
          initial={{ opacity: 0, scale: .8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: .5 }}
          className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-red-500 to-red-700 shadow-2xl shadow-red-600/40"
        >
          <Siren className="h-12 w-12 text-white" />
        </motion.div>

        {/* Heading */}

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .2 }}
          className="max-w-4xl text-center text-5xl font-extrabold leading-tight text-white md:text-7xl"
        >
          AI Emergency
          <span className="block text-red-500">
            Response System
          </span>
        </motion.h1>

        {/* Subtitle */}

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .35 }}
          className="mt-8 max-w-3xl text-center text-lg leading-8 text-zinc-400 md:text-xl"
        >
          Built using Artificial Intelligence, real-time geolocation,
hospital coordination and smart emergency analytics to
accelerate emergency response and save lives. For real-time
          incident reporting, intelligent triage, hospital coordination,
          live responder tracking and emergency analytics.
        </motion.p>

        {/* Buttons */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .45 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Button size="lg" asChild>
            <Link href="/login">
              Launch Command Center
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button variant="outline" size="lg" asChild>
            <a
              href="https://github.com/shiwanibanjare6/ai-emergency-response-system"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Repository
            </a>
          </Button>
        </motion.div>

        {/* Feature Cards */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: .7 }}
          className="mt-14 grid w-full gap-6 md:grid-cols-2 xl:grid-cols-4"
        >
          {features.map((feature) => (
            <motion.div
    key={feature.title}
    whileHover={{
        y: -8,
        scale: 1.03,
    }}
    transition={{
        duration: .25,
    }}
    className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-xl hover:border-red-500/40 hover:shadow-xl hover:shadow-red-900/20"
>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}