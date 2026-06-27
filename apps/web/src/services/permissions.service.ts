export const PermissionsService = {
  requestCamera: async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately, just testing permission
      return true;
    } catch {
      return false;
    }
  },
  
  requestLocation: async (): Promise<boolean> => {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state === 'granted' || result.state === 'prompt';
    } catch {
      return false;
    }
  }
};
