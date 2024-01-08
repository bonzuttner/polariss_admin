import React, { Suspense, useEffect } from 'react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Api from '../../api/Api'
import { useNavigate, useParams } from 'react-router-dom'
function Device() {
  const location = useLocation()
  const { id } = useParams()
  const navigate = useNavigate()
  const type = location?.state
  const [device, setDevice] = useState({})
  const [user, setUser] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const getUserData = async () => {
    let userId =
      type === 'info'
        ? localStorage.getItem('userProfileId')
        : localStorage.getItem('userId')
    const responseUser = await Api.call(
      {},
      `users/${userId}`,
      'get',
      localStorage.getItem('userId')
    )

    if (responseUser.data) {
      let userData = responseUser.data.data
      let selectedDevice = id ? userData.devices.find((a) => a.imsi == id) : {}
      selectedDevice.userId = userId
      setUser(userData)
      setDevice(selectedDevice)
      setLoading(false)
    }
  }

  useEffect(() => {
    getUserData()
  }, [])

  const handleChange = (value, field) => {
    setDevice({ ...device, [field]: value })
  }

  const updateDevice = async () => {
    let path = `devices`
    // id ? `devices/${id}` : `devices`
    let request_type = id ? `put` : `post`
    let userId =
      type === 'info'
        ? localStorage.getItem('userProfileId')
        : localStorage.getItem('userId')
    device.userId = userId
    device.type = 'SKGM01'
    device.sortNo = 1
    if (!device.bikeId) {
      device.bikeId = user.bikes[0].id
    }
    const response = await Api.call(
      device,
      path,
      request_type,
      localStorage.getItem('userId')
    )
    if (response.data.code === 200) {
      setError("")
      window.location.reload(false)
    } else {
      let modal = document.getElementById('exampleModal')
      modal.classList.remove('show')
      let modalBack = document.getElementsByClassName('modal-backdrop')
      if (modalBack) {
        for (let i = 0; i < modalBack.length; i++) {
          modalBack[i]?.classList.remove('show')
        }
      }
      setError(response.data ? response.data.message : 'Error, Please try again!')
    }
  }

  return (
    <div className='edit-card'>
      {error && (
        <div class='alert alert-danger' role='alert'>
          {error}
        </div>
      )}

      <div className='card'>
        <div className='card-header p-3'>
          <h4>デバイスデータ</h4>
        </div>
        {!loading && (
          <form className='p-4'>
            <div class='mb-3 row'>
              <label for='userId' class='col-sm-4 col-form-label'>
                userID
              </label>
              <div class='col-sm-8'>
                <input
                  class='form-control'
                  id='userId'
                  value={device?.userId}
                  onChange={(event) =>
                    handleChange(event.target.value, 'userId')
                  }
                />
              </div>
            </div>
            <div class='mb-3 row'>
              <label for='name' class='col-sm-4 col-form-label'>
                Sim Number
              </label>
              <div class='col-sm-8'>
                <input
                  class='form-control'
                  id='name'
                  value={device?.name}
                  onChange={(event) => handleChange(event.target.value, 'name')}
                />
              </div>
            </div>
            {id && (
              <div class='mb-3 row'>
                <label for='sortNo' class='col-sm-4 col-form-label'>
                  imsi
                </label>
                <div class='col-sm-8'>
                  <input
                    class='form-control'
                    id='imsi'
                    disabled
                    value={device?.imsi}
                    onChange={(event) =>
                      handleChange(event.target.value, 'imsi')
                    }
                  />
                </div>
              </div>
            )}

            <div class='mb-3 row'>
              <label for='type' class='col-sm-4 col-form-label'>
                deviceType
              </label>
              <div class='col-sm-8'>
                <select
                  class='form-select'
                  aria-label='Default select example'
                  id='type'
                  onChange={(event) => handleChange(event.target.value, 'type')}
                  value={device?.type}
                  disabled
                >
                  <option value='SKB001'> SKB001 </option>
                  <option value='SKG001'> SKG001 </option>
                  <option value='SKGM01' selected>
                    SKGM01
                  </option>
                  <option value='SKGTL01'> SKGTL01 </option>
                </select>
              </div>
            </div>

            <div class='mb-3 row'>
              <label for='bikeId' class='col-sm-4 col-form-label'>
                bikeID
              </label>
              <div class='col-sm-8'>
                <select
                  class='form-select'
                  aria-label='Default select example'
                  id='bikeId'
                  onChange={(event) =>
                    handleChange(parseInt(event.target.value), 'bikeId')
                  }
                  value={device?.bikeId}
                >
                  {user?.bikes.map((bike) => {
                    return <option value={bike.id}>{bike.name}</option>
                  })}
                </select>
              </div>
            </div>

            <div class='mb-3 row'>
              <label for='stopFLG' class='col-sm-4 col-form-label'>
                stopFLG
              </label>
              <div class='col-sm-8'>
                <select
                  class='form-select'
                  aria-label='Default select example'
                  id='stopFLG'
                  value={device?.stopFLG}
                  disabled
                >
                  <option value='0' selected=''>
                    有効
                  </option>
                  <option value='9'> 停止 </option>
                </select>
              </div>
            </div>

            <div className='d-flex justify-content-between'>
              <button
                type='button'
                className='btn btn-outline-primary btn-sm px-3'
                onClick={() =>
                  navigate(
                    `${type === 'info' ? '/setting/user-info' : '/setting'}`
                  )
                }
              >
                戻る
              </button>
              <div className='d-flex justify-content-between'>
                {id && (
                  <button type='button' class='btn btn-danger btn-sm mx-3 px-2'>
                    削除
                  </button>
                )}

                <button
                  type='button'
                  class='btn btn-primary'
                  data-bs-toggle='modal'
                  data-bs-target='#exampleModal'
                >
                  更新
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
      <div
        class='modal fade'
        id='exampleModal'
        tabindex='-1'
        aria-labelledby='exampleModalLabel'
        aria-hidden='true'
      >
        <div class='modal-dialog'>
          <div class='modal-content'>
            <div class='modal-header'>
              <h1 class='modal-title fs-5' id='exampleModalLabel'>
                Modal Title
              </h1>
              <button
                type='button'
                class='btn-close'
                data-bs-dismiss='modal'
                aria-label='Close'
              ></button>
            </div>
            <div class='modal-body'>
              <p>更新を実施します</p>
            </div>
            <div class='modal-footer'>
              <button
                type='button'
                className='btn btn-outline-primary'
                data-bs-dismiss='modal'
              >
                戻る
              </button>
              <button
                type='button'
                className='btn btn-primary'
                onClick={() => updateDevice()}
              >
                更新
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Device
