const EARTH_RADIUS_KM = 6371;
const DEFAULT_MIN_SEGMENT_METERS = 5;

const toRadians = (value) => (value * Math.PI) / 180;

const isValidCoordinate = (value, min, max) =>
    Number.isFinite(value) && value >= min && value <= max;

const isValidMovementPoint = (point) =>
    isValidCoordinate(point?.lat, -90, 90) &&
    isValidCoordinate(point?.lon, -180, 180);

const getSegmentDistanceKm = (from, to) => {
    const latDelta = toRadians(to.lat - from.lat);
    const lonDelta = toRadians(to.lon - from.lon);
    const fromLat = toRadians(from.lat);
    const toLat = toRadians(to.lat);

    const haversine =
        Math.sin(latDelta / 2) ** 2 +
        Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lonDelta / 2) ** 2;

    return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

export const calculateCrossedKilometers = (
    movements,
    { minSegmentMeters = DEFAULT_MIN_SEGMENT_METERS } = {}
) => {
    if (!Array.isArray(movements) || movements.length < 2) {
        return 0;
    }

    const minSegmentKm = minSegmentMeters / 1000;
    let totalDistanceKm = 0;
    let previousPoint = null;

    for (const movement of movements) {
        const currentPoint = {
            lat: Number(movement?.lat),
            lon: Number(movement?.lon)
        };

        if (!isValidMovementPoint(currentPoint)) {
            continue;
        }

        if (!previousPoint) {
            previousPoint = currentPoint;
            continue;
        }

        const segmentDistanceKm = getSegmentDistanceKm(previousPoint, currentPoint);

        // Ignore tiny GPS jitter while still summing the real travelled route.
        if (segmentDistanceKm >= minSegmentKm) {
            totalDistanceKm += segmentDistanceKm;
        }

        previousPoint = currentPoint;
    }

    return totalDistanceKm;
};
