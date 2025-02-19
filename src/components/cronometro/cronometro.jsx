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
    return { eventIndex: -2, countdown: null, progress: 0 };
  }

  // Progresso baseado no tempo restante
  const totalYearTime = FINAL_EVENT_DATE - REFERENCE_DATE;
  const remainingTime = FINAL_EVENT_DATE - now;
  const progress = (remainingTime / totalYearTime) * PERIMETER; // Começa cheio e diminui

  return { eventIndex, countdown, progress };
};

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  if (timeLeft.eventIndex === -2) return null;

  const getStrokeColor = () => {
    if (!timeLeft.countdown) return "#ff0000"; // Vermelho quando acabar
    const percent = timeLeft.progress / PERIMETER;
    if (percent > 0.66) return "#ff0000"; // Vermelho (início do ano)
    if (percent > 0.33) return "#ffcc00"; // Amarelo (meio do caminho)
    return "#00ff00"; // Verde (próximo do evento)
  };

  return (
    <div className="countdown-container">
      <svg width="100%" height="120" viewBox={`0 0 ${RECT_WIDTH + 20} ${RECT_HEIGHT + 20}`}>
        <rect
          className="rect-bg"
          x="10"
          y="10"
          width={RECT_WIDTH}
          height={RECT_HEIGHT}
        />
        <rect
          className="rect-progress"
          x="10"
          y="10"
          width={RECT_WIDTH}
          height={RECT_HEIGHT}
          strokeDasharray={PERIMETER}
          strokeDashoffset={PERIMETER - timeLeft.progress}
          stroke={getStrokeColor()}
        />
      </svg>

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
    </div>
  );
};

export default Countdown;
