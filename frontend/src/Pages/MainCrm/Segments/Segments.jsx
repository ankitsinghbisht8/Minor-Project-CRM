import React, { useState, useEffect } from "react";
import { Plus, Filter, Search, Users, Calendar, Target } from "lucide-react";
import SegmentTable from "../../../components/SegmentTable/SegmentTable.jsx";
import CreateSegmentModal from "../../../components/CreateSegmentModal/CreateSegmentModal.jsx";
import { segmentsData } from "../../data/segmentsData.js";
import "./Segments.css";

const Segments = () => {
  const [segments, setSegments] = useState([]);
  const [filteredSegments, setFilteredSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterBy, setFilterBy] = useState("all");

  // Simulate API call
  useEffect(() => {
    const fetchSegments = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSegments(segmentsData);
        setFilteredSegments(segmentsData);
      } catch (error) {
        console.error("Error fetching segments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSegments();
  }, []);

  // Filter segments based on search and filter criteria
  useEffect(() => {
    let filtered = segments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (segment) =>
          segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          segment.rules.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filterBy !== "all") {
      filtered = filtered.filter((segment) => {
        switch (filterBy) {
          case "high-value":
            return segment.audienceSize > 50;
          case "recent":
            return new Date(segment.created) > new Date("2025-06-01");
          case "active":
            return segment.status === "active";
          default:
            return true;
        }
      });
    }

    setFilteredSegments(filtered);
  }, [segments, searchTerm, filterBy]);

  const handleCreateSegment = (newSegment) => {
    const segment = {
      id: segments.length + 1,
      ...newSegment,
      created: new Date().toISOString().split("T")[0],
      status: "active",
    };
    setSegments((prev) => [segment, ...prev]);
    setShowCreateModal(false);
  };

  const handleStartCampaign = (segmentId) => {
    console.log(`Starting campaign for segment ID: ${segmentId}`);
    // Here you would typically navigate to campaign creation page
    // or open campaign modal
  };

  const handleDeleteSegment = (segmentId) => {
    console.log(`Deleting segment ID: ${segmentId}`);
    setSegments((prev) => prev.filter((segment) => segment.id !== segmentId));
  };

  const handleEditSegment = (segmentId) => {
    console.log(`Editing segment ID: ${segmentId}`);
    // Here you would open edit modal or navigate to edit page
  };

  const getTotalAudience = () => {
    return filteredSegments.reduce((total, segment) => total + segment.audienceSize, 0);
  };

  return (
    <div className="segments-page">
      {/* Header Section */}
      <div className="segments-header">
        <div className="header-left">
          <h1 className="page-title">Segments</h1>
          <p className="page-subtitle">
            Create and manage customer segments to target your campaigns effectively
          </p>
        </div>
        <button className="create-segment-btn" onClick={() => setShowCreateModal(true)}>
          <Plus size={20} />
          Create Segment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{filteredSegments.length}</h3>
            <p>Total Segments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <h3>{getTotalAudience().toLocaleString()}</h3>
            <p>Total Audience</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h3>{segments.filter((s) => new Date(s.created) > new Date("2025-06-01")).length}</h3>
            <p>Recent Segments</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="segments-controls">
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search segments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-container">
          <Filter size={20} />
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Segments</option>
            <option value="high-value">High Value (50+ users)</option>
            <option value="recent">Recent</option>
            <option value="active">Active</option>
          </select>
        </div>
      </div>

      {/* Segments Table */}
      <div className="segments-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading segments...</p>
          </div>
        ) : filteredSegments.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h3>No segments found</h3>
            <p>Create your first segment to start targeting your audience</p>
            <button className="create-segment-btn" onClick={() => setShowCreateModal(true)}>
              <Plus size={20} />
              Create Segment
            </button>
          </div>
        ) : (
          <SegmentTable
            segments={filteredSegments}
            onStartCampaign={handleStartCampaign}
            onDeleteSegment={handleDeleteSegment}
            onEditSegment={handleEditSegment}
          />
        )}
      </div>

      {/* Create Segment Modal */}
      {showCreateModal && (
        <CreateSegmentModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSegment}
        />
      )}
    </div>
  );
};

export default Segments;
