import React, { Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MainLayout(props) {
  return (
    <div className="main-layout">
      <header id="page-header">
        <nav>
          <div className="left">
            <a href="/" className="brand">
              <img
                className="logo-image"
                src="https://polarissdevapp.azurewebsites.net/img/logo/polariss_logo01.png"
                alt=""
              />
            </a>
          </div>
          {}
          <div className="right">
            {localStorage.getItem('userId') ? (
              <div className="primary-nav has-mega-menu">
                <ul className="navigation">
                  <li className="active has-child">
                    <a>{localStorage.getItem('user-name') || 'Name'}</a>
                    <div className="wrapper">
                      <div id="nav-homepages" className="nav-wrapper">
                        <ul>Name
                          <li>
                            <a href="/setting">管理画面</a>
                          </li>
                          <li onClick={() => localStorage.removeItem('userId')}>
                            <a href="/login">ログオフ</a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="secondary-nav">
                <a
                  href="/login"
                  data-modal-external-file="modal_sign_in.php"
                  data-target="modal-sign-in"
                >
                  Sign In
                </a>
                <a
                  href="#"
                  className="promoted"
                  data-modal-external-file="modal_register.php"
                  data-target="modal-register"
                >
                  Register
                </a>
              </div>
            )}
            <div className="nav-btn">
              <i></i>
              <i></i>
              <i></i>
            </div>
          </div>
        </nav>
      </header>
      <div>{props.children}</div>
    </div>
  );
}

export default MainLayout;
