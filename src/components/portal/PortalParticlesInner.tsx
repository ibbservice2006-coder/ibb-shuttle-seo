import { motion } from "framer-motion";

const particles = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  size: Math.random() * 4 + 2,
  x: Math.random() * 100,
  delay: Math.random() * 5,
  duration: Math.random() * 10 + 15,
  opacity: Math.random() * 0.3 + 0.1,
}));

const PortalParticlesInner = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {particles.map((particle) => (
      <motion.div
        key={particle.id}
        className="absolute rounded-full"
        style={{
          width: particle.size,
          height: particle.size,
          left: `${particle.x}%`,
          background: `radial-gradient(circle, rgba(191, 149, 63, ${particle.opacity}) 0%, transparent 70%)`,
          boxShadow: `0 0 ${particle.size * 2}px rgba(191, 149, 63, ${particle.opacity})`,
        }}
        initial={{ y: "100vh", opacity: 0 }}
        animate={{
          y: "-100vh",
          opacity: [0, particle.opacity, particle.opacity, 0],
        }}
        transition={{
          duration: particle.duration,
          delay: particle.delay,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    ))}
  </div>
);

export default PortalParticlesInner;
