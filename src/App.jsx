import { useState, useEffect, useRef } from 'react';
import SettingsPanel from './components/SettingsPanel';
import ProgressPanel from './components/ProgressPanel';
import StatsCard from './components/StatsCard';
import ResultsTable from './components/ResultsTable';

const DEFAULT_CITIES = [
  "Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner",
  "Alwar", "Bhilwara", "Sikar", "Pali", "Bharatpur",
  "Sri Ganganagar", "Sawai Madhopur", "Tonk", "Churu",
  "Jhunjhunu", "Dausa", "Nagaur", "Hanumangarh", "Banswara",
];

export default function App() {
  // Config state
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('GOOGLE_PLACES_API_KEY') || '';
  });
  const [searchQuery, setSearchQuery] = useState('packers and movers');
  const [stateName, setStateName] = useState('Rajasthan');
  const [cities, setCities] = useState(DEFAULT_CITIES);

  // Runner state
  const [isSearching, setIsSearching] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const [results, setResults] = useState(() => {
    try {
      const cached = localStorage.getItem('LEAD_MAP_RESULTS');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      console.error('Failed to parse cached results', e);
      return [];
    }
  });
  const [logs, setLogs] = useState([]);

  // Refs to prevent closure staleness in active async loop
  const isSearchingRef = useRef(isSearching);
  const isPausedRef = useRef(isPaused);
  const currentCityIndexRef = useRef(currentCityIndex);
  const citiesRef = useRef(cities);
  const apiKeyRef = useRef(apiKey);
  const searchQueryRef = useRef(searchQuery);
  const stateNameRef = useRef(stateName);

  // Update refs when state changes
  useEffect(() => { isSearchingRef.current = isSearching; }, [isSearching]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { currentCityIndexRef.current = currentCityIndex; }, [currentCityIndex]);
  useEffect(() => { citiesRef.current = cities; }, [cities]);
  useEffect(() => { apiKeyRef.current = apiKey; }, [apiKey]);
  useEffect(() => { searchQueryRef.current = searchQuery; }, [searchQuery]);
  useEffect(() => { stateNameRef.current = stateName; }, [stateName]);

  // Persist API Key
  useEffect(() => {
    localStorage.setItem('GOOGLE_PLACES_API_KEY', apiKey);
  }, [apiKey]);

  // Persist Results
  useEffect(() => {
    localStorage.setItem('LEAD_MAP_RESULTS', JSON.stringify(results));
  }, [results]);

  // Add system logs helper
  const addLog = (text, type = 'info') => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setLogs((prev) => [...prev, { text, type, time: timeStr }]);
  };

  const handleStartSearch = () => {
    if (!apiKey.trim()) {
      addLog('Error: Google API key is missing. Please set it in the target configuration.', 'error');
      return;
    }
    if (cities.length === 0) {
      addLog('Error: No target cities specified. Add at least one city.', 'error');
      return;
    }

    setIsSearching(true);
    setIsPaused(false);
    
    // If starting fresh
    if (currentCityIndex === 0) {
      setResults((prev) => prev.filter((r) => r.status === 'Interested'));
      setLogs([]);
      addLog('Starting new scraping run...', 'info');
      // Timeout is needed because state update is async, but we can call searchRunner directly after setting refs
      isSearchingRef.current = true;
      isPausedRef.current = false;
      currentCityIndexRef.current = 0;
      setTimeout(() => {
        searchRunner();
      }, 50);
    } else {
      // Resuming from pause
      addLog('Resuming scraping run...', 'info');
      isSearchingRef.current = true;
      isPausedRef.current = false;
      setTimeout(() => {
        searchRunner();
      }, 50);
    }
  };

  const handlePauseSearch = () => {
    setIsPaused(true);
    isPausedRef.current = true;
    addLog('Scraping runner pausing... Current progress will be saved.', 'warn');
  };

  const handleResumeSearch = () => {
    setIsPaused(false);
    isPausedRef.current = false;
    addLog('Scraping runner resuming...', 'info');
    searchRunner();
  };

  const handleStopSearch = () => {
    setIsSearching(false);
    setIsPaused(false);
    isSearchingRef.current = false;
    isPausedRef.current = false;
    setCurrentCityIndex(0);
    currentCityIndexRef.current = 0;
    setResults((prev) => prev.filter((r) => r.status === 'Interested'));
    
    addLog('Scraping runner stopped and reset.', 'warn');
  };

  // Main scraper controller loop
  const searchRunner = async () => {
    addLog(`Running lead finder query: "${searchQueryRef.current}" in ${stateNameRef.current}`, 'info');

    while (currentCityIndexRef.current < citiesRef.current.length) {
      // Exit hooks
      if (!isSearchingRef.current) {
        break;
      }
      if (isPausedRef.current) {
        addLog(`Runner paused at city #${currentCityIndexRef.current + 1}.`, 'warn');
        break;
      }

      const city = citiesRef.current[currentCityIndexRef.current];
      addLog(`[${currentCityIndexRef.current + 1}/${citiesRef.current.length}] Scraping ${city}...`, 'info');

      try {
        const response = await fetch('/google-places/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKeyRef.current,
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.websiteUri',
          },
          body: JSON.stringify({
            textQuery: `${searchQueryRef.current} in ${city}, ${stateNameRef.current}`,
            maxResultCount: 20,
          }),
        });

        if (!response.ok) {
          const errorMsg = await response.text();
          addLog(`Error querying Places API for ${city} (HTTP ${response.status}): ${errorMsg.slice(0, 100)}`, 'error');
        } else {
          const data = await response.json();
          const places = data.places || [];
          addLog(`Found ${places.length} businesses in ${city}.`, 'success');

          const cityRows = places.map((place) => {
            const website = place.websiteUri || '';
            return {
              City: city,
              Name: place.displayName?.text || '',
              Address: place.formattedAddress || '',
              Phone: place.nationalPhoneNumber || '',
              Rating: place.rating || '',
              Reviews: place.userRatingCount || 0,
              Has_Website: website ? 'Yes' : 'No',
              Website: website,
            };
          });

          // Update main results, eliminating duplicates (by Name & Phone)
          setResults((prev) => {
            const combined = [...prev, ...cityRows];
            const uniqueMap = new Map();
            for (const row of combined) {
              const key = `${row.Name}-${row.Phone}`;
              const existing = prev.find((p) => `${p.Name}-${p.Phone}` === key);
              if (existing) {
                uniqueMap.set(key, {
                  ...row,
                  status: existing.status || 'Not Contacted',
                  checked: existing.checked || false,
                  comment: existing.comment || '',
                });
              } else {
                uniqueMap.set(key, {
                  status: 'Not Contacted',
                  checked: false,
                  comment: '',
                  ...row,
                });
              }
            }
            return Array.from(uniqueMap.values());
          });

          const newLeads = cityRows.filter((r) => r.Has_Website === 'No');
          if (newLeads.length > 0) {
            addLog(`Success! Found ${newLeads.length} leads without website in ${city}.`, 'success');
          } else {
            addLog(`All businesses in ${city} have websites listed.`, 'info');
          }
        }

      } catch (error) {
        addLog(`Network or configuration failure for ${city}: ${error.message}`, 'error');
      }

      // Progress index increment
      currentCityIndexRef.current += 1;
      setCurrentCityIndex(currentCityIndexRef.current);

      // Pacing interval to respect Google rate limits
      if (currentCityIndexRef.current < citiesRef.current.length && isSearchingRef.current && !isPausedRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }

    // Complete run
    if (currentCityIndexRef.current >= citiesRef.current.length) {
      addLog('Finished! Search execution completed for all cities.', 'success');
      setIsSearching(false);
      isSearchingRef.current = false;
    }
  };

  // Derived stats
  const totalFound = results.length;
  const withWebsite = results.filter((r) => r.Has_Website === 'Yes').length;
  const leadsCount = results.filter((r) => r.Has_Website === 'No').length;

  const handleUpdateResult = (key, updatedFields) => {
    setResults((prev) =>
      prev.map((item) => {
        const itemKey = `${item.Name}-${item.Phone}`;
        if (itemKey === key) {
          return { ...item, ...updatedFields };
        }
        return item;
      })
    );
  };

  const handleBulkUpdateResults = (keys, updatedFields) => {
    setResults((prev) =>
      prev.map((item) => {
        const itemKey = `${item.Name}-${item.Phone}`;
        if (keys.includes(itemKey)) {
          return { ...item, ...updatedFields };
        }
        return item;
      })
    );
  };

  const handleDeleteResults = (keys) => {
    setResults((prev) =>
      prev.filter((item) => {
        const itemKey = `${item.Name}-${item.Phone}`;
        return !keys.includes(itemKey);
      })
    );
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">LM</div>
          <div className="logo-text">
            <h1>LeadMap Dashboard</h1>
            <p>No-Website Google Places Lead Miner</p>
          </div>
        </div>

        <div className={`api-badge ${apiKey.trim() ? '' : 'missing'}`}>
          <span className="api-badge-indicator" style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: apiKey.trim() ? 'var(--success)' : 'var(--danger)',
            display: 'inline-block'
          }}></span>
          {apiKey.trim() ? 'Google API Key Loaded' : 'No API Key Loaded'}
        </div>
      </header>

      <StatsCard
        totalFound={totalFound}
        withWebsite={withWebsite}
        leadsCount={leadsCount}
        currentCityIndex={currentCityIndex}
        totalCities={cities.length}
      />

      <div className="dashboard-grid">
        <aside style={{ display: 'flex', flexDirection: 'column' }}>
          <SettingsPanel
            apiKey={apiKey}
            setApiKey={setApiKey}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            cities={cities}
            setCities={setCities}
            stateName={stateName}
            setStateName={setStateName}
            isSearching={isSearching}
          />

          <ProgressPanel
            isSearching={isSearching}
            isPaused={isPaused}
            currentCity={cities[currentCityIndex]}
            totalCities={cities.length}
            currentCityIndex={currentCityIndex}
            logs={logs}
            onStart={handleStartSearch}
            onPause={handlePauseSearch}
            onResume={handleResumeSearch}
            onStop={handleStopSearch}
            apiKey={apiKey}
            cities={cities}
          />
        </aside>

        <main style={{ minHeight: '650px' }}>
          <ResultsTable
            results={results}
            onUpdateResult={handleUpdateResult}
            onBulkUpdateResults={handleBulkUpdateResults}
            onDeleteResults={handleDeleteResults}
          />
        </main>
      </div>
    </div>
  );
}
