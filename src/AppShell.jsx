import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

/**
 * AppShell: layout base das páginas internas.
 * Usa as classes do layout.css (app / main / content).
 */
export default function AppShell({ user, children }) {
  return (
    <div className="app">
      <aside className="sidebar">
        <Sidebar />
      </aside>
      <main className="main">
        <header className="topbar">
          <Topbar user={user} />
        </header>
        <section className="content">{children}</section>
      </main>
    </div>
  );
}
