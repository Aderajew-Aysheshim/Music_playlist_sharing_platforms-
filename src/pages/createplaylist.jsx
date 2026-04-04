import Sidebar from "../components/Sidebar";
import { createPlaylist } from "../api";
import { useRef, useState } from "react";

 function CreatePlaylist() {
   const [name, setName] = useState("");
const [description, setDescription] = useState("");
const [isPublic, setIsPublic] = useState(true);
const HandleSubmit = async () => {
  const data = {
    name,
    description,
    is_public: isPublic,
  };

  await createPlaylist(data);
  alert("Playlist created!");
};
const [coverFile, setCoverFile] = useState(null);
  const fileInputRef = useRef();

  const handleCoverClick = () => {
    fileInputRef.current.click(); // open file dialog
  };

  const handleFileChange = (e) => {
    setCoverFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("is_public", isPublic);
    if (coverFile) formData.append("cover", coverFile);

    try {
      const res = await fetch(`${BASE_URL}/playlists/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: formData, // send multipart/form-data
      });
      const data = await res.json();
      console.log(data);
      alert("Playlist created!");
    } catch (err) {
      console.error(err);
      alert("Failed to create playlist");
    }
  };
  return (
     <div>
     
    <div className="flex bg-black text-white min-h-screen">
      <Sidebar />

      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-6">Create New Playlist</h1>

        <div className="bg-gray-900 p-6 rounded-lg max-w-2xl">
          
          <div>
      
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept="image/*"
      />
        <div
        className="w-32 h-32 bg-gray-700 mt-2 flex items-center justify-center cursor-pointer"
        onClick={handleCoverClick}
      >
        {coverFile ? coverFile.name : "Upload"}
      </div>

      <button onClick={HandleSubmit}></button>
    </div>

         
          <div className="mb-4">
            <label>Playlist Name</label>
            <input
              className="w-full p-2 mt-2 bg-black border border-gray-600"
              placeholder="Enter name" onChange={(e) => setName(e.target.value)} />
          </div>

         
          <div className="mb-4">
            <label>Description</label>
            <textarea
             className="w-full p-2 mt-2 bg-black border border-gray-600"
            onChange={(e) => setDescription(e.target.value)} 
            />
          </div>

          
          <div className="mb-4">
            <label>
              <input type="checkbox" onChange={(e) => setIsPublic(e.target.checked)} /> Public Playlist
            </label>
          </div>

          <button className="bg-green-500 px-6 py-2 rounded" onClick={handleSubmit}>
            Create Playlist
          </button>
        </div>
      </div>
     
    </div>
    </div>
  );
}
export default CreatePlaylist;