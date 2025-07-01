

export const findCurrentSelection = (items, currentId) => {
    return items.find(item => currentId && item.id === currentId) || items[0];
};

export const getCurrentDeviceData = (users, selectedUserRef) => {
    const currentUser = findCurrentSelection(users, selectedUserRef.current?.id);
    const currentBike = findCurrentSelection(currentUser.bikes, selectedUserRef.current?.bikeId);
    const currentDevice = findCurrentSelection(currentBike.devices, selectedUserRef.current?.deviceId);

    return { currentUser, currentBike, currentDevice };
};

export const handleSelectionChange = (field, value, users, stateSetters) => {
    const { setSelectedUser, setSelectedBike, setSelectedDevice } = stateSetters;

    switch (field) {
        case 'user':
            const user = users.find(u => u.id.toString() === value);
            if (user) {
                setSelectedUser(user);
                setSelectedBike(user.bikes[0]);
                setSelectedDevice(user.bikes[0]?.devices[0]);
            }
            break;
        case 'bike':
            const bike = stateSetters.selectedUser.bikes.find(b => b.id.toString() === value);
            if (bike) {
                setSelectedBike(bike);
                setSelectedDevice(bike.devices[0]);
            }
            break;
        case 'device':
            const device = stateSetters.selectedBike.devices.find(d => d.id.toString() === value);
            if (device) setSelectedDevice(device);
            break;
    }
};