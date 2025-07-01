import { Dropdown } from 'bootstrap';
import React, { Suspense, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModalComponent from '../common/ModalComponent';
import Api from '../../api/Api';
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

  let userId = localStorage.getItem('userId');
  let role = localStorage.getItem('role');
  const getList = async () => {
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
        const response = await Api.call({}, 'users/list', 'get', userId);
        if (response.data) {
          let allUsers = response.data.data;
          setUsersList(allUsers);
        }
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
  };
  useEffect(() => {
    if (role !== 'user') {
      getList();
    }
  }, []);

  const renderUserTree = () => {
    if (role === 'master' && !selectedSecondLevel) {
      const firstLevel = [];
      const secondtLevel = [];
      let secondLevelTable = false;
      let secondList = [];
      list.map((item) => {
        firstLevel.push(
          <button
            className={`btn d-block ${
              item.id === selectedFirstLevel.id
                ? 'btn-secondary'
                : 'btn-outline-secondary'
            }`}
            id={item.id}
            onClick={() => setSelectedFirstLevel(item)}
          >{`${item.name2} ${item.name1}`}</button>
        );
        if (item.id === selectedFirstLevel.id) {
          secondList = usersList.filter((user) => user.parent?.id === item.id);
          if (item.admins2.length === 0) {
            secondLevelTable = true;
          } else {
            item.admins2?.map((secondItem) => {
              secondtLevel.push(
                <button
                  className={`btn d-block btn-outline-secondary`}
                  onClick={() => setSecondLevel(secondItem)}
                >{`${secondItem.name2} ${secondItem.name1}`}</button>
              );
            });
            if (secondList.length > 1) {
              secondtLevel.push(
                <button
                  className={`btn d-block btn-outline-secondary`}
                  onClick={() => setSecondLevel(item, secondList)}
                >{`Show Direct Children`}</button>
              );
            }
          }
        }
      });
      return (
        <>
          <div className="d-flex levels-section">
            <div className="first level"> {firstLevel}</div>
            <div className="second level">
              {secondLevelTable
                ? secondList.length !== 0 && renderTable(secondList)
                : secondtLevel}
            </div>
          </div>

          <div className="show-all-section">
            <button
              className="btn show-all"
              onClick={() => setShowPool(!showPool)}
            >{`${showPool ? 'Hide Users Pool' : 'Show Users Pool'}`}</button>
          </div>
          {showPool && renderTable(poolList)}

          <div className="show-all-section">
            <button
              className="btn show-all"
              onClick={() => setShowAll(!showAll)}
            >{`${showAll ? 'Hide All Users' : 'Show All Users'}`}</button>
          </div>
          {showAll && renderTable(usersList)}
        </>
      );
    } else if (role === 'admin1' && !selectedSecondLevel) {
      const firstLevel = [];
      let secondtLevel = [];
      list.map((item) => {
        firstLevel.push(
          <button
            className={`btn d-block ${
              item.id === selectedFirstLevel.id
                ? 'btn-secondary'
                : 'btn-outline-secondary'
            }`}
            onClick={() => setSelectedFirstLevel(item)}
          >{`${item.name2} ${item.name1}`}</button>
        );
        if (item.id === selectedFirstLevel.id) {
          let extraUsers = usersList.filter(
            (user) => user.parent?.id === item.id
          );
          secondtLevel = extraUsers;
        }
      });
      return (
        <>
          <div className="d-flex levels-section-table">
            <div className="first level"> {firstLevel}</div>
            <div className="second level">
              {' '}
              {renderTable(secondtLevel, true)}
            </div>
          </div>
          <div className="show-all-section">
            <button
              className="btn show-all"
              onClick={() => setShowAll(!showAll)}
            >{`${showAll ? 'Hide All Users' : 'Show Users Pool'}`}</button>
          </div>
          {showAll && renderTable(poolList)}
        </>
      );
    } else {
      return (
        <>
          {renderTable()}
          <div className="show-all-section">
            <button
              className="btn show-all"
              onClick={() => setShowAll(!showAll)}
            >{`${showAll ? 'Hide All Users' : 'Show Users Pool'}`}</button>
          </div>
          {showAll && renderTable(poolList)}
        </>
      );
    }
  };

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

  const showModal = (user) => {
    setSelectedUser(user);
    setShow(true);
  };

  const renderTable = (userList = [], showExtra = false, type = '') => {
    const listToRender = userList.length === 0 ? list : userList;
    return (
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">筐体番号</th>
              <th scope="col">姓</th>
              <th scope="col">名</th>
              <th scope="col">ニックネーム</th>
              <th scope="col">Email</th>
              <th scope="col">属性</th>
              <th scope="col">状態</th>
              {showExtra && <th scope="col">Show</th>}
              <th scope="col">F</th>
            </tr>
          </thead>
          {!loading && (
            <tbody>
              {listToRender.map((user) => {
                return (
                  <tr>
                    <td>{user.id}</td>
                    <td>{user.name1}</td>
                    <td>{user.name2}</td>
                    <td>{user.nickname}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{'有効'}</td>
                    {showExtra && (
                      <td>
                        {user.role !== 'user' && (
                          <button
                            className="btn btn-outline-secondary btn-sm mx-2"
                            onClick={() => setSecondLevel(user)}
                          >
                            Show children
                          </button>
                        )}
                      </td>
                    )}
                    <td>
                      <button
                        className="btn btn-primary btn-sm mx-2"
                        onClick={() => userUpdate(user)}
                      >
                        編集
                      </button>
                      <button
                        className="btn btn-danger btn-sm "
                        onClick={() => showModal(user)}
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>
    );
  };

  return (
    <div className="list-page m-4">
      <div className="back-section">
        {selectedSecondLevel && (
          <button
            className="btn btn-outline-primary clear-btn px-4"
            onClick={() => {
              getList();
            }}
          >
            Clear Filter
          </button>
        )}
        <button
          className="btn btn-outline-primary back-btn px-4"
          onClick={() => navigate('/setting')}
        >
          戻る
        </button>
      </div>
      {loading ? (
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      ) : role === 'admin2' ? (
        renderUserTree()
      ) : (
        renderUserTree()
      )}
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
