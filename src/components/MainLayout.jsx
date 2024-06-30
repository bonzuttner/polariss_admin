import React, { Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MainLayout(props) {
  
  return (
    <div className="main-layout">
      <header id="page-header">
        <nav>
          <div class="left">
            <a href="/" class="brand">
              <img
                className="logo-image"
                src="https://polarissdevapp.azurewebsites.net/img/logo/polariss_logo01.png"
                alt=""
              />
            </a>
          </div>
          {}
          <div class="right">
            {localStorage.getItem('userId') ? (
              <div class="primary-nav has-mega-menu">
                <ul class="navigation">
                  <li class="active has-child">
                    <a href="#nav-homepages">
                      {localStorage.getItem('user-name') || 'Name'}
                    </a>
                    <div class="wrapper">
                      <div id="nav-homepages" class="nav-wrapper">
                        <ul>
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
              <div class="secondary-nav">
                <a
                  href="/login"
                  data-modal-external-file="modal_sign_in.php"
                  data-target="modal-sign-in"
                >
                  Sign In
                </a>
                <a
                  href="#"
                  class="promoted"
                  data-modal-external-file="modal_register.php"
                  data-target="modal-register"
                >
                  Register
                </a>
              </div>
            )}
            <div class="nav-btn">
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
