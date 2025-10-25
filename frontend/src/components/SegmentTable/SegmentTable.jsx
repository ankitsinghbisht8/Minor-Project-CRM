import React, { useEffect, useRef, useState } from "react";
import { Play, Trash2, MoreVertical, Users, Calendar, X, AlertTriangle } from "lucide-react";
import "./SegmentTable.css";

const SegmentTable = ({ segments, onStartCampaign, onDeleteSegment, isDarkMode }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, segment: null });
  const menuRef = useRef(null);

  useEffect(() => {
    function onDocMouseDown(e) {
      if (!activeDropdown) return;
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    }
    function onDocKeyDown(e) {
      if (e.key === 'Escape') setActiveDropdown(null);
    }
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onDocKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onDocKeyDown);
    };
  }, [activeDropdown]);

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
      case "delete":
        const segment = segments.find(s => s.id === segmentId);
        setDeleteModal({ isOpen: true, segment });
        break;
      default:
        break;
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.segment) {
      onDeleteSegment(deleteModal.segment.id);
      setDeleteModal({ isOpen: false, segment: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, segment: null });
  };

  return (
    <div className="segment-table-container">
      <div className="table-wrapper">
        <table className="segment-table">
          <thead>
            <tr>
              <th>Segment Name</th>
              <th>Description</th>
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
                  <span className="rules-text" title={segment.description}>
                    {segment.description}
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
                    <div className="dropdown-container" ref={activeDropdown === segment.id ? menuRef : null}>
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
                            className="dropdown-item delete-btn"
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

      {/* Custom Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className={`delete-modal-overlay ${isDarkMode ? 'dark' : ''}`}>
          <div className="delete-modal">
            <div className="delete-modal-header">
              <div className="delete-modal-icon">
                <AlertTriangle size={24} />
              </div>
              <h3>Delete Segment</h3>
              <button 
                className="close-btn" 
                onClick={handleDeleteCancel}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="delete-modal-body">
              <p>Are you sure you want to delete this segment?</p>
              <div className="segment-info">
                <div className="segment-detail">
                  <strong>Name:</strong> {deleteModal.segment?.name}
                </div>
                <div className="segment-detail">
                  <strong>Description:</strong> {deleteModal.segment?.description}
                </div>
                <div className="segment-detail">
                  <strong>Audience Size:</strong> {deleteModal.segment?.audienceSize?.toLocaleString()}
                </div>
              </div>
              <div className="warning-message">
                <AlertTriangle size={16} />
                <span>This action cannot be undone. All associated data will be permanently deleted.</span>
              </div>
            </div>
            
            <div className="delete-modal-footer">
              <button 
                className="cancel-btn" 
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
              <button 
                className="delete-confirm-btn" 
                onClick={handleDeleteConfirm}
              >
                <Trash2 size={16} />
                Delete Segment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SegmentTable;
