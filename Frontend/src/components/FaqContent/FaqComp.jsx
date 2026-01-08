import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiShield, FiDollarSign, FiTruck } from "react-icons/fi";

const faqs = [
  {
    icon: <FiShield />,
    question: "What is this platform?",
    answer:
      "B2BExchange is a secure, cloud-based marketplace created for licensed healthcare providers and independent pharmacies to trade prescription medications safely and compliantly.",
  },
  {
    icon: <FiDollarSign />,
    question: "Is there a cost to join?",
    answer:
      "Joining the platform is free. A one-time ACH verification fee of $0.50 is required to securely link your bank account. Once completed, members gain full access to trading features, compliance tools, and discounted partner services.",
  },
  {
    icon: <FiShield />,
    question: "How do I sign up?",
    answer:
      "Registration begins by completing the online application. After submission, our onboarding team will reach out within 48 hours to request licensing documentation. This process helps maintain a trusted and verified marketplace.",
  },
  {
    icon: <FiShield />,
    question: "Can I manage multiple pharmacy locations under one account?",
    answer:
      "Each pharmacy location is treated as an individual entity. To ensure accurate licensing and compliance, a separate registration is required for every location.",
  },
  {
    icon: <FiShield />,
    question: "How is security and data privacy handled?",
    answer:
      "We take privacy seriously. Every participant undergoes a verification process before accessing the platform. All sensitive information is securely stored and never shared with external parties except when legally required.",
  },
  {
    icon: <FiTruck />,
    question: "Who covers shipping expenses?",
    answer:
      "Shipping responsibility depends on seller status. Premium sellers cover all ground shipping and part of express shipping costs, while non-premium sellers pass shipping costs to the buyer.",
  },
  {
    icon: <FiDollarSign />,
    question: "Why do medication prices differ across listings?",
    answer:
      "B2BExchange does not sell medications directly. Licensed pharmacies list their own inventory, and pricing varies based on factors such as expiration dates, availability, and packaging condition, allowing buyers to compare and choose the best option.",
  },
  {
    icon: <FiShield />,
    question: "Are transactions considered wholesale?",
    answer:
      "Transactions between licensed pharmacies are conducted solely to meet specific patient needs, as permitted under DSCSA guidelines, and are not classified as wholesale activities.",
  },
  {
    icon: <FiTruck />,
    question: "How do pharmacy-to-pharmacy orders work?",
    answer:
      "Buyers select a shipping option and accept applicable charges. Once the seller confirms the order, both parties receive notifications. Orders can be tracked and managed through the dashboard, and delivery confirmation is handled automatically if not manually confirmed.",
  },
  {
    icon: <FiDollarSign />,
    question: "Is there a minimum listing requirement for sellers?",
    answer:
      "There is no minimum quantity required to list products. The only applicable fee is the one-time ACH setup charge, which also applies to future account updates.",
  },
];

export default function FaqComp() {
  const [active, setActive] = useState(null);

  return (
    <section className="relative py-28 bg-linear-to-b from-slate-50 to-white overflow-hidden">
      
      {/* Decorative background dots */}
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle,#14b8a6_1px,transparent_1px)] bg-size-[26px_26px]" />

      <div className="relative max-w-4xl mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about using B2BExchange confidently and compliantly.
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="space-y-5">
          {faqs.map((item, index) => {
            const open = active === index;

            return (
              <motion.div
                key={index}
                layout
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition"
              >
                <button
                  onClick={() => setActive(open ? null : index)}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-teal-600 text-xl">
                      {item.icon}
                    </div>
                    <span className="font-medium text-gray-900">
                      {item.question}
                    </span>
                  </div>

                  <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-teal-600"
                  >
                    <FiChevronDown size={22} />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4 }}
                      className="px-6 pb-6 text-gray-600 leading-relaxed"
                    >
                      {item.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
