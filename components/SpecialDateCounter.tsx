import { useEffect, useState } from "react";

interface TimeLeft {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface SpecialDateCounterProps {
  date: Date | string | { seconds: number; nanoseconds: number } | null;
  title: string;
}

/**
 * Visual counter component that tracks time elapsed (or remaining) for a special date.
 * Displays years, months, days, hours, minutes, and seconds in a stylized grid.
 */
export default function SpecialDateCounter({ date, title }: SpecialDateCounterProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!date) return;

    let targetDate: Date;
    if (typeof date === "object" && "seconds" in date) {
      targetDate = new Date(date.seconds * 1000);
    } else {
      targetDate = new Date(date);
    }

    const calculateTimeLeft = () => {
      const difference = +new Date() - +targetDate;

      let diff = Math.abs(difference);

      const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
      diff -= years * (1000 * 60 * 60 * 24 * 365);

      const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
      diff -= months * (1000 * 60 * 60 * 24 * 30);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      diff -= days * (1000 * 60 * 60 * 24);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      diff -= hours * (1000 * 60 * 60);

      const minutes = Math.floor(diff / (1000 * 60));
      diff -= minutes * (1000 * 60);

      const seconds = Math.floor(diff / 1000);

      setTimeLeft({ years, months, days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [date]);

  if (!date || !timeLeft) return null;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white/50 backdrop-blur-sm rounded-3xl shadow-sm border border-pink-100 max-w-2xl mx-auto mt-8 mb-8 animate-fade-in-up">
      <h3 className="text-2xl md:text-3xl font-serif text-pink-500 font-bold mb-6 text-center drop-shadow-sm">
        {title}
      </h3>

      <div className="flex flex-wrap justify-center gap-4 md:gap-8">
        {[
          { label: "Anos", value: timeLeft.years },
          { label: "Meses", value: timeLeft.months },
          { label: "Dias", value: timeLeft.days },
          { label: "Horas", value: timeLeft.hours },
          { label: "Minutos", value: timeLeft.minutes },
          { label: "Segundos", value: timeLeft.seconds },
        ].map((item, index) =>
          item.label === "Anos" && item.value === 0 ? null : (
            <div key={index} className="flex flex-col items-center">
              <div className="bg-white/80 w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-[0_4px_20px_rgba(236,72,153,0.15)] text-pink-600 border border-pink-100/50 transform hover:scale-105 transition-transform duration-300">
                <span className="text-xl md:text-2xl font-bold font-mono">
                  {String(item.value).padStart(2, "0")}
                </span>
              </div>
              <span className="text-xs md:text-sm text-pink-400 font-medium mt-2 uppercase tracking-wider">
                {item.label}
              </span>
            </div>
          ),
        )}
      </div>
      <div className="mt-4 text-pink-300 text-xs text-center font-medium italic">
        ❤️ Cada segundo com você é um presente ❤️
      </div>
    </div>
  );
}
