import { motion } from "framer-motion";

export default function PageHero({
  title,
  description,
  gradient = "from-teal-700 via-emerald-700 to-teal-800",
  align = "center",
  showCTA = false,
  backgroundImage,
  animationType = "zoom", // "zoom", "pan", "none"
}) {
  // Different animation variants for the background
  const getBackgroundAnimation = () => {
    switch(animationType) {
      case "zoom":
        return {
          initial: { scale: 1 },
          animate: { scale: 1.1 },
          transition: { duration: 20, repeat: Infinity, repeatType: "reverse" }
        };
      case "pan":
        return {
          initial: { scale: 1.2, x: -20 },
          animate: { scale: 1.2, x: 20 },
          transition: { duration: 30, repeat: Infinity, repeatType: "reverse" }
        };
      default:
        return {};
    }
  };

  return (
    <section
      className={`relative overflow-hidden bg-linear-to-r ${gradient} text-white`}
    >
      {/* Background Image with Animation */}
      {backgroundImage && (
        <motion.div 
          className="absolute inset-0 z-0"
          {...getBackgroundAnimation()}
        >
          {/* Multiple overlay layers for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/50 to-black/60 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/30 z-10" />
          
          <img 
            src={backgroundImage} 
            alt=""
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}

      {/* Animated glow effects */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl z-10"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-0 right-0 w-80 h-80 bg-black/20 rounded-full blur-3xl z-10"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-42 z-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={`max-w-3xl ${
            align === "left" ? "text-left" : "text-center mx-auto"
          }`}
        >
          <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold leading-tight drop-shadow-lg">
            {title}
          </h1>

          <p className="mt-6 text-lg text-gray-200 leading-relaxed drop-shadow-md">
            {description}
          </p>

          {showCTA && (
            <div className="mt-8 flex gap-4 justify-center">
              <button className="px-7 py-3 bg-white text-teal-800 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg">
                Get Started
              </button>
              <button className="px-7 py-3 border border-white rounded-full hover:bg-white/10 transition backdrop-blur-sm shadow-lg">
                Learn More
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}