
const DEFAULT_CENTER = { lat: 36.2223633040231, lng: 137.81848964688243 };


//function to put the device first letter as a lable on the device marker
export function getMarkerLabel(label) {
    return label?.length > 2
        ? label.split(/\s/).reduce((r, word) => (r += word[0] || ''), '')
        : label;
}

//render the device marker on the map
export function getMarkerPosition(device, simulatedPosition) {
    return (
        simulatedPosition ||
        (device?.lastLocation?.lat
            ? { lat: device.lastLocation.lat, lng: device.lastLocation.lon }
            : DEFAULT_CENTER)
    );
}
