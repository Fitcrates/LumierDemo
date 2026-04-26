export default function Footer() {
  return (
    <footer style={{
      width: "100%",
      padding: "1rem 0 1rem",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: "1rem",
      fontSize: "0.6rem",
      letterSpacing: "0.1em",
      opacity: 0.5,
      textTransform: "uppercase",
      backgroundColor: "var(--ink)",
      color: "var(--text-on-dark)"
    }}>
      <div>Demo Website</div>
      <div>Designed & Built by Arkadiusz Wawrzyniak | <a href="https://appcrates.pl" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", color: "inherit" }}>appcrates.pl</a></div>
    </footer>
  );
}
