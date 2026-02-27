import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export default function WeatherAlerts() {
  const { t } = useTranslation();
  const [location, setLocation] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [status, setStatus] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    const subscription = localStorage.getItem('weather-alert-subscription');
    if (subscription) {
      const { location: savedLocation } = JSON.parse(subscription);
      setLocation(savedLocation);
      setIsSubscribed(true);
      setStatus(t('subscribed_for_alerts', { location: savedLocation }));
    }

    if (isSubscribed && 'Notification' in window && Notification.permission === 'granted') {
      const interval = setInterval(() => {
        fetchWeatherAlerts(location);
      }, 300000); // Check every 5 minutes

      return () => clearInterval(interval);
    }
  }, [isSubscribed, location, t]);

  const fetchWeatherAlerts = async (loc: string) => {
    if (!OPENWEATHER_API_KEY) {
      console.error('OpenWeather API key is missing.');
      setStatus(t('openweather_api_key_missing'));
      return;
    }
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${loc}&appid=${OPENWEATHER_API_KEY}`);
      const data = await response.json();

      if (data.weather && data.weather[0].main.toLowerCase().includes('rain')) {
        new Notification(t('weather_alert_title'), {
          body: t('weather_alert_body', { location: loc, condition: data.weather[0].description }) as string,
        });
      }
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      setStatus(t('error_fetching_weather_alerts'));
    }
  };

  const handleSubscribe = async () => {
    if (!location) {
      setStatus(t('enter_location_to_subscribe'));
      return;
    }

    if (!('Notification' in window)) {
      setStatus(t('browser_no_notification_support'));
      return;
    }

    if (Notification.permission === 'granted') {
      subscribeUser();
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        subscribeUser();
      } else {
        setStatus(t('notification_permission_denied'));
      }
    }
  };

  const subscribeUser = () => {
    localStorage.setItem('weather-alert-subscription', JSON.stringify({ location }));
    setIsSubscribed(true);
    setStatus(t('subscribed_success', { location }));
    new Notification(t('subscription_successful'), {
      body: t('will_receive_alerts', { location }) as string,
    });
  };

  const handleUnsubscribe = () => {
    localStorage.removeItem('weather-alert-subscription');
    setIsSubscribed(false);
    setStatus(t('unsubscribed_from_alerts'));
  };

  const handleUseCurrentLocation = () => {
    setLoadingLocation(true);
    setStatus(t('fetching_location'));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Reverse geocoding to get city name (requires another API, for simplicity, we'll use lat/lon for OpenWeatherMap directly or a placeholder)
          // For now, we'll just set a generic location string or use a reverse geocoding service.
          // A simple approach for OpenWeatherMap is to use lat/lon directly, but the current API call expects a city name.
          // For a full solution, a reverse geocoding API would be needed here.
          // For demonstration, we'll use a placeholder or instruct the user to manually enter after getting lat/lon.
          // Let's assume we can get a city name from OpenWeatherMap's API with lat/lon.
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}`)
            .then(res => res.json())
            .then(data => {
              if (data.name) {
                setLocation(data.name);
                setStatus(t('location_fetched_success', { location: data.name }));
              } else {
                setStatus(t('could_not_determine_city'));
              }
            })
            .catch(error => {
              console.error('Error during reverse geocoding:', error);
              setStatus(t('error_fetching_location_data'));
            })
            .finally(() => setLoadingLocation(false));
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLoadingLocation(false);
          if (error.code === error.PERMISSION_DENIED) {
            setStatus(t('geolocation_permission_denied'));
          } else {
            setStatus(t('failed_to_fetch_location_data'));
          }
        }
      );
    } else {
      setLoadingLocation(false);
      setStatus(t('geolocation_not_supported'));
    }
  };

  return (
    <div className="p-8 bg-gray-100 dark:bg-gray-800 min-h-screen">
      <h1 className="text-4xl font-bold font-display mb-8 text-center text-gray-800 dark:text-white">{t('weather_alerts')}</h1>
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-md p-8">
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">{t('weather_alerts_description')}</p>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input 
            type="text" 
            value={location} 
            onChange={e => setLocation(e.target.value)} 
            placeholder={t('enter_location')} 
            className="flex-grow p-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubscribed || loadingLocation}
          />
          {!isSubscribed && (
            <button 
              onClick={handleUseCurrentLocation} 
              disabled={loadingLocation} 
              className="p-3 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
            >
              {loadingLocation ? t('fetching_location') : <><MapPin size={20} className="mr-2" /> {t('use_current_location')}</>}
            </button>
          )}
          {isSubscribed ? (
            <button onClick={handleUnsubscribe} className="p-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
              {t('unsubscribe')}
            </button>
          ) : (
            <button onClick={handleSubscribe} className="p-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              {t('subscribe')}
            </button>
          )}
        </div>
        {status && <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">{status}</p>}
      </div>
    </div>
  );
}
