import { motion } from "framer-motion";

export default function AboutBanner() {
  return (
    <section className="relative py-28 bg-linear-to-b from-white to-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 space-y-32">

        {/* ROW 1 */}
        <div className="grid gap-14 lg:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Built for Modern Pharmaceutical Trade
            </h2>
            <p className="mt-6 text-gray-600 leading-relaxed">
              B2BExchange is a secure digital marketplace designed to help licensed
              pharmacies, distributors, and healthcare providers trade prescription
              medications efficiently while meeting regulatory requirements.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Our platform focuses on compliance, transparency, and operational
              efficiency—so healthcare professionals can focus on patient care.
            </p>
          </motion.div>

          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            src="/about-pharma-1.jpg"
            alt="Pharma Operations"
            className="rounded-3xl shadow-xl object-cover w-full h-95"
          />
        </div>

        {/* ROW 2 (REVERSED) */}
        <div className="grid gap-14 lg:grid-cols-2 items-center">
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            src="/about-pharma-2.jpg"
            alt="Compliance & Logistics"
            className="rounded-3xl shadow-xl object-cover w-full h-95"
          />

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Compliance-First. Technology-Driven.
            </h2>
            <p className="mt-6 text-gray-600 leading-relaxed">
              Every workflow on B2BExchange is built with regulatory alignment in
              mind, supporting DSCSA readiness and traceable pharmaceutical supply
              chains.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              From onboarding to order fulfillment, our technology simplifies
              complex processes without compromising security.
            </p>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
