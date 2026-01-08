import { motion } from "framer-motion";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

export default function ContactBanner() {
  return (
    <section className="relative py-28 bg-linear-to-r from-teal-800 via-emerald-800 to-teal-900 text-white overflow-hidden">

      {/* Background glow */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 14, repeat: Infinity }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold">
            Get in Touch With B2BExchange
          </h1>
          <p className="mt-4 text-gray-200 max-w-2xl mx-auto">
            Have questions about our platform, compliance, or onboarding?
            Our team is here to support you.
          </p>
        </motion.div>

        {/* Contact Cards */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard
            icon={<FaPhoneAlt />}
            title="Call Us"
            value="1-833-B2B-EXCH"
            sub="Mon – Fri | 10AM – 5PM EST"
          />

          <InfoCard
            icon={<FaEnvelope />}
            title="Email Support"
            value="support@b2bexchange.com"
            sub="We usually respond within 24 hours"
          />

          <InfoCard
            icon={<FaMapMarkerAlt />}
            title="Office Location"
            value="United States"
            sub="Serving licensed pharmacies nationwide"
          />
        </div>
      </div>
    </section>
  );
}

function InfoCard({ icon, title, value, sub }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 250 }}
      className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition"
    >
      <div className="text-3xl text-emerald-300 mb-4 flex justify-center">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-white font-medium">{value}</p>
      <p className="text-sm text-gray-200 mt-1">{sub}</p>
    </motion.div>
  );
}
