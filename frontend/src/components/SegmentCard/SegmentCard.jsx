import React from "react";
import { Users, Play, Edit, Trash2, Calendar } from "lucide-react";
import "./SegmentCard.css";

const SegmentCard = ({ segment, onStartCampaign, onDeleteSegment, onEditSegment, isDarkMode }) => {
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

  return (
    <div className={`segment-card ${isDarkMode ? "dark" : ""}`}>
      <div className="segment-card-header">
        <div className="segment-info">
          <div className="segment-avatar" style={{ background: getSegmentColor(segment.name) }}>
            <span className="segment-emoji">{getSegmentIcon(segment.name)}</span>
          </div>
          <div className="segment-details">
            <h3 className={`segment-name ${isDarkMode ? "dark" : ""}`}>{segment.name}</h3>
            <p className={`segment-id ${isDarkMode ? "dark" : ""}`}>ID: {segment.id}</p>
          </div>
        </div>
        <div className="segment-actions">
          <button
            className={`action-btn edit ${isDarkMode ? "dark" : ""}`}
            onClick={() => onEditSegment(segment.id)}
            title="Edit Segment"
          >
            <Edit size={16} />
          </button>
          <button
            className={`action-btn delete ${isDarkMode ? "dark" : ""}`}
            onClick={() => onDeleteSegment(segment.id)}
            title="Delete Segment"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="segment-card-body">
        <div className={`segment-rules ${isDarkMode ? "dark" : ""}`}>
          <h4 className={`rules-title ${isDarkMode ? "dark" : ""}`}>Rules</h4>
          <p className={`rules-text ${isDarkMode ? "dark" : ""}`}>{segment.rules}</p>
        </div>

        <div className="segment-stats">
          <div className={`stat-item ${isDarkMode ? "dark" : ""}`}>
            <div className="stat-icon">
              <Users size={20} />
            </div>
            <div className="stat-info">
              <span className={`stat-value ${isDarkMode ? "dark" : ""}`}>
                {segment.audienceSize.toLocaleString()}
              </span>
              <span className={`stat-label ${isDarkMode ? "dark" : ""}`}>Audience Size</span>
            </div>
          </div>

          <div className={`stat-item ${isDarkMode ? "dark" : ""}`}>
            <div className="stat-icon">
              <Calendar size={20} />
            </div>
            <div className="stat-info">
              <span className={`stat-value ${isDarkMode ? "dark" : ""}`}>
                {new Date(segment.created).toLocaleDateString()}
              </span>
              <span className={`stat-label ${isDarkMode ? "dark" : ""}`}>Created</span>
            </div>
          </div>
        </div>

        <div className={`segment-status ${isDarkMode ? "dark" : ""}`}>
          <span className={`status-badge ${segment.status} ${isDarkMode ? "dark" : ""}`}>
            {segment.status}
          </span>
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
  );
};

export default SegmentCard;
