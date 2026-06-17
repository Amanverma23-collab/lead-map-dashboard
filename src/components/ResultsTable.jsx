import React, { useState, useMemo } from 'react';

export default function ResultsTable({ results = [] }) {
  const [activeTab, setActiveTab] = useState('leads'); // 'leads' or 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('Reviews');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filter leads vs all
  const filteredByTab = useMemo(() => {
    if (activeTab === 'leads') {
      return results.filter((r) => r.Has_Website === 'No');
    }
    return results;
  }, [results, activeTab]);

  // Filter by search term
  const searchedResults = useMemo(() => {
    if (!searchTerm.trim()) return filteredByTab;
    const term = searchTerm.toLowerCase();
    return filteredByTab.filter(
      (r) =>
        r.Name?.toLowerCase().includes(term) ||
        r.City?.toLowerCase().includes(term) ||
        r.Phone?.toLowerCase().includes(term) ||
        r.Address?.toLowerCase().includes(term)
    );
  }, [filteredByTab, searchTerm]);

  // Sort results
  const sortedResults = useMemo(() => {
    if (!sortField) return searchedResults;

    return [...searchedResults].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle nulls
      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      // Check numeric
      const numA = Number(valA);
      const numB = Number(valB);

      if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '') {
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      }

      // String sort
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortOrder === 'asc' ? -1 : 1;
      if (strA > strB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [searchedResults, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to descending for ratings/reviews
    }
  };

  const handleDownloadCSV = (isLeadsOnly) => {
    const dataToExport = isLeadsOnly
      ? results.filter((r) => r.Has_Website === 'No')
      : results;

    if (dataToExport.length === 0) return;

    const headers = ['City', 'Name', 'Address', 'Phone', 'Rating', 'Reviews', 'Has_Website', 'Website'];
    const csvRows = [headers.join(',')];

    for (const row of dataToExport) {
      const values = headers.map((header) => {
        const val = row[header] === undefined || row[header] === null ? '' : row[header];
        // Escape quotes
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = isLeadsOnly ? 'no_website_leads.csv' : 'all_results.csv';

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalLeads = results.filter((r) => r.Has_Website === 'No').length;
  const totalAll = results.length;

  const renderSortArrow = (field) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div className="glass-card" style={{ height: '100%' }}>
      <div className="tabs-container">
        <div className="tabs-list">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'leads' ? 'active' : ''}`}
            onClick={() => setActiveTab('leads')}
          >
            Leads (No Website)
            <span className="tab-badge">{totalLeads}</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Results
            <span className="tab-badge">{totalAll}</span>
          </button>
        </div>
      </div>

      <div className="filter-panel">
        <div className="search-wrapper">
          <input
            type="text"
            className="form-input"
            style={{ padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
            placeholder="Search by name, city, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="download-buttons">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => handleDownloadCSV(true)}
            disabled={totalLeads === 0}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Leads CSV
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => handleDownloadCSV(false)}
            disabled={totalAll === 0}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export All CSV
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        {sortedResults.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📂</div>
            <div className="empty-state-title">No leads or results to show</div>
            <p style={{ fontSize: '0.8rem' }}>
              {searchTerm
                ? 'Try adjusting your search query'
                : 'Start scraping businesses to populate this table'}
            </p>
          </div>
        ) : (
          <table className="results-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('Name')}>
                  Business Name {renderSortArrow('Name')}
                </th>
                <th className="sortable" onClick={() => handleSort('Reviews')}>
                  Reviews {renderSortArrow('Reviews')}
                </th>
                <th className="sortable" onClick={() => handleSort('Rating')}>
                  Rating {renderSortArrow('Rating')}
                </th>
                <th>Phone Number</th>
                <th className="sortable" onClick={() => handleSort('City')}>
                  City {renderSortArrow('City')}
                </th>
                <th>Address</th>
                {activeTab === 'all' && <th>Website</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((place, idx) => (
                <tr key={`${place.Name}-${place.Phone}-${idx}`}>
                  <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{place.Name}</td>
                  <td>
                    <span className="reviews-count">{place.Reviews} reviews</span>
                  </td>
                  <td>
                    {place.Rating ? (
                      <span className="rating-badge">
                        ★ {place.Rating}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                    )}
                  </td>
                  <td>
                    {place.Phone ? (
                      <a href={`tel:${place.Phone}`} className="phone-link">
                        {place.Phone}
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>No Phone</span>
                    )}
                  </td>
                  <td>
                    <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      {place.City}
                    </span>
                  </td>
                  <td>
                    <div className="address-text" title={place.Address}>
                      {place.Address || 'No Address'}
                    </div>
                  </td>
                  {activeTab === 'all' && (
                    <td>
                      {place.Has_Website === 'Yes' ? (
                        <a
                          href={place.Website}
                          target="_blank"
                          rel="noreferrer"
                          className="badge yes"
                          style={{ textDecoration: 'none' }}
                        >
                          Yes
                        </a>
                      ) : (
                        <span className="badge no">No</span>
                      )}
                    </td>
                  )}
                  <td>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${place.Name} ${place.Address}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="action-link"
                    >
                      Maps ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
