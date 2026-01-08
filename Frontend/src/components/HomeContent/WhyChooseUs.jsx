import { motion } from "framer-motion";
import {
  FaBrain,
  FaRecycle,
  FaMoneyBillWave,
  FaCheckCircle,
} from "react-icons/fa";

const features = [
  {
    icon: <FaBrain />,
    title: "Extensive Product Network",
    desc: "Access a continuously updated catalog of thousands of pharmaceutical products available for bulk trading.",
    bg: "bg-red-100",
    color: "text-red-500",
  },
  {
    icon: <FaRecycle />,
    title: "Smarter Inventory Utilization",
    desc: "Redistribute surplus, compliant stock efficiently and minimize losses caused by unused inventory.",
    bg: "bg-blue-100",
    color: "text-blue-500",
  },
  {
    icon: <FaMoneyBillWave />,
    title: "Optimized Bulk Pricing",
    desc: "Unlock cost-effective purchasing and selling opportunities designed to improve pharmacy margins.",
    bg: "bg-yellow-100",
    color: "text-yellow-500",
  },
  {
    icon: <FaCheckCircle />,
    title: "Reliable Medicine Availability",
    desc: "Source hard-to-find medications and maintain consistent supply across regional and national markets.",
    bg: "bg-green-100",
    color: "text-green-500",
  },
];


export default function WhyChooseUs() {
  return (
    <section className="relative py-12 bg-linear-to-b from-white to-teal-50">
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Built for Pharmacists, Trusted by Vendors
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            A purpose-built B2B platform enabling pharmacies to buy and sell medicines with confidence, compliance, and control.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100  border-b-2 border-b-teal-600"
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 flex items-center justify-center rounded-full ${item.bg} ${item.color} text-2xl mb-5 group-hover:scale-110 transition-transform`}
              >
                {item.icon}
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {item.desc}
              </p>

              {/* Bottom Accent */}
              <div className="mt-6 h-1 w-10 bg-teal-600 rounded-full opacity-0 group-hover:opacity-100 transition" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
