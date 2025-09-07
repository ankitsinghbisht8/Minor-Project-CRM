import React, { useState, useEffect } from "react";
import { Plus, Filter, Search, Users, Calendar, Target } from "lucide-react";
import axios from "axios";
import SegmentTable from "../../../components/SegmentTable/SegmentTable.jsx";
import CreateSegmentModal from "../../../components/CreateSegmentModal/CreateSegmentModal.jsx";
import { useDarkMode } from "../../../contexts/DarkModeContext";
import "./Segments.css";

const Segments = () => {
  const [segments, setSegments] = useState([]);
  const [filteredSegments, setFilteredSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterBy, setFilterBy] = useState("all");
  const { isDarkMode } = useDarkMode();

  // Load computed segments from backend and group by label
  useEffect(() => {
    const fetchSegments = async () => {
      try {
        setLoading(true);
        const base = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
        const res = await axios.get(`${base}/api/dashboard/segments`, { withCredentials: true });
        const rows = Array.isArray(res.data) ? res.data : [];

        const grouped = rows.reduce((acc, r) => {
          const key = r.segment || 'Regular';
          if (!acc[key]) acc[key] = [];
          acc[key].push(r);
          return acc;
        }, {});

        const rulesText = {
          'VIP': "total_spend > 20000 AND num_orders > 10 AND days_since_last_order < 30",
          'Loyal': "total_spend > 10000 AND num_orders > 5",
          'Churn Risk': "days_since_last_order > 180",
          'Regular': "everyone else"
        };

        const today = new Date().toISOString().split('T')[0];
        const built = Object.entries(grouped).map(([name, list], idx) => ({
          id: idx + 1,
          name,
          rules: rulesText[name] || '—',
          audienceSize: list.length,
          created: today,
          status: 'active'
        }));

        setSegments(built);
        setFilteredSegments(built);
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
    <div className={`segments-page ${isDarkMode ? 'dark' : ''}`}>
      {/* Header Section */}
      <div className="segments-header">
        <div className="header-left">
          <h1 className={`page-title ${isDarkMode ? 'dark' : ''}`}>Segments</h1>
          <p className={`page-subtitle ${isDarkMode ? 'dark' : ''}`}>
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
        <div className={`stat-card ${isDarkMode ? 'dark' : ''}`}>
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3 className={isDarkMode ? 'dark' : ''}>{filteredSegments.length}</h3>
            <p className={isDarkMode ? 'dark' : ''}>Total Segments</p>
          </div>
        </div>
        <div className={`stat-card ${isDarkMode ? 'dark' : ''}`}>
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <h3 className={isDarkMode ? 'dark' : ''}>{getTotalAudience().toLocaleString()}</h3>
            <p className={isDarkMode ? 'dark' : ''}>Total Audience</p>
          </div>
        </div>
        <div className={`stat-card ${isDarkMode ? 'dark' : ''}`}>
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h3 className={isDarkMode ? 'dark' : ''}>{segments.filter((s) => new Date(s.created) > new Date("2025-06-01")).length}</h3>
            <p className={isDarkMode ? 'dark' : ''}>Recent Segments</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="segments-controls">
        <div className={`search-container ${isDarkMode ? 'dark' : ''}`}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search segments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`search-input ${isDarkMode ? 'dark' : ''}`}
          />
        </div>
        <div className={`filter-container ${isDarkMode ? 'dark' : ''}`}>
          <Filter size={20} />
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className={`filter-select ${isDarkMode ? 'dark' : ''}`}
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
          <div className={`loading-container ${isDarkMode ? 'dark' : ''}`}>
            <div className="loading-spinner"></div>
            <p className={isDarkMode ? 'dark' : ''}>Loading segments...</p>
          </div>
        ) : filteredSegments.length === 0 ? (
          <div className={`empty-state ${isDarkMode ? 'dark' : ''}`}>
            <Users size={48} />
            <h3 className={isDarkMode ? 'dark' : ''}>No segments found</h3>
            <p className={isDarkMode ? 'dark' : ''}>Create your first segment to start targeting your audience</p>
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
            isDarkMode={isDarkMode}
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
