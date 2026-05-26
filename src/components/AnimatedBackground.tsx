import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      type: 'bubble' | 'fish';
      angle?: number;
    }> = [];

    for (let i = 0; i < 18; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 6 + 2,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: -Math.random() * 1 - 0.5,
        type: 'bubble'
      });
    }

    for (let i = 0; i < 5; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 20 + 15,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 1,
        type: 'fish',
        angle: Math.random() * Math.PI * 2
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (isDark) {
        gradient.addColorStop(0, 'rgba(2, 6, 23, 0.95)');
        gradient.addColorStop(0.5, 'rgba(15, 23, 42, 0.78)');
        gradient.addColorStop(1, 'rgba(17, 24, 39, 0.92)');
      } else {
        gradient.addColorStop(0, 'rgba(232, 245, 255, 0.92)');
        gradient.addColorStop(0.45, 'rgba(191, 219, 254, 0.55)');
        gradient.addColorStop(1, 'rgba(167, 243, 208, 0.45)');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        if (particle.type === 'bubble') {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          const bubbleOpacity = 0.18 + Math.sin(Date.now() * 0.002 + index) * 0.08;
          ctx.fillStyle = isDark
            ? `rgba(226, 232, 240, ${bubbleOpacity})`
            : `rgba(255, 255, 255, ${Math.max(0.18, bubbleOpacity + 0.08)})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(
            particle.x - particle.size * 0.3,
            particle.y - particle.size * 0.3,
            particle.size * 0.3,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = isDark ? 'rgba(226, 232, 240, 0.35)' : 'rgba(255, 255, 255, 0.55)';
          ctx.fill();

          particle.y += particle.speedY;
          particle.x += particle.speedX;

          if (particle.y < -particle.size) {
            particle.y = canvas.height + particle.size;
            particle.x = Math.random() * canvas.width;
          }
        } else {
          ctx.save();
          ctx.translate(particle.x, particle.y);
          ctx.rotate(particle.angle || 0);

          ctx.beginPath();
          ctx.ellipse(0, 0, particle.size, particle.size * 0.6, 0, 0, Math.PI * 2);
          const fishHue = isDark ? 150 + index * 10 : 190 + index * 20;
          const fishLightness = isDark ? 48 : 60;
          ctx.fillStyle = `hsla(${fishHue}, 70%, ${fishLightness}%, 0.78)`;
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(-particle.size, 0);
          ctx.lineTo(-particle.size * 1.5, -particle.size * 0.4);
          ctx.lineTo(-particle.size * 1.3, 0);
          ctx.lineTo(-particle.size * 1.5, particle.size * 0.4);
          ctx.closePath();
          ctx.fill();

          ctx.restore();

          particle.x += particle.speedX;
          particle.y += particle.speedY;

          if (particle.x < 0 || particle.x > canvas.width) {
            particle.speedX *= -1;
            particle.angle = Math.PI - (particle.angle || 0);
          }
          if (particle.y < 0 || particle.y > canvas.height) {
            particle.speedY *= -1;
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener('resize', setCanvasSize);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <div className="fixed inset-0 z-0 transition-theme duration-300">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-blue-300 to-blue-500 opacity-90 transition-theme duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-gray-900" />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-80"
      />

      <div className="absolute bottom-0 left-0 h-40 w-full opacity-30 dark:opacity-20">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: 0 }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              rotate: [0, 10, -10, 0],
              y: [0, -5, 0]
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5
            }}
            className="absolute bottom-0 h-16 w-8 rounded-t-full bg-gradient-to-t from-pink-400 to-orange-300 dark:from-emerald-500 dark:via-teal-400 dark:to-cyan-200"
            style={{
              left: `${10 + i * 15}%`,
              transform: `skew(${-10 + Math.random() * 20}deg)`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AnimatedBackground;
