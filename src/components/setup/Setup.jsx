import React, { useState } from 'react';
import Profile from '../profile/Profile';
import Bike from '../bike/Bike';
import Device from '../device/Device';
import { Button } from '../common/Button.jsx';

function Setup() {
  const [currentForm, setCurrentForm] = useState('profile');

  const renderForm = () => {
    switch (currentForm) {
      case 'profile':
        return <Profile component={'setup'} changeForm={changeForm} />;
      case 'bike':
        return <Bike component={'setup'} changeForm={changeForm} />;
      case 'device':
        return <Device component={'setup'} changeForm={changeForm} />;
      default:
        return null;
    }
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
    <div>
      {renderForm()}
      {currentForm !== 'profile' && (
        <div className="-mt-6 mb-10 text-center">
          <Button variant="outline" onClick={() => changeForm('back')}>
            Back
          </Button>
        </div>
      )}
    </div>
  );
}

export default Setup;
