import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import FloatingMedicines from "../FloatingMedicines";

export default function JoinBanner() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24 lg:py-28 bg-gradient-to-r from-[#2d1233] via-[#3a1940] to-[#1e0a2e] text-white">
      {/* Floating Medicines - dark theme */}
      <FloatingMedicines theme="dark" count={12} />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute -top-20 -left-20 w-80 h-80 bg-[#9155a7]/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#a42574]/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7b2c78]/5 rounded-full blur-3xl"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />

      {/* Floating particles */}
      {[...Array(25)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            background:
              i % 3 === 0
                ? "rgba(145, 85, 167, 0.3)"
                : i % 3 === 1
                ? "rgba(164, 37, 116, 0.25)"
                : "rgba(255, 255, 255, 0.15)",
          }}
          animate={{
            y: [0, -30 + Math.random() * 20, 0],
            x: [0, Math.random() * 15 - 7, 0],
            opacity: [0.2, 0.7, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 5 + Math.random() * 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 3,
          }}
        />
      ))}

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#d4a5d4] text-sm font-semibold border border-white/10 backdrop-blur-sm">
            <motion.span
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-[#a42574]"
            />
            Join the Movement
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight"
        >
          Join a Growing Network of
          <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c4a5d4] via-[#d4a5c4] to-[#e8b5d4]">
            {" "}Independent Pharmacies
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed"
        >
          Connect with verified vendors, discover bulk opportunities, and
          strengthen your supply chain through a trusted pharma marketplace.
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-wrap justify-center gap-8 sm:gap-12"
        >
          {[
            { num: "500+", label: "Active Vendors" },
            { num: "10K+", label: "Products" },
            { num: "$2M+", label: "Monthly Volume" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#c4a5d4] to-[#e8b5d4]">
                {stat.num}
              </div>
              <div className="text-xs sm:text-sm text-gray-400 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex flex-col sm:flex-row justify-center gap-4"
        >
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 50px rgba(145, 85, 167, 0.4)",
            }}
            whileTap={{ scale: 0.97 }}
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#9155a7] via-[#7b2c78] to-[#a42574] text-white rounded-full font-semibold shadow-lg shadow-[#9155a7]/30 transition-all duration-300 cursor-pointer relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              Join the Community
              <FaArrowRight className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#a42574] via-[#9155a7] to-[#7b2c78] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/20 text-white rounded-full font-semibold hover:bg-white/5 hover:border-[#9155a7]/50 transition-all duration-300 backdrop-blur-sm cursor-pointer"
          >
            Schedule a Demo
          </motion.button>
        </motion.div>

        {/* Trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex flex-wrap justify-center gap-6"
        >
          {["No setup fees", "Free to join", "Cancel anytime"].map(
            (text, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 text-sm text-gray-400"
              >
                <svg
                  className="w-4 h-4 text-[#9155a7]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {text}
              </span>
            )
          )}
        </motion.div>
      </div>
    </section>
  );
}