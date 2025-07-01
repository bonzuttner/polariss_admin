import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../settings/Setting.css';
import Api from '../../api/Api';
import Profile from '../profile/Profile';
import Bike from '../bike/Bike';
import Device from '../device/Device';
function Setup(props) {
  const navigate = useNavigate();
  const fromRef = useRef();
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
  const [currentForm, setCurrentForm] = useState('profile');

  const renderForm = () => {
    let formToReturn;
    switch (currentForm) {
      case 'profile':
        formToReturn = <Profile component={'setup'} changeForm={changeForm} />;
        break;
      case 'bike':
        formToReturn = <Bike component={'setup'} changeForm={changeForm} />;
        break;
      case 'device':
        formToReturn = <Device component={'setup'} changeForm={changeForm} />;
        break;
    }
    return formToReturn;
  };

  const changeForm = (operation = 'next') => {
    let updatedForm = currentForm;
    if (operation === 'next') {
      switch (currentForm) {
        case 'profile':
          updatedForm = 'bike';
          break;
        case 'bike':
          updatedForm = 'device';
          break;
      }
    } else {
      switch (currentForm) {
        case 'bike':
          updatedForm = 'profile';
          break;
        case 'device':
          updatedForm = 'bike';
          break;
      }
    }
    setCurrentForm(updatedForm);
  };

  return (
    <div className="setting-page">
      {renderForm()}
      <div className="modal-footer setup">
        {currentForm !== 'profile' && (
          <button
            type="button"
            className="btn btn-outline-primary"
            data-bs-dismiss="modal"
            onClick={() => changeForm('back')}
          >
            Back
          </button>
        )}
        {/* {currentForm !== 'device' && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => changeForm('next')}
          >
            Next
          </button>
        )} */}
      </div>
    </div>
  );
}

export default Setup;
