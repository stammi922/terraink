import InstallPrompt from "@/features/install/ui/InstallPrompt";

export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="brand-row">
        <div className="brand-copy">
          <p className="app-kicker">TerraInk · Cartographic Poster Engine</p>
          <h1 className="hero-headline">
            <span className="hero-headline__top">WHERE DO YOU WANT YOUR</span>
            <span className="hero-headline__word">map?</span>
          </h1>
        </div>
        <img
          className="brand-logo"
          src="/assets/logo.png"
          alt="TerraInk logo"
        />
      </div>
      <InstallPrompt />
    </header>
  );
}
