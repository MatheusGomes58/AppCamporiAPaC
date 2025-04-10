import { app } from "../components/firebase/firebase";
import InscricaoForm from "../components/inscricao/inscricao";

function App({clube}) {
  return (
    <div>
      <InscricaoForm
        clube={clube}
      />
    </div>
  );
}

export default App;