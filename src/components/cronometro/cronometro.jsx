import React, { useState, useEffect } from 'react';
import './cronometro.css';  // Import the CSS file

const Countdown = () => {
  const eventDays = [
    new Date('2024-07-05T00:00:00'),
    new Date('2024-07-06T00:00:00'),
    new Date('2024-07-07T00:00:00'),
    new Date('2024-07-08T00:00:00'),
    new Date('2024-07-09T00:00:00'),
  ];

  const eventMessages = [
    "1º DIA",
    "2º DIA",
    "3º DIA",
    "4º DIA",
    "DIA DO ENCERRAMENTO",
  ];

  const calculateTimeLeft = () => {
    const now = new Date();
    let eventIndex = -1;
    let countdown = null;

    for (let i = 0; i < eventDays.length; i++) {
      const eventStart = new Date(eventDays[i]).setHours(0, 0, 0, 0);
      const eventEnd = new Date(eventDays[i]).setHours(23, 59, 59, 999);

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

    const lastEventEnd = new Date(eventDays[eventDays.length - 1]).setHours(23, 59, 59, 999);

    if (now > lastEventEnd) {
      return { eventIndex: -2, countdown: null };
    }

    return { eventIndex, countdown };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  if (timeLeft.eventIndex === -2) return null;

  return (
    <div className="countdown">
      {timeLeft.eventIndex === -1 ? (
        <div>
          <span>{timeLeft.countdown?.days}D</span>
          <span>{timeLeft.countdown?.hours}H</span>
          <span>{timeLeft.countdown?.minutes}M</span>
          <span>{timeLeft.countdown?.seconds}S</span>
        </div>
      ) : (
        <span>{eventMessages[timeLeft.eventIndex]}</span>
      )}
    </div>
  );
};

export default Countdown;
