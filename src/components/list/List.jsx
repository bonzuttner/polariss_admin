// List.jsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalComponent from '../common/ModalComponent';
import Api from '../../api/Api';
import styles from './List.module.css';
import CustomerList from './CustomerList';
import SimList from './SimList';
import UserTree from './UserTree';
import NotesModal from './NotesModal';

function List() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [poolList, setpoolList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFirstLevel, setSelectedFirstLevel] = useState('');
  const [selectedSecondLevel, setSelectedSecondLevel] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [showPool, setShowPool] = useState(false);
  const [show, setShow] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  let userId = localStorage.getItem('userId');
  let role = localStorage.getItem('role');

  // Fetch users with pagination
  const fetchUsers = useCallback(async (page = 1, pageSize = 5) => {
    try {
      const response = await Api.call(
          { page, page_size: pageSize },
          'users/profiles/list',
          'get', // Changed to POST since pagination is in body
          userId
      );

      if (response.data && response.data.code === 200) {
        const { users_profiles, pagination } = response.data.data;

        // Transform API data to match existing structure
        const transformedUsers = users_profiles.map(user => ({
          id: user.user_id,
          device_id: user.device_id,
          name1: user.last_name,
          name2: user.first_name,
          nickname: user.nickname,
          email: user.email,
          role: user.role,
          status: user.status,
          parent: null // You might need to adjust this based on your hierarchy
        }));

        setUsersList(transformedUsers);
        setTotalUsers(pagination.total);
        setTotalPages(pagination.total_pages);
        setCurrentPage(pagination.page);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }, []);

  const getList = useCallback(async () => {
    setLoading(true);
    setList([]);

    let path = role === 'admin2' ? 'users/list' : 'users/tree';
    const response = await Api.call({}, path, 'get', userId);

    if (response.data) {
      let list = response.data.data;
      setList(list);
      setSelectedFirstLevel(list[0]);
      setSelectedSecondLevel('');

      if (role === 'master') {
        // Fetch users with pagination
        await fetchUsers(currentPage, itemsPerPage);

        const poolresponse = await Api.call({}, 'users/pool', 'get', userId);
        if (poolresponse.data) {
          let allUsers = poolresponse.data.data;
          setpoolList(allUsers);
        }
      } else if (role === 'admin1' || role === 'admin2') {
        const response = await Api.call({}, 'users/pool', 'get', userId);
        if (response.data) {
          let allUsers = response.data.data;
          setpoolList(allUsers);
        }

        const responseUsers = await Api.call({}, 'users/list', 'get', userId);
        if (responseUsers.data) {
          let usersList = responseUsers.data.data;
          setUsersList(usersList);
        }
      }
      setLoading(false);
    }
  }, [role, userId, currentPage, itemsPerPage, fetchUsers]);

  useEffect(() => {
    if (role !== 'user') {
      getList();
    }
  }, [getList, role]);

  // Pagination functions for users
  const paginateUsers = useCallback((pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  }, [totalPages]);

  const setSecondLevel = async (item, list = []) => {
    if (list.length > 0) {
      setList(list);
      setSelectedSecondLevel(item);
    } else {
      setLoading(true);
      let path = `users/list`;
      const response = await Api.call({}, path, 'get', item.id);
      if (response.data) {
        let list = response.data.data;
        setList(list);
        setSelectedSecondLevel(item);
        setLoading(false);
      }
    }
  };

  const userUpdate = (user) => {
    localStorage.setItem('userProfileId', user.id);
    localStorage.setItem('userProfileRole', user.role);
    navigate('/setting/user-info');
  };

  const deviceUpdate = (sim) => {
    console.log("the sim obj is" , sim);
    localStorage.setItem('deviceImsi', sim.deviceImsi);
    localStorage.setItem('deviceName', sim.deviceName);
    navigate(`/sim-list/${sim.deviceImsi}`);
  };
  const showModal = (user) => {
    setSelectedUser(user);
    setShow(true);
  };

  return (
      <div className="list-page m-4">
        <div className="back-section">
          {selectedSecondLevel && (
              <button
                  className={`${styles.btn} ${styles.btnPrimary} ${styles.btnMd}  ${styles.btnOutline}`}
                  onClick={() => {
                    getList();
                  }}
              >
                Clear Filter
              </button>
          )}
          <button
              className={`${styles.btn} ${styles.btnPrimary} ${styles.btnMd}  `}
              onClick={() => navigate('/setting')}
          >
            戻る
          </button>
        </div>

        <CustomerList />
        <SimList deviceUpdate={deviceUpdate} />

        {loading ? (
            <div className="spinner-border text-secondary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
        ) : (
            <UserTree
                role={role}
                selectedSecondLevel={selectedSecondLevel}
                list={list}
                usersList={usersList}
                poolList={poolList}
                showAll={showAll}
                showPool={showPool}
                setSelectedFirstLevel={setSelectedFirstLevel}
                setSecondLevel={setSecondLevel}
                setShowAll={setShowAll}
                setShowPool={setShowPool}
                userUpdate={userUpdate}
                showModal={showModal}
                selectedFirstLevel={selectedFirstLevel}
                currentPage={currentPage}
                totalPages={totalPages}
                totalUsers={totalUsers}
                itemsPerPage={itemsPerPage}
                paginateUsers={paginateUsers}
            />
        )}

        <NotesModal />
        {show && (
            <ModalComponent
                name={'users'}
                id={selectedUser?.id}
                close={() => setShow(false)}
                userId={localStorage.getItem('userId')}
            />
        )}
      </div>
  );
}

export default List;