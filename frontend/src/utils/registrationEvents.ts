
export const notifyRegistrationEvent = (data?: any) => {
  if (typeof window === 'undefined') return;
  try {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('slotify_registrations');
      channel.postMessage({ type: 'SHOP_REGISTERED', timestamp: Date.now(), data });
      channel.close();
    }
    localStorage.setItem('slotify_last_registration', Date.now().toString());
  } catch (err) {
    console.error('Failed to broadcast registration event:', err);
  }
};
