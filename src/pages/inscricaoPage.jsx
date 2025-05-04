import { app } from "../components/firebase/firebase";
import InscricaoForm from "../components/inscricao/inscricaoTorneio";

function App({ clube, admin, ismaster }) {
  return (
    <div>
      <InscricaoForm
        clube={clube}
        admin={admin}
        ismaster={ismaster}
      />
    </div>
  );
}

export default App;