import { useEffect, useState } from 'react';
import { BellIcon, BellSlashIcon } from '@heroicons/react/24/outline';

interface PushNotificationManagerProps {
  className?: string;
}

export default function PushNotificationManager({ className = '' }: PushNotificationManagerProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if browser supports push notifications
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscription();
      fetchPublicKey();
    }
  }, []);

  const fetchPublicKey = async () => {
    try {
      const response = await fetch('/api/push/public-key');
      if (response.ok) {
        const data = await response.json();
        setPublicKey(data.publicKey);
      }
    } catch (error) {
      console.error('Error fetching public key:', error);
    }
  };

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const subscribe = async () => {
    if (!publicKey) {
      alert('Push notifications not configured');
      return;
    }

    setLoading(true);
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await registration.update();

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Notification permission denied');
        setLoading(false);
        return;
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Send subscription to server
      const token = localStorage.getItem('token');
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subscription }),
      });

      if (response.ok) {
        setIsSubscribed(true);
        alert('Đã bật thông báo push!');
      } else {
        throw new Error('Failed to subscribe');
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      alert('Lỗi khi bật thông báo push');
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Notify server
      const token = localStorage.getItem('token');
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIsSubscribed(false);
      alert('Đã tắt thông báo push');
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      alert('Lỗi khi tắt thông báo push');
    } finally {
      setLoading(false);
    }
  };

  // Convert VAPID public key to Uint8Array
  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  if (!isSupported) {
    return null; // Don't show if not supported
  }

  return (
    <button
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={loading || !publicKey}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isSubscribed
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${className}`}
      title={isSubscribed ? 'Tắt thông báo push' : 'Bật thông báo push'}
    >
      {isSubscribed ? (
        <>
          <BellIcon className="h-5 w-5" />
          <span>Đã bật thông báo</span>
        </>
      ) : (
        <>
          <BellSlashIcon className="h-5 w-5" />
          <span>Bật thông báo</span>
        </>
      )}
    </button>
  );
}

