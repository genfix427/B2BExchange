import { motion } from "framer-motion";
import { FaShieldAlt, FaNetworkWired, FaClipboardCheck, FaUsers } from "react-icons/fa";

const features = [
  {
    icon: <FaShieldAlt />,
    title: "Secure Marketplace",
    desc: "Every participant is verified to ensure trusted and compliant transactions."
  },
  {
    icon: <FaClipboardCheck />,
    title: "Regulatory Ready",
    desc: "Designed to support DSCSA compliance and audit-friendly workflows."
  },
  {
    icon: <FaNetworkWired />,
    title: "Connected Network",
    desc: "Trade confidently with licensed pharmacies and providers nationwide."
  },
  {
    icon: <FaUsers />,
    title: "Built for Professionals",
    desc: "Purpose-built for pharmacists, healthcare providers, and supply teams."
  },
];

export default function AboutFeatures() {
  return (
    <section className="relative py-28 bg-linear-to-r from-teal-800 via-emerald-800 to-teal-900 text-white overflow-hidden">

      {/* Decorative Glow */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 14, repeat: Infinity }}
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
          <h2 className="text-3xl md:text-4xl font-bold">
            Why Choose B2BExchange
          </h2>
          <p className="mt-4 text-gray-200 max-w-2xl mx-auto">
            A modern platform built to strengthen pharmaceutical supply chains.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-20">
          {features.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition"
            >
              <div className="text-3xl text-emerald-300 mb-4 flex justify-center">
                {item.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-200">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <button className="inline-flex items-center gap-3 px-10 py-4 bg-white text-teal-800 font-semibold rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition cursor-pointer">
            Join the B2BExchange Community
          </button>
        </motion.div>
      </div>
    </section>
  );
}
