import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { DropdownMenu } from './common/DropdownMenu';

function MainLayout({ children }) {
  const { theme, toggleTheme } = useTheme();
  const isLoggedIn = Boolean(localStorage.getItem('userId'));
  const userName = localStorage.getItem('user-name') || 'Name';

  const handleLogout = () => {
    localStorage.removeItem('userId');
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
        <a href="/" className="flex items-center">
          <img src="/polaris_01.png" alt="Polaris" className="h-8 w-auto sm:h-9" />
        </a>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition hover:bg-surface-hover hover:text-text"
          >
            {theme === 'dark' ? <FaSun size={16} /> : <FaMoon size={16} />}
          </button>

          {isLoggedIn && (
            <DropdownMenu
              trigger={
                <button
                  type="button"
                  id="user-name"
                  className="flex h-9 max-w-[9rem] items-center justify-center truncate rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg transition hover:bg-primary-hover"
                >
                  {userName}
                </button>
              }
            >
              <DropdownMenu.Item asChild>
                <a href="/setting" className="no-underline">
                  管理画面
                </a>
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item onSelect={handleLogout} className="text-danger">
                ログオフ
              </DropdownMenu.Item>
            </DropdownMenu>
          )}
        </div>
      </header>

      <div className="flex-1">{children}</div>
    </div>
  );
}

export default MainLayout;
