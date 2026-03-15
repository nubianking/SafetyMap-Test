// ============================================================================
// EVIDENCE REVIEW - Evidence Archive Modal for Reviewing Uploaded Incidents
// ============================================================================

import { useState, useEffect } from 'react';
import { ICONS } from '../constants';
import { apiFetch } from '../services/api';

interface EvidenceItem {
  id: string;
  hash: string;
  filename: string;
  mimetype: 'video' | 'image' | 'audio';
  size: number;
  uploaded_at: string;
  audited: boolean;
  metadata: {
    lat: number;
    lng: number;
    incident_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
}

interface EvidenceReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EvidenceReviewModal = ({ isOpen, onClose }: EvidenceReviewModalProps) => {
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [selected, setSelected] = useState<EvidenceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchEvidence();
    }
  }, [isOpen]);

  const fetchEvidence = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<EvidenceItem[]>('/api/v1/evidence');
      setEvidence(data);
    } catch (err: any) {
      // Auth errors are handled by forceReLogin in apiFetch
      if (!err.status || (err.status !== 401 && err.status !== 403)) {
        setError(err.message || 'Failed to load evidence');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0f0f0f] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
        
        {/* Header - Matches your Incident Report style */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <h2 className="text-white font-bold tracking-wider text-sm uppercase">
              Evidence Archive
            </h2>
            <span className="text-gray-500 text-xs">({evidence.length} items)</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ICONS.X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[600px]">
          
          {/* Left: List */}
          <div className="w-1/2 border-r border-gray-800 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <ICONS.Clock className="w-6 h-6 animate-spin mr-2" />
                LOADING...
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full text-red-500">
                <ICONS.AlertTriangle className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-sm uppercase tracking-wider">Error Loading Evidence</p>
                <p className="text-xs mt-2 opacity-70">{error}</p>
              </div>
            ) : evidence.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-600">
                <ICONS.AlertTriangle className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-sm uppercase tracking-wider">No Evidence Found</p>
                <p className="text-xs mt-2 opacity-70">Upload incidents to see them here</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {evidence.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selected?.id === item.id 
                        ? 'bg-gray-800 border-blue-500/50' 
                        : 'bg-[#1a1a1a] border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-900 rounded-lg">
                        {item.mimetype.startsWith('video') ? (
                          <ICONS.FileVideo className="w-6 h-6 text-blue-400" />
                        ) : item.mimetype.startsWith('image') ? (
                          <ICONS.FileImage className="w-6 h-6 text-green-400" />
                        ) : (
                          <ICONS.FileAudio className="w-6 h-6 text-yellow-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-white text-sm font-medium truncate">
                            {item.metadata?.incident_type || 'Unknown Incident'}
                          </p>
                          {item.audited ? (
                            <ICONS.CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <ICONS.Clock className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        
                        <p className="text-gray-500 text-xs mb-2">
                          {new Date(item.uploaded_at).toLocaleString()} • {(item.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded border ${getSeverityColor(item.metadata?.severity || 'low')}`}>
                            {item.metadata?.severity || 'Unknown'}
                          </span>
                          <span className="text-[10px] text-gray-600 font-mono">
                            ID: {item.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Detail View */}
          <div className="w-1/2 bg-[#0a0a0a] p-6 overflow-y-auto">
            {selected ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Evidence Preview</h3>
                  <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center border border-gray-800">
                    {selected.mimetype.startsWith('video') ? (
                      <video 
                        src={`/api/v1/evidence/${selected.id}/stream`} 
                        className="max-w-full max-h-full rounded"
                        controls
                      />
                    ) : selected.mimetype.startsWith('image') ? (
                      <img 
                        src={`/api/v1/evidence/${selected.id}/stream`} 
                        alt="Evidence" 
                        className="max-w-full max-h-full object-contain rounded"
                      />
                    ) : (
                      <div className="text-center">
                        <ICONS.FileAudio className="w-16 h-16 text-gray-700 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Audio File</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-1">Hash (SHA-256)</h4>
                    <code className="text-[10px] text-gray-500 font-mono bg-gray-900 px-2 py-1 rounded block break-all">
                      {selected.hash}
                    </code>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-1">Location</h4>
                      <p className="text-white text-sm font-mono">
                        {selected.metadata?.lat?.toFixed(4)}, {selected.metadata?.lng?.toFixed(4)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-1">Status</h4>
                      <p className={`text-sm ${selected.audited ? 'text-green-400' : 'text-yellow-400'}`}>
                        {selected.audited ? 'Forensic Audit Complete' : 'Pending Analysis'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-800 flex gap-3">
                    <button 
                      onClick={() => window.open(`/api/v1/evidence/${selected.id}/download`)}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg text-sm font-medium transition-colors uppercase tracking-wider"
                    >
                      Download Evidence
                    </button>
                    <button 
                      onClick={() => {/* Delete logic */}}
                      className="px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-600">
                <div className="w-24 h-24 rounded-full bg-gray-900 flex items-center justify-center mb-4">
                  <ICONS.FileImage className="w-10 h-10 opacity-30" />
                </div>
                <p className="text-sm uppercase tracking-wider">Select Evidence to Review</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceReviewModal;
