'use client';

import React, { useState, useEffect } from 'react';
import { Hourglass, Clock } from 'lucide-react';

interface CountdownTimerProps {
  prazoDefesa: string | Date | null;
}

export function CountdownTimer({ prazoDefesa }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isOver, setIsOver] = useState<boolean>(false);

  useEffect(() => {
    if (!prazoDefesa) return;

    const targetDate = new Date(prazoDefesa);

    const calculateTime = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft('Prazo Limite Excedido');
        setIsOver(true);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000); // atualizar a cada minuto

    return () => clearInterval(interval);
  }, [prazoDefesa]);

  if (!prazoDefesa) return null;

  return (
    <div className={`px-4 py-2 border rounded-xl flex items-center gap-2.5 transition-all select-none backdrop-blur-md ${
      isOver 
        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
        : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 animate-pulse'
    }`}>
      {isOver ? (
        <Clock className="h-4 w-4 shrink-0 text-rose-450" />
      ) : (
        <Hourglass className="h-4 w-4 shrink-0 text-indigo-400" />
      )}
      <div className="flex flex-col">
        <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
          Prazo Final de Defesa
        </span>
        <span className="text-xs font-bold leading-none mt-0.5 font-mono">
          {timeLeft}
        </span>
      </div>
    </div>
  );
}
