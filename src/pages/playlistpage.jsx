import Sidebar from "../components/Sidebar";
import PlayerBar from "../components/PlayerBar";
import { useEffect, useState } from "react";
import { getPlaylists } from "../api";
import { Link } from "react-router-dom";
import { getPlaylistDetail } from "../api";
export default function PlaylistPage() {
  
   const [playlists, setPlaylists] = useState([]);

 useEffect(() => {
  getPlaylists().then(setPlaylists);
}, []);
const [currentPlaylist, setCurrentPlaylist] = useState(null);
const [currentSong, setCurrentSong] = useState(null);
const selectPlaylist = async (id) => {
  const data = await getPlaylistDetail(id);
  setCurrentPlaylist(data); // store playlist with all songs
};
  return (
    <div>
  <div>
     

      {playlists.map((p) => (
        <div key={p.id}>
          <button onClick={() => selectPlaylist(p.id)}>
      {p.name}
    </button>
        </div>
      ))}
    </div>

    <div className="flex bg-gradient-to-r from-black via-gray-900 to-green-900 text-white min-h-screen">
      
      <Sidebar />
     
      <div className="flex-1 p-6">
       
        <div className="flex items-center gap-6 mb-6">
          <div className="w-40 h-40 bg-gray-700 rounded"></div>
         <Link to="/create">
        <button className="bg-green-500 px-4 py-2 rounded mt-4">Create New Playlist</button>
      </Link>
      
          <div>
             <h2 className="text-sm text-green-400">Public Playlist</h2>
            <h1 className="text-4xl font-bold">
              {currentPlaylist?.name || "Select a Playlist"}
            </h1>
          </div>
        </div>

        
        <div className="flex gap-4 mb-4">
         <button
            className="bg-green-500 px-5 py-2 rounded-full"
            onClick={() => {
              if (currentPlaylist?.entries?.length > 0) {
                setCurrentSong(currentPlaylist.entries[0].song);
              }
            }}
           
          >
            ▶ Play
          </button>
          <button
            className="border px-4 py-2 rounded"
           
          >
            ❤️ Like
          </button>
        </div>

        
        <table className="w-full text-left">
          <thead className="text-gray-400">
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Album</th>
              <th>Time</th>
            </tr>
          </thead>

          <tbody>
           
  {currentPlaylist?.entries?.map((entry, index) => (
              <tr
                key={index}
                onClick={() => setCurrentSong(entry.song)}
                className="cursor-pointer hover:bg-gray-800"
              >
                <td>{entry.order || index + 1}</td>
                <td>{entry.song.title}</td>
                <td>{entry.song.album}</td>
                <td>{entry.song.duration}</td>
              </tr>
            ))}

</tbody>
          
        </table>
      </div>

      <PlayerBar song={currentSong}/>
      
    </div>
    </div>
  );
}