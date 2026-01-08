import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";

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
];

export default function FaqSection() {
  const [active, setActive] = useState(null);

  return (
    <section className="py-24 bg-linear-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-6">

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-gray-600">
            Clear answers to help you get started with confidence.
          </p>
        </motion.div>

        {/* FAQ Cards */}
        <div className="space-y-5">
          {faqs.map((item, index) => {
            const open = active === index;

            return (
              <motion.div
                key={index}
                layout
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition"
              >
                <button
                  onClick={() => setActive(open ? null : index)}
                  className="w-full flex justify-between items-center p-6 text-left"
                >
                  <span className="font-medium text-gray-900">
                    {item.q}
                  </span>

                  <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-teal-600"
                  >
                    <FiChevronDown size={22} />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4 }}
                      className="px-6 pb-6 text-gray-600 leading-relaxed"
                    >
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
