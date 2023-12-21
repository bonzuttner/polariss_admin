import React, { Suspense, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './Setting.css'
import Api from '../../api/Api'
import Dropdown from 'react-bootstrap/Dropdown'
function Settings(props) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [list, setList] = useState([])
  const [parent, setParent] = useState('')
  const [role, setRole] = useState(localStorage.getItem('userProfileRole'))
  const [error, setError] = useState('')
  let userId = id || localStorage.getItem('userId')
  let componentType = props.type
  let userProfileId =
    componentType === 'info' ? localStorage.getItem('userProfileId') : userId
  const [userDetail, setUserDetail] = useState({})
  const [selectedTab, setSelectedTab] = useState('profile')
  const getDetails = async () => {
    const response = await Api.call({}, `users/${userProfileId}`, 'get', userId)
    if (response.data) {
      let userData = response.data.data
      const userItem = document.getElementById('user-name')

      localStorage.setItem('userId', userId)

      if (userId === userProfileId) {
        localStorage.setItem('user-name', userData.name1)
        localStorage.setItem('role', userData.role)
        //localStorage.setItem('userProfileId', userId)
        if (userItem) {
          userItem.innerHTML = userData.name1
        }
      } else {
        //localStorage.setItem('userProfileId', userProfileId)
      }

      setUserDetail(response.data.data)
      setParent(response.data.data.parent)
    }
  }
  const getUserList = async () => {
    let path = 'users/tree'
    const response = await Api.call({}, path, 'get', userId)
    if (response.data) {
      let list = response.data.data
      list?.splice(0, 0, {
        admins2: [],
        email: 'Master',
        id: 'e19a238b-0a33-4b43-a440-22bb486657a2',
        name1: 'Master',
        name2: 'Master',
        nickname: 'Master',
        role: 'master',
      })
      setList(list)
    }
  }
  useEffect(() => {
    if (id || localStorage.getItem('userId')) {
      getDetails()
    }
    if (localStorage.getItem('role') === 'master' && componentType === 'info') {
      getUserList()
    }
  }, [])

  const tabClicked = (type) => {
    setSelectedTab(type)
  }

  const setParentData = (item) => {
    const secondLevelElement = document.getElementById(item.id)
    setParent(item)
  }

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'profile':
        return (
          <div className='card'>
            <div className='card-header'>
              <button
                className='btn btn-primary btn-sm my-2'
                onClick={() =>
                  navigate('/setting/profile', { state: componentType })
                }
              >
                編集
              </button>
            </div>
            <ul className='list-group list-group-flush'>
              <li className='list-group-item '>
                <p>苗字</p>
                <p>{userDetail.name1}</p>
              </li>
              <li className='list-group-item '>
                <p>名前</p>
                <p>{userDetail.name2}</p>
              </li>
              <li className='list-group-item '>
                <p>ニックネーム</p>
                <p>{userDetail.nickname}</p>
              </li>
              <li className='list-group-item '>
                <p>E-Mail</p>
                <p>{userDetail.email}</p>
              </li>
              <li className='list-group-item '>
                <p>ユーザー種別</p>
                <p>{userDetail.role}</p>
              </li>
            </ul>
          </div>
        )
        break
      case 'bikes':
        return (
          <div className='card'>
            <div className='card-header'>
              <button
                className='btn btn-primary btn-sm my-2'
                onClick={() => navigate('/setting/bike')}
              >
                新規登録
              </button>
            </div>
            <ul className='list-group list-group-flush'>
              {userDetail.bikes.map((bike) => {
                return (
                  <li className='detail-list'>
                    <p className='w-50'>{bike.name}</p>
                    <div className='right-side'>
                      <p>{bike.type}</p>
                      <p>{bike.sortNo}</p>
                      <button
                        className='btn btn-primary btn-sm my-2'
                        onClick={() =>
                          navigate(`/setting/bike/${bike.id}`, { state: componentType })
                        }
                      >
                        編集
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )
        break
      case 'devices':
        return (
          <div className='card'>
            <div className='card-header'>
              <button
                className='btn btn-primary btn-sm my-2'
                onClick={() => navigate('/setting/device')}
              >
                新規登録
              </button>
            </div>
            <ul className='list-group list-group-flush'>
              {userDetail.devices.map((device) => {
                return (
                  <li className='detail-list'>
                    <p className='w-50'>{device.name}</p>
                    <div className='right-side'>
                      <p>
                        {
                          userDetail.bikes.find((a) => a.id === device.bikeId)
                            ?.name
                        }
                      </p>
                      <p>{device.type}</p>
                      <p>{device.sortNo}</p>
                      <button
                        className='btn btn-primary btn-sm my-2'
                        onClick={() =>
                          navigate(`/setting/device/${device.imsi}`, { state: componentType })
                        }
                      >
                        編集
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )
        break
      case 'assign-users':
        return (
          <div className='card'>
            {/* <div className='card-header'>Assign User</div> */}
            <form className='p-4'>
              <div class='mb-3 row'>
                <label for='type' class='col-sm-4 col-form-label'>
                  Role
                </label>
                <div class='col-sm-8'>
                  <select
                    class='form-select'
                    aria-label='Default select example'
                    id='type'
                    onChange={(event) => setRole(event.target.value)}
                  >
                    <option selected={role === 'admin1'} value='admin1'>
                      Admin1
                    </option>
                    <option selected={role === 'admin2'} value='admin2'>
                      Admin2
                    </option>
                    <option selected={role === 'user'} value='user'>
                      User
                    </option>
                  </select>
                </div>
              </div>

              <div class='mb-3 row'>
                <label for='type' class='col-sm-4 col-form-label'>
                  Parent
                </label>
                <div class='col-sm-8'>
                  <Dropdown>
                    <Dropdown.Toggle
                      id='dropdown-basic'
                      className='btn btn-outline-primary w-100'
                    >
                      {parent ? parent?.nickname : 'Select parent'}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      {list.map((item) => {
                        let returnedItem = []
                        if (item.admins2.length > 0) {
                          returnedItem.push(
                            <>
                              <Dropdown.Item
                                className={`${
                                  item.id === parent?.id ? 'selected' : ''
                                }`}
                                value={item.id}
                                onClick={() => setParentData(item)}
                              >
                                <div className='first-level d-flex justify-content-between align-items-center'>
                                  <p className='m-0'>{item.nickname}</p>
                                  {/* <span>{'>'}</span> */}
                                </div>
                              </Dropdown.Item>
                              <div id={item.id} className='second-level hide'>
                                {item.admins2.map((admin2) => {
                                  return (
                                    <Dropdown.Item
                                      className={`${
                                        admin2.id === parent?.id
                                          ? 'selected'
                                          : ''
                                      }`}
                                      value={admin2.id}
                                      onClick={() => setParentData(admin2)}
                                    >
                                      {admin2.nickname}
                                    </Dropdown.Item>
                                  )
                                })}
                              </div>
                            </>
                          )
                        } else {
                          returnedItem.push(
                            <Dropdown.Item
                              value={item.id}
                              onClick={() => setParentData(item)}
                            >
                              {item.nickname}
                            </Dropdown.Item>
                          )
                        }

                        return returnedItem
                      })}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>

              <div className='d-flex justify-content-between'>
                <button
                  type='button'
                  className='btn btn-outline-primary btn-sm px-3'
                  onClick={() => navigate('/setting')}
                >
                  戻る
                </button>
                <div className='d-flex justify-content-between'>
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
          </div>
        )
    }
  }

  const updateUserRoleParent = async () => {
    let body = {
      role: role,
    }
    if (parent) {
      body.parentId = parent.id
    }
    const response = await Api.call(
      body,
      `users/${localStorage.getItem('userProfileId')}/role`,
      'put',
      localStorage.getItem('userId')
    )
    if (response?.data?.code === 200) {
      localStorage.setItem('userProfileRole', response?.data.data.role)
      window.location.reload(false)
    } else {
      const modal = document.getElementById('exampleModal')
      if (modal) {
        //modal.classList.remove("show");
      }
      setError(response?.data?.message)
    }
  }

  return (
    <div className='setting-page'>
      <div className='alert'>
        <p>{`・LoginUserID: ${localStorage.getItem('userId')}`}</p>
        <p>{`・UserProfile.userID: ${userProfileId}`}</p>
        <p>{`・action: Index`}</p>
      </div>
      <div className='tabs-section'>
        <ul className='nav nav-underline'>
          <li className='nav-item'>
            <a
              className={`nav-link ${
                selectedTab === 'profile' ? 'active' : ''
              }`}
              aria-current='page'
              href='#'
              value='profile'
              onClick={() => tabClicked('profile')}
            >
              ユーザー情報
            </a>
          </li>
          <li className='nav-item'>
            <a
              className={`nav-link ${selectedTab === 'bikes' ? 'active' : ''}`}
              href='#'
              onClick={() => tabClicked('bikes')}
            >
              バイク情報
            </a>
          </li>
          <li className='nav-item'>
            <a
              className={`nav-link ${
                selectedTab === 'devices' ? 'active' : ''
              }`}
              href='#'
              onClick={() => tabClicked('devices')}
            >
              デバイス情報
            </a>
          </li>
          {localStorage.getItem('role') === 'master' &&
            componentType === 'info' && (
              <li className='nav-item'>
                <a
                  className={`nav-link ${
                    selectedTab === 'assign-users' ? 'active' : ''
                  }`}
                  href='#'
                  onClick={() => tabClicked('assign-users')}
                >
                  Assign Users
                </a>
              </li>
            )}
        </ul>
        <div className='tab-content'>{renderTabContent()}</div>
      </div>
      {localStorage.getItem('role') !== 'user' && (
        <button
          className='btn btn-primary py-2 px-4 mt-4 list-btn'
          onClick={() => navigate('/setting/list')}
        >
          管理画面
        </button>
      )}

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
                ユーザーデータ
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
              {error && (
                <div class='alert alert-danger' role='alert'>
                  {error}
                </div>
              )}
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
                onClick={() => updateUserRoleParent()}
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

export default Settings
