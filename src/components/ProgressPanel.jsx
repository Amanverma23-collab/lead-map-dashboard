import React, { useEffect, useRef } from 'react';

export default function ProgressPanel({
  isSearching,
  isPaused,
  currentCity,
  totalCities,
  currentCityIndex,
  logs,
  onStart,
  onPause,
  onResume,
  onStop,
  apiKey,
  cities,
}) {
  const consoleRef = useRef(null);

  // Auto-scroll console to bottom when logs update
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const progressPercent = totalCities > 0 
    ? Math.round((currentCityIndex / totalCities) * 100) 
    : 0;

  const hasApiKey = !!apiKey.trim();
  const hasCities = cities.length > 0;
  const isStartDisabled = !hasApiKey || !hasCities || isSearching;

  return (
    <div className="glass-card" style={{ marginTop: '1.5rem' }}>
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
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
        Scraping Runner Status
      </h3>

      <div className="progress-bar-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
          <span>
            {isSearching 
              ? isPaused 
                ? 'Search Paused' 
                : `Scraping: ${currentCity || 'Initializing...'}`
              : currentCityIndex === totalCities && totalCities > 0
                ? 'Search Completed'
                : 'Ready to Run'}
          </span>
          <span style={{ fontWeight: '600', color: 'var(--accent)' }}>{progressPercent}%</span>
        </div>
        <div className="progress-bar-outer">
          <div className="progress-bar-inner" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <div className="progress-label-row">
          <span>City progress</span>
          <span>{currentCityIndex} / {totalCities} cities</span>
        </div>
      </div>

      <div className="console-logger" ref={consoleRef}>
        {logs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            System ready. Enter configuration and click "Start Search" to begin generating leads...
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className={`log-entry ${log.type}`}>
              [{log.time}] {log.text}
            </div>
          ))
        )}
      </div>

      <div className="action-row">
        {!isSearching && currentCityIndex === 0 ? (
          <button
            type="button"
            className="btn-primary"
            onClick={onStart}
            disabled={isStartDisabled}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Start Search
          </button>
        ) : (
          <>
            {isSearching && !isPaused && (
              <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onPause}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                Pause
              </button>
            )}

            {isSearching && isPaused && (
              <button type="button" className="btn-primary" style={{ flex: 1 }} onClick={onResume}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Resume
              </button>
            )}

            <button type="button" className="btn-danger" style={{ flex: 1 }} onClick={onStop}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              </svg>
              {isSearching ? 'Cancel / Stop' : 'Reset Dashboard'}
            </button>
          </>
        )}
      </div>

      {!hasApiKey && (
        <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.75rem', textAlign: 'center' }}>
          Please set your Google Places API Key in the configurations first.
        </p>
      )}
    </div>
  );
}
