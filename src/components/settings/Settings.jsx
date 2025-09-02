import React, { Suspense, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Setting.css';
import Api from '../../api/Api';
import Dropdown from 'react-bootstrap/Dropdown';
function Settings(props) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [list, setList] = useState([]);
  const [parent, setParent] = useState('');
  const [role, setRole] = useState(localStorage.getItem('userProfileRole'));
  const [error, setError] = useState('');
  let userId = id || localStorage.getItem('userId');
  let componentType = props.type;
  let userProfileId =
    componentType === 'info' ? localStorage.getItem('userProfileId') : userId;

  let logedInRole = localStorage.getItem('role');
  const [userDetail, setUserDetail] = useState({});
  const [selectedTab, setSelectedTab] = useState('profile');
  const getDetails = async () => {
    const response = await Api.call(
      {},
      `users/${userProfileId}`,
      'get',
      userId
    );
    if (response.data) {
      let userData = response.data.data;
      const userItem = document.getElementById('user-name');

      localStorage.setItem('userId', userId);

      if (userId === userProfileId) {
        if (userData.name1) localStorage.setItem('user-name', userData.name1);
        localStorage.setItem('role', userData.role);
        //localStorage.setItem('userProfileId', userId)
        if (userItem) {
          userItem.innerHTML = userData.name1;
        }
      } else {
        //localStorage.setItem('userProfileId', userProfileId)
      }

      setUserDetail(response.data.data);
      setParent(response.data.data.parent);
    }
  };
  const getUserList = async () => {
    let path = 'users/tree';
    const response = await Api.call({}, path, 'get', userId);
    if (response.data) {
      let list = response.data.data;
      if (logedInRole === 'master') {
        list?.splice(0, 0, {
          admins2: [],
          email: 'Master',
          id: '27661ba2-bc20-49a8-a9eb-8089c611d1dc',
          name1: 'Master',
          name2: 'Master',
          nickname: 'Master',
          role: 'master',
        });
      } else if (logedInRole === 'admin2') {
        list = list[0].admins2;
      }

      setList(list);
    }
  };
  useEffect(() => {
    if (id || localStorage.getItem('userId')) {
      getDetails();
    }
    if (logedInRole !== 'user' && componentType === 'info') {
      getUserList();
    }
  }, []);

  const tabClicked = (type) => {
    setSelectedTab(type);
  };

  const setParentData = (item) => {
    const secondLevelElement = document.getElementById(item.id);
    setParent(item);
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'profile':
        return (
          <div className="card">
            <div className="card-header">
              <button
                className="btn btn-primary btn-sm my-2"
                onClick={() =>
                  navigate('/setting/profile', { state: componentType })
                }
              >
                編集
              </button>
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item ">
                <p>苗字</p>
                <p>{userDetail.name1}</p>
              </li>
              <li className="list-group-item ">
                <p>名前</p>
                <p>{userDetail.name2}</p>
              </li>
              <li className="list-group-item ">
                <p>ニックネーム</p>
                <p>{userDetail.nickname}</p>
              </li>
              <li className="list-group-item ">
                <p>E-Mail</p>
                <p>{userDetail.email}</p>
              </li>
              <li className="list-group-item ">
                <p>ユーザー種別</p>
                <p>{userDetail.role}</p>
              </li>
            </ul>
          </div>
        );
        break;
      case 'bikes':
        return (
          <div className="card">
            <div className="card-header">
              <button
                className="btn btn-primary btn-sm my-2"
                onClick={() =>
                  navigate('/setting/bike', { state: componentType })
                }
              >
                新規登録
              </button>
            </div>
            <ul className="list-group list-group-flush">
              {userDetail?.bikes?.map((bike) => {
                return (
                  <li className="detail-list">
                    <p className="w-50">{bike.name}</p>
                    <div className="right-side">
                      <p>{bike.type}</p>
                      <p>{bike.sortNo}</p>
                      <button
                        className="btn btn-primary btn-sm my-2"
                        onClick={() =>
                          navigate(`/setting/bike/${bike.id}`, {
                            state: componentType,
                          })
                        }
                      >
                        編集
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
        break;
      case 'devices':
        return (
          <div className="card">
            <div className="card-header">
              <button
                className="btn btn-primary btn-sm my-2"
                onClick={() =>
                  navigate('/setting/device', { state: componentType })
                }
              >
                新規登録
              </button>
            </div>
            <ul className="list-group list-group-flush">
              {userDetail.devices.map((device) => {
                return (
                  <li className="detail-list">
                    <p className="w-50">{device.name}</p>
                    <div className="right-side">
                      <p>
                        {
                          userDetail.bikes.find((a) => a.id === device.bikeId)
                            ?.name
                        }
                      </p>
                      <p>{device.type}</p>
                      <p>{device.sortNo}</p>
                      <button
                        className="btn btn-primary btn-sm my-2"
                        onClick={() =>
                          navigate(`/setting/device/${device.imsi}`, {
                            state: componentType,
                          })
                        }
                      >
                        編集
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
        break;
      case 'assign-users':
        return (
          <div className="card">
            {/* <div className='card-header'>Assign User</div> */}
            <form className="p-4">
              <div className="mb-3 row">
                <label for="type" className="col-sm-4 col-form-label">
                  Role
                </label>
                <div className="col-sm-8">
                  <select
                    className="form-select"
                    aria-label="Default select example"
                    id="type"
                    onChange={(event) => setRole(event.target.value)}
                  >
                    {logedInRole === 'master' && (
                      <option selected={role === 'admin1'} value="admin1">
                        Admin1
                      </option>
                    )}
                    {(logedInRole === 'master' || logedInRole === 'admin1') && (
                      <option selected={role === 'admin2'} value="admin2">
                        Admin2
                      </option>
                    )}

                    <option selected={role === 'user'} value="user">
                      User
                    </option>
                  </select>
                </div>
              </div>

              <div className="mb-3 row">
                <label for="type" className="col-sm-4 col-form-label">
                  Parent
                </label>
                <div className="col-sm-8">
                  <Dropdown>
                    <Dropdown.Toggle
                      id="dropdown-basic"
                      className="btn btn-outline-primary w-100"
                    >
                      {parent ? parent?.nickname : 'Select parent'}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      {list.map((item) => {
                        let returnedItem = [];
                        if (item.admins2?.length > 0) {
                          returnedItem.push(
                            <>
                              <Dropdown.Item
                                className={`${
                                  item.id === parent?.id ? 'selected' : ''
                                }`}
                                value={item.id}
                                onClick={() => setParentData(item)}
                              >
                                <div className="first-level d-flex justify-content-between align-items-center">
                                  <p className="m-0">{item.nickname}</p>
                                  {/* <span>{'>'}</span> */}
                                </div>
                              </Dropdown.Item>
                              <div id={item.id} className="second-level hide">
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
                                  );
                                })}
                              </div>
                            </>
                          );
                        } else {
                          returnedItem.push(
                            <Dropdown.Item
                              value={item.id}
                              onClick={() => setParentData(item)}
                            >
                              {item.nickname}
                            </Dropdown.Item>
                          );
                        }

                        return returnedItem;
                      })}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>

              <div className="d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm px-3"
                  onClick={() => navigate('/setting')}
                >
                  戻る
                </button>
                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModal"
                  >
                    更新
                  </button>
                </div>
              </div>
            </form>
          </div>
        );
    }
  };

  const updateUserRoleParent = async () => {
    let body = {
      role: role,
    };
    if (parent) {
      body.parentId = parent.id;
    }
    const response = await Api.call(
      body,
      `users/${localStorage.getItem('userProfileId')}/role`,
      'put',
      localStorage.getItem('userId')
    );
    if (response?.data?.code === 200) {
      localStorage.setItem('userProfileRole', response?.data.data.role);
      window.location.reload(false);
    } else {
      const modal = document.getElementById('exampleModal');
      if (modal) {
        modal.classList.remove('show');
      }
      let modalBack = document.getElementsByClassName('modal-backdrop');
      if (modalBack) {
        for (let i = 0; i < modalBack.length; i++) {
          modalBack[i]?.classList.remove('show');
        }
      }
      setError(response?.data?.message);
    }
  };

  return (
    <div className="setting-page">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <div className="alert">
        <p>{`・LoginUserID: ${localStorage.getItem('userId')}`}</p>
        <p>{`・UserProfile.userID: ${userProfileId}`}</p>
        <p>{`・action: Index`}</p>
      </div>
      <div className="tabs-section">
        <ul className="nav nav-underline">
          <li className="nav-item">
            <a
              className={`nav-link ${
                selectedTab === 'profile' ? 'active' : ''
              }`}
              aria-current="page"
              href="#"
              value="profile"
              onClick={() => tabClicked('profile')}
            >
              ユーザー情報
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`nav-link ${selectedTab === 'bikes' ? 'active' : ''}`}
              href="#"
              onClick={() => tabClicked('bikes')}
            >
              顧客名
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`nav-link ${
                selectedTab === 'devices' ? 'active' : ''
              }`}
              href="#"
              onClick={() => tabClicked('devices')}
            >
              デバイス情報
            </a>
          </li>
          {logedInRole !== 'user' && componentType === 'info' && (
            <li className="nav-item">
              <a
                className={`nav-link ${
                  selectedTab === 'assign-users' ? 'active' : ''
                }`}
                href="#"
                onClick={() => tabClicked('assign-users')}
              >
                Assign Users
              </a>
            </li>
          )}
        </ul>
        <div className="tab-content">{renderTabContent()}</div>
      </div>
      {localStorage.getItem('role') !== 'user' && (
        <button
          className="btn btn-primary py-2 px-4 mt-4 list-btn"
          onClick={() => navigate('/setting/list')}
        >
          管理画面
        </button>
      )}

      <div
        className="modal fade"
        id="exampleModal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">
                ユーザーデータ
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p>更新を実施します</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-primary"
                data-bs-dismiss="modal"
              >
                戻る
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => updateUserRoleParent()}
              >
                更新
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
