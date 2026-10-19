"use client";
import { useEffect, useRef, useCallback, useState } from "react";

declare global {
  interface Window {
    google: typeof google;
    initGooglePlaces?: () => void;
    gm_authFailure?: () => void;
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
  // Called when Google can't be used (no key, billing off, bad key, script blocked),
  // so the page can offer typing the address by hand instead.
  onUnavailable?: () => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  country?: string;
  types?: string;
}

let googleScriptLoaded = false;
let googleScriptLoading = false;
let googleFailed = false;
const loadCallbacks: (() => void)[] = [];
const failureCallbacks = new Set<() => void>();

function markGoogleFailed() {
  googleFailed = true;
  failureCallbacks.forEach((cb) => cb());
}

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
      markGoogleFailed();
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

    // Google calls this when the key is rejected (billing off, bad key, wrong domain).
    window.gm_authFailure = markGoogleFailed;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      googleScriptLoading = false;
      markGoogleFailed();
      resolve();
    };
    document.head.appendChild(script);
  });
}

export default function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  onUnavailable,
  placeholder = "Start typing an address...",
  className = "",
  style = {},
  country = "ca",
  types = "address",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const isInitialMount = useRef(true);
  const [unavailable, setUnavailable] = useState(false);
  // Parents pass fresh inline callbacks every render. Keep the latest in refs so
  // the Google listener (attached once) always calls the current version —
  // re-attaching per render used to drop the listener after the first keystroke.
  const onChangeRef = useRef(onChange);
  const onPlaceSelectRef = useRef(onPlaceSelect);
  const onUnavailableRef = useRef(onUnavailable);
  useEffect(() => {
    onChangeRef.current = onChange;
    onPlaceSelectRef.current = onPlaceSelect;
    onUnavailableRef.current = onUnavailable;
  });

  // Set initial value only on mount — after that, the input is uncontrolled
  useEffect(() => {
    if (isInitialMount.current && inputRef.current && value) {
      inputRef.current.value = value;
      isInitialMount.current = false;
    }
  }, [value]);

  const handlePlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;

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

    const streetAddress = streetNumber && route
      ? `${streetNumber} ${route}`
      : place.formatted_address?.split(",")[0] || "";

    // Set the input to just the street address
    if (inputRef.current) {
      inputRef.current.value = streetAddress;
    }
    onChangeRef.current(streetAddress);

    if (onPlaceSelectRef.current) {
      onPlaceSelectRef.current({
        formatted_address: place.formatted_address || "",
        street_address: streetAddress,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        city: city || undefined,
        province: province || undefined,
        postal_code: postal_code || undefined,
      });
    }
  }, []);

  useEffect(() => {
    const notify = () => { setUnavailable(true); onUnavailableRef.current?.(); };
    failureCallbacks.add(notify);
    if (googleFailed) notify();

    loadGoogleScript().then(() => {
      if (!window.google?.maps?.places) { markGoogleFailed(); return; }
      if (!inputRef.current || autocompleteRef.current) return;

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country },
        types: [types],
        fields: ["formatted_address", "geometry", "address_components"],
      });

      autocomplete.addListener("place_changed", handlePlaceChanged);
      autocompleteRef.current = autocomplete;
    });

    return () => {
      failureCallbacks.delete(notify);
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [country, types, handlePlaceChanged]);

  return (
    <div style={{ position: "relative" }}>
      <input
        ref={inputRef}
        type="text"
        defaultValue={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        style={style}
        autoComplete="off"
      />
      {!unavailable && (
        <p style={{ fontSize: "12px", color: "#666666", marginTop: "4px" }}>
          Select from the dropdown to capture the full address.
        </p>
      )}
    </div>
  );
}
