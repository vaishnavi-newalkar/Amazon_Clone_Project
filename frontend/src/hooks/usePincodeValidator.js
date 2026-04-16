/**
 * usePincodeValidator - Custom hook for real-time Indian pincode validation
 * Uses the free India Post API: https://api.postalpincode.in/pincode/{pincode}
 */
import { useState, useRef } from 'react';

export function usePincodeValidator() {
  const [status, setStatus]   = useState(null); // null | 'loading' | 'valid' | 'invalid'
  const [info,   setInfo]     = useState(null); // { district, state, postOffices[] }
  const debounceRef = useRef(null);

  /**
   * Call this whenever the pincode field changes.
   * Returns a resolved Promise with { district, state } on success, or null on failure.
   * Callbacks: onSuccess({ district, state }) - called when pincode is valid
   */
  const validate = (pincode, { onSuccess } = {}) => {
    setStatus(null);
    setInfo(null);

    if (!pincode || pincode.length < 6) return;
    if (!/^\d{6}$/.test(pincode)) {
      setStatus('invalid');
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setStatus('loading');
      try {
        const res  = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await res.json();

        if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const po       = data[0].PostOffice[0];
          const result   = { district: po.District, state: po.State, postOffices: data[0].PostOffice };
          setStatus('valid');
          setInfo(result);
          onSuccess?.(result);
        } else {
          setStatus('invalid');
          setInfo(null);
        }
      } catch {
        setStatus(null); // Silently fail on network error
      }
    }, 500);
  };

  return { pincodeStatus: status, pincodeInfo: info, validatePincode: validate };
}
