import { motion } from "motion/react";
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

const getDateObject = (date: SpecialDateCounterProps["date"]) => {
  if (!date) return null;
  if (typeof date === "object" && "seconds" in date) return new Date(date.seconds * 1000);
  return new Date(date);
};

const addMonths = (date: Date, months: number) => {
  const result = new Date(date);
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
};

/**
 * Calendar-accurate difference between two dates (real month and year lengths,
 * leap years included), in either direction.
 */
const getCalendarDifference = (a: Date, b: Date): TimeLeft => {
  const [start, end] = a <= b ? [a, b] : [b, a];

  let totalMonths =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (addMonths(start, totalMonths) > end) totalMonths -= 1;

  const anchor = addMonths(start, totalMonths);
  let remaining = Math.floor((end.getTime() - anchor.getTime()) / 1000);

  const days = Math.floor(remaining / 86400);
  remaining -= days * 86400;
  const hours = Math.floor(remaining / 3600);
  remaining -= hours * 3600;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining - minutes * 60;

  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    days,
    hours,
    minutes,
    seconds,
  };
};

/**
 * Visual counter component that tracks time elapsed (or remaining) for a special date.
 * Displays years, months, days, hours, minutes, and seconds in a stylized grid.
 */
export default function SpecialDateCounter({ date, title }: SpecialDateCounterProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isFuture, setIsFuture] = useState(false);

  useEffect(() => {
    if (!date) return;

    const targetDate = getDateObject(date);
    if (!targetDate) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      setIsFuture(targetDate.getTime() > now.getTime());
      setTimeLeft(getCalendarDifference(targetDate, now));
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [date]);

  if (!date || !timeLeft) return null;

  const targetDate = getDateObject(date);
  const dateLabel = targetDate
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(targetDate)
    : "";

  const units = [
    { label: "Anos", value: timeLeft.years },
    { label: "Meses", value: timeLeft.months },
    { label: "Dias", value: timeLeft.days },
    { label: "Horas", value: timeLeft.hours },
    { label: "Minutos", value: timeLeft.minutes },
    { label: "Segundos", value: timeLeft.seconds },
  ].filter((item) => item.label !== "Anos" || item.value > 0);

  return (
    <motion.div
      className="w-full rounded-lg border border-rose-100 bg-white/90 p-5 shadow-[0_18px_70px_rgba(127,29,29,0.08)] backdrop-blur"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: "easeOut" }}
    >
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400">
            {isFuture ? "Contagem regressiva" : "Tempo juntos"}
          </span>
          <h3 className="mt-1 text-2xl font-semibold text-brand-ink md:text-3xl">{title}</h3>
        </div>
        {dateLabel && (
          <span className="text-sm font-medium text-stone-500">
            {isFuture ? "Até" : "Desde"} {dateLabel}
          </span>
        )}
      </div>

      <motion.div
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 1 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.045 },
          },
        }}
      >
        {units.map((item) => (
          <motion.div
            key={item.label}
            className="rounded-lg border border-rose-100 bg-rose-50/70 p-3"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.26, ease: "easeOut" },
              },
            }}
          >
            <div className="font-mono text-2xl font-semibold text-rose-950 md:text-3xl">
              {String(item.value).padStart(2, "0")}
            </div>
            <div className="mt-1 text-[11px] font-bold uppercase tracking-wide text-rose-400">
              {item.label}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
