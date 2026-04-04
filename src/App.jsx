import { BrowserRouter, Routes, Route } from "react-router-dom";
import PlaylistPage from "./pages/PlaylistPage";
import CreatePlaylist from "./pages/CreatePlaylist";

 function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PlaylistPage />} />
        <Route path="/create" element={<CreatePlaylist />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;