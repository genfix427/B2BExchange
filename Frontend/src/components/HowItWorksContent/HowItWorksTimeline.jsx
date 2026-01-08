import { motion } from "framer-motion";
import {
  FaStore,
  FaClipboardCheck,
  FaHospital,
  FaUserMd,
  FaCheckCircle,
} from "react-icons/fa";

/* -------------------- DATA -------------------- */
const steps = [
  {
    icon: <FaStore />,
    title: "A Secure Pharma Marketplace",
    desc: "B2BExchange is a trusted digital marketplace that connects independent pharmacies and healthcare providers within a verified and compliant environment.",
  },
  {
    icon: <FaClipboardCheck />,
    title: "Compliance-First Trading",
    desc: "Buy and sell small quantities of non-controlled, non-expired, FDA-approved medications using DSCSA-aligned workflows and built-in compliance tools.",
  },
  {
    icon: <FaCheckCircle />,
    title: "Designed for Independent Pharmacies",
    desc: "Reduce losses from slow-moving inventory, list surplus products, and source medications from licensed peers while staying compliant in minutes.",
  },
  {
    icon: <FaHospital />,
    title: "Hospitals, Clinics & LTC Facilities",
    desc: "B2BExchange supports hospitals, clinics, and LTC facilities by simplifying loan, borrow, and transfer scenarios while managing DSCSA obligations.",
  },
  {
    icon: <FaUserMd />,
    title: "Doctors & Clinical Providers",
    desc: "Physicians and clinics can conveniently purchase prescription medications for office use at competitive prices while improving inventory control.",
  },
];

/* -------------------- BACKGROUND DOTS -------------------- */
const AnimatedDots = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(60)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute w-1.5 h-1.5 bg-teal-400/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 6 + Math.random() * 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 4,
          }}
        />
      ))}
    </div>
  );
};

/* -------------------- MAIN COMPONENT -------------------- */
export default function HowItWorksTimeline() {
  return (
    <section className="relative py-28 bg-linear-to-b from-slate-50 to-white overflow-hidden">

      {/* Animated Background */}
      <AnimatedDots />

      <div className="relative max-w-6xl mx-auto px-6">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            How B2BExchange Works
          </h2>
          <p className="mt-4 text-gray-600 max-w-3xl mx-auto">
            A secure, compliant, and efficient way to trade prescription medications
            across the healthcare supply chain.
          </p>
        </motion.div>

        {/* Timeline Wrapper */}
        <div className="relative">

          {/* Animated Vertical Line */}
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute left-5 md:left-1/2 top-0 w-0.75 bg-linear-to-b from-teal-500 to-emerald-600 rounded-full"
          />

          {/* Steps */}
          <div className="space-y-16">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={`relative flex flex-col md:flex-row gap-6 ${
                  index % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"
                }`}
              >
                {/* Timeline Icon */}
                <div className="relative z-10 flex items-center justify-center w-11 h-11 rounded-full bg-teal-600 text-white shadow-lg md:absolute md:left-1/2 md:-translate-x-1/2">
                  {step.icon}
                </div>

                {/* Card */}
                <div
                  className={`bg-white rounded-2xl px-6 pt-10 pb-6 shadow-md border border-gray-100 max-w-xl hover:shadow-xl transition ${
                    index % 2 === 0 ? "md:ml-auto" : "md:mr-auto"
                  }`}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
