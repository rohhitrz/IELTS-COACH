import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocityX: number;
  velocityY: number;
}

interface ConfettiEffectProps {
  trigger: boolean;
  duration?: number;
}

const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ trigger, duration = 3000 }) => {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isActive, setIsActive] = useState(false);

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);
      
      // Generate confetti pieces
      const pieces: ConfettiPiece[] = [];
      for (let i = 0; i < 50; i++) {
        pieces.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: -10,
          rotation: Math.random() * 360,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4,
          velocityX: (Math.random() - 0.5) * 4,
          velocityY: Math.random() * 3 + 2
        });
      }
      setConfetti(pieces);

      // Clean up after duration
      setTimeout(() => {
        setIsActive(false);
        setConfetti([]);
      }, duration);
    }
  }, [trigger, isActive, duration]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti"
          style={{
            left: piece.x,
            top: piece.y,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            animation: `confetti-fall ${duration}ms linear forwards`
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiEffect;