import React from 'react';

export default function StatsCard({
  totalFound,
  withWebsite,
  leadsCount,
  currentCityIndex,
  totalCities,
}) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <span className="stat-title">Total Found</span>
        <span className="stat-value highlight">{totalFound}</span>
      </div>

      <div className="stat-card">
        <span className="stat-title">With Website</span>
        <span className="stat-value">{withWebsite}</span>
      </div>

      <div className="stat-card" style={{ borderColor: 'rgba(245, 158, 11, 0.2)' }}>
        <span className="stat-title" style={{ color: 'var(--warning)' }}>No Website (Leads)</span>
        <span className="stat-value leads-highlight">{leadsCount}</span>
      </div>

      <div className="stat-card">
        <span className="stat-title">Cities Scraped</span>
        <span className="stat-value">
          {currentCityIndex}
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '400' }}>
            {' '}/ {totalCities}
          </span>
        </span>
      </div>
    </div>
  );
}
