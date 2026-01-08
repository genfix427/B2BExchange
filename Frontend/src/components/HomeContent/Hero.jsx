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

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-teal-50 via-white to-teal-100">
      
      {/* Floating background animation */}
      <motion.div
        className="absolute -top-32 -right-32 w-125 h-125 bg-teal-200/30 rounded-full blur-3xl"
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-14 items-center">

        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block mb-4 px-4 py-1 rounded-full bg-teal-100 text-teal-700 text-sm font-medium">
            B2B Marketplace for Pharmacists
          </span>

          <h1 className="text-2xl md:text-3xl xl:text-4xl font-bold text-gray-900 leading-tight">
            A secure pharmacy-to-pharmacy marketplace
            <span className="text-teal-600"> for buying and selling overstocked inventory.</span> 
            
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-xl">
            Connect verified pharmaceutical vendors and buyers on a secure,
            compliant, and scalable B2B platform built exclusively for pharmacists.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button className="px-6 py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition shadow-lg">
              Start Selling
            </button>

            <button className="px-6 py-3 rounded-lg border border-teal-600 text-teal-600 font-medium hover:bg-teal-50 transition">
              Become a Buyer
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            ✔ Licensed vendors only • ✔ Bulk pricing • ✔ Secure transactions
          </p>
        </motion.div>

        {/* RIGHT FEATURES */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid sm:grid-cols-2 gap-6"
        >
          {features.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition"
            >
              <div className="text-3xl text-teal-600 mb-3">
                {item.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
