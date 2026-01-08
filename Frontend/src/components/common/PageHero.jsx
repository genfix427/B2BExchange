import { motion } from "framer-motion";

export default function PageHero({
  title,
  description,
  gradient = "from-teal-700 via-emerald-700 to-teal-800",
  align = "center",
  showCTA = false,
}) {
  return (
    <section
      className={`relative overflow-hidden bg-linear-to-r ${gradient} text-white`}
    >
      {/* Animated glow */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-0 right-0 w-80 h-80 bg-black/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-28">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={`max-w-3xl ${
            align === "left" ? "text-left" : "text-center mx-auto"
          }`}
        >
          <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold leading-tight">
            {title}
          </h1>

          <p className="mt-6 text-lg text-gray-200 leading-relaxed">
            {description}
          </p>

          {showCTA && (
            <div className="mt-8 flex gap-4 justify-center">
              <button className="px-7 py-3 bg-white text-teal-800 rounded-full font-semibold hover:bg-gray-100 transition">
                Get Started
              </button>
              <button className="px-7 py-3 border border-white rounded-full hover:bg-white/10 transition">
                Learn More
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
