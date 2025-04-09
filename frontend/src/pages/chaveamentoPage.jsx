import TournamentBracket from "../components/chaveamento/chaveamento";

const teams = [
  "Time A", "Time B", "Time C", "Time D",
  "Time E", "Time F", "Time G", "Time H",
  "Time I", "Time J", "Time K", "Time L",
  "Time M", "Time N", "Time O", "Time P"
];

function App() {
  return (
    <div>
      <h1>🏆 Torneio de Futebol</h1>
      <TournamentBracket initialTeams={teams} />
    </div>
  );
}


export default App;