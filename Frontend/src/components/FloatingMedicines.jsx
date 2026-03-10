// src/components/FloatingMedicines.jsx
import { motion } from "framer-motion";

const medicineConfigs = {
  light: {
    capsule1: { color1: "#9155a7", color2: "#a42574", opacity: 0.12 },
    capsule2: { color1: "#7b2c78", color2: "#9155a7", opacity: 0.1 },
    tablet: { color: "#9155a7", opacity: 0.1 },
    pill: { color: "#a42574", opacity: 0.08 },
    cross: { color: "#7b2c78", opacity: 0.1 },
    bottle: { color: "#9155a7", opacity: 0.08 },
  },
  dark: {
    capsule1: { color1: "#c4a5d4", color2: "#d4a5c4", opacity: 0.1 },
    capsule2: { color1: "#b87db5", color2: "#c4a5d4", opacity: 0.08 },
    tablet: { color: "#c4a5d4", opacity: 0.08 },
    pill: { color: "#d4a5c4", opacity: 0.07 },
    cross: { color: "#b87db5", opacity: 0.08 },
    bottle: { color: "#c4a5d4", opacity: 0.07 },
  },
};

const floatingItems = [
  { id: 1, type: "capsule1", x: "3%", y: "12%", size: 48, rot: 35, dur: 20, del: 0 },
  { id: 2, type: "capsule2", x: "88%", y: "20%", size: 38, rot: -25, dur: 24, del: 2 },
  { id: 3, type: "tablet", x: "78%", y: "65%", size: 26, rot: 0, dur: 18, del: 1 },
  { id: 4, type: "pill", x: "12%", y: "72%", size: 36, rot: 50, dur: 22, del: 3 },
  { id: 5, type: "cross", x: "55%", y: "8%", size: 22, rot: 0, dur: 26, del: 1.5 },
  { id: 6, type: "bottle", x: "92%", y: "48%", size: 34, rot: 0, dur: 19, del: 0.5 },
  { id: 7, type: "capsule1", x: "42%", y: "85%", size: 32, rot: -40, dur: 21, del: 4 },
  { id: 8, type: "tablet", x: "8%", y: "42%", size: 20, rot: 0, dur: 23, del: 2.5 },
  { id: 9, type: "cross", x: "72%", y: "88%", size: 18, rot: 15, dur: 25, del: 3.5 },
  { id: 10, type: "pill", x: "35%", y: "28%", size: 28, rot: -55, dur: 17, del: 1 },
  { id: 11, type: "capsule2", x: "62%", y: "45%", size: 30, rot: 70, dur: 28, del: 5 },
  { id: 12, type: "bottle", x: "22%", y: "55%", size: 28, rot: 0, dur: 20, del: 2 },
];

const CapsuleSVG = ({ size, color1, color2, opacity, rotation }) => (
  <svg
    width={size}
    height={size * 0.45}
    viewBox="0 0 100 45"
    style={{ transform: `rotate(${rotation}deg)` }}
  >
    <rect
      x="5" y="5" width="90" height="35"
      rx="17.5" ry="17.5"
      fill={color1} fillOpacity={opacity}
      stroke={color1} strokeWidth="1" strokeOpacity={opacity * 0.6}
    />
    <rect
      x="50" y="5" width="45" height="35"
      rx="17.5" ry="17.5"
      fill={color2} fillOpacity={opacity}
    />
    <line
      x1="50" y1="5" x2="50" y2="40"
      stroke="white" strokeWidth="1" strokeOpacity={opacity * 1.5}
    />
  </svg>
);

const TabletSVG = ({ size, color, opacity }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle
      cx="20" cy="20" r="17"
      fill={color} fillOpacity={opacity}
      stroke={color} strokeWidth="1.2" strokeOpacity={opacity * 0.7}
    />
    <line
      x1="8" y1="20" x2="32" y2="20"
      stroke={color} strokeWidth="0.8" strokeOpacity={opacity * 0.5}
    />
  </svg>
);

const PillSVG = ({ size, color, opacity, rotation }) => (
  <svg
    width={size}
    height={size * 0.5}
    viewBox="0 0 60 30"
    style={{ transform: `rotate(${rotation}deg)` }}
  >
    <rect
      x="3" y="3" width="54" height="24"
      rx="12" ry="12"
      fill={color} fillOpacity={opacity}
      stroke={color} strokeWidth="1.2" strokeOpacity={opacity * 0.6}
    />
    <ellipse
      cx="18" cy="15" rx="5" ry="3.5"
      fill="white" fillOpacity={opacity * 0.8}
    />
  </svg>
);

const CrossSVG = ({ size, color, opacity }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <rect
      x="14" y="4" width="12" height="32" rx="3"
      fill={color} fillOpacity={opacity}
      stroke={color} strokeWidth="0.8" strokeOpacity={opacity * 0.5}
    />
    <rect
      x="4" y="14" width="32" height="12" rx="3"
      fill={color} fillOpacity={opacity}
      stroke={color} strokeWidth="0.8" strokeOpacity={opacity * 0.5}
    />
  </svg>
);

const BottleSVG = ({ size, color, opacity }) => (
  <svg width={size * 0.6} height={size} viewBox="0 0 30 50">
    <rect
      x="8" y="2" width="14" height="8" rx="2"
      fill={color} fillOpacity={opacity * 1.2}
      stroke={color} strokeWidth="0.8" strokeOpacity={opacity * 0.5}
    />
    <rect
      x="4" y="10" width="22" height="36" rx="4"
      fill={color} fillOpacity={opacity}
      stroke={color} strokeWidth="1" strokeOpacity={opacity * 0.6}
    />
    <text
      x="15" y="32" textAnchor="middle"
      fontSize="9" fill={color} fillOpacity={opacity * 2}
      fontWeight="bold"
    >
      Rx
    </text>
  </svg>
);

const ShapeRenderer = ({ item, theme }) => {
  const config = medicineConfigs[theme];
  const typeConfig = config[item.type];

  switch (item.type) {
    case "capsule1":
    case "capsule2":
      return (
        <CapsuleSVG
          size={item.size}
          color1={typeConfig.color1}
          color2={typeConfig.color2}
          opacity={typeConfig.opacity}
          rotation={item.rot}
        />
      );
    case "tablet":
      return <TabletSVG size={item.size} color={typeConfig.color} opacity={typeConfig.opacity} />;
    case "pill":
      return <PillSVG size={item.size} color={typeConfig.color} opacity={typeConfig.opacity} rotation={item.rot} />;
    case "cross":
      return <CrossSVG size={item.size} color={typeConfig.color} opacity={typeConfig.opacity} />;
    case "bottle":
      return <BottleSVG size={item.size} color={typeConfig.color} opacity={typeConfig.opacity} />;
    default:
      return null;
  }
};

export default function FloatingMedicines({ theme = "light", count = 12 }) {
  const items = floatingItems.slice(0, count);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {items.map((item) => (
        <motion.div
          key={item.id}
          className="absolute"
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -20, 12, -8, 0],
            x: [0, 10, -8, 6, 0],
            rotate: [0, 8, -6, 4, 0],
            scale: [1, 1.04, 0.96, 1.02, 1],
          }}
          transition={{
            duration: item.dur,
            delay: item.del,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <ShapeRenderer item={item} theme={theme} />
        </motion.div>
      ))}
    </div>
  );
}