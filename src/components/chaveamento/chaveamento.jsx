import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import "./chaveamento.css";

const TournamentBracket = ({ isMaster, admin }) => {
  const { tournamentName } = useParams();
  const [bracket, setBracket] = useState([]);
  const [winners, setWinners] = useState([]);
  const [corridaData, setCorridaData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (tournamentName.includes("Corrida")) {
          const docRef = doc(db, "inscricoes", tournamentName);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const rawData = docSnap.data();
            const sortedEntries = Object.entries(rawData).sort(([keyA], [keyB]) => {
              if (keyA < keyB) return -1;
              if (keyA > keyB) return 1;
              return 0;
            });
            const sortedData = Object.fromEntries(sortedEntries);
            setCorridaData(sortedData)
          }
        } else if (tournamentName.includes("Trilha")) {
          const docRef = doc(db, "inscricoes", tournamentName);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const rawData = docSnap.data();
            const sortedEntries = Object.entries(rawData).sort(([keyA], [keyB]) => {
              if (keyA < keyB) return -1;
              if (keyA > keyB) return 1;
              return 0;
            });
            const sortedData = Object.fromEntries(sortedEntries);
            setCorridaData(sortedData)
          }
        } else if (tournamentName.includes("Especialidade")) {
          const docRef = doc(db, "inscricoes", tournamentName);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const rawData = docSnap.data();
            const sortedEntries = Object.entries(rawData).sort(([keyA], [keyB]) => {
              if (keyA < keyB) return -1;
              if (keyA > keyB) return 1;
              return 0;
            });
            const sortedData = Object.fromEntries(sortedEntries);
            setCorridaData(sortedData)
          }
        }else {
          const inscricoesRef = doc(collection(db, "eventos"), tournamentName);
          const docSnap = await getDoc(inscricoesRef);

          if (!docSnap.exists()) return;

          const initialTeams = docSnap.data()?.inscritos || [];

          const campeonatoDoc = await getDoc(doc(db, "campeonato", tournamentName));
          const savedData = campeonatoDoc.exists() ? campeonatoDoc.data() : null;
          const savedRoundsObj = savedData?.rounds || {};

          const savedBracket = Object.keys(savedRoundsObj)
            .sort((a, b) => Number(a) - Number(b))
            .map((key) => savedRoundsObj[key]);

          const bracketToUse = savedBracket.length > 0 ? savedBracket : [initialTeams];
          const lastRound = bracketToUse[bracketToUse.length - 1] || [];
          const newWinners = [...bracketToUse.slice(1), Array(Math.floor(lastRound.length / 2)).fill(null)];

          setBracket(bracketToUse);
          setWinners(newWinners);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    if (tournamentName) fetchData();
  }, [tournamentName]);

  const saveBracketToFirestore = async (updatedBracket) => {
    try {
      const bracketObj = {};
      updatedBracket.forEach((round, index) => {
        bracketObj[index] = round;
      });

      await setDoc(doc(db, "campeonato", tournamentName), {
        rounds: bracketObj,
      });
    } catch (error) {
      console.error("Erro ao salvar o chaveamento:", error);
    }
  };

  const handleSelectWinner = async (roundIndex, matchIndex, team) => {
    if (!isMaster || !admin) return

    if (tournamentName.includes("corrida")) return; // Corrida não permite classificação

    const confirm = window.confirm(`Você deseja mesmo classificar ${team} para a próxima etapa?`);
    if (!confirm) return;

    const updatedRound = [...winners[roundIndex]];
    updatedRound[matchIndex] = team;

    const updatedWinners = [...winners];
    updatedWinners[roundIndex] = updatedRound;
    setWinners(updatedWinners);

    if (updatedRound.every((w) => w !== null)) {
      const nextRoundTeams = [...updatedRound];
      const updatedBracket = [...bracket, nextRoundTeams];

      setBracket(updatedBracket);

      const nextRoundSize = Math.floor(nextRoundTeams.length / 2);
      if (nextRoundSize > 0) {
        setWinners([...updatedWinners, Array(nextRoundSize).fill(null)]);
      }

      await saveBracketToFirestore(updatedBracket);
    } else {
      await saveBracketToFirestore(bracket);
    }
  };

  const getMatchTeams = (roundIndex, matchIndex) => {
    const teams = bracket[roundIndex];
    return [teams[matchIndex * 2], teams[matchIndex * 2 + 1]];
  };

  // Exibição para Trilha
  if ((tournamentName.includes("Trilha") || tournamentName.includes("Corrida") || tournamentName.includes("Especialidade"))) {
    let count = 0;
    return (
      <div className="bracket-container">
        <h1>{tournamentName}</h1>
        <div className="round">
          <div className="match">
            <div className="clube">
              <table className="table">
                <tbody>
                  {corridaData? Object.entries(corridaData).map(([clube, participantes]) => {
                    if (!Array.isArray(participantes) || participantes.length === 0) return null;
                    return (
                      <>
                        <thead>
                          <tr>
                            <th colSpan="2">{clube}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>#</td>
                            <td>Participante</td>
                          </tr>
                          {participantes.map((p, i) => (
                            <tr key={i}>
                              <td>{++count}</td>
                              <td>{p}</td>
                            </tr>
                          ))}
                        </tbody>
                      </>
                    );
                  }): "No momento não há membros inscritos na lista de nomes"}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Exibição padrão (torneio)
  return (
    <div className="bracket-container">
      <h1>{`Torneio de ${tournamentName}`}</h1>
      {bracket.map((roundTeams, roundIndex) => (
        <div className="round" key={roundIndex}>
          <h3 className="round-title">{`${roundIndex + 1}° Rodada`}</h3>
          {roundTeams.map((_, i) => {
            if (i % 2 !== 0) return null;
            const matchIndex = i / 2;
            const [teamA, teamB] = getMatchTeams(roundIndex, matchIndex);
            const winner = winners[roundIndex]?.[matchIndex];

            return (
              <div className="match" key={matchIndex}>
                <div
                  className={`team ${winner === teamA ? "selected" : ""}`}
                  onClick={() => handleSelectWinner(roundIndex, matchIndex, teamA)}
                >
                  {teamA}
                </div>
                {teamB && <div className="vs">vs</div>}
                {teamB && <div
                  className={`team ${winner === teamB ? "selected" : ""}`}
                  onClick={() => handleSelectWinner(roundIndex, matchIndex, teamB)}
                >
                  {teamB}
                </div>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default TournamentBracket;
