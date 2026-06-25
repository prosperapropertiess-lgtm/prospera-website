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
    lat: number;
    lng: number;
    city?: string;
    province?: string;
    postal_code?: string;
  }) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Restrict to specific country. Default: "ca" */
  country?: string;
  /** Restrict to specific types. Default: "address" */
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
  const [ready, setReady] = useState(false);

  const handlePlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;

    const formatted = place.formatted_address || "";
    onChange(formatted);

    if (onPlaceSelect) {
      let city = "";
      let province = "";
      let postal_code = "";

      for (const comp of place.address_components || []) {
        if (comp.types.includes("locality")) city = comp.long_name;
        if (comp.types.includes("administrative_area_level_1")) province = comp.short_name;
        if (comp.types.includes("postal_code")) postal_code = comp.long_name;
      }

      onPlaceSelect({
        formatted_address: formatted,
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
      if (autocompleteRef.current) return; // already initialized

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country },
        types: [types],
        fields: ["formatted_address", "geometry", "address_components"],
      });

      autocomplete.addListener("place_changed", handlePlaceChanged);
      autocompleteRef.current = autocomplete;
      setReady(true);
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
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={ready ? placeholder : placeholder}
      className={className}
      style={style}
      autoComplete="off"
    />
  );
}
