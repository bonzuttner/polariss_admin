import React, { Suspense, useEffect } from 'react';
import { useState } from 'react';
import './LineLogin.css';
import LineButtonImage from '../../assets/btn_login_base.png';
function LineLogin() {
  
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {}, []);

  const lineLogin = () => {
    const redirectUri = encodeURIComponent(location.origin);
    window.location.href = `https://access.line.me/oauth2/v2.1/login?returnUri=%2Foauth2%2Fv2.1%2Fauthorize%2Fconsent%3Fresponse_type%3Dcode%26client_id%3D1661093729%26redirect_uri%3D${redirectUri}%26state%3DJqv_5Bdv5IKDahQqlqIeGtvXS6HKJMLMi_e3lmoLQAar_WbF_cRMkUXqyxMADZnqDojHezxqeyWQGsScdVxjsJK6C0HKVK4v-Q9Xnz0tpuaFcUVHiomhYph6GYfMt6Ojn7nQapbwMm1e0xLaRtfv44GqvfMeEq-5n8vV8hWWpaQ3hpmVwZ3ZgdB5fFR4kpNHusAqZ-fvIYc71zHbHcV1XTRW2Ig5952zUw_J_VsL7gc%26scope%3Dprofile%2520openid&loginChannelId=1661093729&loginState=u7tA4gvzKs2vkXFkeTzcKO#`;
  };

  return (
    <div className="line-login">
      <h2>ログイン</h2>
      <button type="button" className="line-btn" onClick={() => lineLogin()}>
        <img src={LineButtonImage} />
      </button>
      <p>LINEの友達追加をお願いします</p>
      <div className="images">
        <a href="https://shorturl.at/iyAD0">
          <img
            src="https://scdn.line-apps.com/n/line_add_friends/btn/ja.png"
            alt="友だち追加"
            height="36"
            border="0"
          />
        </a>
        <img src="https://qr-official.line.me/sid/L/812travn.png" />
      </div>
    </div>
  );
}

export default LineLogin;
