import { motion } from "framer-motion";
import { FaIndustry, FaTruck, FaShieldAlt } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

const features = [
  {
    icon: <MdVerified />,
    title: "Verified Pharma Vendors",
    desc: "Trade only with licensed and verified pharmacies & distributors.",
  },
  {
    icon: <FaIndustry />,
    title: "Bulk Medicine Trading",
    desc: "Buy & sell medicines in large quantities with better margins.",
  },
  {
    icon: <FaShieldAlt />,
    title: "Compliance & Safety",
    desc: "DSCSA-ready, traceable & regulation-focused platform.",
  },
  {
    icon: <FaTruck />,
    title: "Fast B2B Logistics",
    desc: "Optimized supply chain with reliable bulk shipping.",
  },
];

// Floating medicine shapes
const floatingMedicines = [
  // Pills (capsule shape)
  {
    id: 1,
    type: "capsule",
    x: "5%",
    y: "15%",
    size: 50,
    rotation: 45,
    duration: 18,
    delay: 0,
    color1: "#9155a7",
    color2: "#a42574",
  },
  {
    id: 2,
    type: "capsule",
    x: "85%",
    y: "25%",
    size: 40,
    rotation: -30,
    duration: 22,
    delay: 2,
    color1: "#7b2c78",
    color2: "#9155a7",
  },
  {
    id: 3,
    type: "capsule",
    x: "75%",
    y: "70%",
    size: 35,
    rotation: 60,
    duration: 20,
    delay: 4,
    color1: "#a42574",
    color2: "#7b2c78",
  },
  {
    id: 4,
    type: "capsule",
    x: "15%",
    y: "75%",
    size: 45,
    rotation: -45,
    duration: 16,
    delay: 1,
    color1: "#9155a7",
    color2: "#a42574",
  },
  {
    id: 5,
    type: "capsule",
    x: "50%",
    y: "10%",
    size: 30,
    rotation: 20,
    duration: 24,
    delay: 3,
    color1: "#7b2c78",
    color2: "#a42574",
  },
  // Round tablets
  {
    id: 6,
    type: "tablet",
    x: "90%",
    y: "55%",
    size: 28,
    duration: 19,
    delay: 0.5,
    color: "#9155a7",
  },
  {
    id: 7,
    type: "tablet",
    x: "10%",
    y: "45%",
    size: 22,
    duration: 21,
    delay: 2.5,
    color: "#a42574",
  },
  {
    id: 8,
    type: "tablet",
    x: "40%",
    y: "80%",
    size: 26,
    duration: 17,
    delay: 1.5,
    color: "#7b2c78",
  },
  {
    id: 9,
    type: "tablet",
    x: "65%",
    y: "5%",
    size: 20,
    duration: 23,
    delay: 3.5,
    color: "#9155a7",
  },
  {
    id: 10,
    type: "tablet",
    x: "30%",
    y: "30%",
    size: 18,
    duration: 25,
    delay: 4.5,
    color: "#a42574",
  },
  // Medicine bottles (small)
  {
    id: 11,
    type: "bottle",
    x: "95%",
    y: "40%",
    size: 36,
    duration: 20,
    delay: 1,
    color: "#7b2c78",
  },
  {
    id: 12,
    type: "bottle",
    x: "20%",
    y: "60%",
    size: 32,
    duration: 18,
    delay: 3,
    color: "#9155a7",
  },
  // Plus/cross shapes (medical)
  {
    id: 13,
    type: "cross",
    x: "55%",
    y: "50%",
    size: 24,
    duration: 22,
    delay: 2,
    color: "#a42574",
  },
  {
    id: 14,
    type: "cross",
    x: "80%",
    y: "85%",
    size: 20,
    duration: 19,
    delay: 0,
    color: "#9155a7",
  },
  {
    id: 15,
    type: "pill",
    x: "45%",
    y: "90%",
    size: 34,
    rotation: 30,
    duration: 21,
    delay: 2.5,
    color: "#7b2c78",
  },
  {
    id: 16,
    type: "pill",
    x: "70%",
    y: "35%",
    size: 28,
    rotation: -60,
    duration: 17,
    delay: 1.5,
    color: "#a42574",
  },
];

// SVG Medicine Components
const CapsuleSVG = ({ size, color1, color2, rotation }) => (
  <svg
    width={size}
    height={size * 0.45}
    viewBox="0 0 100 45"
    style={{ transform: `rotate(${rotation}deg)` }}
  >
    <defs>
      <linearGradient id={`cap-${color1}-${color2}`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={color1} stopOpacity="0.6" />
        <stop offset="50%" stopColor={color1} stopOpacity="0.6" />
        <stop offset="50%" stopColor={color2} stopOpacity="0.6" />
        <stop offset="100%" stopColor={color2} stopOpacity="0.6" />
      </linearGradient>
    </defs>
    <rect
      x="5"
      y="5"
      width="90"
      height="35"
      rx="17.5"
      ry="17.5"
      fill={`url(#cap-${color1}-${color2})`}
      stroke={color1}
      strokeWidth="1"
      strokeOpacity="0.3"
    />
    <line x1="50" y1="5" x2="50" y2="40" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
  </svg>
);

const TabletSVG = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle
      cx="20"
      cy="20"
      r="17"
      fill={color}
      fillOpacity="0.15"
      stroke={color}
      strokeWidth="1.5"
      strokeOpacity="0.4"
    />
    <line
      x1="8"
      y1="20"
      x2="32"
      y2="20"
      stroke={color}
      strokeWidth="1"
      strokeOpacity="0.3"
    />
  </svg>
);

const BottleSVG = ({ size, color }) => (
  <svg width={size * 0.6} height={size} viewBox="0 0 30 50">
    <rect
      x="8"
      y="2"
      width="14"
      height="8"
      rx="2"
      fill={color}
      fillOpacity="0.3"
      stroke={color}
      strokeWidth="1"
      strokeOpacity="0.4"
    />
    <rect
      x="4"
      y="10"
      width="22"
      height="36"
      rx="4"
      fill={color}
      fillOpacity="0.15"
      stroke={color}
      strokeWidth="1.5"
      strokeOpacity="0.4"
    />
    <text
      x="15"
      y="32"
      textAnchor="middle"
      fontSize="10"
      fill={color}
      fillOpacity="0.5"
      fontWeight="bold"
    >
      Rx
    </text>
  </svg>
);

const CrossSVG = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <rect
      x="14"
      y="4"
      width="12"
      height="32"
      rx="3"
      fill={color}
      fillOpacity="0.2"
      stroke={color}
      strokeWidth="1"
      strokeOpacity="0.3"
    />
    <rect
      x="4"
      y="14"
      width="32"
      height="12"
      rx="3"
      fill={color}
      fillOpacity="0.2"
      stroke={color}
      strokeWidth="1"
      strokeOpacity="0.3"
    />
  </svg>
);

const PillSVG = ({ size, color, rotation }) => (
  <svg
    width={size}
    height={size * 0.5}
    viewBox="0 0 60 30"
    style={{ transform: `rotate(${rotation}deg)` }}
  >
    <rect
      x="3"
      y="3"
      width="54"
      height="24"
      rx="12"
      ry="12"
      fill={color}
      fillOpacity="0.18"
      stroke={color}
      strokeWidth="1.5"
      strokeOpacity="0.35"
    />
    <ellipse
      cx="18"
      cy="15"
      rx="6"
      ry="4"
      fill="white"
      fillOpacity="0.3"
    />
  </svg>
);

const FloatingMedicine = ({ medicine }) => {
  const renderShape = () => {
    switch (medicine.type) {
      case "capsule":
        return (
          <CapsuleSVG
            size={medicine.size}
            color1={medicine.color1}
            color2={medicine.color2}
            rotation={medicine.rotation}
          />
        );
      case "tablet":
        return <TabletSVG size={medicine.size} color={medicine.color} />;
      case "bottle":
        return <BottleSVG size={medicine.size} color={medicine.color} />;
      case "cross":
        return <CrossSVG size={medicine.size} color={medicine.color} />;
      case "pill":
        return (
          <PillSVG
            size={medicine.size}
            color={medicine.color}
            rotation={medicine.rotation}
          />
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      className="absolute pointer-events-none z-0"
      style={{ left: medicine.x, top: medicine.y }}
      animate={{
        y: [0, -25, 10, -15, 0],
        x: [0, 15, -10, 8, 0],
        rotate: [0, 10, -8, 5, 0],
        scale: [1, 1.05, 0.95, 1.02, 1],
      }}
      transition={{
        duration: medicine.duration,
        delay: medicine.delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {renderShape()}
    </motion.div>
  );
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center bg-gradient-to-br from-[#f5eef7] via-white to-[#fce8f3]">
      {/* Floating Medicines Background */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingMedicines.map((med) => (
          <FloatingMedicine key={med.id} medicine={med} />
        ))}
      </div>

      {/* Large gradient orbs */}
      <motion.div
        className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#9155a7]/10 rounded-full blur-3xl"
        animate={{ y: [0, 40, 0], x: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-[#a42574]/10 rounded-full blur-3xl"
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7b2c78]/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />

      {/* DNA Helix inspired decoration */}
      <div className="absolute right-0 top-0 bottom-0 w-1 hidden lg:block">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-[#9155a7]/20"
            style={{ top: `${i * 5}%`, right: "20px" }}
            animate={{
              x: [0, Math.sin(i) * 20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4,
              delay: i * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-12 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center w-full">
        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left"
        >
          {/* Badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-6 px-5 py-2 rounded-full bg-[#9155a7]/10 text-[#7b2c78] text-sm font-semibold border border-[#9155a7]/20 backdrop-blur-sm"
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-[#a42574] inline-block"
            />
            B2B Marketplace for Pharmacists
          </motion.span>

          <h1 className="text-3xl sm:text-4xl md:text-4xl xl:text-5xl font-extrabold text-[#111111] leading-tight tracking-tight">
            A secure pharmacy-to-pharmacy
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#9155a7] via-[#7b2c78] to-[#a42574]">
                {" "}marketplace{" "}
              </span>
              <motion.span
                className="absolute bottom-1 left-0 right-0 h-3 bg-[#9155a7]/15 -z-0 rounded"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 1 }}
              />
            </span>
            for buying and selling
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a42574] to-[#9155a7]">
              {" "}overstocked inventory.
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed"
          >
            Connect verified pharmaceutical vendors and buyers on a secure,
            compliant, and scalable B2B platform built exclusively for pharmacists.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 flex flex-col sm:flex-row flex-wrap gap-4 justify-center lg:justify-start"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(145, 85, 167, 0.3)" }}
              whileTap={{ scale: 0.97 }}
              className="group relative px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#9155a7] to-[#7b2c78] text-white font-semibold text-base overflow-hidden shadow-lg shadow-[#9155a7]/25 transition-all duration-300 cursor-pointer"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start Selling
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#7b2c78] to-[#a42574] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-3.5 rounded-xl border-2 border-[#9155a7] text-[#9155a7] font-semibold text-base hover:bg-[#9155a7]/5 transition-all duration-300 backdrop-blur-sm cursor-pointer"
            >
              Become a Buyer
            </motion.button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-2 justify-center lg:justify-start"
          >
            {[
              "Licensed vendors only",
              "Bulk pricing",
              "Secure transactions",
            ].map((text, i) => (
              <motion.span
                key={text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + i * 0.15 }}
                className="flex items-center gap-1.5 text-sm text-gray-500"
              >
                <svg
                  className="w-4 h-4 text-[#9155a7]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {text}
              </motion.span>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="mt-10 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0"
          >
            {[
              { number: "500+", label: "Vendors" },
              { number: "10K+", label: "Products" },
              { number: "99%", label: "Uptime" },
            ].map((stat, i) => (
              <div key={i} className="text-center lg:text-left">
                <div className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9155a7] to-[#a42574]">
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT FEATURES */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6"
        >
          {features.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.15 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-white/80 backdrop-blur-md p-5 sm:p-6 rounded-2xl shadow-md hover:shadow-2xl hover:shadow-[#9155a7]/10 transition-all duration-300 border border-white/50 overflow-hidden"
            >
              {/* Card gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#9155a7] via-[#7b2c78] to-[#a42574] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />

              {/* Floating particle on hover */}
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#9155a7]/5 rounded-full group-hover:scale-150 transition-transform duration-500" />

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9155a7]/10 to-[#a42574]/10 flex items-center justify-center text-2xl text-[#9155a7] mb-4 group-hover:bg-gradient-to-br group-hover:from-[#9155a7] group-hover:to-[#a42574] group-hover:text-white transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="font-bold text-[#111111] mb-2 text-sm sm:text-base">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Extra CTA card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="sm:col-span-2 relative bg-gradient-to-r from-[#9155a7] to-[#a42574] p-5 sm:p-6 rounded-2xl shadow-lg text-white overflow-hidden"
          >
            {/* Animated pattern overlay */}
            <motion.div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
                                  radial-gradient(circle at 80% 20%, white 1px, transparent 1px),
                                  radial-gradient(circle at 60% 80%, white 1px, transparent 1px)`,
                backgroundSize: "60px 60px, 80px 80px, 40px 40px",
              }}
              animate={{ backgroundPosition: ["0px 0px", "60px 60px"] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-bold text-lg">
                  Ready to transform your pharmacy?
                </h3>
                <p className="text-white/80 text-sm mt-1">
                  Join hundreds of verified vendors today.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 bg-white text-[#9155a7] font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm whitespace-nowrap cursor-pointer"
              >
                Get Started Free
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 50L48 45.7C96 41.3 192 32.7 288 30.2C384 27.7 480 31.3 576 38.8C672 46.3 768 57.7 864 58.5C960 59.3 1056 49.7 1152 44.2C1248 38.7 1344 37.3 1392 36.7L1440 36V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z"
            fill="white"
            fillOpacity="0.6"
          />
        </svg>
      </div>
    </section>
  );
}