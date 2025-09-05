import React, { useState } from "react";
import { Play, Edit3, Trash2, MoreVertical, Users, Calendar } from "lucide-react";
import "./SegmentTable.css";

const SegmentTable = ({ segments, onStartCampaign, onDeleteSegment, onEditSegment }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getAudienceSizeColor = (size) => {
    if (size >= 100) return "high";
    if (size >= 50) return "medium";
    return "low";
  };

  const handleDropdownToggle = (segmentId) => {
    setActiveDropdown(activeDropdown === segmentId ? null : segmentId);
  };

  const handleAction = (action, segmentId) => {
    setActiveDropdown(null);
    switch (action) {
      case "campaign":
        onStartCampaign(segmentId);
        break;
      case "edit":
        onEditSegment(segmentId);
        break;
      case "delete":
        if (window.confirm("Are you sure you want to delete this segment?")) {
          onDeleteSegment(segmentId);
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="segment-table-container">
      <div className="table-wrapper">
        <table className="segment-table">
          <thead>
            <tr>
              <th>Segment Name</th>
              <th>Rules</th>
              <th>Audience Size</th>
              <th>Created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((segment) => (
              <tr key={segment.id} className="table-row">
                <td className="segment-name-cell">
                  <div className="segment-name">
                    <div className="segment-icon">
                      <Users size={16} />
                    </div>
                    <div>
                      <span className="name">{segment.name}</span>
                      <span className="segment-id">ID: {segment.id}</span>
                    </div>
                  </div>
                </td>
                <td className="rules-cell">
                  <span className="rules-text" title={segment.rules}>
                    {segment.rules}
                  </span>
                </td>
                <td className="audience-size-cell">
                  <span className={`audience-badge ${getAudienceSizeColor(segment.audienceSize)}`}>
                    {segment.audienceSize.toLocaleString()}
                  </span>
                </td>
                <td className="created-cell">
                  <div className="date-info">
                    <Calendar size={14} />
                    <span>{formatDate(segment.created)}</span>
                  </div>
                </td>
                <td className="status-cell">
                  <span className={`status-badge ${segment.status || "active"}`}>
                    {segment.status || "Active"}
                  </span>
                </td>
                <td className="actions-cell">
                  <div className="actions-container">
                    <button
                      className="action-btn primary"
                      onClick={() => handleAction("campaign", segment.id)}
                      title="Start Campaign"
                    >
                      <Play size={16} />
                      Start Campaign
                    </button>
                    <div className="dropdown-container">
                      <button
                        className="action-btn secondary"
                        onClick={() => handleDropdownToggle(segment.id)}
                        title="More Actions"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {activeDropdown === segment.id && (
                        <div className="dropdown-menu">
                          <button
                            className="dropdown-item"
                            onClick={() => handleAction("edit", segment.id)}
                          >
                            <Edit3 size={14} />
                            Edit Segment
                          </button>
                          <button
                            className="dropdown-item delete"
                            onClick={() => handleAction("delete", segment.id)}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SegmentTable;
