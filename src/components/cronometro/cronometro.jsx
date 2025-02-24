import React, { useState, useEffect } from "react";
import "./cronometro.css"; // Estilos atualizados

const REFERENCE_DATE = new Date("2025-02-01T00:00:00"); // Início do ano
const FINAL_EVENT_DATE = new Date("2025-06-22T23:59:59"); // Último evento
const RECT_WIDTH = 300;
const RECT_HEIGHT = 80;
const PERIMETER = (RECT_WIDTH + RECT_HEIGHT) * 2; // Perímetro total

const eventDays = [
  new Date("2025-06-19T00:00:00"),
  new Date("2025-06-20T00:00:00"),
  new Date("2025-06-21T00:00:00"),
  new Date("2025-06-22T00:00:00"),
];

const eventMessages = ["1º DIA", "2º DIA", "3º DIA", "4º DIA", "DIA DO ENCERRAMENTO"];

const calculateTimeLeft = () => {
  const now = new Date();
  let eventIndex = -1;
  let countdown = null;

  for (let i = 0; i < eventDays.length; i++) {
    const eventStart = eventDays[i].setHours(0, 0, 0, 0);
    const eventEnd = eventDays[i].setHours(23, 59, 59, 999);

    if (now >= eventStart && now <= eventEnd) {
      eventIndex = i;
      break;
    }

    if (now < eventStart) {
      const timeDiff = eventStart - now;
      countdown = {
        days: Math.floor(timeDiff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((timeDiff % (1000 * 60)) / 1000),
      };
      break;
    }
  }

  if (now > FINAL_EVENT_DATE) {
    return { eventIndex: -2, countdown: null, progress: PERIMETER }; // Barra cheia quando evento acabou
  }

  // Cálculo de progresso invertido
  const totalYearTime = FINAL_EVENT_DATE - REFERENCE_DATE;
  const remainingTime = FINAL_EVENT_DATE - now;
  const progress = ((totalYearTime - remainingTime) / totalYearTime) * PERIMETER; // Progresso aumenta conforme o tempo passa

  return { eventIndex, countdown, progress };
};

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  if (timeLeft.eventIndex === -2) return null;

  return (
    <div className="countdown-container">
      <div className="countdown-text">
        {timeLeft.eventIndex === -1 ? (
          <div className="time-values">
            <span>{timeLeft.countdown?.days}D</span>
            <span>{timeLeft.countdown?.hours}H</span>
            <span>{timeLeft.countdown?.minutes}M</span>
            <span>{timeLeft.countdown?.seconds}S</span>
          </div>
        ) : (
          <span className="event-message">{eventMessages[timeLeft.eventIndex]}</span>
        )}
      </div>

      <div className="progress-bar">
        <div className="progress-container">
          <div
            className="progress-filled"
            style={{ width: `${(timeLeft.progress / PERIMETER) * 100}%` }}
          />
          <div className="moving-object"></div>
        </div>
      </div>
    </div>
  );
};

export default Countdown;
