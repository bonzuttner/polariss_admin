import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaQrcode } from 'react-icons/fa';

function LineLogin() {
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('userId')) {
      navigate('/');
    }
  }, [navigate]);

  const lineLogin = () => {
    const lineLoginUrl = import.meta.env.VITE_LINE_LOGIN_URL;
    if (!lineLoginUrl) {
      console.error('VITE_LINE_LOGIN_URL is not configured');
      toast.error('ログイン機能が利用できません。しばらくしてからもう一度お試しください。');
      return;
    }
    setRedirecting(true);
    const redirectUri = encodeURIComponent(location.origin);
    window.location.href = lineLoginUrl.replace('{redirectUri}', redirectUri);
  };

  const botBasicId = import.meta.env.VITE_BOT_BASIC_ID;
  const lineFriendUrl = `https://line.me/R/ti/p/@${botBasicId}`;
  const lineQrUrl = `https://qr-official.line.me/sid/L/${botBasicId}.png`;

  if (localStorage.getItem('userId')) return null;

  return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[radial-gradient(circle_at_top,rgb(var(--token-primary)/0.08),transparent_55%)] px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-10 text-center shadow-xl">
          <div className="mb-5 flex justify-center">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.2001 3.59998H4.8001C4.0369 3.59998 3.30482 3.88437 2.75474 4.39445C2.20466 4.90453 1.88013 5.59996 1.88013 6.32498L1.8667 17.675C1.8667 18.4 2.19123 19.0954 2.74131 19.6055C3.29139 20.1156 4.02347 20.4 4.78667 20.4H19.1867C19.9499 20.4 20.682 20.1156 21.232 19.6055C21.7821 19.0954 22.1067 18.4 22.1067 17.675V6.32498C22.1067 5.59996 21.7821 4.90453 21.232 4.39445C20.682 3.88437 19.9499 3.59998 19.1867 3.59998H19.2001Z" fill="#00B900"/>
              <path d="M8.3999 8.40002C8.82012 8.40002 9.1599 8.0598 9.1599 7.64002C9.1599 7.22024 8.82012 6.88002 8.3999 6.88002C7.97972 6.88002 7.6399 7.22024 7.6399 7.64002C7.6399 8.0598 7.97972 8.40002 8.3999 8.40002Z" fill="white"/>
              <path d="M11.6399 15.6H7.5599C7.1399 15.6 6.8399 15.28 6.8399 14.88C6.8399 14.48 7.1599 14.16 7.5599 14.16H11.6399C12.0399 14.16 12.3599 14.48 12.3599 14.88C12.3599 15.28 12.0399 15.6 11.6399 15.6Z" fill="white"/>
              <path d="M16.4399 15.6H14.5199C14.1199 15.6 13.7999 15.28 13.7999 14.88C13.7999 14.48 14.1199 14.16 14.5199 14.16H16.4399C16.8399 14.16 17.1599 14.48 17.1599 14.88C17.1599 15.28 16.8399 15.6 16.4399 15.6Z" fill="white"/>
              <path d="M16.44 12.24H7.56C7.16 12.24 6.84 11.92 6.84 11.52C6.84 11.12 7.16 10.8 7.56 10.8H16.44C16.84 10.8 17.16 11.12 17.16 11.52C17.16 11.92 16.84 12.24 16.44 12.24Z" fill="white"/>
              <path d="M16.44 8.88002H7.56C7.16 8.88002 6.84 8.56002 6.84 8.16002C6.84 7.76002 7.16 7.44002 7.56 7.44002H16.44C16.84 7.44002 17.16 7.76002 17.16 8.16002C17.16 8.56002 16.84 8.88002 16.44 8.88002Z" fill="white"/>
            </svg>
          </div>

          <h1 className="mb-1 text-2xl font-bold text-text">ログイン</h1>
          <p className="mb-8 text-sm text-text-muted">LINEアカウントで簡単ログイン</p>

          <button
              type="button"
              onClick={() => lineLogin()}
              disabled={redirecting}
              className="mb-8 flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#00B900] px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#00B900]/20 transition hover:scale-[1.02] hover:bg-[#00a500] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
          >
            {redirecting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.2001 3.59998H4.8001C4.0369 3.59998 3.30482 3.88437 2.75474 4.39445C2.20466 4.90453 1.88013 5.59996 1.88013 6.32498L1.8667 17.675C1.8667 18.4 2.19123 19.0954 2.74131 19.6055C3.29139 20.1156 4.02347 20.4 4.78667 20.4H19.1867C19.9499 20.4 20.682 20.1156 21.232 19.6055C21.7821 19.0954 22.1067 18.4 22.1067 17.675V6.32498C22.1067 5.59996 21.7821 4.90453 21.232 4.39445C20.682 3.88437 19.9499 3.59998 19.1867 3.59998H19.2001Z" fill="white"/>
                  <path d="M8.3999 8.40002C8.82012 8.40002 9.1599 8.0598 9.1599 7.64002C9.1599 7.22024 8.82012 6.88002 8.3999 6.88002C7.97972 6.88002 7.6399 7.22024 7.6399 7.64002C7.6399 8.0598 7.97972 8.40002 8.3999 8.40002Z" fill="#00B900"/>
                  <path d="M11.6399 15.6H7.5599C7.1399 15.6 6.8399 15.28 6.8399 14.88C6.8399 14.48 7.1599 14.16 7.5599 14.16H11.6399C12.0399 14.16 12.3599 14.48 12.3599 14.88C12.3599 15.28 12.0399 15.6 11.6399 15.6Z" fill="#00B900"/>
                  <path d="M16.4399 15.6H14.5199C14.1199 15.6 13.7999 15.28 13.7999 14.88C13.7999 14.48 14.1199 14.16 14.5199 14.16H16.4399C16.8399 14.16 17.1599 14.48 17.1599 14.88C17.1599 15.28 16.8399 15.6 16.4399 15.6Z" fill="#00B900"/>
                  <path d="M16.44 12.24H7.56C7.16 12.24 6.84 11.92 6.84 11.52C6.84 11.12 7.16 10.8 7.56 10.8H16.44C16.84 10.8 17.16 11.12 17.16 11.52C17.16 11.92 16.84 12.24 16.44 12.24Z" fill="#00B900"/>
                  <path d="M16.44 8.88002H7.56C7.16 8.88002 6.84 8.56002 6.84 8.16002C6.84 7.76002 7.16 7.44002 7.56 7.44002H16.44C16.84 7.44002 17.16 7.76002 17.16 8.16002C17.16 8.56002 16.84 8.88002 16.44 8.88002Z" fill="#00B900"/>
                </svg>
            )}
            {redirecting ? 'リダイレクト中...' : 'LINEでログイン'}
          </button>

          <div className="border-t border-border pt-7">
            <p className="mb-4 text-sm text-text-muted">LINEの友達追加をお願いします</p>
            <div className="flex flex-col items-center gap-4">
              <a href={lineFriendUrl} className="opacity-90 transition hover:opacity-100">
                <img
                    src="https://scdn.line-apps.com/n/line_add_friends/btn/ja.png"
                    alt="友だち追加"
                    height="40"
                />
              </a>

              <div className="group relative inline-block">
                <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg bg-surface-hover px-4 py-2.5 text-sm text-text-muted transition hover:bg-border-strong/40 hover:text-text"
                >
                  QRコードを表示
                  <FaQrcode size={14} />
                </button>

                <div className="pointer-events-none absolute bottom-full left-1/2 z-20 w-56 -translate-x-1/2 translate-y-[-8px] opacity-0 transition group-hover:pointer-events-auto group-hover:translate-y-[-16px] group-hover:opacity-100">
                  <div className="relative rounded-xl border border-border bg-surface p-5 text-center shadow-2xl">
                    <h3 className="mb-3 text-sm font-semibold text-text">友達追加用QRコード</h3>
                    <img src={lineQrUrl} alt="LINE QRコード" className="mx-auto mb-2 h-[150px] w-[150px]" />
                    <p className="text-xs text-text-muted">QRコードをスキャンして友達追加</p>
                    <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-8 border-t-8 border-x-transparent border-t-surface" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default LineLogin;
