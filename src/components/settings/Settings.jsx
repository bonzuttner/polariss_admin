import React, { useCallback, useEffect, useState } from 'react';
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

  const [userDetail, setUserDetail] = useState({});
  const [viewOnly, setViewOnly] = useState(false);

  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const userId = id || localStorage.getItem('userId');
  const componentType = props.type;
  const userProfileId = componentType === 'info'
      ? localStorage.getItem('userProfileId')
      : userId;

  const logedInRole = localStorage.getItem('role');


  /* --------------------------------------------------------
     FETCH USER DETAILS
  -------------------------------------------------------- */
  const getDetails = async () => {
    setIsProfileLoading(true);
    try {
      const res = await Api.call({}, `users/${userProfileId}`, 'get', userId);
      if (res.data?.data) {
        const data = res.data.data;

        // check if the fetched user id is the same as the logged-in user to  set the role
        if(data.id === userId.trim())
        {
        localStorage.setItem('role', data.role);
        }

        setUserDetail(data);
        setParent(data.parent || null);
        setViewOnly(data.viewOnly);
      }
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setIsProfileLoading(false);
    }
  };


  /* --------------------------------------------------------
     FLATTEN USER TREE
  -------------------------------------------------------- */
  const flattenUserTree = (node, level = 0, result = []) => {
    result.push({ ...node, _level: level });

    if (node.children) {
      node.children.forEach(child =>
          flattenUserTree(child, level + 1, result)
      );
    }
    return result;
  };


  /* --------------------------------------------------------
     FETCH USER CHILDREN TREE
  -------------------------------------------------------- */
  const getUserList = async () => {
    try {
      const res = await Api.call({}, "users/get-childrens", "get", userId);

      if (res.data?.code === 200) {
        setList(flattenUserTree(res.data.data));
      }
    } catch (err) {
      console.error("Failed to fetch user children:", err);
    }
  };


  /* --------------------------------------------------------
     INITIAL LOAD
  -------------------------------------------------------- */
  useEffect(() => {
    getDetails();
    if (logedInRole !== 'user' && componentType === 'info') {
      getUserList();
    }
  }, []);


  /* --------------------------------------------------------
     TAB SWITCH TRANSITION
  -------------------------------------------------------- */
  const handleTabClick = (tab) => {
    setIsTabChanging(true);
    setTimeout(() => {
      setSelectedTab(tab);
      setIsTabChanging(false);
    }, 300);
  };

  const [selectedTab, setSelectedTab] = useState('profile');


  /* --------------------------------------------------------
     RE-RENDER TAB CONTENT WHEN DATA CHANGES
  -------------------------------------------------------- */
  useEffect(() => {
    setActiveTabContent(renderTabContent());
  }, [selectedTab, userDetail, role, parent, list, viewOnly]);


  /* --------------------------------------------------------
     UPDATE PARENT
  -------------------------------------------------------- */
  const setParentData = (item) => {
    setParent(item);
  };


  /* --------------------------------------------------------
     RENDER TABS
  -------------------------------------------------------- */
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
                handleRoleChange={(e) => setRole(e.target.value)}
                parent={parent}
                setParentData={setParentData}
                list={list}
                logedInRole={logedInRole}
                navigate={navigate}
                updateUserRoleParent={updateUserRoleParent}
                error={error}
                isUpdating={isUpdating}
                viewOnly={viewOnly}
                setViewOnly={setViewOnly}
            />
        );

      default:
        return null;
    }
  }, [selectedTab, userDetail, role, parent, list, viewOnly, isUpdating]);


  /* --------------------------------------------------------
     UPDATE ROLE / PARENT / VIEW ONLY
  -------------------------------------------------------- */
  const updateUserRoleParent = async () => {
    setIsUpdating(true);
    setError('');

    try {
      let body = {
        role: role,
        view_only: viewOnly ? 1 : 0
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
        window.location.reload();
      } else {
        setError(response?.data?.message);
      }
    } catch (error) {
      console.error('Update error:', error);
      setError('更新中にエラーが発生しました');
    } finally {
      setIsUpdating(false);
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

        {logedInRole !== 'user' && (
            <button
                className={`${styles.btn} ${styles.btnPrimary} ${styles.btnMd}`}
                onClick={() => navigate('/setting/list')}
            >
              管理画面
            </button>
        )}
      </div>
  );
}

export default Settings;