import React, { useState } from "react";
import { Users, Play, Trash2, Calendar, X, AlertTriangle, TrendingUp, Target } from "lucide-react";
import "./SegmentCard.css";

const SegmentCard = ({ segment, onStartCampaign, onDeleteSegment, isDarkMode }) => {
  const [deleteModal, setDeleteModal] = useState(false);

  const getSegmentIcon = (segmentName) => {
    const icons = {
      VIP: "👑",
      Loyal: "💎",
      Regular: "👤",
      "Churn Risk": "⚠️",
    };
    return icons[segmentName] || "👤";
  };

  const getSegmentColor = (segmentName) => {
    const colors = {
      VIP: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      Loyal: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      Regular: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "Churn Risk": "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    };
    return colors[segmentName] || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  };

  const handleDeleteClick = () => {
    setDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    onDeleteSegment(segment.id);
    setDeleteModal(false);
  };

  const handleDeleteCancel = () => {
    setDeleteModal(false);
  };

  return (
    <>
      <div className={`segment-card ${isDarkMode ? "dark" : ""}`}>
        <div className="segment-card-header">
          <div className="segment-info">
            <div className="segment-avatar" style={{ background: getSegmentColor(segment.name) }}>
              <span className="segment-emoji">{getSegmentIcon(segment.name)}</span>
            </div>
            <div className="segment-details">
              <h3 className={`segment-name ${isDarkMode ? "dark" : ""}`}>{segment.name}</h3>
              <p className={`segment-id ${isDarkMode ? "dark" : ""}`}>
                <Target size={12} style={{ display: 'inline', marginRight: '4px' }} />
                {segment.id.substring(0, 8)}...
              </p>
            </div>
          </div>
          <div className="segment-actions">
            <button
              className={`action-btn delete ${isDarkMode ? "dark" : ""}`}
              onClick={handleDeleteClick}
              title="Delete Segment"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="segment-card-body">
          <div className={`segment-rules ${isDarkMode ? "dark" : ""}`}>
            <h4 className={`rules-title ${isDarkMode ? "dark" : ""}`}>Description</h4>
            <p className={`rules-text ${isDarkMode ? "dark" : ""}`}>{segment.description}</p>
          </div>

          <div className="segment-stats">
            <div className={`stat-item ${isDarkMode ? "dark" : ""}`}>
              <div className="stat-icon users-icon">
                <Users size={18} />
              </div>
              <div className="stat-info">
                <span className={`stat-value ${isDarkMode ? "dark" : ""}`}>
                  {segment.audienceSize.toLocaleString()}
                </span>
                <span className={`stat-label ${isDarkMode ? "dark" : ""}`}>Audience</span>
              </div>
            </div>

            <div className={`stat-item ${isDarkMode ? "dark" : ""}`}>
              <div className="stat-icon calendar-icon">
                <Calendar size={18} />
              </div>
              <div className="stat-info">
                <span className={`stat-value ${isDarkMode ? "dark" : ""}`}>
                  {new Date(segment.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className={`stat-label ${isDarkMode ? "dark" : ""}`}>Created</span>
              </div>
            </div>

            <div className={`stat-item ${isDarkMode ? "dark" : ""}`}>
              <div className="stat-icon status-icon">
                <TrendingUp size={18} />
              </div>
              <div className="stat-info">
                <span className={`stat-value ${isDarkMode ? "dark" : ""}`}>Active</span>
                <span className={`stat-label ${isDarkMode ? "dark" : ""}`}>Status</span>
              </div>
            </div>
          </div>
        </div>

        <div className="segment-card-footer">
          <button
            className={`campaign-btn ${isDarkMode ? "dark" : ""}`}
            onClick={() => onStartCampaign(segment.id)}
          >
            <Play size={18} />
            Start Campaign
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className={`card-delete-modal-overlay ${isDarkMode ? 'dark' : ''}`} onClick={handleDeleteCancel}>
          <div className="card-delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="card-delete-modal-header">
              <div className="card-delete-modal-icon">
                <AlertTriangle size={24} />
              </div>
              <h3>Delete Segment</h3>
              <button 
                className="card-close-btn" 
                onClick={handleDeleteCancel}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="card-delete-modal-body">
              <p>Are you sure you want to delete this segment?</p>
              <div className="card-segment-info">
                <div className="card-segment-detail">
                  <strong>Name:</strong> <span>{segment.name}</span>
                </div>
                <div className="card-segment-detail">
                  <strong>Description:</strong> <span>{segment.description}</span>
                </div>
                <div className="card-segment-detail">
                  <strong>Audience Size:</strong> <span>{segment.audienceSize?.toLocaleString()}</span>
                </div>
              </div>
              <div className="card-warning-message">
                <AlertTriangle size={16} />
                <span>This action cannot be undone. All associated data will be permanently deleted.</span>
              </div>
            </div>
            
            <div className="card-delete-modal-footer">
              <button 
                className="card-cancel-btn" 
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
              <button 
                className="card-delete-confirm-btn" 
                onClick={handleDeleteConfirm}
              >
                <Trash2 size={16} />
                Delete Segment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SegmentCard;
