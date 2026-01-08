import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

export default function JoinBanner() {
  return (
    <section className="relative overflow-hidden py-28 bg-linear-to-r from-teal-800 via-emerald-800 to-teal-900 text-white">

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute w-2 h-2 bg-white/40 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{ y: [0, -20, 0], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="relative max-w-5xl mx-auto px-6 text-center">

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-4xl xl:text-5xl font-bold leading-tight"
        >
          Join a Growing Network of
          <span className="text-emerald-300"> Independent Pharmacies</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 text-lg text-gray-200 max-w-2xl mx-auto"
        >
          Connect with verified vendors, discover bulk opportunities, and strengthen
          your supply chain through a trusted pharma marketplace.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex justify-center"
        >
          <button className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-teal-800 rounded-full font-semibold shadow-lg hover:shadow-2xl transition-all duration-300">
            Join the Community
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
