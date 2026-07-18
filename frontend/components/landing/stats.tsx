"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Ambulance,
  BrainCircuit,
  Users,
} from "lucide-react";

const stats = [
  {
    icon: Activity,
    value: "98%",
    label: "AI Analysis Accuracy",
  },
  {
    icon: Ambulance,
    value: "24/7",
    label: "Emergency Monitoring",
  },
  {
    icon: Users,
    value: "4",
    label: "System User Roles",
  },
  {
    icon: BrainCircuit,
    value: "AI",
    label: "Real-time Decision Support",
  },
];

export function Stats() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: .5 }}
        viewport={{ once: true }}
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((item) => (
          <motion.div
            key={item.label}
            whileHover={{
              y: -6,
              scale: 1.03,
            }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center backdrop-blur-xl"
          >
            <item.icon className="mx-auto mb-5 h-10 w-10 text-red-500" />

            <h2 className="text-4xl font-bold text-white">
              {item.value}
            </h2>

            <p className="mt-3 text-zinc-400">
              {item.label}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}