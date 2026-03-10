// src/components/TestimonialsContent/TestimonialsComp.jsx
import { motion } from "framer-motion";
import { FaQuoteLeft, FaStar } from "react-icons/fa";
import FloatingMedicines from "../FloatingMedicines";

const testimonials = [
  {
    name: "Michael Thompson",
    role: "Director of Procurement",
    company: "Atlantic Pharma Supply, NY",
    feedback:
      "This platform has become a critical part of our bulk sourcing strategy. Verified sellers, transparent transactions, and consistent availability make it easy to operate at scale.",
    rating: 5,
    gradient: "from-[#9155a7] to-[#7b2c78]",
  },
  {
    name: "Jennifer Collins",
    role: "Independent Pharmacy Owner",
    company: "ClearCare Pharmacy, Texas",
    feedback:
      "Managing inventory and sourcing hard-to-find medications is significantly easier now. The platform brings trust, efficiency, and pricing clarity into one place.",
    rating: 5,
    gradient: "from-[#7b2c78] to-[#a42574]",
  },
  {
    name: "David Reynolds",
    role: "Operations Manager",
    company: "NorthBridge Healthcare, California",
    feedback:
      "Built by people who clearly understand the pharmaceutical supply chain. From compliance to logistics, everything is designed for real-world B2B workflows.",
    rating: 5,
    gradient: "from-[#a42574] to-[#9155a7]",
  },
];

export default function TestimonialsComp() {
  return (
    <section className="relative py-20 sm:py-24 lg:py-28 bg-gradient-to-b from-[#faf7fc] via-white to-[#f5eef7]/40 overflow-hidden">
      {/* Floating Medicines Background */}
      <FloatingMedicines theme="light" count={10} />

      {/* Background gradient orbs */}
      <motion.div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#9155a7]/6 rounded-full blur-3xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-80 h-80 bg-[#a42574]/5 rounded-full blur-3xl"
        animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 -left-20 w-72 h-72 bg-[#7b2c78]/4 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          {/* Badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-5 px-5 py-2 rounded-full bg-[#9155a7]/10 text-[#7b2c78] text-sm font-semibold border border-[#9155a7]/20 backdrop-blur-sm"
          >
            <motion.span
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-[#a42574]"
            />
            Testimonials
          </motion.span>

          <h2 className="text-3xl sm:text-4xl md:text-4xl font-extrabold text-[#111111] tracking-tight">
            Trusted by U.S.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9155a7] via-[#7b2c78] to-[#a42574]">
              Pharma Professionals
            </span>
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Real feedback from pharmacists, distributors, and healthcare supply
            leaders across the United States.
          </p>

          {/* Rating summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-6 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-[#9155a7]/10 shadow-sm"
          >
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="text-[#a42574] text-sm" />
              ))}
            </div>
            <span className="text-sm font-semibold text-[#111111]">4.9/5</span>
            <span className="text-sm text-gray-500">from 200+ reviews</span>
          </motion.div>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.15 }}
              whileHover={{ y: -12, scale: 1.02 }}
              className="relative group"
            >
              {/* Animated gradient border glow */}
              <motion.div
                className={`absolute -inset-[1px] rounded-3xl bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-500`}
              />

              {/* Card */}
              <div className="relative bg-white/85 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-md group-hover:shadow-2xl group-hover:shadow-[#9155a7]/10 transition-all duration-500 border border-gray-100/80 group-hover:border-[#9155a7]/20 overflow-hidden h-full flex flex-col">
                {/* Top accent line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-3xl`}
                />

                {/* Background decoration */}
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#9155a7]/3 rounded-full group-hover:scale-[2] transition-transform duration-700" />

                <div className="relative z-10 flex flex-col h-full">
                  {/* Avatar & Info */}
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg shadow-[#9155a7]/20 flex-shrink-0`}
                    >
                      {item.name.charAt(0)}
                    </motion.div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#111111] text-sm sm:text-base truncate">
                        {item.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        {item.company}
                      </p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(item.rating)].map((_, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        <FaStar className="text-[#a42574] text-sm" />
                      </motion.span>
                    ))}
                  </div>

                  {/* Quote icon */}
                  <div className="mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-300`}
                    >
                      <FaQuoteLeft className="text-white text-sm" />
                    </div>
                  </div>

                  {/* Feedback */}
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-6 flex-grow">
                    "{item.feedback}"
                  </p>

                  {/* Divider + Role */}
                  <div className="mt-auto">
                    <div className="h-px bg-gradient-to-r from-[#9155a7]/15 via-[#a42574]/15 to-transparent mb-4" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-medium text-[#9155a7]">
                        {item.role}
                      </span>
                      <span className="text-xs text-gray-400">Verified ✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 sm:mt-20 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 bg-white/70 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-[#9155a7]/10 shadow-sm">
            {/* Avatars stack */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {["M", "J", "D", "S", "A"].map((letter, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#9155a7] to-[#a42574] border-2 border-white flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-md"
                    style={{
                      opacity: 1 - i * 0.12,
                    }}
                  >
                    {letter}
                  </motion.div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-[#111111]">
                  200+ Professionals
                </p>
                <p className="text-xs text-gray-500">
                  already trust our platform
                </p>
              </div>
            </div>

            <div className="hidden sm:block w-px h-12 bg-[#9155a7]/15" />

            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 15px 35px rgba(145, 85, 167, 0.3)",
              }}
              whileTap={{ scale: 0.97 }}
              className="group relative px-8 py-3 rounded-xl bg-gradient-to-r from-[#9155a7] to-[#a42574] text-white font-semibold shadow-lg shadow-[#9155a7]/20 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Join Our Community
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#a42574] to-[#7b2c78] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}