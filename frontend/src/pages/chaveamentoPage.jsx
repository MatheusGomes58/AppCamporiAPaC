import TournamentBracket from "../components/chaveamento/chaveamento";


function App({ isMaster, admin }) {
  return (
    <div>
      <TournamentBracket
        isMaster={isMaster}
        admin={admin}
      />
    </div>
  );
}


export default App;