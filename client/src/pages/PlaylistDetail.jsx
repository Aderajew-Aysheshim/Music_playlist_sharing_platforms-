import { useState, useEffect } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("playlists/")
      .then(res => {
        setPlaylists(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading playlists...</p>;

  return (
    <div>
      {playlists.length === 0 ? (
        <p>No playlists found.</p>
      ) : (
        playlists.map(pl => (
          <div key={pl.id}>
            <Link to={`/playlist/${pl.id}`}>
              <h3>{pl.name}</h3>
            </Link>
            <p>{pl.description}</p>
          </div>
        ))
      )}
    </div>
  );
}