import React, {useCallback, useEffect, useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './Settings.module.css';
import Api from '../../api/Api';
import AssignUsersTab from "./AssignUsersTab.jsx";
import DevicesTab from "./DevicesTab.jsx";
import BikesTab from "./BikesTab.jsx";
import ProfileTab from "./ProfileTab.jsx";


function Settings(props) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [list, setList] = useState([]);
  const [parent, setParent] = useState(null);
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




  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  // Add this useEffect to debug the isUpdating state
  useEffect(() => {
    console.log('isUpdating state changed:', isUpdating);
  }, [isUpdating]);

  //  tab transition effect
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
  }, [selectedTab, userDetail ,  role, parent, list]);


  const getDetails = async () => {
    setIsProfileLoading(true);
    try {
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
  }
  catch (error) {
    console.error('Error fetching details:', error);
    }
    finally {
      setIsProfileLoading(false);
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

  const setParentData =  (item) => {
    console.log('Setting parent to:', item);
    setParent(item);
  };
  // Update the role dropdown onChange handler
  const handleRoleChange = (event) => {
    console.log('Setting role to:', event.target.value);
    setRole(event.target.value);
  };
  const renderTabContent = useCallback(() => {
    switch (selectedTab) {
      case 'profile':
        return (
            <ProfileTab
                userDetail={userDetail}
                componentType={componentType}
                navigate={navigate}
                isLoading={isProfileLoading}
                isUpdating={isUpdating}
            />
        );

      case 'bikes':
        return (
            <BikesTab
                userDetail={userDetail}
                componentType={componentType}
                navigate={navigate}
            />
        );

      case 'devices':
        return (
            <DevicesTab
                userDetail={userDetail}
                componentType={componentType}
                navigate={navigate}
            />
        );

      case 'assign-users':
        return (
            <AssignUsersTab
                role={role}
                handleRoleChange={handleRoleChange}
                parent={parent}
                setParentData={setParentData}
                list={list}
                logedInRole={logedInRole}
                navigate={navigate}
                updateUserRoleParent={updateUserRoleParent}
                error={error}
                isUpdating={isUpdating}

            />
        );

      default:
        return null;
    }
  }, [selectedTab, userDetail, role, parent, list, logedInRole, componentType, error , isUpdating]);

  const updateUserRoleParent = async () => {
    setIsUpdating(true);
    setError(''); // Clear previous errors

    try {
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
  } catch (error) {
      console.error('Update error:', error);
      setError('更新中にエラーが発生しました');
    } finally {
      setIsUpdating(false);
    }} ;

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
                顧客名
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