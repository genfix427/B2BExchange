import { motion } from "framer-motion";
import { FaHandshake, FaShieldAlt, FaChartLine } from "react-icons/fa";

export default function AboutUsHome() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-teal-900 via-teal-800 to-emerald-900 text-white py-24">
      
      {/* Floating background shapes */}
      <motion.div
        className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{ y: [0, 40, 0], x: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl"
        animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block mb-4 px-4 py-1 rounded-full bg-white/10 text-sm font-medium">
            About Our Platform
          </span>

          <h2 className="text-3xl md:text-4xl xl:text-5xl font-bold leading-tight">
            Connecting Pharmacists Through
            <span className="text-emerald-300"> Smarter Bulk Trade</span>
          </h2>

          <p className="mt-6 text-gray-200 max-w-xl leading-relaxed">
            We are building a trusted B2B marketplace designed exclusively for
            pharmacists, distributors, and licensed vendors to trade medicines
            securely, efficiently, and at scale.
          </p>

          <p className="mt-4 text-gray-300 max-w-xl">
            Our platform simplifies bulk procurement, improves inventory
            movement, and strengthens supply chains — all while maintaining
            compliance and transparency.
          </p>

          {/* Highlights */}
          <div className="mt-8 grid sm:grid-cols-3 gap-6">
            {[
              { icon: <FaHandshake />, label: "Trusted Partnerships" },
              { icon: <FaShieldAlt />, label: "Compliance Focused" },
              { icon: <FaChartLine />, label: "Built for Growth" },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white/10 rounded-xl p-4 text-center hover:bg-white/20 transition"
              >
                <div className="text-2xl text-emerald-300 mb-2 flex justify-center">
                  {item.icon}
                </div>
                <p className="text-sm font-medium">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT IMAGE BLOCK */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative group"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5"
              alt="Pharma trade platform"
              className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
            />

            {/* Overlay */}
            <div className="absolute inset-0 `bg-gradient-to-t` from-black/50 to-transparent" />
          </div>

          {/* Floating badge */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="absolute -bottom-6 -left-6 bg-white text-gray-900 rounded-2xl p-5 shadow-xl"
          >
            <p className="text-sm font-semibold">
              Built exclusively for licensed pharma professionals
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
