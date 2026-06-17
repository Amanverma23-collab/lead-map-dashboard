import { useState } from 'react';

const DEFAULT_CITIES = [
  "Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner",
  "Alwar", "Bhilwara", "Sikar", "Pali", "Bharatpur",
  "Sri Ganganagar", "Sawai Madhopur", "Tonk", "Churu",
  "Jhunjhunu", "Dausa", "Nagaur", "Hanumangarh", "Banswara",
];

export default function SettingsPanel({
  apiKey,
  setApiKey,
  searchQuery,
  setSearchQuery,
  cities,
  setCities,
  stateName,
  setStateName,
  isSearching,
}) {
  const [newCity, setNewCity] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleAddCity = (e) => {
    e.preventDefault();
    if (!newCity.trim()) return;
    const cleanCity = newCity.trim();
    if (!cities.includes(cleanCity)) {
      setCities([...cities, cleanCity]);
    }
    setNewCity('');
  };

  const handleRemoveCity = (cityToRemove) => {
    setCities(cities.filter((c) => c !== cityToRemove));
  };

  const handleResetCities = () => {
    setCities(DEFAULT_CITIES);
  };

  const handleClearCities = () => {
    setCities([]);
  };

  return (
    <div className="glass-card">
      <h3 className="card-title">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        Target Configuration
      </h3>

      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="form-label">Google Places API Key</label>
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              marginBottom: '0.4rem',
            }}
          >
            {showKey ? 'Hide key' : 'Show key'}
          </button>
        </div>
        <input
          type={showKey ? 'text' : 'password'}
          className="form-input"
          placeholder="Paste API key here (AIzaSy...)"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={isSearching}
        />
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
          Saved securely in local browser storage.
        </p>

        <button
          type="button"
          className="instruction-toggle"
          onClick={() => setShowHelp(!showHelp)}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '2px' }}>
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          {showHelp ? 'Hide instructions' : 'How to get a free API Key?'}
        </button>

        {showHelp && (
          <div className="instruction-box">
            <h4>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '2px' }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              Google Cloud API Key Guide
            </h4>
            <ol>
              <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer">Google Cloud Console</a> and create a project.</li>
              <li>Setup a <a href="https://console.cloud.google.com/billing" target="_blank" rel="noreferrer">Billing Account</a> (enables Google's $200/month free tier, which allows up to 10k searches).</li>
              <li>Go to the <a href="https://console.cloud.google.com/apis/library/places.googleapis.com" target="_blank" rel="noreferrer">Places API (New) Library Page</a> and click <strong>Enable</strong>.</li>
              <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer">API Credentials Console</a>, click <strong>+ Create Credentials</strong> and select <strong>API Key</strong>.</li>
              <li>Copy and paste your key above, then restrict it to "Places API (New)" in Google settings for safety.</li>
            </ol>
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Business Type / Query</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. packers and movers, dentists, gyms"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isSearching}
        />
      </div>

      <div className="form-group">
        <label className="form-label">State / Region Name</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. Rajasthan, California"
          value={stateName}
          onChange={(e) => setStateName(e.target.value)}
          disabled={isSearching}
        />
      </div>

      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label className="form-label" style={{ margin: 0 }}>
            Cities to Search ({cities.length})
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="city-add-btn"
              style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem' }}
              onClick={handleResetCities}
              disabled={isSearching}
            >
              Reset Default
            </button>
            <button
              type="button"
              className="city-add-btn"
              style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem' }}
              onClick={handleClearCities}
              disabled={isSearching}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="cities-manager">
          {cities.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
              No cities added. Add at least one city below.
            </p>
          ) : (
            <div className="cities-list">
              {cities.map((city) => (
                <span className="city-chip" key={city}>
                  {city}
                  {!isSearching && (
                    <button type="button" onClick={() => handleRemoveCity(city)}>
                      &times;
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        {!isSearching && (
          <form onSubmit={handleAddCity} className="city-input-wrapper">
            <input
              type="text"
              className="form-input"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
              placeholder="Add city name..."
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
            />
            <button type="submit" className="city-add-btn">
              Add
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
