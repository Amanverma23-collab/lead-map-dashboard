import { useState, useMemo } from 'react';

export default function ResultsTable({
  results = [],
  onUpdateResult,
  onBulkUpdateResults,
  onDeleteResults,
}) {
  const [activeTab, setActiveTab] = useState('leads'); // 'leads', 'interested', or 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('Reviews');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filter leads vs all vs interested
  const filteredByTab = useMemo(() => {
    if (activeTab === 'leads') {
      return results.filter((r) => r.Has_Website === 'No');
    }
    if (activeTab === 'interested') {
      return results.filter((r) => r.status === 'Interested');
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

  // Checkbox state calculations
  const selectedResults = useMemo(() => results.filter((r) => r.checked), [results]);
  const selectedCount = selectedResults.length;

  const allVisibleChecked = useMemo(() => {
    if (sortedResults.length === 0) return false;
    return sortedResults.every((r) => r.checked);
  }, [sortedResults]);

  const handleSelectAllChange = (e) => {
    const isChecked = e.target.checked;
    const keys = sortedResults.map((r) => `${r.Name}-${r.Phone}`);
    onBulkUpdateResults(keys, { checked: isChecked });
  };

  const exportToCSV = (dataToExport, filename) => {
    if (dataToExport.length === 0) return;

    const headers = ['City', 'Name', 'Address', 'Phone', 'Rating', 'Reviews', 'Has_Website', 'Website', 'Status'];
    const csvRows = [headers.join(',')];

    for (const row of dataToExport) {
      const values = headers.map((header) => {
        let val;
        if (header === 'Status') {
          val = row.status || 'Not Contacted';
        } else {
          val = row[header] === undefined || row[header] === null ? '' : row[header];
        }
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

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCSV = (type) => {
    let dataToExport = results;
    let filename = 'all_results.csv';

    if (type === 'leads') {
      dataToExport = results.filter((r) => r.Has_Website === 'No');
      filename = 'no_website_leads.csv';
    } else if (type === 'interested') {
      dataToExport = results.filter((r) => r.status === 'Interested');
      filename = 'interested_leads.csv';
    }

    exportToCSV(dataToExport, filename);
  };

  const handleExportSelected = () => {
    exportToCSV(selectedResults, 'selected_leads.csv');
  };

  const getStyleClassForStatus = (status) => {
    switch (status) {
      case 'Interested': return 'status-interested';
      case 'No Reply': return 'status-no-reply';
      case 'Rejected': return 'status-rejected';
      default: return 'status-not-contacted';
    }
  };

  const totalLeads = results.filter((r) => r.Has_Website === 'No').length;
  const totalInterested = results.filter((r) => r.status === 'Interested').length;
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
            className={`tab-btn ${activeTab === 'interested' ? 'active' : ''}`}
            onClick={() => setActiveTab('interested')}
          >
            Interested Leads ⭐
            <span className="tab-badge interested-badge">{totalInterested}</span>
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
            onClick={() => handleDownloadCSV('leads')}
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
            className="btn-secondary btn-interested-csv"
            onClick={() => handleDownloadCSV('interested')}
            disabled={totalInterested === 0}
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
            Export Interested CSV
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => handleDownloadCSV('all')}
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

      {selectedCount > 0 && (
        <div className="bulk-actions-bar">
          <div className="bulk-actions-info">
            <span className="selected-badge">{selectedCount}</span>
            <span>selected</span>
          </div>
          <div className="bulk-actions-controls">
            <select
              className="bulk-select"
              onChange={(e) => {
                if (e.target.value) {
                  const keys = selectedResults.map((r) => `${r.Name}-${r.Phone}`);
                  onBulkUpdateResults(keys, { status: e.target.value });
                  e.target.value = '';
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Change Status...</option>
              <option value="Not Contacted">Not Contacted</option>
              <option value="No Reply">No Reply</option>
              <option value="Interested">Interested</option>
              <option value="Rejected">Rejected</option>
            </select>
            <button
              type="button"
              className="btn-bulk btn-bulk-export"
              onClick={handleExportSelected}
            >
              Export CSV
            </button>
            <button
              type="button"
              className="btn-bulk btn-bulk-deselect"
              onClick={() => {
                const keys = selectedResults.map((r) => `${r.Name}-${r.Phone}`);
                onBulkUpdateResults(keys, { checked: false });
              }}
            >
              Deselect All
            </button>
            <button
              type="button"
              className="btn-bulk btn-bulk-delete"
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${selectedCount} selected lead(s)?`)) {
                  const keys = selectedResults.map((r) => `${r.Name}-${r.Phone}`);
                  onDeleteResults(keys);
                }
              }}
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

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
                <th style={{ width: '40px', padding: '1rem 0.75rem', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={allVisibleChecked}
                    onChange={handleSelectAllChange}
                    className="custom-checkbox"
                  />
                </th>
                <th className="sortable" onClick={() => handleSort('Name')}>
                  Business Name {renderSortArrow('Name')}
                </th>
                <th style={{ width: '150px' }}>Status</th>
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
                {(activeTab === 'all' || activeTab === 'interested') && <th>Website</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((place, idx) => {
                const itemKey = `${place.Name}-${place.Phone}`;
                return (
                  <tr key={`${place.Name}-${place.Phone}-${idx}`} className={place.checked ? 'row-selected' : ''}>
                    <td style={{ textAlign: 'center', padding: '1rem 0.75rem' }}>
                      <input
                        type="checkbox"
                        checked={!!place.checked}
                        onChange={(e) => onUpdateResult(itemKey, { checked: e.target.checked })}
                        className="custom-checkbox"
                      />
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{place.Name}</td>
                    <td>
                      <select
                        value={place.status || 'Not Contacted'}
                        onChange={(e) => onUpdateResult(itemKey, { status: e.target.value })}
                        className={`status-select ${getStyleClassForStatus(place.status)}`}
                      >
                        <option value="Not Contacted">Not Contacted</option>
                        <option value="No Reply">No Reply</option>
                        <option value="Interested">Interested</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
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
                    {(activeTab === 'all' || activeTab === 'interested') && (
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
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
