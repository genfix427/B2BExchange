import { motion } from "framer-motion";
import { FaQuoteLeft } from "react-icons/fa";

const testimonials = [
  {
    name: "Michael Thompson",
    role: "Director of Procurement",
    company: "Atlantic Pharma Supply, NY",
    feedback:
      "This platform has become a critical part of our bulk sourcing strategy. Verified sellers, transparent transactions, and consistent availability make it easy to operate at scale.",
  },
  {
    name: "Jennifer Collins",
    role: "Independent Pharmacy Owner",
    company: "ClearCare Pharmacy, Texas",
    feedback:
      "Managing inventory and sourcing hard-to-find medications is significantly easier now. The platform brings trust, efficiency, and pricing clarity into one place.",
  },
  {
    name: "David Reynolds",
    role: "Operations Manager",
    company: "NorthBridge Healthcare, California",
    feedback:
      "Built by people who clearly understand the pharmaceutical supply chain. From compliance to logistics, everything is designed for real-world B2B workflows.",
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-28 bg-linear-to-b from-slate-50 via-white to-emerald-50 overflow-hidden">

      {/* Background motion glow */}
      <motion.div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-175 h-175 bg-emerald-200/30 rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Trusted by U.S. Pharma Professionals
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Real feedback from pharmacists, distributors, and healthcare supply leaders across the United States.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.15 }}
              whileHover={{ y: -14, rotateX: 3, rotateY: -3 }}
              className="relative group perspective-1000"
            >
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-3xl bg-linear-to-r from-emerald-400 via-teal-400 to-emerald-400 animate-pulse blur opacity-70" />

              {/* Card */}
              <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-lg group-hover:shadow-2xl transition-all duration-500 border border-white/60">

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-semibold text-lg shadow-md">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.company}</p>
                  </div>
                </div>

                <FaQuoteLeft className="text-emerald-500 text-3xl mb-4 opacity-80" />

                <p className="text-gray-700 leading-relaxed mb-8">
                  {item.feedback}
                </p>

                <div className="border-t pt-4 text-sm text-gray-600">
                  {item.role}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
