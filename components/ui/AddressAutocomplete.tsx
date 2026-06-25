"use client";
import { useEffect, useRef, useState, useCallback } from "react";

declare global {
  interface Window {
    google: typeof google;
    initGooglePlaces?: () => void;
  }
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: {
    formatted_address: string;
    street_address: string;
    lat: number;
    lng: number;
    city?: string;
    province?: string;
    postal_code?: string;
  }) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  country?: string;
  types?: string;
}

let googleScriptLoaded = false;
let googleScriptLoading = false;
const loadCallbacks: (() => void)[] = [];

function loadGoogleScript() {
  if (googleScriptLoaded) return Promise.resolve();
  if (googleScriptLoading) {
    return new Promise<void>((resolve) => {
      loadCallbacks.push(resolve);
    });
  }

  googleScriptLoading = true;

  return new Promise<void>((resolve) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("[AddressAutocomplete] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not set");
      googleScriptLoading = false;
      resolve();
      return;
    }

    window.initGooglePlaces = () => {
      googleScriptLoaded = true;
      googleScriptLoading = false;
      resolve();
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });
}

export default function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Start typing an address...",
  className = "",
  style = {},
  country = "ca",
  types = "address",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  // Use local state to avoid React/Google DOM fight
  const [localValue, setLocalValue] = useState(value);
  const skipNextSync = useRef(false);

  // Sync parent value → local only when parent changes (not from our own updates)
  useEffect(() => {
    if (!skipNextSync.current) {
      setLocalValue(value);
    }
    skipNextSync.current = false;
  }, [value]);

  const handlePlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;

    // Extract just the street address (number + street name), not the full formatted address
    let streetNumber = "";
    let route = "";
    let city = "";
    let province = "";
    let postal_code = "";

    for (const comp of place.address_components || []) {
      if (comp.types.includes("street_number")) streetNumber = comp.long_name;
      if (comp.types.includes("route")) route = comp.long_name;
      if (comp.types.includes("locality")) city = comp.long_name;
      if (comp.types.includes("administrative_area_level_1")) province = comp.short_name;
      if (comp.types.includes("postal_code")) postal_code = comp.long_name;
    }

    // Build clean street address: "969 Battery St"
    const streetAddress = streetNumber && route
      ? `${streetNumber} ${route}`
      : place.formatted_address?.split(",")[0] || "";

    // Update local state immediately to prevent flicker
    setLocalValue(streetAddress);
    skipNextSync.current = true;
    onChange(streetAddress);

    if (onPlaceSelect) {
      onPlaceSelect({
        formatted_address: place.formatted_address || "",
        street_address: streetAddress,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        city: city || undefined,
        province: province || undefined,
        postal_code: postal_code || undefined,
      });
    }
  }, [onChange, onPlaceSelect]);

  useEffect(() => {
    loadGoogleScript().then(() => {
      if (!window.google?.maps?.places || !inputRef.current) return;
      if (autocompleteRef.current) return;

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country },
        types: [types],
        fields: ["formatted_address", "geometry", "address_components"],
      });

      autocomplete.addListener("place_changed", handlePlaceChanged);
      autocompleteRef.current = autocomplete;
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [country, types, handlePlaceChanged]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={localValue}
      onChange={(e) => {
        setLocalValue(e.target.value);
        onChange(e.target.value);
      }}
      placeholder={placeholder}
      className={className}
      style={style}
      autoComplete="off"
    />
  );
}
