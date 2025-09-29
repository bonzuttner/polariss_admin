// List.jsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalComponent from '../common/ModalComponent';
import Api from '../../api/Api';
import styles from './List.module.css';
import CustomerList from './CustomerList';
import UserList from './UserList';
import SimList from './SimList';
import UserTree from './UserTree';
import NotesModal from './NotesModal';

function List() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [poolList, setpoolList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFirstLevel, setSelectedFirstLevel] = useState('');
  const [selectedSecondLevel, setSelectedSecondLevel] = useState('');
  const [show, setShow] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});

  let userId = localStorage.getItem('userId');
  let role = localStorage.getItem('role');

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
      setLoading(false);
    }
  }, [role, userId]);

  useEffect(() => {
    if (role !== 'user') {
      getList();
    }
  }, [getList, role]);

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
                setSelectedFirstLevel={setSelectedFirstLevel}
                setSecondLevel={setSecondLevel}
                userUpdate={userUpdate}
                showModal={showModal}
                selectedFirstLevel={selectedFirstLevel}
            />
        )}

        {role === 'master' && <UserList

            userUpdate={userUpdate}
            showModal={showModal}
        />}



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