import { useState, useRef, useEffect, useCallback } from 'react';

export default function useSelections(initialUsers = []) {
    const [users, setUsers] = useState(initialUsers);
    const [selectedUser, setSelectedUser] = useState({});
    const [selectedBike, setSelectedBike] = useState({});
    const [selectedDevice, setSelectedDevice] = useState({});

    const usersRef = useRef(users);
    const selectedUserRef = useRef(selectedUser);
    const selectedBikeRef = useRef(selectedBike);
    const selectedDeviceRef = useRef(selectedDevice);

    // Keep refs updated
    useEffect(() => {
        usersRef.current = users;
        selectedUserRef.current = selectedUser;
        selectedBikeRef.current = selectedBike;
        selectedDeviceRef.current = selectedDevice;
    }, [users, selectedUser, selectedBike, selectedDevice]);

    const updateSelections = useCallback((users) => {
        if (users.length === 0) return null;

        const currentUser = users.find(u =>
            selectedUserRef.current?.id === u.id
        ) || users[0];

        const currentBike = currentUser.bikes.find(b =>
            selectedBikeRef.current?.id === b.id
        ) || currentUser.bikes[0];

        const currentDevice = currentBike.devices.find(d =>
            selectedDeviceRef.current?.id === d.id
        ) || currentBike.devices[0];

        setSelectedUser(currentUser);
        setSelectedBike(currentBike);
        setSelectedDevice(currentDevice);

        return { currentUser, currentBike, currentDevice };
    }, []);

    const handleSelect = useCallback((field, event) => {
        const value = event.target.value;

        switch (field) {
            case 'user':
                const user = usersRef.current.find(u => u.id.toString() === value);
                if (user) {
                    const newBike = user.bikes[0];
                    const newDevice = newBike?.devices[0];

                    setSelectedUser(user);
                    setSelectedBike(newBike);
                    setSelectedDevice(newDevice);
                    return { user, bike: newBike, device: newDevice };
                }
                break;

            case 'bike':
                const bike = selectedUserRef.current.bikes.find(
                    b => b.id.toString() === value
                );
                if (bike) {
                    const newDevice = bike.devices[0];
                    setSelectedBike(bike);
                    setSelectedDevice(newDevice);
                    return { bike, device: newDevice };
                }
                break;

            case 'device':
                const device = selectedBikeRef.current.devices.find(
                    d => d.id.toString() === value
                );
                if (device) {
                    setSelectedDevice(device);
                    return { device };
                }
                break;
        }
        return null;
    }, []);

    return {
        users,
        selectedUser,
        selectedBike,
        selectedDevice,
        setUsers,
        updateSelections,
        handleSelect
    };
}