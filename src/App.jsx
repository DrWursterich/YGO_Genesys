import { useEffect, useState } from "react";
import cardsData from "./data/genesys_merged.json";
import "./App.css";

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
  const [sortDesc, setSortDesc] = useState(true);
  const [search, setSearch] = useState(""); // search state
  const [selectedType, setSelectedType] = useState("all"); // optional type filter

  useEffect(() => {
    let filtered = [...cardsData];

    // Filter by search text
    if (search.trim() !== "") {
      filtered = filtered.filter((card) =>
        card.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by type if selected
    if (selectedType !== "all") {
      filtered = filtered.filter(
        (card) => card.frameType.toLowerCase() === selectedType
      );
    }

    // Sort by type order first, then points
    const sorted = filtered.sort((a, b) => {
      const typeA = typeOrder.indexOf(a.frameType.toLowerCase());
      const typeB = typeOrder.indexOf(b.frameType.toLowerCase());

      if (typeA !== typeB) return typeA - typeB;

      return sortDesc
        ? Number(b.genesys_points) - Number(a.genesys_points)
        : Number(a.genesys_points) - Number(b.genesys_points);
    });

    setCards(sorted);
  }, [sortDesc, search, selectedType]);

  const toggleSort = () => setSortDesc(!sortDesc);

  return (
    <div className="container">
      <h1>Yu-Gi-Oh! Genesys Format</h1>

      <div className="controls">
        <input
          type="text"
          placeholder="Search cards..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px", marginRight: "10px", borderRadius: "6px" }}
        />

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{ padding: "8px", marginRight: "10px", borderRadius: "6px" }}
        >
          <option value="all">All Types</option>
          {typeOrder.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>

        <button onClick={toggleSort}>
          Sort {sortDesc ? "Ascending" : "Descending"}
        </button>
      </div>

      <div className="grid">
        {cards.map((card) => (
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
