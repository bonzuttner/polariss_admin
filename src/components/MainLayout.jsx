import React, { Suspense, useEffect } from 'react'

function MainLayout(props) {
  console.log('props ', props)
  useEffect(() => {}, [])

  return (
    <div className='main-layout'>
      <nav class='navbar navbar-expand-lg bg-body-tertiary p-0'>
        <div class='container-fluid d-flex justify-content-between'>
          <a class='navbar-brand' href='#'>
            <img className='logo-image' src='/src/assets/polariss_logo01.png' />
          </a>
          <ul class='navbar-nav mb-2 mb-lg-0'>
            <li class='nav-item dropdown'>
              <a
                class='nav-link dropdown-toggle'
                href='#'
                role='button'
                data-bs-toggle='dropdown'
                aria-expanded='false'
              >
                Dropdown
              </a>
              <ul class='dropdown-menu'>
                <li>
                  <a class='dropdown-item' href='#'>
                    Action
                  </a>
                </li>
                <li>
                  <a class='dropdown-item' href='#'>
                    Another action
                  </a>
                </li>
                <li>
                  <hr class='dropdown-divider' />
                </li>
                <li>
                  <a class='dropdown-item' href='#'>
                    Something else here
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
