import { DemoConsole } from "./pages/DemoConsole";
import { DesktopPet } from "./pages/DesktopPet";
import { EvalPage } from "./pages/EvalPage";
import { MemoriesPage } from "./pages/MemoriesPage";
import { MobileApp } from "./pages/MobileApp";

export function App() {
  const path = window.location.pathname;
  if (path.startsWith("/demo")) return <DemoConsole />;
  if (path.startsWith("/memories")) return <MemoriesPage />;
  if (path.startsWith("/eval")) return <EvalPage />;
  if (path.startsWith("/desktop")) return <DesktopPet />;
  return <MobileApp />;
}
