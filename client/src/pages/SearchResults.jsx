import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchResults() {
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    const playlists = [
        { id: 1, name: "Lofi Beats", description: "Relaxing music" },
        { id: 2, name: "Workout Hits", description: "Gym energy" },
        { id: 3, name: "Chill Nights", description: "Late vibes" }
    ];

    const filtered = playlists.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div style={{ padding: "20px", color: "white", background: "#121212", minHeight: "100vh" }}>
            <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>
                Search Playlists
            </h1>

            <input
                type="text"
                placeholder="Search playlists..."
                onChange={(e) => setQuery(e.target.value)}
                style={{
                    padding: "10px",
                    width: "100%",
                    marginBottom: "20px",
                    borderRadius: "5px"
                }}
            />

            {filtered.map(item => (
                <div
                    key={item.id}
                    onClick={() => navigate(`/playlist/${item.id}`)}
                    style={{
                        padding: "15px",
                        background: "#181818",
                        marginBottom: "10px",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}
                >
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                </div>
            ))}
        </div>
    );

}

export default SearchResults;