import { motion } from "framer-motion";
import { FaHandshake, FaShieldAlt, FaChartLine } from "react-icons/fa";
import FloatingMedicines from "../FloatingMedicines";

export default function AboutUsHome() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#2d1233] via-[#3a1940] to-[#1e0a2e] text-white py-20 sm:py-24 lg:py-28">
      {/* Floating Medicines - dark theme */}
      <FloatingMedicines theme="dark" count={12} />

      {/* Gradient orbs */}
      <motion.div
        className="absolute -top-24 -left-24 w-96 h-96 bg-[#9155a7]/8 rounded-full blur-3xl"
        animate={{ y: [0, 40, 0], x: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-80 h-80 bg-[#a42574]/8 rounded-full blur-3xl"
        animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/3 w-64 h-64 bg-[#7b2c78]/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full bg-white/10 text-[#d4a5d4] text-sm font-semibold border border-white/10 backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#a42574] animate-pulse" />
            About Our Platform
          </motion.span>

          <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight">
            Connecting Pharmacists Through
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c4a5d4] via-[#d4a5c4] to-[#e8b5d4]">
              {" "}Smarter Bulk Trade
            </span>
          </h2>

          <p className="mt-6 text-gray-300 max-w-xl leading-relaxed text-base sm:text-lg mx-auto lg:mx-0">
            We are building a trusted B2B marketplace designed exclusively for
            pharmacists, distributors, and licensed vendors to trade medicines
            securely, efficiently, and at scale.
          </p>

          <p className="mt-4 text-gray-400 max-w-xl mx-auto lg:mx-0">
            Our platform simplifies bulk procurement, improves inventory
            movement, and strengthens supply chains — all while maintaining
            compliance and transparency.
          </p>

          {/* Highlights */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {[
              {
                icon: <FaHandshake />,
                label: "Trusted Partnerships",
                color: "from-[#9155a7] to-[#7b2c78]",
              },
              {
                icon: <FaShieldAlt />,
                label: "Compliance Focused",
                color: "from-[#7b2c78] to-[#a42574]",
              },
              {
                icon: <FaChartLine />,
                label: "Built for Growth",
                color: "from-[#a42574] to-[#9155a7]",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.15 }}
                whileHover={{ y: -6, scale: 1.03 }}
                className="group bg-white/5 backdrop-blur-sm rounded-xl p-5 text-center hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-[#9155a7]/30"
              >
                <div
                  className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-lg mb-3 group-hover:scale-110 transition-transform duration-300`}
                >
                  {item.icon}
                </div>
                <p className="text-sm font-medium text-gray-200">
                  {item.label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 15px 35px rgba(145, 85, 167, 0.4)",
              }}
              whileTap={{ scale: 0.97 }}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#9155a7] to-[#a42574] text-white font-semibold shadow-lg shadow-[#9155a7]/25 transition-all duration-300 cursor-pointer"
            >
              Learn More About Us
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-7 py-3 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/5 transition-all duration-300 cursor-pointer"
            >
              Contact Us
            </motion.button>
          </motion.div>
        </motion.div>

        {/* RIGHT IMAGE BLOCK */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative group"
        >
          {/* Decorative ring */}
          <motion.div
            className="absolute -inset-4 rounded-3xl border border-[#9155a7]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          />

          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[#9155a7]/20">
            <img
              src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5"
              alt="Pharma trade platform"
              className="w-full h-64 sm:h-80 lg:h-full object-cover transform group-hover:scale-110 transition duration-700"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2d1233]/60 via-transparent to-[#9155a7]/10" />

            {/* Overlay content */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9155a7] to-[#a42574] border-2 border-[#2d1233] flex items-center justify-center text-xs font-bold text-white"
                    >
                      {["A", "B", "C"][i]}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-gray-300">
                  500+ verified vendors active
                </span>
              </div>
            </div>
          </div>

          {/* Floating badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            className="absolute -bottom-5 -left-3 sm:-bottom-6 sm:-left-6 bg-white text-[#111111] rounded-2xl p-4 sm:p-5 shadow-xl shadow-[#9155a7]/15 max-w-[240px] border border-[#9155a7]/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9155a7] to-[#a42574] flex items-center justify-center text-white flex-shrink-0">
                <FaShieldAlt />
              </div>
              <p className="text-sm font-semibold leading-snug">
                Built exclusively for licensed pharma professionals
              </p>
            </div>
          </motion.div>

          {/* Top right floating stat */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-gradient-to-br from-[#9155a7] to-[#a42574] text-white rounded-xl p-3 sm:p-4 shadow-lg"
          >
            <div className="text-xl sm:text-2xl font-extrabold">99%</div>
            <div className="text-xs text-white/80">Uptime</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}