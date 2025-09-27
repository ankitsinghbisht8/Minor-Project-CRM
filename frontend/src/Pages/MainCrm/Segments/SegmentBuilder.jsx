import React, { useState } from "react";
import axios from "axios";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import RecommendationsModal from "./RecommendationsModal";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../../../contexts/DarkModeContext";
import "./SegmentBuilder.css";

const SegmentBuilder = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    rules: [{ field: "totalSpend", operator: "gte", value: "" }],
  });
  const [errors, setErrors] = useState({});
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [showRec, setShowRec] = useState(false);

  const fieldOptions = [
    { value: "totalSpend", label: "Total Spend" },
    { value: "totalOrders", label: "Total Orders" },
    { value: "visits", label: "Number of Visits" },
    { value: "lastPurchase", label: "Last Purchase Date" },
    { value: "registrationDate", label: "Registration Date" },
    { value: "age", label: "Age" },
    { value: "location", label: "Location" },
  ];

  const operatorOptions = [
    { value: "gte", label: "Greater than or equal to (≥)" },
    { value: "lte", label: "Less than or equal to (≤)" },
    { value: "eq", label: "Equal to (=)" },
    { value: "gt", label: "Greater than (>)" },
    { value: "lt", label: "Less than (<)" },
    { value: "contains", label: "Contains" },
    { value: "not_contains", label: "Does not contain" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleRuleChange = (index, field, value) => {
    const newRules = [...formData.rules];
    newRules[index] = {
      ...newRules[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      rules: newRules,
    }));
  };

  const addRule = () => {
    setFormData((prev) => ({
      ...prev,
      rules: [...prev.rules, { field: "totalSpend", operator: "gte", value: "" }],
    }));
  };

  const removeRule = (index) => {
    if (formData.rules.length > 1) {
      setFormData((prev) => ({
        ...prev,
        rules: prev.rules.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Segment name is required";
    }

    // Validate rules
    formData.rules.forEach((rule, index) => {
      if (!rule.field) {
        newErrors[`rule_${index}_field`] = "Field is required";
      }
      if (!rule.operator) {
        newErrors[`rule_${index}_operator`] = "Operator is required";
      }
      if (!rule.value.toString().trim()) {
        newErrors[`rule_${index}_value`] = "Value is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateRulesText = () => {
    return formData.rules
      .map((rule) => {
        const field = fieldOptions.find((f) => f.value === rule.field)?.label || rule.field;
        const operator =
          operatorOptions.find((o) => o.value === rule.operator)?.label || rule.operator;
        return `${field} ${operator} ${rule.value}`;
      })
      .join(" AND ");
  };

  const estimateAudienceSize = () => {
    // Simple mock estimation based on rules
    let estimate = 1000;
    formData.rules.forEach((rule) => {
      if (rule.field === "totalSpend" && rule.operator === "gte") {
        const value = parseFloat(rule.value) || 0;
        if (value > 500) estimate = Math.max(10, estimate - 200);
        if (value > 1000) estimate = Math.max(5, estimate - 300);
      }
    });
    return Math.floor(Math.random() * estimate) + 10;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const segmentData = {
        ...formData,
        rules: generateRulesText(),
        audienceSize: estimateAudienceSize(),
      };

      // Here you would typically save to backend
      console.log("Creating segment:", segmentData);

      // Navigate back to segments page
      navigate("/segments");
    }
  };

  const handleCancel = () => {
    navigate("/segments");
  };

  const fetchRecommendations = async () => {
    try {
      setRecLoading(true);
      setRecError(null);
      setShowRec(true);
      const base = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}`;
      const res = await axios.post(`${base}/api/rag/recommendations`, {}, { withCredentials: true });
      setRecommendations(res.data?.suggestions || []);
    } catch (e) {
      setRecError(e.response?.data?.error || "Failed to load recommendations");
    } finally {
      setRecLoading(false);
    }
  };

  const applyRecommendation = (rec) => {
    setFormData((prev) => ({
      ...prev,
      name: rec.name || prev.name,
      description: rec.description || prev.description,
      rules: (rec.rules || []).map((r) => ({ field: r.field, operator: r.operator, value: r.value }))
    }));
    setShowRec(false);
  };

  return (
    <div className={`segment-builder-page ${isDarkMode ? "dark" : ""}`}>
      {/* Header Section */}
      <div className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={handleCancel}>
            <ArrowLeft size={20} />
            Back to Segments
          </button>
          <div className="header-content">
            <h1 className={`page-title ${isDarkMode ? "dark" : ""}`}>Create New Segment</h1>
            <p className={`page-subtitle ${isDarkMode ? "dark" : ""}`}>
              Build custom audience segments using dynamic rules and conditions
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="page-content">
        <form onSubmit={handleSubmit} className="segment-form">
          {/* Basic Information Section */}
          <div className={`form-section ${isDarkMode ? "dark" : ""}`}>
            <h2 className={`section-title ${isDarkMode ? "dark" : ""}`}>Basic Information</h2>

            <div className="form-group">
              <label htmlFor="name" className={isDarkMode ? "dark" : ""}>
                Segment Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter segment name"
                className={`form-input ${errors.name ? "error" : ""} ${isDarkMode ? "dark" : ""}`}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description" className={isDarkMode ? "dark" : ""}>
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe this segment (optional)"
                rows="3"
                className={`form-textarea ${isDarkMode ? "dark" : ""}`}
              />
            </div>
          </div>

          {/* Segment Rules Section */}
          <div className={`form-section ${isDarkMode ? "dark" : ""}`}>
            <div className="rules-header">
              <h2 className={`section-title ${isDarkMode ? "dark" : ""}`}>Segment Rules</h2>
              <div style={{ display: "flex", gap: "0.5rem", marginLeft: "auto" }}>
                <button type="button" className="add-rule-btn" onClick={addRule}>
                  <Plus size={16} />
                  Add Rule
                </button>
                <button type="button" className="add-rule-btn" onClick={fetchRecommendations}>
                  Recommendations
                </button>
              </div>
            </div>

            {formData.rules.map((rule, index) => (
              <div key={index}>
                <div className={`rule-group ${isDarkMode ? "dark" : ""}`}>
                  <div className="rule-header">
                    <span className={`rule-label ${isDarkMode ? "dark" : ""}`}>
                      Rule {index + 1}
                    </span>
                    {formData.rules.length > 1 && (
                      <button
                        type="button"
                        className="remove-rule-btn"
                        onClick={() => removeRule(index)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="rule-inputs">
                    <div className="form-group">
                      <select
                        value={rule.field}
                        onChange={(e) => handleRuleChange(index, "field", e.target.value)}
                        className={`form-select ${errors[`rule_${index}_field`] ? "error" : ""} ${
                          isDarkMode ? "dark" : ""
                        }`}
                      >
                        {fieldOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors[`rule_${index}_field`] && (
                        <span className="error-text">{errors[`rule_${index}_field`]}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <select
                        value={rule.operator}
                        onChange={(e) => handleRuleChange(index, "operator", e.target.value)}
                        className={`form-select ${
                          errors[`rule_${index}_operator`] ? "error" : ""
                        } ${isDarkMode ? "dark" : ""}`}
                      >
                        {operatorOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors[`rule_${index}_operator`] && (
                        <span className="error-text">{errors[`rule_${index}_operator`]}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <input
                        type="text"
                        value={rule.value}
                        onChange={(e) => handleRuleChange(index, "value", e.target.value)}
                        placeholder="Value"
                        className={`form-input ${errors[`rule_${index}_value`] ? "error" : ""} ${
                          isDarkMode ? "dark" : ""
                        }`}
                      />
                      {errors[`rule_${index}_value`] && (
                        <span className="error-text">{errors[`rule_${index}_value`]}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Interactive Logic Selector between rules */}
                {index < formData.rules.length - 1 && (
                  <div
                    className="logic-connector"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      margin: "1.5rem 0",
                      gap: "1rem",
                    }}
                  >
                    <div
                      className="connector-line"
                      style={{
                        flex: 1,
                        height: "2px",
                        background:
                          "linear-gradient(to right, transparent, #e2e8f0 20%, #e2e8f0 80%, transparent)",
                      }}
                    ></div>
                    <div
                      className="logic-selector"
                      style={{
                        display: "flex",
                        background: "white",
                        border: "2px solid #e2e8f0",
                        borderRadius: "1rem",
                        overflow: "hidden",
                        boxShadow: "0 2px 8px 0 rgba(0, 0, 0, 0.06)",
                        minWidth: "400px",
                      }}
                    >
                      <button
                        type="button"
                        className={`logic-option and ${
                          formData.logicOperator === "AND" ? "active" : ""
                        }`}
                        onClick={() => setFormData((prev) => ({ ...prev, logicOperator: "AND" }))}
                        style={{
                          flex: 1,
                          background:
                            formData.logicOperator === "AND"
                              ? "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)"
                              : "transparent",
                          border: "none",
                          padding: "1rem",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "0.25rem",
                          borderRight: "1px solid #f1f5f9",
                        }}
                      >
                        <span
                          className="logic-text"
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 700,
                            color: formData.logicOperator === "AND" ? "#111827" : "#374151",
                          }}
                        >
                          AND
                        </span>
                        <span
                          className="logic-description"
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            color: formData.logicOperator === "AND" ? "#374151" : "#6b7280",
                            textAlign: "center",
                            lineHeight: 1.2,
                          }}
                        >
                          All conditions must be met
                        </span>
                      </button>
                      <button
                        type="button"
                        className={`logic-option or ${
                          formData.logicOperator === "OR" ? "active" : ""
                        }`}
                        onClick={() => setFormData((prev) => ({ ...prev, logicOperator: "OR" }))}
                        style={{
                          flex: 1,
                          background:
                            formData.logicOperator === "OR"
                              ? "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)"
                              : "transparent",
                          border: "none",
                          padding: "1rem",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <span
                          className="logic-text"
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 700,
                            color: formData.logicOperator === "OR" ? "#581c87" : "#7c3aed",
                          }}
                        >
                          OR
                        </span>
                        <span
                          className="logic-description"
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            color: formData.logicOperator === "OR" ? "#7c3aed" : "#8b5cf6",
                            textAlign: "center",
                            lineHeight: 1.2,
                          }}
                        >
                          Any condition can be met
                        </span>
                      </button>
                    </div>
                    <div
                      className="connector-line"
                      style={{
                        flex: 1,
                        height: "2px",
                        background:
                          "linear-gradient(to right, transparent, #e2e8f0 20%, #e2e8f0 80%, transparent)",
                      }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Preview Section */}
          <div className={`form-section ${isDarkMode ? "dark" : ""}`}>
            <h2 className={`section-title ${isDarkMode ? "dark" : ""}`}>Preview</h2>
            <div className={`preview-box ${isDarkMode ? "dark" : ""}`}>
              <p className={isDarkMode ? "dark" : ""}>
                <strong>Rules:</strong> {generateRulesText() || "No rules defined"}
              </p>
              <p className={isDarkMode ? "dark" : ""}>
                <strong>Estimated Audience:</strong> ~{estimateAudienceSize()} users
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              <Save size={16} />
              Create Segment
            </button>
          </div>
        </form>
      </div>
      <RecommendationsModal
        open={showRec}
        loading={recLoading}
        error={recError}
        suggestions={recommendations}
        onClose={() => setShowRec(false)}
        onApply={applyRecommendation}
      />
    </div>
  );
};

export default SegmentBuilder;
