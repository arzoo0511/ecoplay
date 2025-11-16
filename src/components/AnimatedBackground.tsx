import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Particles for bubbles and fish
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      type: 'bubble' | 'fish';
      angle?: number;
    }> = [];

    // Create bubbles
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 6 + 2,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: -Math.random() * 1 - 0.5,
        type: 'bubble'
      });
    }

    // Create fish
    for (let i = 0; i < 8; i++) {
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

      // Create ocean gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0, 50, 150, 0.3)');
      gradient.addColorStop(0.5, 'rgba(0, 100, 200, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 150, 255, 0.1)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        if (particle.type === 'bubble') {
          // Draw bubble
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(Date.now() * 0.002 + index) * 0.1})`;
          ctx.fill();
          
          // Add bubble highlight
          ctx.beginPath();
          ctx.arc(particle.x - particle.size * 0.3, particle.y - particle.size * 0.3, particle.size * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.fill();

          // Move bubble
          particle.y += particle.speedY;
          particle.x += particle.speedX;

          // Reset bubble if it goes off screen
          if (particle.y < -particle.size) {
            particle.y = canvas.height + particle.size;
            particle.x = Math.random() * canvas.width;
          }
        } else if (particle.type === 'fish') {
          // Draw simple fish shape
          ctx.save();
          ctx.translate(particle.x, particle.y);
          ctx.rotate(particle.angle || 0);
          
          // Fish body
          ctx.beginPath();
          ctx.ellipse(0, 0, particle.size, particle.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${200 + index * 30}, 70%, 60%, 0.8)`;
          ctx.fill();
          
          // Fish tail
          ctx.beginPath();
          ctx.moveTo(-particle.size, 0);
          ctx.lineTo(-particle.size * 1.5, -particle.size * 0.4);
          ctx.lineTo(-particle.size * 1.3, 0);
          ctx.lineTo(-particle.size * 1.5, particle.size * 0.4);
          ctx.closePath();
          ctx.fill();
          
          ctx.restore();

          // Move fish
          particle.x += particle.speedX;
          particle.y += particle.speedY;

          // Bounce off edges
          if (particle.x < 0 || particle.x > canvas.width) {
            particle.speedX *= -1;
            particle.angle = Math.PI - (particle.angle || 0);
          }
          if (particle.y < 0 || particle.y > canvas.height) {
            particle.speedY *= -1;
          }
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="fixed inset-0 z-0">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-400 via-blue-600 to-blue-900" />
      
      {/* Animated Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-80"
      />
      
      {/* Coral Decorations */}
      <div className="absolute bottom-0 left-0 w-full h-40 opacity-30">
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
            className={`absolute bottom-0 w-8 h-16 bg-gradient-to-t from-pink-400 to-orange-300 rounded-t-full`}
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