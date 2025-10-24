import React, { useState, useEffect } from "react";
import { Plus, Filter, Search, Users, Calendar, Target, Grid3X3, List, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SegmentTable from "../../../components/SegmentTable/SegmentTable.jsx";
import SegmentCard from "../../../components/SegmentCard/SegmentCard.jsx";
import { useDarkMode } from "../../../contexts/DarkModeContext";
import "./Segments.css";

const Segments = () => {
  const navigate = useNavigate();
  const [segments, setSegments] = useState([]);
  const [filteredSegments, setFilteredSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [toast, setToast] = useState(null);
  const { isDarkMode } = useDarkMode();

  // Load segments from backend
  useEffect(() => {
    const fetchSegments = async () => {
      try {
        setLoading(true);
        const base = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
        const res = await axios.get(`${base}/api/segments`, { withCredentials: true });
        const segmentsData = Array.isArray(res.data) ? res.data : [];

        // Transform the segments data to match the expected format
        const transformedSegments = segmentsData.map((segment) => ({
          id: segment.id,
          name: segment.name,
          description: segment.description,
          audienceSize: segment.audienceSize || 0,
          created: segment.createdAt ? segment.createdAt.split('T')[0] : new Date().toISOString().split("T")[0],
          status: segment.status || "active",
          // Store additional data for future use
          segmentRulesId: segment.segmentRulesId,
          segmentMetaDataId: segment.segmentMetaDataId,
        }));

        console.log("Fetched segments:", transformedSegments);
        setSegments(transformedSegments);
        setFilteredSegments(transformedSegments);
      } catch (error) {
        console.error("Error fetching segments:", error);
        setSegments([]);
        setFilteredSegments([]);
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
          segment.description.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleCreateSegment = () => {
    // Navigate to segment builder page instead of opening modal
    navigate("builder");
  };

  const handleStartCampaign = async (segmentId) => {
    try {
      const base = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
      const seg = segments.find(s => s.id === segmentId);
      const payload = {
        segmentId,
        name: `Campaign - ${seg?.name || segmentId.substring(0, 6)}`,
        message: seg?.description || ""
      };
      const res = await axios.post(`${base}/api/campaigns`, payload, { withCredentials: true });
      const campaign = res.data;
      showToast("Campaign started successfully!", "success");
      navigate(`/campaigns?id=${campaign.id}`);
    } catch (error) {
      console.error("Error starting campaign:", error);
      const errorMessage = error.response?.data?.error || error.message;
      showToast(`Failed to start campaign: ${errorMessage}`, "error");
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteSegment = async (segmentId) => {
    try {
      console.log(`Deleting segment ID: ${segmentId}`);
      const base = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
      await axios.delete(`${base}/api/segments/${segmentId}`, { withCredentials: true });
      
      // Remove from local state
      setSegments((prev) => prev.filter((segment) => segment.id !== segmentId));
      setFilteredSegments((prev) => prev.filter((segment) => segment.id !== segmentId));
      
      console.log("Segment deleted successfully");
      showToast("Segment deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting segment:", error);
      const errorMessage = error.response?.data?.error || error.message;
      showToast(`Failed to delete segment: ${errorMessage}`, "error");
    }
  };


  const getTotalAudience = () => {
    return filteredSegments.reduce((total, segment) => total + segment.audienceSize, 0);
  };

  return (
    <div className={`segments-page ${isDarkMode ? "dark" : ""}`}>
      {/* Header Section */}
      <div className="segments-header">
        <div className="header-left">
          <h1 className={`page-title ${isDarkMode ? "dark" : ""}`}>Segments</h1>
          <p className={`page-subtitle ${isDarkMode ? "dark" : ""}`}>
            Create and manage customer segments to target your campaigns effectively
          </p>
        </div>
        <button className="create-segment-btn" onClick={handleCreateSegment}>
          <Plus size={20} />
          Create Segment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className={`stat-card ${isDarkMode ? "dark" : ""}`}>
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3 style={{ color: 'black' }}>{filteredSegments.length}</h3>
            <p style={{ color: 'black' }}>Total Segments</p>
          </div>
        </div>
        <div className={`stat-card ${isDarkMode ? "dark" : ""}`}>
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <h3 style={{ color: 'black' }}>{getTotalAudience().toLocaleString()}</h3>
            <p style={{ color: 'black' }}>Total Audience</p>
          </div>
        </div>
        <div className={`stat-card ${isDarkMode ? "dark" : ""}`}>
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h3 style={{ color: 'black' }}>
              {segments.filter((s) => new Date(s.created) > new Date("2025-06-01")).length}
            </h3>
            <p style={{ color: 'black' }}>Recent Segments</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="segments-controls">
        <div className={`search-container ${isDarkMode ? "dark" : ""}`}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search segments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`search-input ${isDarkMode ? "dark" : ""}`}
          />
        </div>
        <div className={`filter-container ${isDarkMode ? "dark" : ""}`}>
          <Filter size={20} />
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className={`filter-select ${isDarkMode ? "dark" : ""}`}
          >
            <option value="all">All Segments</option>
            <option value="high-value">High Value (50+ users)</option>
            <option value="recent">Recent</option>
            <option value="active">Active</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className={`view-toggle ${isDarkMode ? "dark" : ""}`}>
          <button
            className={`view-btn ${viewMode === "list" ? "active" : ""} ${
              isDarkMode ? "dark" : ""
            }`}
            onClick={() => setViewMode("list")}
            title="List View"
          >
            <List size={18} />
          </button>
          <button
            className={`view-btn ${viewMode === "cards" ? "active" : ""} ${
              isDarkMode ? "dark" : ""
            }`}
            onClick={() => setViewMode("cards")}
            title="Card View"
          >
            <Grid3X3 size={18} />
          </button>
        </div>
      </div>

      {/* Segments Content */}
      <div className="segments-content">
        {loading ? (
          <div className={`loading-container ${isDarkMode ? "dark" : ""}`}>
            <div className="loading-spinner"></div>
            <p className={isDarkMode ? "dark" : ""}>Loading segments...</p>
          </div>
        ) : filteredSegments.length === 0 ? (
          <div className={`empty-state ${isDarkMode ? "dark" : ""}`}>
            <Users size={48} />
            <h3 className={isDarkMode ? "dark" : ""}>No segments found</h3>
            <p className={isDarkMode ? "dark" : ""}>
              Create your first segment to start targeting your audience
            </p>
            <button className="create-segment-btn" onClick={handleCreateSegment}>
              <Plus size={20} />
              Create Segment
            </button>
          </div>
        ) : viewMode === "list" ? (
          <SegmentTable
            segments={filteredSegments}
            onStartCampaign={handleStartCampaign}
            onDeleteSegment={handleDeleteSegment}
            isDarkMode={isDarkMode}
          />
        ) : (
          <div className={`segments-grid ${isDarkMode ? "dark" : ""}`}>
            {filteredSegments.map((segment) => (
              <SegmentCard
                key={segment.id}
                segment={segment}
                onStartCampaign={handleStartCampaign}
                onDeleteSegment={handleDeleteSegment}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.type} ${isDarkMode ? 'dark' : ''}`}>
          <div className="toast-icon">
            {toast.type === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <XCircle size={20} />
            )}
          </div>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default Segments;
