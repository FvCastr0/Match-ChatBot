import "./App.css";
import fihass from "./assets/fihass.png";
import match from "./assets/match.png";
import smatch from "./assets/smatch.png";

function App() {
  return (
    <main className="container">
      <div className="texts">
        <h1>O match perfeito entre fome e sabor começa agora</h1>
        <h2>
          <strong>Um clique</strong> te separa da melhor rede delivery de Juiz
          de Fora 🔥
        </h2>
        <h3>Escolha sua marca e peça sem medo 🚀</h3>
      </div>

      <div className="brands">
        <h1>Nossas marcas</h1>
        <div className="images">
          <img src={smatch} alt="Smatch Burger Logo" />
          <img src={match} alt="Smatch Burger Logo" />
          <img src={fihass} alt="Smatch Burger Logo" />
        </div>
      </div>
    </main>
  );
}

export default App;
