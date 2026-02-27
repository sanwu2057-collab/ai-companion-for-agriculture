import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

interface CurrentWeatherData {
  temperature: number;
  humidity: number;
  windspeed: number;
}

interface DailyWeatherData {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weathercode: number[];
}

interface EarthquakeData {
  id: string;
  mag: number;
  place: string;
  time: number;
  tsunami: number;
}

export default function ClimateDetector() {
  const { t } = useTranslation();
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherData | null>(null);
  const [dailyForecast, setDailyForecast] = useState<DailyWeatherData | null>(null);
  const [earthquakes, setEarthquakes] = useState<EarthquakeData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [locationInput, setLocationInput] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number; name?: string } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [liveUpdates, setLiveUpdates] = useState<string[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);

  const fetchEarthquakeData = async (latitude: number, longitude: number) => {
    try {
      // Fetch earthquakes within 500km radius in the last 30 days
      const response = await fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${latitude}&longitude=${longitude}&maxradiuskm=500&minmagnitude=2.5`);
      if (!response.ok) throw new Error('Failed to fetch earthquake data');
      const data = await response.json();
      const formattedQuakes = data.features.slice(0, 3).map((f: any) => ({
        id: f.id,
        mag: f.properties.mag,
        place: f.properties.place,
        time: f.properties.time,
        tsunami: f.properties.tsunami
      }));
      setEarthquakes(formattedQuakes);
    } catch (err) {
      console.error("Earthquake Fetch Error:", err);
    }
  };

  const fetchWeatherData = async (latitude: number, longitude: number, locationName?: string) => {
    setError(null);
    setCurrentWeather(null);
    setDailyForecast(null);
    setAiAdvice(null);
    setLiveUpdates([]);
    setEarthquakes([]);
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);
      if (!response.ok) {
        throw new Error('Failed to fetch weather data.');
      }
      const data = await response.json();
      setCurrentWeather(data.current_weather);
      setDailyForecast(data.daily);
      fetchEarthquakeData(latitude, longitude);
    } catch (err) {
      setError('Could not fetch weather data.');
      console.error(err);
    }
  };

  const generateLiveUpdate = async () => {
    if (!currentWeather || !API_KEY) return;
    setLiveLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const prompt = `
        As a real-time agricultural climate and geological monitor, provide a single, short, punchy "live update" sentence (max 15 words) based on these conditions:
        - Temperature: ${currentWeather.temperature}°C
        - Wind: ${currentWeather.windspeed} km/h
        ${earthquakes.length > 0 ? `- Recent Seismic Activity: ${earthquakes[0].mag} mag near ${earthquakes[0].place}` : ''}
        
        The update should sound like a live news flash for farmers. Include geological warnings if relevant.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const newUpdate = response.text?.trim() || "Monitoring climate conditions...";
      setLiveUpdates(prev => [newUpdate, ...prev].slice(0, 5));
    } catch (err) {
      console.error("Live Update Error:", err);
    } finally {
      setLiveLoading(false);
    }
  };

  useEffect(() => {
    if (currentWeather) {
      generateLiveUpdate();
    }
  }, [currentWeather, earthquakes]);

  useEffect(() => {
    if (selectedLocation) {
      fetchWeatherData(selectedLocation.latitude, selectedLocation.longitude, selectedLocation.name);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        fetchWeatherData(position.coords.latitude, position.coords.longitude);
      }, () => {
        setError('Geolocation permission denied. Please enter a location.');
      });
    } else {
      setError('Geolocation is not supported by this browser. Please enter a location.');
    }
  }, [selectedLocation]);

  const handleLocationSearch = async () => {
    if (!locationInput) return;
    setLocationLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${locationInput}&count=1&language=en&format=json`);
      if (!response.ok) {
        throw new Error('Failed to fetch location data.');
      }
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const { latitude, longitude, name } = data.results[0];
        setSelectedLocation({ latitude, longitude, name });
      } else {
        setError('Location not found. Please try a different search term.');
      }
    } catch (err) {
      setError('Could not search for location.');
      console.error(err);
    } finally {
      setLocationLoading(false);
    }
  };

  const getAiAdvice = async () => {
    if (!currentWeather || !dailyForecast || !API_KEY) return;
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const prompt = `
        As an agricultural climate and geological hazard expert, analyze the following data for a farmer and provide concise, actionable advice.
        
        Current Weather:
        - Temperature: ${currentWeather.temperature}°C
        - Wind Speed: ${currentWeather.windspeed} km/h
        
        7-Day Forecast (Max/Min Temps):
        ${dailyForecast.time.map((t, i) => `${t}: ${dailyForecast.temperature_2m_max[i]}°C / ${dailyForecast.temperature_2m_min[i]}°C`).join('\n')}
        
        Recent Geological Activity (within 500km):
        ${earthquakes.length > 0 ? earthquakes.map(q => `- Mag ${q.mag} at ${q.place} (${new Date(q.time).toLocaleDateString()}) ${q.tsunami ? '[TSUNAMI WARNING]' : ''}`).join('\n') : 'No significant activity detected.'}

        Please identify:
        1. Immediate risks (frost, heat stress, high winds, seismic/tsunami threats).
        2. Best activities for the next 3 days (planting, harvesting, spraying, irrigation, safety measures).
        3. Crop Suitability: Based on the current temperature and upcoming forecast, which specific crops are most suitable to be planted or maintained right now?
        4. Any long-term climate or geological trends or warnings based on this data.
        
        Keep the response professional, encouraging, and easy to read.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
      });

      setAiAdvice(response.text || "No advice available at this time.");
    } catch (err) {
      console.error("AI Advice Error:", err);
      setAiAdvice("Failed to get AI advice. Please try again later.");
    } finally {
      setAiLoading(false);
    }
  };

  const getWeatherDescription = (code: number) => {
    switch (code) {
      case 0: return 'Clear sky';
      case 1: case 2: case 3: return 'Mainly clear, partly cloudy, and overcast';
      case 45: case 48: return 'Fog and depositing rime fog';
      case 51: case 53: case 55: return 'Drizzle: Light, moderate, and dense intensity';
      case 56: case 57: return 'Freezing Drizzle: Light and dense intensity';
      case 61: case 63: case 65: return 'Rain: Slight, moderate and heavy intensity';
      case 66: case 67: return 'Freezing Rain: Light and heavy intensity';
      case 71: case 73: case 75: return 'Snow fall: Slight, moderate, and heavy intensity';
      case 77: return 'Snow grains';
      case 80: case 81: case 82: return 'Rain showers: Slight, moderate, and violent';
      case 85: case 86: return 'Snow showers: Slight and heavy';
      case 95: return 'Thunderstorm: Slight or moderate';
      case 96: case 99: return 'Thunderstorm with slight and heavy hail';
      default: return 'N/A';
    }
  };

  return (
    <div className="glassmorphism p-8 text-center max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold font-display text-[var(--color-text-primary)] mb-6">{t('climate_detector')}</h2>

      <div className="flex space-x-2 mb-8">
        <input
          type="text"
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          placeholder={t('enter_location')}
          className="w-full p-4 border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] text-[var(--color-text-primary)] rounded-full font-sans focus:outline-none focus:border-[var(--color-neon-blue)]"
          disabled={locationLoading}
        />
        <button
          onClick={handleLocationSearch}
          disabled={!locationInput || locationLoading}
          className="bg-[var(--color-neon-blue)] text-white py-4 px-8 rounded-full font-display font-semibold hover:bg-[var(--color-neon-purple)] transition-all transform hover:scale-105 disabled:bg-gray-700 disabled:text-[var(--color-text-secondary)]"
        >
          {locationLoading ? t('searching') : <Search className="h-6 w-6" />}
        </button>
      </div>

      {error && <p className="text-red-500 mb-6 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}
      
      {liveUpdates.length > 0 && (
        <div className="mb-8 overflow-hidden bg-[var(--color-neon-cyan)]/5 border-y border-[var(--color-neon-cyan)]/20 py-2">
          <div className="flex items-center whitespace-nowrap animate-marquee">
            {liveUpdates.map((update, i) => (
              <span key={i} className="mx-8 text-xs font-mono text-[var(--color-neon-cyan)] flex items-center">
                <span className="w-2 h-2 bg-[var(--color-neon-cyan)] rounded-full mr-2 animate-pulse" />
                {update}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {currentWeather ? (
            <div className="glassmorphism p-6 rounded-2xl border border-[var(--color-neon-cyan)]/30">
              <p className="text-sm font-mono text-[var(--color-text-secondary)] uppercase tracking-widest mb-2">{t('current_conditions')}</p>
              <p className="text-6xl font-bold font-display text-[var(--color-neon-cyan)] mb-4">{currentWeather.temperature}°C</p>
              <div className="flex justify-around text-lg text-[var(--color-text-secondary)]">
                <div className="text-center">
                  <p className="text-xs uppercase opacity-50 mb-1">{t('humidity')}</p>
                  <p className="font-semibold text-[var(--color-text-primary)]">{currentWeather.humidity}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs uppercase opacity-50 mb-1">{t('wind')}</p>
                  <p className="font-semibold text-[var(--color-text-primary)]">{currentWeather.windspeed} km/h</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glassmorphism p-12 rounded-2xl animate-pulse">
              <p className="text-[var(--color-text-secondary)]">{t('loading_weather')}</p>
            </div>
          )}

          {dailyForecast && (
            <div className="glassmorphism p-6 rounded-2xl">
              <h3 className="text-xl font-bold font-display text-[var(--color-text-primary)] mb-4 text-left">{t('daily_forecast')}</h3>
              <div className="space-y-3">
                {dailyForecast.time.slice(0, 5).map((dateString, index) => (
                  <div key={dateString} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-sm font-mono text-[var(--color-text-secondary)] w-24">{new Date(dateString).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    <p className="text-sm font-bold text-[var(--color-neon-cyan)]">{dailyForecast.temperature_2m_max[index]}° / {dailyForecast.temperature_2m_min[index]}°</p>
                    <p className="text-xs text-[var(--color-text-primary)] text-right flex-1 ml-4 truncate">{getWeatherDescription(dailyForecast.weathercode[index])}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glassmorphism p-6 rounded-2xl border border-red-500/20">
            <h3 className="text-xl font-bold font-display text-[var(--color-text-primary)] mb-4 text-left flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
              {t('geological_hazards')}
            </h3>
            {earthquakes.length > 0 ? (
              <div className="space-y-3">
                {earthquakes.map((q) => (
                  <div key={q.id} className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-left">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-red-400">Mag {q.mag}</p>
                      <p className="text-[10px] font-mono text-[var(--color-text-secondary)]">{new Date(q.time).toLocaleString()}</p>
                    </div>
                    <p className="text-xs text-[var(--color-text-primary)] mb-1">{q.place}</p>
                    {q.tsunami === 1 && (
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest animate-bounce">
                        ⚠️ {t('tsunami_warning')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-secondary)] text-left italic">
                {t('no_recent_seismic_activity')}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glassmorphism p-6 rounded-2xl border border-[var(--color-neon-purple)]/30 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold font-display text-[var(--color-text-primary)] flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-[var(--color-neon-purple)]" />
                {t('ai_climate_advisor')}
                <span className="ml-3 text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 uppercase tracking-tighter font-mono">
                  {t('crop_suitability')}
                </span>
              </h3>
              <button
                onClick={getAiAdvice}
                disabled={aiLoading || !currentWeather}
                className="text-xs bg-[var(--color-neon-purple)] text-white px-4 py-2 rounded-full hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {aiLoading ? t('analyzing_advice') : t('refresh_advice')}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto text-left mb-6">
              {aiAdvice ? (
                <div className="prose prose-sm prose-invert max-w-none">
                  <div className="text-[var(--color-text-primary)] whitespace-pre-wrap text-sm leading-relaxed">
                    {aiAdvice}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-secondary)] opacity-50 space-y-4">
                  <Sparkles className="h-12 w-12" />
                  <p className="text-sm">{t('ai_advice_placeholder')}</p>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 pt-4">
              <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-3 uppercase tracking-wider">{t('required_applications')}</h4>
              <div className="grid grid-cols-2 gap-2">
                <button className="text-[10px] bg-white/5 border border-white/10 p-2 rounded-lg hover:bg-white/10 transition-colors text-left">
                  <p className="font-bold text-[var(--color-neon-cyan)]">{t('crop_insurance')}</p>
                  <p className="text-[var(--color-text-secondary)]">{t('crop_insurance_desc')}</p>
                </button>
                <button className="text-[10px] bg-white/5 border border-white/10 p-2 rounded-lg hover:bg-white/10 transition-colors text-left">
                  <p className="font-bold text-[var(--color-neon-blue)]">{t('irrigation_subsidy')}</p>
                  <p className="text-[var(--color-text-secondary)]">{t('irrigation_subsidy_desc')}</p>
                </button>
                <button className="text-[10px] bg-white/5 border border-white/10 p-2 rounded-lg hover:bg-white/10 transition-colors text-left">
                  <p className="font-bold text-[var(--color-neon-purple)]">{t('disaster_relief')}</p>
                  <p className="text-[var(--color-text-secondary)]">{t('disaster_relief_desc')}</p>
                </button>
                <button className="text-[10px] bg-white/5 border border-white/10 p-2 rounded-lg hover:bg-white/10 transition-colors text-left">
                  <p className="font-bold text-green-400">{t('green_credit')}</p>
                  <p className="text-[var(--color-text-secondary)]">{t('green_credit_desc')}</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

