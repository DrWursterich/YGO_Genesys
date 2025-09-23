import { useEffect, useState } from "react";
import cardsData from "./data/genesys_merged.json";
import "./App.css";

// Move typeOrder outside the component to avoid exhaustive-deps warning
const typeOrder = [
  "normal",
  "effect",
  "ritual",
  "fusion",
  "synchro",
  "xyz",
  "spell",
  "trap",
];

function App() {
  const [cards, setCards] = useState([]);
  const [sortDesc, setSortDesc] = useState(true); // default descending
  const [filterType, setFilterType] = useState(""); // empty = show all


  useEffect(() => {
    const sorted = [...cardsData].sort((a, b) => {
      // First: points (primary)
      const pointDiff = sortDesc
        ? Number(b.genesys_points) - Number(a.genesys_points)
        : Number(a.genesys_points) - Number(b.genesys_points);
      if (pointDiff !== 0) return pointDiff;

      // Second: type order (within same points)
      const typeA = typeOrder.indexOf(a.frameType);
      const typeB = typeOrder.indexOf(b.frameType);
      return typeA - typeB;
    });

    setCards(sorted);
  }, [sortDesc]);

  const toggleSort = () => setSortDesc(!sortDesc);

  return (
    <div className="container">
      <h1>Yu-Gi-Oh! Genesys Format</h1>
      <div className="controls">
        <div className="controls">
        <button onClick={toggleSort}>
          Sort {sortDesc ? "Lowest → Highest" : "Highest → Lowest"}
        </button>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ marginLeft: "12px", padding: "6px", borderRadius: "4px" }}
        >
          <option value="">All Types</option>
          {typeOrder.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>
      </div>
      <div className="grid">
        {cards.filter((card) =>
          filterType ? card.frameType === filterType : true
          ).map((card) => (
          <div className="card" key={card.id || card.name}>
            <img
              src={
                card.card_images?.[0]?.image_url ||
                "https://via.placeholder.com/150x210?text=No+Image"
              }
              alt={card.name}
            />
            <p className="name">{card.name}</p>
            <p className="points">{card.genesys_points} pts</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
