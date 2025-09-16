import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './Settings.module.css';
import Api from '../../api/Api';
import Dropdown from 'react-bootstrap/Dropdown';

function Settings(props) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [list, setList] = useState([]);
  const [parent, setParent] = useState('');
  const [role, setRole] = useState(localStorage.getItem('userProfileRole'));
  const [error, setError] = useState('');
  const [isTabChanging, setIsTabChanging] = useState(false);
  const [activeTabContent, setActiveTabContent] = useState(null);

  let userId = id || localStorage.getItem('userId');
  let componentType = props.type;
  let userProfileId =
      componentType === 'info' ? localStorage.getItem('userProfileId') : userId;

  let logedInRole = localStorage.getItem('role');
  const [userDetail, setUserDetail] = useState({});
  const [selectedTab, setSelectedTab] = useState('profile');

  // Add tab transition effect
  const handleTabClick = (tab) => {
    setIsTabChanging(true);
    setTimeout(() => {
      setSelectedTab(tab);
      setIsTabChanging(false);
    }, 300);
  };

  // Add smooth content transition
  useEffect(() => {
    setActiveTabContent(renderTabContent());
  }, [selectedTab, userDetail]);

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
        if (userItem) {
          userItem.innerHTML = userData.name1;
        }
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

  const setParentData = (item) => {
    setParent(item);
  };
  const renderNormalDeviceList = () => (
      <div className={`${styles.card} ${styles.cardReveal}`}>
        <div className={styles.cardHeader}>
          <div className={styles.horizontalContainerStart}>

            <button
                className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm} my-2`}
                onClick={() =>
                    navigate('/setting/device', {state: componentType})
                }
            >
              新規登録
            </button>

          </div>
        </div>
        <ul className={styles.listGroup}>
          {userDetail.devices?.length > 0 ? (
              userDetail.devices.map((device) => (
                  <li key={device.imsi} className={styles.detailListItem}>
                    <p className={styles.itemName}>{device.name}</p>
                    <div className={styles.itemActions}>
                      <p>
                        {
                          userDetail.bikes?.find((a) => a.id === device.bikeId)
                              ?.name
                        }
                      </p>
                      <p>{device.type}</p>
                      <p>{device.sortNo}</p>
                      <button
                          className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
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
              ))
          ) : (
              <li className={styles.listGroupItem}>
                <p className={styles.emptyState}>デバイス情報がありません</p>
              </li>
          )}
        </ul>
      </div>
  );
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'profile':
        return (
            <div className={`${styles.card} ${styles.cardReveal}`}>
              <div className={styles.cardHeader}>
                <div className={styles.horizontalContainerStart}>

                  <button
                      className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm} `}
                      onClick={() =>
                          navigate('/setting/profile', {state: componentType})
                      }
                  >
                    編集
                  </button>
                </div>

              </div>
              <ul className={styles.listGroup}>
                <li className={styles.listGroupItem}>
                  <p className={styles.label}>苗字</p>
                  <p className={styles.value}>{userDetail.name1 || '-'}</p>
                </li>
                <li className={styles.listGroupItem}>
                  <p className={styles.label}>名前</p>
                  <p className={styles.value}>{userDetail.name2 || '-'}</p>
                </li>
                <li className={styles.listGroupItem}>
                  <p className={styles.label}>ニックネーム</p>
                  <p className={styles.value}>{userDetail.nickname || '-'}</p>
                </li>
                <li className={styles.listGroupItem}>
                  <p className={styles.label}>E-Mail</p>
                  <p className={styles.value}>{userDetail.email || '-'}</p>
                </li>
                <li className={styles.listGroupItem}>
                  <p className={styles.label}>ユーザー種別</p>
                  <p className={styles.value}>{userDetail.role || '-'}</p>
                </li>
              </ul>
            </div>
        );

      case 'bikes':
        return (
            <div className={`${styles.card} ${styles.cardReveal}`}>
              <div className={styles.cardHeader}>
                <div className={styles.horizontalContainerStart}>
                  <button
                      className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm} my-2`}
                      onClick={() =>
                          navigate('/setting/bike', {state: componentType})
                      }
                  >
                    新規登録
                  </button>

                </div>

              </div>
              <ul className={styles.listGroup}>
                {userDetail?.bikes?.length > 0 ? (
                    userDetail.bikes.map((bike) => (
                        <li key={bike.id} className={styles.detailListItem}>
                          <p className={styles.itemName}>{bike.name}</p>
                          <div className={styles.itemActions}>
                            <p className={styles.itemName}>{bike.type}</p>
                            <p className={styles.itemName}>{bike.sortNo}</p>
                            <button
                                className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
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
                    ))
                ) : (
                    <li className={styles.listGroupItem}>
                      <p className={styles.emptyState}>車両情報がありません</p>
                    </li>
                )}
              </ul>
            </div>
        );

      case 'devices':
        return renderNormalDeviceList();




      case 'assign-users':
        return (
            <div className={`${styles.card} ${styles.cardReveal}`}>
              <form className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="type" className={styles.formLabel}>
                    Role
                  </label>
                  <div className={styles.formInput}>
                    <select
                        className={styles.formSelect}
                        id="type"
                        onChange={(event) => setRole(event.target.value)}
                        value={role}
                    >
                      {logedInRole === 'master' && (
                          <option value="admin1">Admin1</option>
                      )}
                      {(logedInRole === 'master' || logedInRole === 'admin1') && (
                          <option value="admin2">Admin2</option>
                      )}
                      <option value="user">User</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="parent" className={styles.formLabel}>
                    Parent
                  </label>
                  <div className={styles.formInput}>
                    <Dropdown>
                      <Dropdown.Toggle
                          id="dropdown-basic"
                          className={styles.dropdownToggle}
                      >
                        {parent ? parent?.nickname : 'Select parent'}
                      </Dropdown.Toggle>

                      <Dropdown.Menu className={styles.dropdownMenu}>
                        {list.map((item) => (
                            <React.Fragment key={item.id}>
                              <Dropdown.Item
                                  className={item.id === parent?.id ? styles.selected : ''}
                                  onClick={() => setParentData(item)}
                              >
                                <div className={styles.dropdownItem}>
                                  <p>{item.nickname}</p>
                                </div>
                              </Dropdown.Item>
                              {item.admins2?.length > 0 && (
                                  <div className={styles.secondLevel}>
                                    {item.admins2.map((admin2) => (
                                        <Dropdown.Item
                                            key={admin2.id}
                                            className={admin2.id === parent?.id ? styles.selected : ''}
                                            onClick={() => setParentData(admin2)}
                                        >
                                          {admin2.nickname}
                                        </Dropdown.Item>
                                    ))}
                                  </div>
                              )}
                            </React.Fragment>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button
                      type="button"
                      className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                      onClick={() => navigate('/setting')}
                  >
                    戻る
                  </button>
                  <button
                      type="button"
                      className={`${styles.btn} ${styles.btnPrimary}`}
                      data-bs-toggle="modal"
                      data-bs-target="#exampleModal"
                  >
                    更新
                  </button>
                </div>
              </form>
            </div>
        );

      default:
        return null;
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
      <div className={styles.settingPage}>
        {error && (
            <div className={styles.alertDanger} role="alert">
              {error}
            </div>
        )}

        <div className={styles.infoAlert}>
          <p>{`・LoginUserID: ${localStorage.getItem('userId')}`}</p>
          <p>{`・UserProfile.userID: ${userProfileId}`}</p>
          <p>{`・action: Index`}</p>
        </div>

        <div className={styles.tabsSection}>
          <ul className={styles.navTabs}>
            <li className={styles.navItem}>
              <button
                  className={`${styles.navLink} ${selectedTab === 'profile' ? styles.active : ''}`}
                  onClick={() => handleTabClick('profile')}
              >
                ユーザー情報
              </button>
            </li>
            <li className={styles.navItem}>
              <button
                  className={`${styles.navLink} ${selectedTab === 'bikes' ? styles.active : ''}`}
                  onClick={() => handleTabClick('bikes')}
              >
                車両情報
              </button>
            </li>
            <li className={styles.navItem}>
              <button
                  className={`${styles.navLink} ${selectedTab === 'devices' ? styles.active : ''}`}
                  onClick={() => handleTabClick('devices')}
              >
                デバイス情報
              </button>
            </li>
            {logedInRole !== 'user' && componentType === 'info' && (
                <li className={styles.navItem}>
                  <button
                      className={`${styles.navLink} ${selectedTab === 'assign-users' ? styles.active : ''}`}
                      onClick={() => handleTabClick('assign-users')}
                  >
                    Assign Users
                  </button>
                </li>
            )}
          </ul>

          <div className={`${styles.tabContent} ${isTabChanging ? styles.tabChanging : ''}`}>
            {activeTabContent}
          </div>
        </div>

        {localStorage.getItem('role') !== 'user' && (
            <button
                className={`${styles.btn} ${styles.btnPrimary} ${styles.btnMd}`}
                onClick={() => navigate('/setting/list')}
            >
              管理画面
            </button>
        )}

        <div
            className="modal fade"
            id="exampleModal"
            tabIndex="-1"
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