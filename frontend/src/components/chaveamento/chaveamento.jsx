import React, { useState } from "react";
import "./chaveamento.css";

const rounds = ['Oitavas', 'Quartas', 'Semifinal', 'Final'];

const TournamentBracket = ({ initialTeams }) => {
  const [bracket, setBracket] = useState([initialTeams]);
  const [winners, setWinners] = useState([Array(initialTeams.length / 2).fill(null)]);

  const handleSelectWinner = (roundIndex, matchIndex, team) => {
    if (roundIndex !== winners.length - 1) return; // só permite alterar na rodada atual

    const updatedRound = [...winners[roundIndex]];
    updatedRound[matchIndex] = team;

    const updatedWinners = [...winners];
    updatedWinners[roundIndex] = updatedRound;
    setWinners(updatedWinners);

    // Quando todos os jogos da rodada atual tiverem vencedor, avança pra próxima
    if (updatedRound.every((w) => w !== null)) {
      const nextRoundTeams = [];
      for (let i = 0; i < updatedRound.length; i++) {
        nextRoundTeams.push(updatedRound[i]);
      }
      if (nextRoundTeams.length > 1) {
        setBracket([...bracket, nextRoundTeams]);
        setWinners([...updatedWinners, Array(nextRoundTeams.length / 2).fill(null)]);
      }
    }
  };

  const getMatchTeams = (roundIndex, matchIndex) => {
    const teams = bracket[roundIndex];
    return [teams[matchIndex * 2], teams[matchIndex * 2 + 1]];
  };

  return (
    <div className="bracket-container">
      {bracket.map((roundTeams, roundIndex) => (
        <div className="round" key={roundIndex}>
          <h3 className="round-title">{rounds[roundIndex]}</h3>
          {roundTeams.map((_, i) => {
            if (i % 2 !== 0) return null;
            const matchIndex = i / 2;
            const [teamA, teamB] = getMatchTeams(roundIndex, matchIndex);
            const winner = winners[roundIndex]?.[matchIndex];

            return (
              <div className="match" key={matchIndex}>
                <div
                  className={`team ${winner === teamA ? 'selected' : ''}`}
                  onClick={() => handleSelectWinner(roundIndex, matchIndex, teamA)}
                >
                  {teamA}
                </div>
                <div className="vs">vs</div>
                <div
                  className={`team ${winner === teamB ? 'selected' : ''}`}
                  onClick={() => handleSelectWinner(roundIndex, matchIndex, teamB)}
                >
                  {teamB}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default TournamentBracket;
