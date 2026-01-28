import gsap from "gsap";
import { useEffect, useRef } from "react";
import "./App.css";

import fihass from "./assets/fihass.png";
import match from "./assets/match.png";
import smatch from "./assets/smatch.png";

function App() {
  const path = window.location.pathname;

  const containerRef = useRef(null);
  const textsRef = useRef(null);
  const brandsRef = useRef(null);

  useEffect(() => {
    if (path === "/feedback") {
      window.location.href =
        "https://falae.experienciab2s.com/84cda132-1a1d-4776-8be0-d6921d77b3a4";
    }
  }, [path]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0,
        duration: 1,
        ease: "power2.out"
      });

      gsap.from(".texts > *", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.2
      });

      gsap.from(".images > div", {
        y: 60,
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        ease: "back.out(1.4)",
        stagger: 0.15,
        delay: 0.4
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleMouseEnter = el => {
    gsap.to(el, {
      scale: 1.05,
      y: -8,
      boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleMouseLeave = el => {
    gsap.to(el, {
      scale: 1,
      y: 0,
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      duration: 0.3,
      ease: "power2.out"
    });
  };

  return (
    <main className="container" ref={containerRef}>
      <div className="texts" ref={textsRef}>
        <h1>O match perfeito entre fome e sabor começa agora</h1>
        <h2>
          <strong>Um clique</strong> te separa da melhor rede delivery de Juiz
          de Fora 🔥
        </h2>
        <h3>Escolha sua marca e peça sem medo 🚀</h3>
      </div>

      <div className="brands" ref={brandsRef}>
        <h1>Nossas marcas</h1>

        <div className="images">
          {[
            {
              img: smatch,
              link: "https://smatchburger.com.br/smatchburger/smatchburger?dd=menu",
              alt: "Smatch Burger Logo"
            },
            {
              img: match,
              link: "https://matchpizza.app.br/matchpizza/matchpizza?dd=from-brand&dd=menu",
              alt: "Match Pizza Logo"
            },
            {
              img: fihass,
              link: "https://deliverydireto.com.br/fihass/fihass?dd=from-brand&dd=menu",
              alt: "Fihass Logo"
            }
          ].map((brand, i) => (
            <div
              key={i}
              onClick={() => (window.location.href = brand.link)}
              onMouseEnter={e => handleMouseEnter(e.currentTarget)}
              onMouseLeave={e => handleMouseLeave(e.currentTarget)}
            >
              <img src={brand.img} alt={brand.alt} />
              <button>Acessar cardápio</button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default App;
