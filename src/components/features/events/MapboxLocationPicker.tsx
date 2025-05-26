"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl, { LngLatLike, Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css"; // Import Mapbox CSS

// Ensure you have NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your .env.local or environment
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "pk.YOUR_MAPBOX_ACCESS_TOKEN"; 
if (MAPBOX_ACCESS_TOKEN === "pk.YOUR_MAPBOX_ACCESS_TOKEN" && process.env.NODE_ENV !== "test") {
  console.warn(
    "Mapbox Access Token is not configured. Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your environment."
  );
}
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

export interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

interface MapboxLocationPickerProps {
  value?: LocationData;
  onChange: (location?: LocationData) => void;
  disabled?: boolean;
}

const MapboxLocationPicker: React.FC<MapboxLocationPickerProps> = ({ value, onChange, disabled }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState(value?.address || "");
  const [suggestions, setSuggestions] = useState<any[]>([]); // From Mapbox Geocoding API
  const [internalValue, setInternalValue] = useState<LocationData | undefined>(value);

  useEffect(() => {
    setInternalValue(value);
    if (value?.address && value.address !== searchQuery) {
      setSearchQuery(value.address);
    }
    if (mapRef.current && value) {
      const newCenter: LngLatLike = [value.longitude, value.latitude];
      mapRef.current.setCenter(newCenter);
      mapRef.current.setZoom(12);
      if (markerRef.current) {
        markerRef.current.setLngLat(newCenter);
      } else {
        markerRef.current = new Marker().setLngLat(newCenter).addTo(mapRef.current);
      }
    }
  }, [value]);

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return; // Initialize map only once and if container exists

    const initialCenter: LngLatLike = internalValue
      ? [internalValue.longitude, internalValue.latitude]
      : [-74.006, 40.7128]; // Default to New York City
    const initialZoom = internalValue ? 12 : 1.5;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12", // Standard street map
      center: initialCenter,
      zoom: initialZoom,
      interactive: !disabled,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    
    if (internalValue) {
        markerRef.current = new Marker()
            .setLngLat([internalValue.longitude, internalValue.latitude])
            .addTo(mapRef.current);
    }

    // Handle map click to update location (optional)
    mapRef.current.on("click", (e) => {
      if (disabled) return;
      const { lng, lat } = e.lngLat;
      // Reverse geocode to get address
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}`)
        .then(response => response.json())
        .then(data => {
          if (data.features && data.features.length > 0) {
            const selectedFeature = data.features[0];
            const newLocation: LocationData = {
              address: selectedFeature.place_name,
              latitude: lat,
              longitude: lng,
            };
            setSearchQuery(selectedFeature.place_name);
            setInternalValue(newLocation);
            onChange(newLocation);
            if (markerRef.current) {
              markerRef.current.setLngLat([lng, lat]);
            } else {
              markerRef.current = new Marker().setLngLat([lng, lat]).addTo(mapRef.current!);
            }
            mapRef.current?.flyTo({ center: [lng, lat], zoom: 12 });
            setSuggestions([]);
          }
        });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [disabled, internalValue]); // Re-run if disabled changes

  const handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&autocomplete=true`
        );
        const data = await response.json();
        setSuggestions(data.features || []);
      } catch (error) {
        console.error("Error fetching geocoding suggestions:", error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    const newLocation: LocationData = {
      address: suggestion.place_name,
      latitude: suggestion.center[1],
      longitude: suggestion.center[0],
    };
    setSearchQuery(suggestion.place_name);
    setInternalValue(newLocation);
    onChange(newLocation); // Propagate change to form

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [newLocation.longitude, newLocation.latitude],
        zoom: 12,
      });
      if (markerRef.current) {
        markerRef.current.setLngLat([newLocation.longitude, newLocation.latitude]);
      } else {
        markerRef.current = new Marker()
          .setLngLat([newLocation.longitude, newLocation.latitude])
          .addTo(mapRef.current);
      }
    }
    setSuggestions([]);
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search for a location..."
        disabled={disabled}
        className="w-full p-2 border border-input rounded-md shadow-sm focus:ring-ring focus:ring-2 focus:border-ring" // Basic styling, can be improved with shadcn/ui Input if preferred
      />
      {suggestions.length > 0 && (
        <ul className="border border-input rounded-md bg-background shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              {suggestion.place_name}
            </li>
          ))}
        </ul>
      )}
      <div
        ref={mapContainerRef}
        className="w-full h-64 rounded-md border border-input" // Basic styling
        aria-label="Map for location selection"
      />
      {MAPBOX_ACCESS_TOKEN === "pk.YOUR_MAPBOX_ACCESS_TOKEN" && (
         <p className="text-xs text-destructive">
           Mapbox features are limited. Please configure your Mapbox Access Token.
         </p>
      )}
    </div>
  );
};

export default MapboxLocationPicker;
