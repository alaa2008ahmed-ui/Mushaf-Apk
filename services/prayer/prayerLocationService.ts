import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { getLocalizedLocationName } from '../../utils/prayerAndWorship/prayerTimesTranslations';
import { isMainAppEntered } from '../../utils/notifications/permissionHelper';
import { getCountryInfo, LocationSearchSuggestion } from '../locationSearchService';
import { computeTimesSync, fetchWithTimeout } from './prayerCalculationService';
import { PrayerLocation } from './prayerTypesAndConfig';

interface RefreshLocationCallbacks {
    isEn: boolean;
    isManualUserAction: boolean;
    onImmediateTimes: (result: NonNullable<ReturnType<typeof computeTimesSync>>) => void;
    onLocationResolved: (location: PrayerLocation, resetOffsets: boolean) => void;
    onResetOffsetsOnly: () => void;
}

const fetchLocationByIP = async (isEn: boolean): Promise<PrayerLocation | null> => {
    const fallbacks = [
        {
            url: 'https://ipwho.is/',
            parser: (data: any): PrayerLocation => {
                const rawCityGov = `${data.city || ''}${data.region ? ` - ${data.region}` : ''}`;
                const rawCountry = data.country || '';
                const cityGovAr = getLocalizedLocationName(rawCityGov, 'ar');
                const cityGovEn = getLocalizedLocationName(rawCityGov, 'en');
                const fullCountryAr = getLocalizedLocationName(rawCountry, 'ar');
                const fullCountryEn = getLocalizedLocationName(rawCountry, 'en');
                return {
                    lat: parseFloat(data.latitude),
                    lng: parseFloat(data.longitude),
                    cityGov: isEn ? cityGovEn : cityGovAr,
                    fullCountry: isEn ? fullCountryEn : fullCountryAr,
                    cityGovAr,
                    cityGovEn,
                    fullCountryAr,
                    fullCountryEn,
                    combinedCode: data.calling_code ? `+${data.calling_code}` : '',
                    source: 'ip'
                };
            }
        },
        {
            url: 'https://ipapi.co/json/',
            parser: (data: any): PrayerLocation => {
                const rawCityGov = `${data.city || ''}${data.region ? ` - ${data.region}` : ''}`;
                const rawCountry = data.country_name || '';
                const cityGovAr = getLocalizedLocationName(rawCityGov, 'ar');
                const cityGovEn = getLocalizedLocationName(rawCityGov, 'en');
                const fullCountryAr = getLocalizedLocationName(rawCountry, 'ar');
                const fullCountryEn = getLocalizedLocationName(rawCountry, 'en');
                return {
                    lat: parseFloat(data.latitude),
                    lng: parseFloat(data.longitude),
                    cityGov: isEn ? cityGovEn : cityGovAr,
                    fullCountry: isEn ? fullCountryEn : fullCountryAr,
                    cityGovAr,
                    cityGovEn,
                    fullCountryAr,
                    fullCountryEn,
                    combinedCode: data.country_calling_code || '',
                    source: 'ip'
                };
            }
        },
        {
            url: 'https://freeipapi.com/api/json',
            parser: (data: any): PrayerLocation => {
                const rawCityGov = `${data.cityName || ''}${data.regionName ? ` - ${data.regionName}` : ''}`;
                const rawCountry = data.countryName || '';
                const cityGovAr = getLocalizedLocationName(rawCityGov, 'ar');
                const cityGovEn = getLocalizedLocationName(rawCityGov, 'en');
                const fullCountryAr = getLocalizedLocationName(rawCountry, 'ar');
                const fullCountryEn = getLocalizedLocationName(rawCountry, 'en');
                return {
                    lat: parseFloat(data.latitude),
                    lng: parseFloat(data.longitude),
                    cityGov: isEn ? cityGovEn : cityGovAr,
                    fullCountry: isEn ? fullCountryEn : fullCountryAr,
                    cityGovAr,
                    cityGovEn,
                    fullCountryAr,
                    fullCountryEn,
                    combinedCode: data.countryCode || '',
                    source: 'ip'
                };
            }
        }
    ];

    for (const service of fallbacks) {
        try {
            const res = await fetchWithTimeout(service.url, { cache: 'no-cache' }, 3500);
            if (!res.ok) continue;
            const data = await res.json();
            const newLoc = service.parser(data);
            if (newLoc && !isNaN(newLoc.lat) && !isNaN(newLoc.lng)) {
                return newLoc;
            }
        } catch (e) {
            console.warn(`IP location fetch failed for ${service.url}:`, e);
        }
    }
    return null;
};

export const getBestHighAccuracyPosition = async (
    timeoutMs: number,
    refineWindowMs = 4200
): Promise<{ latitude: number; longitude: number; accuracy: number }> => {
    const initialPos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 0
    });

    let bestLat = initialPos.coords.latitude;
    let bestLng = initialPos.coords.longitude;
    let bestAcc =
        typeof initialPos.coords.accuracy === 'number' && !isNaN(initialPos.coords.accuracy)
            ? initialPos.coords.accuracy
            : 9999;

    // If accuracy is already pinpoint (<= 25m) or no refinement window requested, return immediately
    if (bestAcc <= 25 || refineWindowMs <= 0) {
        return { latitude: bestLat, longitude: bestLng, accuracy: bestAcc };
    }

    // Refine coarse cell/Wi-Fi fix via a brief watchPosition window to lock onto GPS satellites
    return await new Promise((resolve) => {
        let settled = false;
        let watchId: string | null = null;

        const finish = () => {
            if (settled) return;
            settled = true;
            if (watchId !== null) {
                Geolocation.clearWatch({ id: watchId }).catch(() => {});
                watchId = null;
            }
            resolve({ latitude: bestLat, longitude: bestLng, accuracy: bestAcc });
        };

        const timer = window.setTimeout(finish, refineWindowMs);

        Geolocation.watchPosition(
            { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 },
            (position, err) => {
                if (settled || err || !position?.coords) return;
                const { latitude, longitude, accuracy } = position.coords;
                const acc = typeof accuracy === 'number' && !isNaN(accuracy) ? accuracy : 9999;
                if (acc <= bestAcc) {
                    bestLat = latitude;
                    bestLng = longitude;
                    bestAcc = acc;
                }
                if (bestAcc <= 20) {
                    window.clearTimeout(timer);
                    finish();
                }
            }
        )
            .then((id) => {
                if (settled) {
                    Geolocation.clearWatch({ id }).catch(() => {});
                } else {
                    watchId = id;
                }
            })
            .catch(() => {
                window.clearTimeout(timer);
                finish();
            });
    });
};

export const refreshDeviceLocation = ({
    isEn,
    isManualUserAction,
    onImmediateTimes,
    onLocationResolved,
    onResetOffsetsOnly
}: RefreshLocationCallbacks): Promise<void> => {
    return new Promise<void>(async (resolve, reject) => {
        let gpsResolved = false;

        const tryIP = async (): Promise<boolean> => {
            const newLoc = await fetchLocationByIP(isEn);
            if (!newLoc || gpsResolved) return false;
            const immediateTimes = computeTimesSync(newLoc, new Date(), isEn);
            if (immediateTimes && !gpsResolved) {
                onImmediateTimes(immediateTimes);
            }
            if (!gpsResolved) {
                onLocationResolved(newLoc, isManualUserAction);
            }
            return true;
        };

        let ipResolved = false;
        if (!isManualUserAction) {
            tryIP()
                .then(success => {
                    if (success) {
                        ipResolved = true;
                        resolve();
                    }
                })
                .catch(() => {});
        }

        try {
            if (Capacitor.isNativePlatform()) {
                const permStatus = await Geolocation.checkPermissions();
                if (permStatus.location !== 'granted') {
                    if (!isManualUserAction && !isMainAppEntered()) {
                        throw new Error('Defer location permission prompt during splash/welcome');
                    }
                    const requestStatus = await Geolocation.requestPermissions();
                    if (requestStatus.location !== 'granted') {
                        throw new Error('Location permission denied');
                    }
                }
            }

            const timeoutVal = isManualUserAction ? 12000 : 6000;
            const { latitude, longitude, accuracy } = await getBestHighAccuracyPosition(
                timeoutVal,
                isManualUserAction ? 4200 : 2500
            );
            gpsResolved = true;

            let newLoc: PrayerLocation = {
                lat: latitude,
                lng: longitude,
                accuracy,
                source: 'gps',
                cityGov: isEn ? 'Current Location' : 'موقعي الحالي',
                fullCountry: '',
                combinedCode: '',
                cityGovAr: 'موقعي الحالي',
                cityGovEn: 'Current Location',
                fullCountryAr: '',
                fullCountryEn: ''
            };

            const immediateGpsTimes = computeTimesSync(newLoc, new Date(), isEn);
            if (immediateGpsTimes) {
                onImmediateTimes(immediateGpsTimes);
            }
            // Push exact GPS coordinates immediately before waiting for reverse-geocode network latency
            onLocationResolved(newLoc, isManualUserAction);

            try {
                const langParam = isEn ? 'en,ar' : 'ar,en';
                const res = await fetchWithTimeout(
                    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=${langParam}`,
                    {},
                    5000
                );
                const data = await res.json();
                if (data && data.address) {
                    const addr = data.address;
                    const city = addr.city || addr.town || addr.municipality || addr.village || addr.suburb || (isEn ? 'Current Location' : 'موقعي');
                    const countryInfo = getCountryInfo(addr.country_code, addr.country, city);
                    const rawCityGov = `${city}${addr.state ? ` - ${addr.state}` : ''}`;
                    const cityGovAr = getLocalizedLocationName(rawCityGov, 'ar');
                    const cityGovEn = getLocalizedLocationName(rawCityGov, 'en');
                    const fullCountryAr = countryInfo.fullNameAr || getLocalizedLocationName(countryInfo.fullName, 'ar');
                    const fullCountryEn = countryInfo.fullNameEn || getLocalizedLocationName(countryInfo.fullName, 'en');
                    newLoc = {
                        ...newLoc,
                        cityGov: isEn ? cityGovEn : cityGovAr,
                        fullCountry: isEn ? fullCountryEn : fullCountryAr,
                        cityGovAr,
                        cityGovEn,
                        fullCountryAr,
                        fullCountryEn,
                        combinedCode: countryInfo.combinedCode
                    };
                } else {
                    throw new Error('No address');
                }
            } catch (e) {
                try {
                    const res2 = await fetchWithTimeout(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${isEn ? 'en' : 'ar'}`,
                        {},
                        5000
                    );
                    const data2 = await res2.json();
                    if (data2 && data2.countryName) {
                        const rawCity = data2.city || data2.locality || (isEn ? 'Current Location' : 'موقعي الحالي');
                        const cityGovAr = getLocalizedLocationName(rawCity, 'ar');
                        const cityGovEn = getLocalizedLocationName(rawCity, 'en');
                        const fullCountryAr = getLocalizedLocationName(data2.countryName, 'ar');
                        const fullCountryEn = getLocalizedLocationName(data2.countryName, 'en');
                        newLoc = {
                            ...newLoc,
                            cityGov: isEn ? cityGovEn : cityGovAr,
                            fullCountry: isEn ? fullCountryEn : fullCountryAr,
                            cityGovAr,
                            cityGovEn,
                            fullCountryAr,
                            fullCountryEn,
                            combinedCode: ''
                        };
                    } else {
                        throw new Error('No data');
                    }
                } catch (err) {
                    newLoc.cityGov = isEn ? 'Current Location' : 'موقعي الحالي';
                    newLoc.cityGovAr = 'موقعي الحالي';
                    newLoc.cityGovEn = 'Current Location';
                }
            }

            onLocationResolved(newLoc, false);
            resolve();
        } catch (err) {
            console.warn('Geolocation GPS failed or timed out, trying/relying on IP:', err);
            if (!ipResolved) {
                const ok = await tryIP();
                if (ok) {
                    resolve();
                } else {
                    if (isManualUserAction) {
                        onResetOffsetsOnly();
                    }
                    reject(err);
                }
            }
        }
    });
};

export const searchLocationByQuery = async (query: string, isEn: boolean): Promise<PrayerLocation | null> => {
    if (!query) return null;
    const langParam = isEn ? 'en,ar' : 'ar,en';
    const res = await fetchWithTimeout(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&accept-language=${langParam}&limit=1`,
        {},
        5000
    );
    const data = await res.json();
    if (data && data.length > 0) {
        const addr = data[0].address;
        const name = addr.city || addr.town || addr.village || query;
        const province = addr.state || '';
        const countryInfo = getCountryInfo(addr.country_code, addr.country, name);
        const rawCityGov = `${name}${province ? ` - ${province}` : ''}`;
        const cityGovAr = getLocalizedLocationName(rawCityGov, 'ar');
        const cityGovEn = getLocalizedLocationName(rawCityGov, 'en');
        const fullCountryAr = countryInfo.fullNameAr || getLocalizedLocationName(countryInfo.fullName, 'ar');
        const fullCountryEn = countryInfo.fullNameEn || getLocalizedLocationName(countryInfo.fullName, 'en');
        return {
            cityGov: isEn ? cityGovEn : cityGovAr,
            fullCountry: isEn ? fullCountryEn : fullCountryAr,
            cityGovAr,
            cityGovEn,
            fullCountryAr,
            fullCountryEn,
            combinedCode: countryInfo.combinedCode,
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            source: 'manual'
        };
    }
    throw new Error('لم يتم العثور على نتائج');
};

export const buildLocationFromSuggestion = (suggestion: LocationSearchSuggestion, isEn: boolean): PrayerLocation => {
    const cityGovAr = suggestion.cityGovAr || suggestion.titleAr;
    const cityGovEn = suggestion.cityGovEn || suggestion.titleEn;
    const fullCountryAr = suggestion.fullCountryAr || suggestion.titleAr;
    const fullCountryEn = suggestion.fullCountryEn || suggestion.titleEn;

    return {
        cityGov: isEn ? cityGovEn : cityGovAr,
        fullCountry: isEn ? fullCountryEn : fullCountryAr,
        cityGovAr,
        cityGovEn,
        fullCountryAr,
        fullCountryEn,
        combinedCode: suggestion.combinedCode || '',
        lat: suggestion.lat,
        lng: suggestion.lng,
        source: 'manual'
    };
};
