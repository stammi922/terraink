import { AppProviders } from "@/core/AppProviders";
import AppHeader from "@/shared/ui/AppHeader";
import FooterNote from "@/shared/ui/FooterNote";
import StepIndicator from "@/shared/ui/StepIndicator";
import SettingsPanel from "@/features/poster/ui/SettingsPanel";
import PreviewPanel from "@/features/poster/ui/PreviewPanel";
import InfoPanel from "@/shared/ui/InfoPanel";
import AnnouncementModal from "@/features/updates/ui/AnnouncementModal";

/**
 * Thin inner shell that lives inside the PosterProvider
 * so hooks have access to context.
 */
function AppShell() {
  return (
    <div className="app-shell">
      <AppHeader />
      <StepIndicator />
      <main className="app-grid">
        <SettingsPanel />
        <PreviewPanel />
        <InfoPanel />
      </main>
      <FooterNote />
      <AnnouncementModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppShell />
    </AppProviders>
  );
}
