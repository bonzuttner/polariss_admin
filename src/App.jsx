import React, { useEffect } from 'react'
import { BrowserRouter as Router, useNavigate, Route, Routes } from 'react-router-dom'
import './App.css'
import MainLayout from './components/MainLayout'
import Settings from './components/settings/Settings'
import Profile from './components/profile/Profile'
import Bike from './components/bike/Bike'
import Device from './components/device/Device'
import List from './components/list/List'

function App() {
  useEffect(() => {}, [])

  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route exact path='/setting/:id' element={<Settings />} />
          <Route exact path='/setting' element={<Settings />} />
          <Route exact path='/setting/user-info' element={<Settings type={'info'}/>} />
          <Route exact path='/setting/profile' element={<Profile />} />
          <Route exact path='/setting/bike/:id' element={<Bike />} />
          <Route exact path='/setting/bike' element={<Bike />} />
          <Route exact path='/setting/device/:id' element={<Device />} />
          <Route exact path='/setting/device' element={<Device />} />
          <Route exact path='/setting/list' element={<List />} />
        </Routes>
      </MainLayout>
    </Router>
  )
}

export default App
