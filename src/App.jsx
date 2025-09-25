import { useEffect, useState } from "react";
import cardsData from "./data/genesys_merged.json";
import "./App.css";

const typeOrder = [
  "effect",
  "ritual",
  "fusion",
  "synchro",
  "xyz",
  "spell",
  "trap",
];

// normalize possible frameType strings into one of the typeOrder values
function normalizeType(frameType) {
  if (!frameType) return "unknown";
  const t = String(frameType).toLowerCase();
  if (t.includes("effect")) return "effect";
  if (t.includes("ritual")) return "ritual";
  if (t.includes("fusion")) return "fusion";
  if (t.includes("synchro")) return "synchro";
  if (t.includes("xyz")) return "xyz";
  if (t.includes("spell")) return "spell";
  if (t.includes("trap")) return "trap";
  // fallback (put unknown types after the known order)
  return "unknown";
}

// parse points filter: returns {min, max} or null
function parsePointsFilter(input) {
  const s = String(input || "").trim();
  if (!s) return null;

  // range "a-b" or "a - b"
  if (s.includes("-")) {
    const parts = s.split("-").map((p) => parseInt(p.trim(), 10));
    if (parts.length === 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
      return { min: Math.min(parts[0], parts[1]), max: Math.max(parts[0], parts[1]) };
    }
    return null;
  }

  // single number
  const v = parseInt(s, 10);
  if (Number.isFinite(v)) return { min: v, max: v };
  return null;
}

function App() {
  const [cards, setCards] = useState([]);
  const [sortDesc, setSortDesc] = useState(true); // true => Highest -> Lowest by points
  const [selectedArchetype, setSelectedArchetype] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [search, setSearch] = useState("");
  const [pointsFilter, setPointsFilter] = useState("");

  // Get unique archetypes for dropdown
  const _cards = cardsData.data
    .map(card => ({
      ...card,
      // flatten genesys_points so the rest of your code works the same
      genesys_points: card.misc_info?.[0]?.genesys_points ?? 0,
    }))
    .filter(card => card.genesys_points > 0);

    // Start from normalized dataset
    let filtered = [..._cards];

      const archetypes = Array.from(
        new Set(filtered.map((card) => card.archetype).filter(Boolean))
      ).sort();

  useEffect(() => {
  if (selectedArchetype) {
   // eslint-disable-next-line react-hooks/exhaustive-deps
   filtered = filtered.filter(
     (card) => card.archetype === selectedArchetype
   );
 }
    // 1) type filter (use normalized type)
    if (selectedType && selectedType !== "all") {
      filtered = filtered.filter((c) => normalizeType(c.frameType) === selectedType);
    }

    // 2) name search (case-insensitive)
    if (search.trim() !== "") {
      const s = search.toLowerCase();
      filtered = filtered.filter((c) => (c.name || "").toLowerCase().includes(s));
    }

    // 3) points filter (exact or range; accepts 10-1 or 1-10)
    const range = parsePointsFilter(pointsFilter);
    if (range) {
      filtered = filtered.filter((c) => {
        const p = Number(c.misc_info[0].genesys_points);
        if (!Number.isFinite(p)) return false;
        return p >= range.min && p <= range.max;
      });
    }

    // 4) SORT — primary: points (desc/asc), secondary: typeOrder
    const sorted = filtered.sort((a, b) => {
      const pa = Number(a.misc_info[0].genesys_points) || 0;
      const pb = Number(b.misc_info[0].genesys_points) || 0;

      if (pa !== pb) {
        return sortDesc ? pb - pa : pa - pb; // points primary
      }

      // same points -> order by normalized type according to typeOrder
      const na = normalizeType(a.frameType);
      const nb = normalizeType(b.frameType);
      let ia = typeOrder.indexOf(na);
      let ib = typeOrder.indexOf(nb);

      // put unknown types after known ones
      if (ia === -1) ia = typeOrder.length;
      if (ib === -1) ib = typeOrder.length;

      return ia - ib;
    });

    setCards(sorted);
  }, [sortDesc, selectedType, selectedArchetype, search, pointsFilter]);

  const toggleSort = () => setSortDesc((s) => !s);

  return (
    <div className="container">
      <h1>Yu-Gi-Oh! Genesys Format Helper</h1>
      <h4> Last Update: 24 Sept, 2025</h4>
      <h5> New features coming soon...</h5>
      <div className="controls">
        {/* Search */}
        <input
          type="text"
          placeholder="Search cards..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px", marginRight: "10px", borderRadius: "6px" }}
        />

        {/* Points range (single or range like 100 or 10-50 or 50-10) */}
        <input
          type="text"
          placeholder="Points (e.g. 100 or 10-50)"
          value={pointsFilter}
          onChange={(e) => setPointsFilter(e.target.value)}
          style={{ padding: "8px", marginRight: "10px", borderRadius: "6px" }}
        />

         {/* Archetype dropdown */}
          <select
            value={selectedArchetype}
            onChange={(e) => setSelectedArchetype(e.target.value)}
            style={{ padding: "8px", marginRight: "10px", borderRadius: "6px" , width: '125px'}}
          >
            <option value="">All Archetypes</option>
            {archetypes.map((arch) => (
              <option key={arch} value={arch}>
                {arch}
              </option>
            ))}
          </select>

        {/* Type selector - options come from typeOrder (normalized values) */}
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

        {/* Sort button - keeps your button style */}
        <button onClick={toggleSort}>
          Sort {sortDesc ? "Highest → Lowest" : "Lowest → Highest"}
        </button>
      </div>

      <div className="grid">
        {cards.map((card) => {
          const CardContent = (
            <>
              <img
                src={
                  card.card_images?.[0]?.image_url ||
                  "https://via.placeholder.com/150x210?text=No+Image"
                }
                alt={card.name}
              />
              <p
                className="name"
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  margin: "8px 0",
                  color: "#0077cc",
                  textDecoration: "none",
                }}
              >
                {card.name}
              </p>
              <p className="points">{card.misc_info[0].genesys_points} pts</p>
            </>
          );

          return card.ygoprodeck_url ? (
            <a
              key={card.id || card.name}
              href={card.ygoprodeck_url}
              target="_blank"
              rel="noopener noreferrer"
              className="card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {CardContent}
            </a>
          ) : (
            <div key={card.id || card.name} className="card">
              {CardContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
