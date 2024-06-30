import { Dropdown } from 'bootstrap';
import React, { Suspense, useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import './Home.css';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Api from '../../api/Api';

const API_KEY = import.meta.env.API_KEY;
function Home(props) {
  console.log('props: ', props)
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState({});
  const [selectedBike, setSelectedBike] = useState({});
  const [selectedDevice, setSelecteDevice] = useState({});

  const lineApi = async () => {
    setLoading(true);
    const body = {
      code: searchParams.get('code'),
      redirectUri: location.origin,
    };
    const response = await Api.call(
      body,
      `auth/line`,
      'post',
      localStorage.getItem('userId')
    );
    if (response.data.code === 200) {
      const userId = response.data.data.accessToken;
      localStorage.setItem('userId', userId);
      navigate('/');
      getHomePage()
    }
  };

  const getHomePage = async () => {
    const response = await Api.call(
      {},
      `homePage`,
      'get',
      localStorage.getItem('userId')
    );
    if (response.data.code === 200) {
      const users = response.data.data;
      setUsers(users);
      const user = users[0];
      const bike = user.bikes[0];
      const device = bike.devices[0];
      setSelectedUser(user);
      setSelectedBike(bike);
      setSelecteDevice(device);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.size > 0) {
      lineApi();
    } else {
      if (!localStorage.getItem('userId')) {
        navigate('/login');
      }
    }
  }, []);

  const handleSelect = (field, event) => {
    const value = event.target.value;
    switch (field) {
      case 'user':
        const user = users.find((a) => a.id === value);
        const bike = user.bikes[0];
        const device = bike.devices[0];
        setSelectedUser(user);
        setSelectedBike(bike);
        setSelecteDevice(device);
        break;
      case 'bike':
        const bikeToSelect = selectedUser.bikes.find((a) => a.id === value);
        const deviceToSelect = bikeToSelect.devices[0];
        setSelectedBike(bikeToSelect);
        setSelecteDevice(deviceToSelect);
        break;
      case 'device':
        const deviceSelectd = selectedBike.devices.find((a) => a.id === value);
        setSelecteDevice(deviceSelectd);
        break;
    }
  };

  const isEmpty = (value) => {
    return Object.keys(value).length === 0 && value.constructor === Object;
  };

  const renderSearchBar = () => {
    return (
      <div className={`col col-md-3 results-wrapper`}>
        <div class="row">
          <div class="form search-form inputs-underline">
            <form>
              <div class="section-title">
                <h3>Select</h3>
              </div>
              <div class="row">
                <div class="col-md-6 col-sm-6">
                  <DatePicker />
                </div>
                <div class="col-md-6 col-sm-6">
                  <div class="form-group">
                    <DatePicker />
                  </div>
                </div>
              </div>

              <div class="form-group">
                <button
                  type="submit"
                  data-ajax-response="map"
                  data-ajax-data-file="assets/external/data_2.php"
                  data-ajax-auto-zoom="1"
                  class="btn btn-primary pull-right"
                >
                  更新
                </button>
              </div>
            </form>
          </div>
        </div>

        <div class="row">
          {/* <div class="results-wrapper"> */}
          <div class="form search-form inputs-underline">
            <form>
              <div class="row">
                <div class="col-md-12 col-sm-12">
                  <div class="form-group">
                    <select
                      class="form-control selectpicker"
                      name="city"
                      onChange={(event) => handleSelect('user', event)}
                    >
                      <option value="" style={{ color: 'red' }}>
                        Users
                      </option>

                      {!isEmpty(selectedUser) &&
                        users.map((user) => {
                          return <option value={user.id}>{user.name1}</option>;
                        })}
                    </select>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-12 col-sm-12">
                  <div class="form-group">
                    <select
                      class="form-control selectpicker"
                      name="category"
                      onChange={(event) => handleSelect('bike', event)}
                    >
                      {!isEmpty(selectedUser) &&
                        selectedUser?.bikes.map((bike) => {
                          return <option value={bike.id}>{bike.name}</option>;
                        })}
                    </select>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-12 col-sm-12">
                  <div class="form-group">
                    <select
                      class="form-control selectpicker"
                      name="device"
                      onChange={(event) => handleSelect('device', event)}
                    >
                      {!isEmpty(selectedBike) &&
                        selectedBike?.devices.map((device) => {
                          return (
                            <option value={device.id}>{device.name}</option>
                          );
                        })}
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </div>
          {/* </div> */}
        </div>
        <div class="row">
          {/* <div class="results-wrapper"> */}
          <div class="form search-form inputs-underline">
            <form>
              <div class="section-title">
                <h3>最終通信情報</h3>
              </div>
              <hr />
              <div class="row">
                <div class="col-md-6 col-sm-6">端末状態：</div>
                <div class="col-md-6 col-sm-6">
                  <button
                    style={{ width: '100%' }}
                    data-ajax-response="map"
                    data-ajax-data-file="assets/external/data_2.php"
                    data-ajax-auto-zoom="1"
                    class="btn btn-primary"
                  >
                    正常
                  </button>
                </div>
              </div>
              <hr />
              <div class="row">
                <div class="col-md-6 col-sm-6">バッテリー：</div>
                <div class="col-md-6 col-sm-6">
                  <button
                    style={{ width: '100%' }}
                    data-ajax-response="map"
                    data-ajax-data-file="assets/external/data_2.php"
                    data-ajax-auto-zoom="1"
                    class="btn btn-primary"
                  >
                    充電中
                  </button>
                </div>
              </div>
              <hr />
              <div class="row">
                <div class="col-md-6 col-sm-6">監視モード：</div>
                <div class="col-md-6 col-sm-6">
                  <button
                    style={{ width: '100%' }}
                    data-ajax-response="map"
                    data-ajax-data-file="assets/external/data_2.php"
                    data-ajax-auto-zoom="1"
                    class="btn btn-primary"
                  >
                    解除中
                  </button>
                </div>
              </div>
            </form>
          </div>
          {/* </div> */}
        </div>
      </div>
    );
  };

  const showBar = () => {
    setShow(!show);
  };

  return (
    <div id="page-content">
      {!loading && (
        <div class="hero-section full-screen has-map has-sidebar">
          <div class="row">
            <div className="search-responsive" onClick={() => showBar()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                fill="white"
                class="bi bi-arrow-bar-right"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M6 8a.5.5 0 0 0 .5.5h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L12.293 7.5H6.5A.5.5 0 0 0 6 8m-2.5 7a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5"
                />
              </svg>
            </div>
            
            <div className={`show-side-bar ${show ? 'show' : 'hide'}`}>
              {renderSearchBar()}
            </div>

            <APIProvider apiKey={API_KEY}>
              <Map
                className={'col col-12 col-md-9 map-col'}
                defaultCenter={{ lat: 22.54992, lng: 0 }}
                defaultZoom={3}
                gestureHandling={'greedy'}
                disableDefaultUI={false}
              />
            </APIProvider>
            {renderSearchBar()}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
