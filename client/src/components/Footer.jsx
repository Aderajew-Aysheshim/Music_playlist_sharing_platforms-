function Footer() {
  return (
    <footer className="app-footer">
      <span>MusiConnect</span>
      <span>Playlist sharing, collaboration, comments, likes, and public discovery.</span>
      <span>&copy; {new Date().getFullYear()}</span>
    </footer>
  );
}

export default Footer;
