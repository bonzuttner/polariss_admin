import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LineLogin.css';

function LineLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('userId')) {
      navigate('/');
    }
  }, [navigate]);

  const lineLogin = () => {
    const redirectUri = encodeURIComponent(location.origin);
    window.location.href = `https://access.line.me/oauth2/v2.1/login?returnUri=%2Foauth2%2Fv2.1%2Fauthorize%2Fconsent%3Fresponse_type%3Dcode%26client_id%3D2007971928%26redirect_uri%3D${redirectUri}%26state%3DJqv_5Bdv5IKDahQqlqIeGtvXS6HKJMLMi_e3lmoLQAar_WbF_cRMkUXqyxMADZnqDojHezxqeyWQGsScdVxjsJK6C0HKVK4v-Q9Xnz0tpuaFcUVHiomhYph6GYfMt6Ojn7nQapbwMm1e0xLaRtfv44GqvfMeEq-5n8vV8hWWpaQ3hpmVwZ3ZgdB5fFR4kpNHusAqZ-fvIYc71zHbHcV1XTRW2Ig5952zUw_J_VsL7gc%26scope%3Dprofile%2520openid&loginChannelId=2007971928&loginState=u7tA4gvzKs2vkXFkeTzcKO#`;
  };

  return (
      <>
        {!localStorage.getItem('userId') && (
            <div className="line-login-container">
              <div className="line-login-card">
                <div className="line-logo">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.2001 3.59998H4.8001C4.0369 3.59998 3.30482 3.88437 2.75474 4.39445C2.20466 4.90453 1.88013 5.59996 1.88013 6.32498L1.8667 17.675C1.8667 18.4 2.19123 19.0954 2.74131 19.6055C3.29139 20.1156 4.02347 20.4 4.78667 20.4H19.1867C19.9499 20.4 20.682 20.1156 21.232 19.6055C21.7821 19.0954 22.1067 18.4 22.1067 17.675V6.32498C22.1067 5.59996 21.7821 4.90453 21.232 4.39445C20.682 3.88437 19.9499 3.59998 19.1867 3.59998H19.2001Z" fill="#00B900"/>
                    <path d="M8.3999 8.40002C8.82012 8.40002 9.1599 8.0598 9.1599 7.64002C9.1599 7.22024 8.82012 6.88002 8.3999 6.88002C7.97972 6.88002 7.6399 7.22024 7.6399 7.64002C7.6399 8.0598 7.97972 8.40002 8.3999 8.40002Z" fill="white"/>
                    <path d="M11.6399 15.6H7.5599C7.1399 15.6 6.8399 15.28 6.8399 14.88C6.8399 14.48 7.1599 14.16 7.5599 14.16H11.6399C12.0399 14.16 12.3599 14.48 12.3599 14.88C12.3599 15.28 12.0399 15.6 11.6399 15.6Z" fill="white"/>
                    <path d="M16.4399 15.6H14.5199C14.1199 15.6 13.7999 15.28 13.7999 14.88C13.7999 14.48 14.1199 14.16 14.5199 14.16H16.4399C16.8399 14.16 17.1599 14.48 17.1599 14.88C17.1599 15.28 16.8399 15.6 16.4399 15.6Z" fill="white"/>
                    <path d="M16.44 12.24H7.56C7.16 12.24 6.84 11.92 6.84 11.52C6.84 11.12 7.16 10.8 7.56 10.8H16.44C16.84 10.8 17.16 11.12 17.16 11.52C17.16 11.92 16.84 12.24 16.44 12.24Z" fill="white"/>
                    <path d="M16.44 8.88002H7.56C7.16 8.88002 6.84 8.56002 6.84 8.16002C6.84 7.76002 7.16 7.44002 7.56 7.44002H16.44C16.84 7.44002 17.16 7.76002 17.16 8.16002C17.16 8.56002 16.84 8.88002 16.44 8.88002Z" fill="white"/>
                  </svg>
                </div>

                <h2 className="line-login-title">ログイン</h2>
                <p className="line-login-subtitle">LINEアカウントで簡単ログイン</p>

                <button
                    type="button"
                    className="line-login-btn"
                    onClick={() => lineLogin()}
                >
              <span className="line-btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.2001 3.59998H4.8001C4.0369 3.59998 3.30482 3.88437 2.75474 4.39445C2.20466 4.90453 1.88013 5.59996 1.88013 6.32498L1.8667 17.675C1.8667 18.4 2.19123 19.0954 2.74131 19.6055C3.29139 20.1156 4.02347 20.4 4.78667 20.4H19.1867C19.9499 20.4 20.682 20.1156 21.232 19.6055C21.7821 19.0954 22.1067 18.4 22.1067 17.675V6.32498C22.1067 5.59996 21.7821 4.90453 21.232 4.39445C20.682 3.88437 19.9499 3.59998 19.1867 3.59998H19.2001Z" fill="white"/>
                  <path d="M8.3999 8.40002C8.82012 8.40002 9.1599 8.0598 9.1599 7.64002C9.1599 7.22024 8.82012 6.88002 8.3999 6.88002C7.97972 6.88002 7.6399 7.22024 7.6399 7.64002C7.6399 8.0598 7.97972 8.40002 8.3999 8.40002Z" fill="#00B900"/>
                  <path d="M11.6399 15.6H7.5599C7.1399 15.6 6.8399 15.28 6.8399 14.88C6.8399 14.48 7.1599 14.16 7.5599 14.16H11.6399C12.0399 14.16 12.3599 14.48 12.3599 14.88C12.3599 15.28 12.0399 15.6 11.6399 15.6Z" fill="#00B900"/>
                  <path d="M16.4399 15.6H14.5199C14.1199 15.6 13.7999 15.28 13.7999 14.88C13.7999 14.48 14.1199 14.16 14.5199 14.16H16.4399C16.8399 14.16 17.1599 14.48 17.1599 14.88C17.1599 15.28 16.8399 15.6 16.4399 15.6Z" fill="#00B900"/>
                  <path d="M16.44 12.24H7.56C7.16 12.24 6.84 11.92 6.84 11.52C6.84 11.12 7.16 10.8 7.56 10.8H16.44C16.84 10.8 17.16 11.12 17.16 11.52C17.16 11.92 16.84 12.24 16.44 12.24Z" fill="#00B900"/>
                  <path d="M16.44 8.88002H7.56C7.16 8.88002 6.84 8.56002 6.84 8.16002C6.84 7.76002 7.16 7.44002 7.56 7.44002H16.44C16.84 7.44002 17.16 7.76002 17.16 8.16002C17.16 8.56002 16.84 8.88002 16.44 8.88002Z" fill="#00B900"/>
                </svg>
              </span>
                  LINEでログイン
                </button>

                <div className="line-friend-section">
                  <p className="line-friend-text">LINEの友達追加をお願いします</p>
                  <div className="line-friend-buttons">
                    <a href="https://shorturl.at/iyAD0" className="line-friend-btn">
                      <img
                          src="https://scdn.line-apps.com/n/line_add_friends/btn/ja.png"
                          alt="友だち追加"
                          height="40"
                          border="0"
                      />
                    </a>

                    {/* QR Code Trigger */}
                    <div className="qr-trigger">
                      <button className="qr-trigger-btn">
                        QRコードを表示
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 10H14V14H10V10Z" fill="currentColor"/>
                          <path d="M4 4H8V8H4V4Z" fill="currentColor"/>
                          <path d="M8 8H10V10H8V8Z" fill="currentColor"/>
                          <path d="M8 14H10V16H8V14Z" fill="currentColor"/>
                          <path d="M14 8H16V10H14V8Z" fill="currentColor"/>
                          <path d="M14 14H16V16H14V14Z" fill="currentColor"/>
                          <path d="M16 4H20V8H16V4Z" fill="currentColor"/>
                          <path d="M4 16H8V20H4V16Z" fill="currentColor"/>
                          <path d="M16 16H20V20H16V16Z" fill="currentColor"/>
                        </svg>
                      </button>

                      {/* Floating QR Code */}
                      <div className="floating-qr-code">
                        <div className="qr-code-content">
                          <h3>友達追加用QRコード</h3>
                          <img src="https://qr-official.line.me/sid/L/812travn.png" alt="LINE QRコード" />
                          <p>QRコードをスキャンして友達追加</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        )}
      </>
  );
}

export default LineLogin;