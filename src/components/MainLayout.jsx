import React, { Suspense, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'


function MainLayout(props) {
  return (
    <div className='main-layout'>
      <nav className='navbar navbar-expand-lg p-0'>
        <div className='container-fluid d-flex justify-content-between'>
          <a className='navbar-brand polaris' href='https://polarissprodapp.azurewebsites.net/'>
            <img className='logo-image'
             src='https://polarissprodapp.azurewebsites.net/img/logo/polariss_logo01.png'
             />
          </a>
          <ul className='navbar-nav mb-2 mb-lg-0 user-name-circle'>
            <li className='nav-item dropdown'>
              <a
                className='nav-link dropdown-toggle user-dropdown'
                href='#'
                role='button'
                data-bs-toggle='dropdown'
                aria-expanded='false'
              >
                <p id='user-name'>{localStorage.getItem("user-name")}</p>
              </a>
              <ul className='dropdown-menu border border-300 profile-menu'>
                <li class='nav-item py-2'>
                  <a class='nav-link px-3' href='/Setting'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='16px'
                      height='16px'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      stroke-width='2'
                      stroke-linecap='round'
                      stroke-linejoin='round'
                      class='feather feather-settings me-2 text-900'
                    >
                      <circle cx='12' cy='12' r='3'></circle>
                      <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z'></path>
                    </svg>
                    管理画面
                  </a>
                </li>
               
                <li className='logout-item'>
                  <a
                    className='log-out-btn btn'
                    href="javascript:document.getElementById('logoutForm').submit()"
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='16px'
                      height='16px'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      stroke-width='2'
                      stroke-linecap='round'
                      stroke-linejoin='round'
                      class='feather feather-log-out me-2'
                    >
                      <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'></path>
                      <polyline points='16 17 21 12 16 7'></polyline>
                      <line x1='21' y1='12' x2='9' y2='12'></line>
                    </svg>
                    ログオフ
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
      <div>{props.children}</div>
    </div>
  )
}

export default MainLayout
