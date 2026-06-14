import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { assetService } from '@/services/assetService';
import { Plus, Search, Trash2, Edit2, X, AlertCircle } from 'lucide-react';

export default function Assets() {
  const { hasRole } = useAuth();
  
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering & Pagination state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null); // null for create, asset object for edit
  const [formData, setFormData] = useState({
    name: '',
    asset_type: 'device',
    status: 'offline',
    location: '',
    region: '',
    ip_address: '',
    health_score: 100,
    description: '',
  });

  const loadAssets = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        search: search || undefined,
        status: status || undefined,
        type: type || undefined,
        page,
        limit: 10
      };
      const res = await assetService.getAll(params);
      setAssets(res.data);
      setTotalPages(res.meta.pages || 1);
    } catch (err) {
      console.error(err);
      setError('Failed to load assets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [search, status, type, page]);

  const handleOpenCreateModal = () => {
    setCurrentAsset(null);
    setFormData({
      name: '',
      asset_type: 'device',
      status: 'offline',
      location: '',
      region: '',
      ip_address: '',
      health_score: 100,
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (asset) => {
    setCurrentAsset(asset);
    setFormData({
      name: asset.name,
      asset_type: asset.asset_type,
      status: asset.status,
      location: asset.location,
      region: asset.region,
      ip_address: asset.ip_address || '',
      health_score: asset.health_score,
      description: asset.description || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentAsset(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'health_score' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      if (currentAsset) {
        // Update
        await assetService.update(currentAsset.id, formData);
      } else {
        // Create
        await assetService.create(formData);
      }
      handleCloseModal();
      loadAssets();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to save asset.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      setError('');
      await assetService.delete(id);
      loadAssets();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to delete asset.');
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'online': return 'var(--status-online)';
      case 'offline': return 'var(--status-offline)';
      case 'degraded': return 'var(--status-degraded)';
      case 'maintenance': return 'var(--status-maint)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 2 }}>Asset Registry</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Manage digital twins and network configurations</p>
        </div>
        {hasRole(['admin', 'manager']) && (
          <button
            onClick={handleOpenCreateModal}
            style={{
              background: 'var(--accent-primary)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: 600,
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              transition: 'background var(--transition-fast)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-primary)'}
          >
            <Plus size={16} />
            Add Asset
          </button>
        )}
      </div>

      {/* Error Panel */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px',
          color: 'var(--status-critical)',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Filter / Search Bar */}
      <div style={{
        display: 'flex',
        gap: 12,
        background: 'var(--bg-surface)',
        border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 10 }} />
          <input
            type="text"
            placeholder="Search assets..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              background: 'var(--bg-base)',
              border: '1px solid var(--bg-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              outline: 'none',
              fontSize: '0.85rem'
            }}
          />
        </div>

        {/* Type Filter */}
        <select
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(1); }}
          style={{
            padding: '8px 12px',
            background: 'var(--bg-base)',
            border: '1px solid var(--bg-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            outline: 'none',
            fontSize: '0.85rem'
          }}
        >
          <option value="">All Types</option>
          <option value="device">Device</option>
          <option value="environment">Environment</option>
          <option value="virtual_object">Virtual Object</option>
          <option value="sensor">Sensor</option>
          <option value="gateway">Gateway</option>
        </select>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          style={{
            padding: '8px 12px',
            background: 'var(--bg-base)',
            border: '1px solid var(--bg-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            outline: 'none',
            fontSize: '0.85rem'
          }}
        >
          <option value="">All Statuses</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="degraded">Degraded</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* Asset Table */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading assets...
          </div>
        ) : assets.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No assets found matching criteria.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bg-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Type</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Location</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Region</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>IP Address</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Health</th>
                {hasRole(['admin', 'manager']) && (
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id} style={{ borderBottom: '1px solid var(--bg-border)', transition: 'background var(--transition-fast)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '16px', fontWeight: 500 }}>{asset.name}</td>
                  <td style={{ padding: '16px', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                    {asset.asset_type.replace('_', ' ')}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: getStatusColor(asset.status)
                      }} />
                      <span style={{ textTransform: 'capitalize', fontSize: '0.8rem', fontWeight: 500 }}>
                        {asset.status}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{asset.location}</td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }} className="mono">{asset.region}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }} className="mono">{asset.ip_address || '—'}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      fontWeight: 600,
                      color: asset.health_score > 85 ? 'var(--status-online)' : asset.health_score > 60 ? 'var(--status-degraded)' : 'var(--status-critical)'
                    }} className="mono">
                      {asset.health_score}%
                    </span>
                  </td>
                  {hasRole(['admin', 'manager']) && (
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <button
                          onClick={() => handleOpenEditModal(asset)}
                          style={{
                            background: 'transparent', border: 'none', color: 'var(--text-secondary)',
                            cursor: 'pointer', padding: 4, borderRadius: 4
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                          <Edit2 size={14} />
                        </button>
                        {hasRole('admin') && (
                          <button
                            onClick={() => handleDelete(asset.id)}
                            style={{
                              background: 'transparent', border: 'none', color: 'var(--text-secondary)',
                              cursor: 'pointer', padding: 4, borderRadius: 4
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--status-critical)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 10 }}>
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            style={{
              padding: '6px 12px', background: 'var(--bg-surface)', border: '1px solid var(--bg-border)',
              borderRadius: 'var(--radius-sm)', color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '0.8rem'
            }}
          >
            Previous
          </button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            style={{
              padding: '6px 12px', background: 'var(--bg-surface)', border: '1px solid var(--bg-border)',
              borderRadius: 'var(--radius-sm)', color: page === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.8rem'
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--bg-border)',
            borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 500,
            padding: 24, boxShadow: 'var(--shadow-elevated)', display: 'flex', flexDirection: 'column', gap: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                {currentAsset ? 'Edit Asset' : 'Register New Asset'}
              </h2>
              <button onClick={handleCloseModal} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Asset Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleFormChange}
                  style={{
                    padding: '8px 12px', background: 'var(--bg-base)', border: '1px solid var(--bg-border)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none'
                  }}
                />
              </div>

              {/* Grid: Type & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Asset Type</label>
                  <select
                    name="asset_type"
                    value={formData.asset_type}
                    onChange={handleFormChange}
                    style={{
                      padding: '8px 12px', background: 'var(--bg-base)', border: '1px solid var(--bg-border)',
                      borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none'
                    }}
                  >
                    <option value="device">Device</option>
                    <option value="environment">Environment</option>
                    <option value="virtual_object">Virtual Object</option>
                    <option value="sensor">Sensor</option>
                    <option value="gateway">Gateway</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Operational Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    style={{
                      padding: '8px 12px', background: 'var(--bg-base)', border: '1px solid var(--bg-border)',
                      borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none'
                    }}
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="degraded">Degraded</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              {/* Grid: Location & Region */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Location</label>
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleFormChange}
                    style={{
                      padding: '8px 12px', background: 'var(--bg-base)', border: '1px solid var(--bg-border)',
                      borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Region</label>
                  <input
                    type="text"
                    name="region"
                    required
                    placeholder="us-east-1"
                    value={formData.region}
                    onChange={handleFormChange}
                    style={{
                      padding: '8px 12px', background: 'var(--bg-base)', border: '1px solid var(--bg-border)',
                      borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Grid: IP & Health */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>IP Address (Optional)</label>
                  <input
                    type="text"
                    name="ip_address"
                    placeholder="e.g. 10.0.1.101"
                    value={formData.ip_address}
                    onChange={handleFormChange}
                    style={{
                      padding: '8px 12px', background: 'var(--bg-base)', border: '1px solid var(--bg-border)',
                      borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Health Score (0-100)</label>
                  <input
                    type="number"
                    name="health_score"
                    min="0"
                    max="100"
                    required
                    value={formData.health_score}
                    onChange={handleFormChange}
                    style={{
                      padding: '8px 12px', background: 'var(--bg-base)', border: '1px solid var(--bg-border)',
                      borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleFormChange}
                  style={{
                    padding: '8px 12px', background: 'var(--bg-base)', border: '1px solid var(--bg-border)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none',
                    resize: 'vertical', fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    padding: '8px 16px', background: 'transparent', border: '1px solid var(--bg-border)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px', background: 'var(--accent-primary)', border: 'none',
                    borderRadius: 'var(--radius-sm)', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem'
                  }}
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
