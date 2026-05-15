'use client';

/**
 * COMPONENT: Titanium Order Map (SIAU NAVIGATOR V11.002)
 * SOP: Penegakan kedaulatan rute berdasarkan jenis pesanan (Fixed UMKM vs Track Record).
 * FIX: Jalur navigasi UMKM murni dipaksa melewati titik Toko (Fixed Waypoint).
 */

import React, { useEffect, useState } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  useMapsLibrary, 
  useMap
} from '@vis.gl/react-google-maps';
import { googleMapsApiKey } from '@/firebase/config';
import { AlertCircle, Loader2 } from 'lucide-react';

interface OrderMapProps {
  destLat: number;
  destLng: number;
  courierLat?: number;
  courierLng?: number;
  shopLat?: number;
  shopLng?: number;
  targetShops?: Array<{ id: string, name: string, lat: number, lng: number }>;
  isDelivering?: boolean;
}

export default function OrderMap({ destLat, destLng, courierLat, courierLng, shopLat, shopLng, targetShops, isDelivering }: OrderMapProps) {
  const [mapError, setMapError] = useState<string | null>(null);

  const center = { 
    lat: destLat || -2.7482, 
    lng: destLng || 125.4056 
  };

  if (!googleMapsApiKey) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted/20 text-destructive p-6 text-center">
         <AlertCircle className="h-10 w-10 mb-2" />
         <p className="text-[10px] font-black uppercase">API Key Diperlukan</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-muted/10 overflow-hidden isolate">
      <APIProvider 
        apiKey={googleMapsApiKey} 
        onError={(err) => {
          console.error("Google Maps API Error:", err);
          setMapError("Sinkronisasi Radar...");
        }}
      >
        <Map
          defaultCenter={center}
          defaultZoom={14}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          mapId="96f912c7b6e7de242326ab31"
          className="w-full h-full"
        >
          {mapError ? (
            <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
               <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
               <h3 className="text-sm font-black uppercase text-primary tracking-tighter">Menghubungkan Radar...</h3>
            </div>
          ) : (
            <>
              <Directions 
                courierLat={courierLat} courierLng={courierLng} 
                shopLat={shopLat} shopLng={shopLng}
                targetShops={targetShops}
                destLat={destLat} destLng={destLng} 
              />

              {/* MARKER MEMBER: TUJUAN AKHIR */}
              {destLat !== 0 && (
                <AdvancedMarker position={{ lat: destLat, lng: destLng }}>
                  <div className="relative flex flex-col items-center">
                     <div className="absolute -inset-4 bg-primary/20 rounded-full animate-ping opacity-50" />
                     <div className="bg-white p-2 rounded-xl shadow-2xl border-2 border-primary relative z-10">
                        <img src="https://cdn-icons-png.flaticon.com/512/9356/9356230.png" className="w-6 h-6" alt="Home" />
                     </div>
                  </div>
                </AdvancedMarker>
              )}

              {/* MARKER TOKO (PURE UMKM) */}
              {shopLat && shopLat !== 0 && (
                <AdvancedMarker position={{ lat: shopLat, lng: shopLng }}>
                   <div className="relative flex flex-col items-center">
                      <div className="bg-white p-2 rounded-xl shadow-2xl border-2 border-orange-600">
                         <img src="https://cdn-icons-png.flaticon.com/512/11550/11550478.png" className="w-6 h-6" alt="Shop" />
                      </div>
                   </div>
                </AdvancedMarker>
              )}

              {/* MARKER TOKO (MULTI SHOP) */}
              {targetShops?.map((sh) => (
                sh.lat !== 0 && (
                  <AdvancedMarker key={sh.id} position={{ lat: sh.lat, lng: sh.lng }}>
                     <div className="relative flex flex-col items-center group">
                        <div className="bg-white p-1.5 rounded-lg shadow-xl border-2 border-orange-600 scale-90">
                           <img src="https://cdn-icons-png.flaticon.com/512/11550/11550478.png" className="w-5 h-5" alt="Shop" />
                        </div>
                     </div>
                  </AdvancedMarker>
                )
              ))}

              {/* MARKER KURIR: LIVE TRACKER */}
              {courierLat && courierLat !== 0 && (
                <AdvancedMarker position={{ lat: courierLat, lng: courierLng }}>
                  <div className="relative flex flex-col items-center">
                     <div className="absolute -inset-4 bg-green-500/30 rounded-full animate-pulse" />
                     <div className="bg-white p-2 rounded-xl shadow-2xl border-2 border-green-600 relative z-10">
                        <img src="https://cdn-icons-png.flaticon.com/512/2972/2972185.png" className="w-7 h-7" alt="Motor" />
                     </div>
                  </div>
                </AdvancedMarker>
              )}
            </>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}

function Directions({ courierLat, courierLng, shopLat, shopLng, targetShops, destLat, destLng }: any) {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();

  useEffect(() => {
    if (!routesLibrary || !map) return;
    const renderer = new routesLibrary.DirectionsRenderer({ 
      map, suppressMarkers: true, 
      polylineOptions: { strokeColor: '#1768B3', strokeOpacity: 0.8, strokeWeight: 8 }
    });
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(renderer);
    return () => renderer.setMap(null);
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer || !destLat || destLat === 0 || !destLng || destLng === 0) return;

    let origin: google.maps.LatLngLiteral | null = null;
    let waypoints: google.maps.DirectionsWaypoint[] = [];
    const destination = { lat: destLat, lng: destLng };

    // SOP V12.000: PENETAPAN ORIGIN & WAYPOINTS
    if (courierLat && courierLat !== 0) {
      origin = { lat: courierLat, lng: courierLng };
    } else if (shopLat && shopLat !== 0) {
      origin = { lat: shopLat, lng: shopLng };
    }

    if (!origin) return;

    // TAMBAHKAN TOKO SEBAGAI WAYPOINT WAJIB JIKA KURIR SEDANG AKTIF
    if (shopLat && shopLat !== 0) {
      waypoints.push({ location: { lat: shopLat, lng: shopLng }, stopover: true });
    }
    if (targetShops && targetShops.length > 0) {
      targetShops.forEach((sh: any) => {
        if (sh.lat && sh.lat !== 0) {
          waypoints.push({ location: { lat: sh.lat, lng: sh.lng }, stopover: true });
        }
      });
    }

    directionsService.route({
      origin, destination, waypoints,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING,
    }).then((response) => {
      directionsRenderer.setDirections(response);
    }).catch((err) => {
      console.warn("[Radar Maps]: Directions request sync...");
    });
  }, [directionsService, directionsRenderer, courierLat, courierLng, shopLat, shopLng, targetShops, destLat, destLng]);

  return null;
}
