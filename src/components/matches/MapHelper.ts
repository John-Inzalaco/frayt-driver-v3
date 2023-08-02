import {Match} from '@frayt/sdk';

export type Region = Coordinates & {
  latitudeDelta: number;
  longitudeDelta: number;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export function getInitialRegion(match?: Match, padding = 0): Region {
  if (!match)
    return {
      latitude: 0,
      latitudeDelta: 0,
      longitude: 0,
      longitudeDelta: 0,
    };
  const pickupCoords: Coordinates = {
    latitude: match.origin_address?.lat ?? 0,
    longitude: match.origin_address?.lng ?? 0,
  };
  const stopsCoords: Coordinates[] = match.stops.map(stop => {
    return {
      latitude: stop.destination_address.lat,
      longitude: stop.destination_address.lng,
    };
  });
  return getRegionForCoordinates([pickupCoords, ...stopsCoords], padding);
}

// https://github.com/react-native-community/react-native-maps/issues/505#issuecomment-243423775
export function getRegionForCoordinates(
  points: Coordinates[],
  padding: number,
): Region {
  // padding should be a fraction, ie .1 is 10% padding
  padding = padding ? padding : 0;
  // points should be an array of { latitude: X, longitude: Y }
  let minX: number, maxX: number, minY: number, maxY: number;

  // init first point
  (point => {
    minX = point.latitude;
    maxX = point.latitude;
    minY = point.longitude;
    maxY = point.longitude;
  })(points[0]);

  // calculate rect
  points.map(point => {
    minX = Math.min(minX, point.latitude);
    maxX = Math.max(maxX, point.latitude);
    minY = Math.min(minY, point.longitude);
    maxY = Math.max(maxY, point.longitude);
  });

  const paddingX = Math.abs(maxX - minX) * padding;
  const paddingY = Math.abs(maxY - minY) * padding;

  minX -= paddingX;
  minY -= paddingY;
  maxX += paddingX;
  maxY += paddingY;

  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  const deltaX = maxX - minX;
  const deltaY = maxY - minY;

  return {
    latitude: midX,
    longitude: midY,
    latitudeDelta: deltaX,
    longitudeDelta: deltaY,
  };
}
