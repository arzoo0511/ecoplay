import { useMemo } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

const LightRays: React.FC = () => {
  const rays = [
    { left: "8%", width: 180, rotate: -12, delay: 0 },
    { left: "28%", width: 140, rotate: -8, delay: 1 },
    { left: "52%", width: 220, rotate: -10, delay: 2 },
    { left: "74%", width: 160, rotate: -6, delay: 3 },
  ];

  return (
    <>
      {/* Surface light */}
      <div
        className="absolute top-0 left-0 w-full h-40 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.18), rgba(255,255,255,0.04), transparent)",
        }}
      />

      {rays.map((ray, i) => (
        <motion.div
          key={i}
          className="absolute top-[-20vh] pointer-events-none"
          style={{
            left: ray.left,
            width: `${ray.width}px`,
            height: "160vh",
            transform: `rotate(${ray.rotate}deg)`,
            transformOrigin: "top center",
            background: `
              linear-gradient(
                to bottom,
                rgba(255,255,255,0.22),
                rgba(255,255,255,0.12),
                rgba(255,255,255,0.04),
                transparent
              )
            `,
            filter: "blur(18px)",
            mixBlendMode: "screen",
          }}
          animate={{
            opacity: [0.3, 0.55, 0.3],
            x: [-15, 15, -15],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: ray.delay,
          }}
        />
      ))}
    </>
  );
};

const BubbleLayer: React.FC = () => {
  const bubbles = useMemo(
    () =>
      Array.from({ length: 20 }, () => ({
        left: Math.random() * 100,
        size: 0.8 + Math.random() * 1.5,
        duration: 12 + Math.random() * 15,
        delay: Math.random() * 20,
        drift: Math.random() * 40 - 30,
        opacity: 0.2 + Math.random() * 0.5,
        maxHeight: -(400 + Math.random() * 500),
        startBottom: -50 - Math.random() * 300,
      })),
    []
  );

  return (
    <>
      {bubbles.map((bubble, i) => (
        <motion.div
          key={i}
          className="absolute text-white/40"
          style={{
            left: `${bubble.left}%`,
            bottom: `${bubble.startBottom}px`,
            scale: bubble.size,
            opacity: bubble.opacity,
          }}
          animate={{
            y: [0, bubble.maxHeight],
            x: [0, bubble.drift, -bubble.drift / 2, 0],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          🫧
        </motion.div>
      ))}
    </>
  );
};


const fishTypes = ["🐟", "🐠", "🐡"];

const FishSchool: React.FC = () => {
  const fishes = useMemo(
    () =>
      Array.from({ length: 8 }, () => ({
        startY: 100 + Math.random() * 500,
        duration: 18 + Math.random() * 12,
        delay: Math.random() * 8,
        reverse: Math.random() > 0.5,
        size: 0.8 + Math.random() * 0.8,
        opacity: 0.25 + Math.random() * 0.4,
        type: fishTypes[Math.floor(Math.random() * fishTypes.length)],
      })),
    []
  );

  return (
    <>
      {fishes.map((fish, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            x: fish.reverse ? "110vw" : "-10vw",
            y: fish.startY,
          }}
          animate={{
            x: fish.reverse ? "-10vw" : "110vw",
            y: [
              fish.startY,
              fish.startY - 20,
              fish.startY + 15,
              fish.startY,
            ],
          }}
          transition={{
            duration: fish.duration,
            repeat: Infinity,
            ease: "linear",
            delay: fish.delay,
          }}
          style={{
            scale: fish.size,
            opacity: fish.opacity,
          }}
        >
          <span
            className="text-2xl"
            style={{
                display: "inline-block",
                transform: fish.reverse ? "none" : "rotateY(180deg)",
            }}
          >
            {fish.type}
          </span>
        </motion.div>
      ))}
    </>
  );
};

const TurtleLayer: React.FC = () => (
  <motion.div
    className="absolute text-5xl opacity-30"
    initial={{ x: "110vw", y: "70vh" }}
    animate={{
      x: "-10vw",
      y: ["70vh", "72vh", "68vh", "70vh"],
    }}
    transition={{
      duration: 45,
      repeat: Infinity,
      ease: "linear",
    }}
  >
    🐢
  </motion.div>
);

const JellyfishLayer: React.FC = () => (
  <motion.div
    className="absolute text-5xl opacity-25"
    initial={{ x: "110vw", y: "40vh" }}
    animate={{
      x: "-10vw",
      y: ["40vh", "35vh", "45vh", "40vh"],
    }}
    transition={{
      duration: 35,
      repeat: Infinity,
      ease: "linear",
    }}
  >
    🪼
  </motion.div>
);

const ParticleLayer: React.FC = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 40 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 4 + 1,
        duration: 10 + Math.random() * 20,
      })),
    []
  );

  return (
    <>
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-cyan-100/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
};

const WaterCurrents: React.FC = () => {
  const currents = [
    {
      top: "18%",
      duration: 14,
      delay: 0,
      opacity: 0.18,
      scale: 1,
    },
    {
      top: "38%",
      duration: 18,
      delay: 2,
      opacity: 0.14,
      scale: 0.9,
    },
    {
      top: "62%",
      duration: 16,
      delay: 1,
      opacity: 0.16,
      scale: 1.1,
    },
    {
      top: "78%",
      duration: 20,
      delay: 3,
      opacity: 0.12,
      scale: 0.85,
    },
  ];

  return (
    <>
      {currents.map((current, i) => (
        <motion.div
          key={i}
          className="absolute left-[-20%] w-[140%] pointer-events-none"
          style={{
            top: current.top,
            opacity: current.opacity,
            scale: current.scale,
          }}
          animate={{
            x: [-40, 40, -40],
          }}
          transition={{
            duration: current.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: current.delay,
          }}
        >
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full h-24"
          >
            <motion.path
              d="
                M0,60
                C150,0 350,120 600,60
                C850,0 1050,120 1200,60
              "
              fill="none"
              stroke="rgba(180,240,255,0.22)"
              strokeWidth="10"
              strokeLinecap="round"
              animate={{
                d: [
                  `
                  M0,60
                  C150,0 350,120 600,60
                  C850,0 1050,120 1200,60
                  `,
                  `
                  M0,50
                  C180,110 320,0 600,50
                  C880,110 1020,0 1200,50
                  `,
                  `
                  M0,60
                  C150,0 350,120 600,60
                  C850,0 1050,120 1200,60
                  `,
                ],
              }}
              transition={{
                duration: current.duration,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                filter: "blur(2px)",
              }}
            />

            <motion.path
              d="
                M0,60
                C150,0 350,120 600,60
                C850,0 1050,120 1200,60
              "
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="24"
              strokeLinecap="round"
              animate={{
                d: [
                  `
                  M0,60
                  C150,0 350,120 600,60
                  C850,0 1050,120 1200,60
                  `,
                  `
                  M0,50
                  C180,110 320,0 600,50
                  C880,110 1020,0 1200,50
                  `,
                  `
                  M0,60
                  C150,0 350,120 600,60
                  C850,0 1050,120 1200,60
                  `,
                ],
              }}
              transition={{
                duration: current.duration,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                filter: "blur(12px)",
              }}
            />
          </svg>
        </motion.div>
      ))}
    </>
  );
};



const UnderwaterBackground: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  const { scrollY } = useScroll();

  const deepY = useTransform(scrollY, [0, 2000], [0, 80]);
  const midY = useTransform(scrollY, [0, 2000], [0, 160]);
  const frontY = useTransform(scrollY, [0, 2000], [0, 240]);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <LightRays />
        
            <WaterCurrents />
        

        <motion.div style={{ y: deepY }}>
            <ParticleLayer />
        </motion.div>
        <BubbleLayer />

        <motion.div style={{ y: midY }}>
            <FishSchool />
        </motion.div>
        
        <motion.div style={{ y: frontY }}>
            <TurtleLayer />
            <JellyfishLayer />
        </motion.div>
    </div>
  );
};

export default UnderwaterBackground;


