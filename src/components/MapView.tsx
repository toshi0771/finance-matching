'use client';

import { useEffect, useRef } from 'react';
import { FinanceCompany } from '@/lib/supabase';

// Osaka center
const OSAKA_CENTER = { lat: 34.6937, lng: 135.5023 };
const OSAKA_ZOOM = 11;

// Fuzzy jitter: ±~400m in each axis
function jitter(seed: string, axis: 'lat' | 'lng'): number {
  let h = 0;
  const str = seed + axis;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  const norm = ((h >>> 0) / 0xffffffff) * 2 - 1;
  return norm * 0.004;
}

// Category pin colors (design spec v5)
const CATEGORY_COLORS: Record<string, string> = {
  個人融資:       '#3B82F6', // blue
  法人融資:       '#7C3AED', // violet
  不動産担保融資: '#D97706', // amber
  手形割引:       '#059669', // emerald
  ファクタリング: '#DC2626', // red
};
const DEFAULT_COLOR = '#6B7280';
const SELECTED_COLOR = '#C9A84C'; // gold accent

function getCategoryColor(categories: { category: string }[]): string {
  if (categories.length === 0) return DEFAULT_COLOR;
  return CATEGORY_COLORS[categories[0].category] ?? DEFAULT_COLOR;
}

function makeSvgPin(color: string, size: 'normal' | 'large' = 'normal'): string {
  const w = size === 'large' ? 36 : 28;
  const h = size === 'large' ? 46 : 36;
  const r1 = size === 'large' ? 18 : 14;
  const r2 = size === 'large' ? 10 : 8;
  const cx = r1;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <circle cx="${cx}" cy="${r1}" r="${r1}" fill="${color}" opacity="0.22"/>
      <circle cx="${cx}" cy="${r1}" r="${r2}" fill="${color}"/>
      <line x1="${cx}" y1="${r1 + r2}" x2="${cx}" y2="${h - 2}" stroke="${color}" stroke-width="2"/>
    </svg>
  `.trim();
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GoogleMaps = any;

declare global {
  interface Window {
    google: { maps: GoogleMaps };
    initGoogleMap?: () => void;
  }
}

type Props = {
  companies: FinanceCompany[];
  selectedCategory: string;
  onSelectCompany: (id: string) => void;
  selectedId: string | null;
};

export default function MapView({ companies, selectedCategory, onSelectCompany, selectedId }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Map<string, any>>(new Map());

  const filtered =
    selectedCategory === 'all'
      ? companies
      : companies.filter(c =>
          c.company_categories.some(cc => cc.category === selectedCategory)
        );

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !mapRef.current) return;

    const initMap = () => {
      if (!mapRef.current) return;
      const map = new window.google.maps.Map(mapRef.current, {
        center: OSAKA_CENTER,
        zoom: OSAKA_ZOOM,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        ],
      });
      mapInstanceRef.current = map;
      renderMarkers(map);
    };

    if (window.google?.maps) {
      initMap();
    } else if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      const pending = document.querySelector<HTMLScriptElement>(
        'script[src*="maps.googleapis.com/maps/api/js"]'
      )!;
      pending.addEventListener('load', initMap);
    } else {
      window.initGoogleMap = initMap;
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function renderMarkers(map: any) {
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current.clear();

    filtered.forEach(company => {
      if (company.lat == null || company.lng == null) return;

      const lat = company.lat + jitter(company.id, 'lat');
      const lng = company.lng + jitter(company.id, 'lng');
      const color = getCategoryColor(company.company_categories);

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map,
        title: company.name,
        icon: {
          url: makeSvgPin(color),
          scaledSize: new window.google.maps.Size(28, 36),
          anchor: new window.google.maps.Point(14, 34),
        },
      });

      marker.addListener('click', () => {
        onSelectCompany(company.id);
      });

      markersRef.current.set(company.id, marker);
    });
  }

  useEffect(() => {
    if (mapInstanceRef.current) {
      renderMarkers(mapInstanceRef.current);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered.length, selectedCategory]);

  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const company = companies.find(c => c.id === id);
      if (!company) return;
      const isSelected = id === selectedId;
      const color = isSelected ? SELECTED_COLOR : getCategoryColor(company.company_categories);
      const size = isSelected ? 'large' : 'normal';
      marker.setIcon({
        url: makeSvgPin(color, size),
        scaledSize: new window.google.maps.Size(isSelected ? 36 : 28, isSelected ? 46 : 36),
        anchor: new window.google.maps.Point(isSelected ? 18 : 14, isSelected ? 44 : 34),
      });
    });
  }, [selectedId, companies]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div
        className="flex items-center justify-center w-full h-full text-sm"
        style={{ background: '#E8EDF2', color: '#6B7A8D' }}
      >
        Google Maps APIキーが設定されていません
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" />;
}
