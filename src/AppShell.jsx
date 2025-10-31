import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

/**
 * Mantém as MESMAS classes que você já tinha:
 * app / sidebar / main / topbar / content
 * Só adicionamos o estado do drawer (menuOpen) + backdrop + botão hambúrguer.
 */
export default function AppShell({ user, children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((v) => !v);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="app">
      <div
        className={`sidebar-backdrop ${menuOpen ? "show" : ""}`}
        onClick={closeMenu}
        aria-hidden={!menuOpen}
      />

      <aside className={`sidebar ${menuOpen ? "is-open" : ""}`}>
        <Sidebar onItemClick={closeMenu} />
      </aside>

      <main className="main">
        <header className="topbar">
          <button
            className="hamburger"
            aria-label="Abrir menu"
            onClick={toggleMenu}
          >
            <span />
          </button>

          <Topbar user={user} onMenuToggle={toggleMenu} />
        </header>

        <section className="content">{children}</section>
      </main>
    </div>
  );
}
