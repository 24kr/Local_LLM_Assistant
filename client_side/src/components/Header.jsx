export default function Header() {
  return (
    <header className="header">
      <div className="logo">
        <img
          className="logo-icon"
          src="/icons/app-logo.svg"
          alt="LoLA application logo"
          width="36"
          height="36"
        />
        <div>
          <h1>LoLA</h1>
          <p className="header-tagline">One-Time Access | Lifetime Privacy</p>
        </div>
      </div>
    </header>
  );
}
