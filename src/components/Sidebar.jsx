 function Sidebar() {
  return (
    <div className="w-64 h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-bold mb-6 text-green-500">CollabPlay</h1>

      <ul className="space-y-4">
        <li className="hover:text-green-400 cursor-pointer">Home</li>
        <li className="hover:text-green-400 cursor-pointer">Explore</li>
        <li className="hover:text-green-400 cursor-pointer">My Library</li>
        <li className="hover:text-green-400 cursor-pointer">Song Browser</li>
      </ul>
    </div>
  );
}
export default Sidebar;