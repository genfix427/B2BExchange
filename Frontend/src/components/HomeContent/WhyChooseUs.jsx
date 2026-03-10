import { motion } from "framer-motion";
import {
  FaBrain,
  FaRecycle,
  FaMoneyBillWave,
  FaCheckCircle,
} from "react-icons/fa";
import FloatingMedicines from "../FloatingMedicines";

const features = [
  {
    icon: <FaBrain />,
    title: "Extensive Product Network",
    desc: "Access a continuously updated catalog of thousands of pharmaceutical products available for bulk trading.",
    bg: "bg-[#9155a7]/10",
    color: "text-[#9155a7]",
    hoverBorder: "group-hover:border-[#9155a7]/30",
    gradient: "from-[#9155a7] to-[#7b2c78]",
  },
  {
    icon: <FaRecycle />,
    title: "Smarter Inventory Utilization",
    desc: "Redistribute surplus, compliant stock efficiently and minimize losses caused by unused inventory.",
    bg: "bg-[#7b2c78]/10",
    color: "text-[#7b2c78]",
    hoverBorder: "group-hover:border-[#7b2c78]/30",
    gradient: "from-[#7b2c78] to-[#a42574]",
  },
  {
    icon: <FaMoneyBillWave />,
    title: "Optimized Bulk Pricing",
    desc: "Unlock cost-effective purchasing and selling opportunities designed to improve pharmacy margins.",
    bg: "bg-[#a42574]/10",
    color: "text-[#a42574]",
    hoverBorder: "group-hover:border-[#a42574]/30",
    gradient: "from-[#a42574] to-[#9155a7]",
  },
  {
    icon: <FaCheckCircle />,
    title: "Reliable Medicine Availability",
    desc: "Source hard-to-find medications and maintain consistent supply across regional and national markets.",
    bg: "bg-[#9155a7]/10",
    color: "text-[#9155a7]",
    hoverBorder: "group-hover:border-[#9155a7]/30",
    gradient: "from-[#9155a7] to-[#a42574]",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="relative py-20 sm:py-24 bg-gradient-to-b from-white via-[#f5eef7]/30 to-[#fce8f3]/20 overflow-hidden">
      {/* Floating Medicines */}
      <FloatingMedicines theme="light" count={10} />

      {/* Subtle gradient orbs */}
      <motion.div
        className="absolute top-10 right-10 w-72 h-72 bg-[#9155a7]/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-10 left-10 w-60 h-60 bg-[#a42574]/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-[#9155a7]/10 text-[#7b2c78] text-sm font-semibold border border-[#9155a7]/20"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#a42574] animate-pulse" />
            Why Choose Us
          </motion.span>

          <h2 className="text-3xl sm:text-4xl md:text-4xl font-extrabold text-[#111111] tracking-tight">
            Built for Pharmacists,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9155a7] via-[#7b2c78] to-[#a42574]">
              Trusted by Vendors
            </span>
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            A purpose-built B2B platform enabling pharmacies to buy and sell
            medicines with confidence, compliance, and control.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.12 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-2xl hover:shadow-[#9155a7]/10 transition-all duration-300 border border-gray-100/80 ${item.hoverBorder} overflow-hidden`}
            >
              {/* Top gradient accent */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl`}
              />

              {/* Background hover glow */}
              <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-[#9155a7]/3 rounded-full group-hover:scale-[2] transition-transform duration-500" />

              <div className="relative z-10">
                {/* Icon */}
                <div
                  className={`w-14 h-14 flex items-center justify-center rounded-xl ${item.bg} ${item.color} text-2xl mb-5 group-hover:scale-110 transition-all duration-300`}
                >
                  {item.icon}
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-[#111111] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.desc}
                </p>

                {/* Bottom Accent */}
                <div
                  className={`mt-6 h-1 w-10 bg-gradient-to-r ${item.gradient} rounded-full opacity-0 group-hover:opacity-100 group-hover:w-16 transition-all duration-500`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 bg-white/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-[#9155a7]/10 shadow-sm"
        >
          {[
            { num: "5,000+", label: "Products Listed" },
            { num: "500+", label: "Verified Vendors" },
            { num: "98%", label: "Satisfaction Rate" },
            { num: "24/7", label: "Platform Access" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#9155a7] to-[#a42574]">
                {stat.num}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}