export interface GeolocationResult {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

export const GeolocationService = {
  /**
   * Get the current position with a two-stage strategy:
   * 1. Quick low-accuracy fix (timeout 5s) — gives a result fast
   * 2. High-accuracy refinement (timeout 10s) — improves if possible
   *
   * The Promise resolves as soon as the first good result arrives.
   */
  getCurrentPosition: (): Promise<GeolocationResult> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }

      let resolved = false;

      const onSuccess = (pos: GeolocationPosition) => {
        if (resolved) return;
        resolved = true;
        resolve({
          coords: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          },
        });
      };

      const onError = (err: GeolocationPositionError) => {
        if (resolved) return;
        resolved = true;
        let message = 'Could not get your location.';
        if (err.code === err.PERMISSION_DENIED) {
          message = 'Location permission denied. Please allow access in your browser settings.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          message = 'Location unavailable. Try searching by address instead.';
        } else if (err.code === err.TIMEOUT) {
          message = 'Location request timed out. Try searching by address instead.';
        }
        reject(new Error(message));
      };

      // Stage 1: fast coarse fix (network/cell tower)
      navigator.geolocation.getCurrentPosition(onSuccess, () => {
        // Stage 1 failed — try high accuracy
        navigator.geolocation.getCurrentPosition(onSuccess, onError, {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0,
        });
      }, {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 30000,
      });
    });
  },

  /**
   * Watch position with automatic cleanup. Returns an unsubscribe function.
   */
  watchPosition: (
    onUpdate: (result: GeolocationResult) => void,
    onError?: (err: Error) => void,
  ): (() => void) => {
    if (!navigator.geolocation) {
      onError?.(new Error('Geolocation is not supported.'));
      return () => {};
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        onUpdate({
          coords: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          },
        });
      },
      (err) => {
        onError?.(new Error(err.message));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
    );

    return () => navigator.geolocation.clearWatch(id);
  },
};
