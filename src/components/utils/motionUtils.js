const EARTH_RADIUS_KM = 6371;

const toRad = (deg) => (deg * Math.PI) / 180;
const toDeg = (rad) => (rad * 180) / Math.PI;

const SPEED_FIELD_CANDIDATES = ['speedKmph', 'speed', 'spd', 'velocity'];
const HEADING_FIELD_CANDIDATES = ['heading', 'hdg', 'course', 'crs', 'bearing', 'direction'];

function isValidPoint(point) {
    const lat = Number(point?.lat);
    const lon = Number(point?.lon);
    return (
        Number.isFinite(lat) && lat >= -90 && lat <= 90 &&
        Number.isFinite(lon) && lon >= -180 && lon <= 180
    );
}

function lastTwoValidPoints(movements) {
    const valid = (movements || []).filter(isValidPoint);
    if (valid.length < 2) return null;
    return [valid[valid.length - 2], valid[valid.length - 1]];
}

function firstNumericField(obj, candidates) {
    for (const key of candidates) {
        const value = Number(obj?.[key]);
        if (Number.isFinite(value)) return value;
    }
    return null;
}

// Great-circle distance between two lat/lon points, in kilometers.
function haversineKm(a, b) {
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
    return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

// Initial bearing from point a to point b, in degrees (0-360, 0 = north).
function bearingDeg(a, b) {
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const dLon = toRad(b.lon - a.lon);
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/**
 * Speed in km/h. Prefers a speed field reported by the backend; falls back
 * to deriving it from the last two movement points when none is present.
 */
export function getDeviceSpeedKmph(device, movements) {
    const reported = firstNumericField(device?.lastLocation, SPEED_FIELD_CANDIDATES);
    if (reported !== null) return reported;

    const pair = lastTwoValidPoints(movements);
    if (!pair) return null;
    const [a, b] = pair;
    const hours = (new Date(b.dt) - new Date(a.dt)) / 3_600_000;
    if (!Number.isFinite(hours) || hours <= 0) return null;
    return haversineKm(a, b) / hours;
}

/**
 * Heading in degrees (0-360, 0 = north). Prefers a heading field reported by
 * the backend; falls back to the bearing between the last two movement points.
 */
export function getDeviceHeadingDeg(device, movements) {
    const reported = firstNumericField(device?.lastLocation, HEADING_FIELD_CANDIDATES);
    if (reported !== null) return ((reported % 360) + 360) % 360;

    const pair = lastTwoValidPoints(movements);
    if (!pair) return null;
    const [a, b] = pair;
    if (a.lat === b.lat && a.lon === b.lon) return null;
    return bearingDeg(a, b);
}

const COMPASS_LABELS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export function headingToCompass(degrees) {
    if (degrees === null || degrees === undefined || !Number.isFinite(degrees)) return null;
    const index = Math.round((((degrees % 360) + 360) % 360) / 45) % 8;
    return COMPASS_LABELS[index];
}
