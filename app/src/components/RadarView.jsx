import React, { useState, useEffect, useRef } from 'react';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Calculate distance using Haversine formula
const getDistance = (p1, p2) => {
    const R = 6371; // km
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLon = (p2.lng - p1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Calculate angle from center to point (0 is North, clockwise to 360)
const getAngle = (center, pt) => {
    const dLon = (pt.lng - center.lng) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(pt.lat * Math.PI / 180);
    const x = Math.cos(center.lat * Math.PI / 180) * Math.sin(pt.lat * Math.PI / 180) -
        Math.sin(center.lat * Math.PI / 180) * Math.cos(pt.lat * Math.PI / 180) * Math.cos(dLon);
    let brng = Math.atan2(y, x);
    brng = brng * 180 / Math.PI;
    return (brng + 360) % 360;
};

export default function RadarView({ places, setSelectedPlace, setRadarMode }) {
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [radarCenter, setRadarCenter] = useState(null);
    const [loadingMsg, setLoadingMsg] = useState('');

    const [radarPlaces, setRadarPlaces] = useState([]);

    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef([]);

    useEffect(() => {
        if (window.google) {
            setScriptLoaded(true);
            return;
        }
        const script = document.createElement('script');
        // Load with marker library and v=weekly for AdvancedMarkerElement
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places,marker&v=weekly`;
        script.onload = () => setScriptLoaded(true);
        document.head.appendChild(script);
    }, []);

    const processPlaces = (center) => {
        window.radarCenter = center;
        setLoadingMsg('Đang quét vệ tinh tìm kiếm khu vực...');

        const geocoder = new window.google.maps.Geocoder();
        const requests = places.map((place, idx) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    // Try to use existing lat/lng or geocode
                    if (place.lat && place.lng) {
                        resolve({ ...place, lat: place.lat, lng: place.lng });
                        return;
                    }
                    const addressToGeocode = place.location || place.name;
                    geocoder.geocode({ address: addressToGeocode }, (results, status) => {
                        if (status === 'OK') {
                            resolve({
                                ...place,
                                lat: results[0].geometry.location.lat(),
                                lng: results[0].geometry.location.lng()
                            });
                        } else {
                            // Demo fallback: If geocoding fails, place it randomly within 4km radius
                            const randomAngle = Math.random() * Math.PI * 2;
                            const randomDist = Math.random() * 0.035;
                            resolve({
                                ...place,
                                lat: center.lat + Math.sin(randomAngle) * randomDist,
                                lng: center.lng + Math.cos(randomAngle) * randomDist
                            });
                        }
                    });
                }, idx * 250); // Delay to prevent OVER_QUERY_LIMIT
            });
        });

        Promise.all(requests).then(processed => {
            // Filter strictly inside 5km radius
            const withinRadius = processed.filter(p => {
                if (!p) return false;
                p.distanceKm = getDistance(center, p);
                return p.distanceKm <= 5;
            });
            // Calculate angles for animation sync
            const withAngles = withinRadius.map(p => {
                p.angle = getAngle(center, p);
                return p;
            });
            setRadarPlaces(withAngles);
            setLoadingMsg('');
        });
    };

    const handleUseCurrentLocation = () => {
        if (navigator.geolocation) {
            setLoadingMsg('Đang kích hoạt định vị GPS...');
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const center = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setRadarCenter(center);
                    processPlaces(center);
                },
                (err) => {
                    alert('Lỗi định vị. Trình duyệt của bạn đang chặn quyền truy cập vị trí.');
                    setLoadingMsg('');
                }
            );
        } else {
            alert('Trình duyệt không hỗ trợ vị trí.');
        }
    };

    // Initialize Map and Render Glowing Dots when radarPlaces updates
    useEffect(() => {
        if (!radarCenter || !mapRef.current || !scriptLoaded) return;

        if (!mapInstance.current) {
            const mapOptions = {
                center: radarCenter,
                zoom: 13,
                mapId: 'DEMO_MAP_ID',
                disableDefaultUI: true,
                gestureHandling: "greedy",
            };
            mapInstance.current = new window.google.maps.Map(mapRef.current, mapOptions);
        } else {
            mapInstance.current.setCenter(radarCenter);
        }

        // Clear existing markers
        markersRef.current.forEach(m => m.map = null);
        markersRef.current = [];

        // Build glowing dots using Advanced Marker Element
        radarPlaces.forEach(place => {
            const el = document.createElement('div');
            el.className = 'radar-dot-wrapper inline-flex items-center justify-center';

            const dot = document.createElement('div');
            dot.className = 'radar-dot relative size-4 bg-green-400 rounded-full shadow-[0_0_15px_#4ade80] pointer-events-auto cursor-pointer border border-white/20';

            const pulse = document.createElement('div');
            pulse.className = 'radar-dot-pulse absolute top-1/2 left-1/2 rounded-full border border-green-400 pointer-events-none';
            // Sync animation delay purely through CSS using calculated angle from radar center!
            pulse.style.animationDelay = `${(place.angle / 360) * 4}s`;

            dot.appendChild(pulse);
            el.appendChild(dot);

            el.onclick = () => setSelectedPlace(place);

            const marker = new window.google.maps.marker.AdvancedMarkerElement({
                map: mapInstance.current,
                position: { lat: place.lat, lng: place.lng },
                content: el,
                title: place.name,
            });
            markersRef.current.push(marker);
        });

    }, [radarPlaces, radarCenter, scriptLoaded, setSelectedPlace]);


    if (!scriptLoaded) return <div className="p-8 text-center text-slate-500 min-h-screen flex items-center justify-center">Đang tải Radar Vệ Tinh...</div>;

    return (
        <div className="flex-1 w-full bg-slate-950 min-h-screen py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                            <span className="material-symbols-outlined text-green-500 text-4xl">radar</span>
                            Bản Đồ Radar
                        </h2>
                        <p className="text-slate-400 mt-2">Phạm vi quét tối đa <span className="text-green-500 font-bold">5KM</span> quanh bộ thu.</p>
                    </div>
                </div>

                {!radarCenter ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl max-w-lg mx-auto text-center relative overflow-hidden">
                        {loadingMsg && (
                            <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                                <span className="material-symbols-outlined text-green-500 text-5xl animate-spin mb-4">radar</span>
                                <p className="text-green-500 font-bold font-mono tracking-widest text-sm">{loadingMsg}</p>
                            </div>
                        )}

                        <div className="size-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-green-500 text-4xl">my_location</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-6">Xác định Tâm Radar của bạn</h3>

                        <button
                            onClick={handleUseCurrentLocation}
                            className="w-full bg-green-500 hover:bg-green-600 text-slate-900 font-black py-4 px-6 rounded-2xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">satellite_alt</span>
                            Sử dụng vị trí hiện tại
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center justify-between mb-6 bg-slate-900 px-6 py-4 rounded-2xl border border-green-500/20">
                            <div className="flex items-center gap-3">
                                <div className="size-2 rounded-full bg-green-500 animate-[ping_1.5s_infinite]"></div>
                                <span className="text-green-500 font-mono text-sm tracking-widest font-bold">RADAR ACTIVE &bull; SCANNING {radarPlaces.length} TARGETS</span>
                            </div>
                            <button onClick={() => setRadarCenter(null)} className="text-slate-400 hover:text-white text-sm font-bold bg-slate-800 px-4 py-2 rounded-lg transition-colors">Đổi tâm Radar</button>
                        </div>

                        <div className="relative w-full aspect-square max-w-[600px] md:max-w-[700px] lg:max-w-[800px] mx-auto rounded-full overflow-hidden border-4 border-slate-800 shadow-[0_0_80px_rgba(0,255,128,0.1)] bg-slate-900 pointer-events-auto transform-gpu">
                            {/* The Map itself */}
                            <div id="radar-map" className="w-full h-[150%] top-1/2 -translate-y-1/2 absolute inset-0 z-0" ref={mapRef}></div>

                            {/* Sweeping Conic Gradient */}
                            <div className="radar-sweep"></div>

                            {/* Grid Overlay to block out map edges and make it military */}
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,7,18,0.7)_80%,rgba(2,7,18,0.95)_100%)] pointer-events-none z-[80]"></div>

                            <div className="absolute inset-0 rounded-full border border-green-500/30 shadow-[0_0_30px_rgba(0,255,128,0.2)_inset] pointer-events-none z-[85]"></div>
                            <div className="absolute top-[16.6%] left-[16.6%] w-[66.6%] h-[66.6%] rounded-full border border-dashed border-green-500/20 pointer-events-none z-[85]"></div>
                            <div className="absolute top-[33.3%] left-[33.3%] w-[33.3%] h-[33.3%] rounded-full border border-solid border-green-500/20 pointer-events-none z-[85]"></div>

                            {/* Crosshairs */}
                            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-green-500/30 pointer-events-none z-[90]"></div>
                            <div className="absolute top-1/2 left-0 right-0 h-px bg-green-500/30 pointer-events-none z-[90]"></div>

                            {/* Center Dot */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-3 bg-red-500 rounded-full shadow-[0_0_15px_red] z-[100] cursor-help tooltip" title="Tâm định vị"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
