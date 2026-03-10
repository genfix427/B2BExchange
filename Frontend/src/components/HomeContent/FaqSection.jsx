import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import FloatingMedicines from "../FloatingMedicines";

const faqs = [
  {
    q: "What is this platform?",
    a: "It is a secure B2B marketplace built exclusively for licensed pharmacies, wholesalers, and distributors to buy and sell pharmaceutical products in bulk.",
  },
  {
    q: "Who can join the platform?",
    a: "Only verified and licensed pharmaceutical professionals can access the platform, ensuring a trusted and compliant trading environment.",
  },
  {
    q: "How does verification work?",
    a: "Each business undergoes a license and compliance review process before being approved to trade on the platform.",
  },
  {
    q: "Is the platform compliant with U.S. regulations?",
    a: "Yes. The platform is designed with compliance-first architecture, supporting DSCSA readiness and traceable supply chains.",
  },
  {
    q: "How does bulk pricing work?",
    a: "Vendors set competitive pricing for bulk quantities. Buyers can compare offers across multiple verified sellers to find the best deals.",
  },
  {
    q: "What types of products can be traded?",
    a: "The platform supports trading of prescription medications, OTC products, medical supplies, and other pharmaceutical inventory in bulk quantities.",
  },
];

export default function FaqSection() {
  const [active, setActive] = useState(null);

  return (
    <section className="relative py-20 sm:py-24 bg-gradient-to-b from-[#faf7fc] via-white to-[#f5eef7]/30 overflow-hidden">
      {/* Floating Medicines */}
      <FloatingMedicines theme="light" count={8} />

      {/* Decorative orbs */}
      <motion.div
        className="absolute top-20 left-10 w-48 h-48 bg-[#9155a7]/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-56 h-56 bg-[#a42574]/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-[#9155a7]/10 text-[#7b2c78] text-sm font-semibold border border-[#9155a7]/20"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#a42574] animate-pulse" />
            FAQ
          </motion.span>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
            Frequently Asked{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9155a7] via-[#7b2c78] to-[#a42574]">
              Questions
            </span>
          </h2>
          <p className="mt-4 text-gray-600 text-base sm:text-lg">
            Clear answers to help you get started with confidence.
          </p>
        </motion.div>

        {/* FAQ Cards */}
        <div className="space-y-4">
          {faqs.map((item, index) => {
            const open = active === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                layout
                className={`bg-white/80 backdrop-blur-sm rounded-2xl border transition-all duration-300 overflow-hidden ${
                  open
                    ? "border-[#9155a7]/30 shadow-lg shadow-[#9155a7]/5"
                    : "border-gray-200/80 shadow-sm hover:shadow-md hover:border-[#9155a7]/20"
                }`}
              >
                <button
                  onClick={() => setActive(open ? null : index)}
                  className="w-full flex justify-between items-center p-5 sm:p-6 text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    {/* Number badge */}
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        open
                          ? "bg-gradient-to-br from-[#9155a7] to-[#a42574] text-white"
                          : "bg-[#9155a7]/10 text-[#9155a7]"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`font-semibold transition-colors duration-300 text-sm sm:text-base ${
                        open ? "text-[#9155a7]" : "text-[#111111]"
                      }`}
                    >
                      {item.q}
                    </span>
                  </div>

                  <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      open
                        ? "bg-[#9155a7] text-white"
                        : "bg-[#9155a7]/10 text-[#9155a7]"
                    }`}
                  >
                    <FiChevronDown size={18} />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6 ml-12">
                        <div className="h-px bg-gradient-to-r from-[#9155a7]/20 via-[#a42574]/20 to-transparent mb-4" />
                        <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                          {item.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-14 text-center"
        >
          <p className="text-gray-500 mb-4">Still have questions?</p>
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 15px 35px rgba(145, 85, 167, 0.25)",
            }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#9155a7] to-[#a42574] text-white font-semibold shadow-lg shadow-[#9155a7]/20 transition-all duration-300 cursor-pointer"
          >
            Contact Support
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}