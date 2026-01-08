import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBox, FaTape, FaSnowflake, FaTruck } from "react-icons/fa";

/* -------------------- BACKGROUND EFFECTS -------------------- */

const AnimatedDots = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(70)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute w-1.5 h-1.5 bg-teal-400/25 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.15, 0.5, 0.15],
          }}
          transition={{
            duration: 6 + Math.random() * 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 4,
          }}
        />
      ))}
    </div>
  );
};

export default function ShippingInfo() {
  const [activeTab, setActiveTab] = useState("packing");

  return (
    <section className="relative py-28 bg-linear-to-b from-slate-50 to-white overflow-hidden">

      {/* Animated Background */}
      <AnimatedDots />

      {/* Soft Gradient Blobs */}
      <motion.div
        className="absolute -top-40 -left-40 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* Tabs Header */}
        <div className="flex justify-center gap-10 border-b mb-20">
          <TabButton
            active={activeTab === "packing"}
            onClick={() => setActiveTab("packing")}
          >
            Packing Guidelines for Shipping
          </TabButton>

          <TabButton
            active={activeTab === "process"}
            onClick={() => setActiveTab("process")}
          >
            Process & Shipping Options
          </TabButton>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "packing" && (
            <motion.div
              key="packing"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              <InfoCard
                icon={<FaBox />}
                title="1) Use sturdy corrugated boxes"
                items={[
                  "Express packaging supports overnight and two-day deliveries.",
                  "Ensure all flaps are intact and free from damage.",
                  "Double-wall boxes are recommended for heavier shipments.",
                  "Reused boxes must be clean and free from tears or old labels.",
                ]}
              />

              <InfoCard
                icon={<FaTape />}
                title="2) Secure partial containers properly"
                items={[
                  "Use fillers to prevent movement in partially filled containers.",
                  "Confirm caps are sealed tightly before placing in plastic bags.",
                ]}
              />

              <InfoCard
                icon={<FaTape />}
                title="3) Seal packages tightly"
                items={[
                  "Seal seams with tape at least two inches wide.",
                  "Use reinforced or pressure-sensitive packing tape.",
                  "Avoid string, masking tape, or paper wrapping.",
                  "Ensure prepaid shipping labels are firmly attached.",
                ]}
              />

              <InfoCard
                icon={<FaBox />}
                title="4) Cushion the interior"
                items={[
                  "Use foam, bubble wrap, or shredded paper for protection.",
                  "Keep products centered to minimize impact during transit.",
                ]}
              />

              <InfoCard
                icon={<FaSnowflake />}
                title="5) Handle temperature-sensitive items carefully"
                items={[
                  "Pre-chill items according to manufacturer guidelines.",
                  "Use insulated containers with moisture protection.",
                  "Allow room for coolant or dry ice as needed.",
                  "Seal double-wall boxes tightly for refrigerated shipments.",
                ]}
              />
            </motion.div>
          )}

          {activeTab === "process" && (
            <motion.div
              key="process"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              <InfoCard
                icon={<FaTruck />}
                title="1) Preparing your shipment"
                items={[
                  "Print the prepaid label generated upon order confirmation.",
                  "Lost or damaged labels can be reprinted at any time.",
                ]}
              />

              <InfoCard
                icon={<FaTruck />}
                title="2) Choose a shipping method"
                items={[
                  "Schedule a pickup through your seller dashboard.",
                  "Same-day pickup may be available for express services.",
                  "Ground shipments typically collect the next business day.",
                  "Overnight refrigerated orders ship Monday through Thursday.",
                ]}
              />

              <InfoCard
                icon={<FaTruck />}
                title="3) Tracking your package"
                items={[
                  "Each shipment includes an automatic tracking number.",
                  "Monitor progress directly from your orders dashboard.",
                  "Personal carrier accounts are not supported.",
                ]}
              />

              <InfoCard
                icon={<FaTruck />}
                title="4) Reprinting documents"
                items={[
                  "Labels and packing checklists are always accessible.",
                  "Go to Orders > Active Sales to reprint documents.",
                ]}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* -------------------- UI HELPERS -------------------- */

function TabButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative pb-4 text-sm md:text-base font-medium transition cursor-pointer ${
        active ? "text-teal-600" : "text-gray-500 hover:text-teal-600"
      }`}
    >
      {children}
      {active && (
        <span className="absolute left-0 bottom-0 w-full h-0.5 bg-teal-600 rounded-full" />
      )}
    </button>
  );
}

function InfoCard({ icon, title, items }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-slate-100/80 backdrop-blur rounded-2xl p-6 shadow-sm hover:shadow-lg transition"
    >
      <div className="flex items-center gap-3 mb-4 text-teal-600 text-xl">
        {icon}
        <h3 className="font-semibold text-gray-900 text-base">
          {title}
        </h3>
      </div>

      <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </motion.div>
  );
}
