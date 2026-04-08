import Geolocation from '@react-native-community/geolocation';
import { Platform } from 'react-native';

export type LocationLookupResult = {
  status: 'granted' | 'denied' | 'error';
  cityOrLocation?: string;
  latitude?: number;
  longitude?: number;
  message?: string;
};

type ReverseGeocodeResponse = {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
};

async function reverseGeocode(latitude: number, longitude: number): Promise<string | undefined> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);

  try {
    const endpoint = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=zh`;
    const response = await fetch(endpoint, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      return undefined;
    }
    const data = (await response.json()) as ReverseGeocodeResponse;
    const city = data.city ?? data.locality;
    if (city && data.countryName) {
      return `${city}, ${data.countryName}`;
    }
    if (city && data.principalSubdivision) {
      return `${city}, ${data.principalSubdivision}`;
    }
    return city ?? undefined;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

export async function resolveCurrentLocation(): Promise<LocationLookupResult> {
  try {
    if (Platform.OS === 'ios') {
      const permissionGranted = await new Promise<boolean>((resolve) => {
        Geolocation.requestAuthorization(
          () => resolve(true),
          () => resolve(false),
        );
      });

      if (!permissionGranted) {
        return {
          status: 'denied',
          message: 'Location permission was denied. Please enter location manually.',
        };
      }
    }

    const coords = await new Promise<{ coords: { latitude: number; longitude: number } }>((resolve, reject) => {
      Geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      });
    });

    const lat = coords.coords.latitude;
    const lon = coords.coords.longitude;
    const readableLocation = await reverseGeocode(lat, lon);
    const fallbackLocation = `${lat.toFixed(3)}, ${lon.toFixed(3)}`;

    return {
      status: 'granted',
      cityOrLocation: readableLocation ?? fallbackLocation,
      latitude: lat,
      longitude: lon,
      message: readableLocation
        ? undefined
        : 'Location coordinates detected. You can edit location manually if needed.',
    };
  } catch {
    return {
      status: 'error',
      message: 'Unable to get current location. Please enter location manually.',
    };
  }
}