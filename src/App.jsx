import React, { useEffect } from 'react'
import { BrowserRouter as Router, useNavigate, Route, Routes } from 'react-router-dom'

import './App.css'
import MainLayout from './components/MainLayout'
import Settings from './components/settings/Settings'
import Profile from './components/profile/Profile'

function App() {
  useEffect(() => {}, [])

  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route exact path='/setting/profile' element={<Profile />} />
          <Route exact path='/setting' element={<Settings />} />
        </Routes>
      </MainLayout>
    </Router>
  )
}

export default App
