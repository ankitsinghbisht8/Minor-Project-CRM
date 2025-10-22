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
  
  function generateId(prefix = "n") {
    if (typeof crypto !== "undefined") {
      if (crypto.randomUUID) return `${prefix}_${crypto.randomUUID()}`;
      if (crypto.getRandomValues) {
        const arr = new Uint32Array(4);
        crypto.getRandomValues(arr);
        return `${prefix}_${Array.from(arr).map(n => n.toString(16).padStart(8, "0")).join("")}`;
      }
    }
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    rules: [{ id: generateId("rule"), kind: "rule", field: "totalSpend", operator: "gte", value: "" }],
  });
  const [errors, setErrors] = useState({});
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [showRec, setShowRec] = useState(false);
  const [audienceSize, setAudienceSize] = useState(null);
  const [calculatingAudience, setCalculatingAudience] = useState(false);

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
    const prevItem = newRules[index];
    const updatedItem = {
      ...prevItem,
      [field]: value,
    };
    newRules[index] = updatedItem;
    console.log("[RuleChange]", {
      changedRuleId: prevItem?.id,
      field,
      value,
      before: prevItem,
      after: updatedItem,
      rulesNext: newRules,
    });
    setFormData((prev) => ({
      ...prev,
      rules: newRules,
    }));
  };

  const addRule = () => {
    setFormData((prev) => {
      const next = [...prev.rules];
      if (next.length && next[next.length - 1].kind === "rule") {
        const op = { id: generateId("op"), kind: "op", op: "AND" };
        next.push(op);
        console.log("[AddRule] Inserted operator between rules", op);
      }
      const newRule = { id: generateId("rule"), kind: "rule", field: "totalSpend", operator: "gte", value: "" };
      next.push(newRule);
      console.log("[AddRule] Added rule", newRule, "Next rules:", next);
      return { ...prev, rules: next };
    });
  };
  
  const removeRule = (id) => {
    // remove a rule by its id and also remove an adjacent operator to keep sequence valid
    setFormData((prev) => {
      const items = [...prev.rules];
      const idx = items.findIndex((r) => r.id === id && r.kind === "rule");
      if (idx === -1) {
        console.warn("[RemoveRule] Rule id not found or not a rule:", id);
        return prev;
      }
      const numRuleItems = items.filter((x) => x.kind === "rule").length;
      if (numRuleItems <= 1) {
        console.warn("[RemoveRule] Cannot remove; must keep at least one rule.");
        return prev;
      }
      const toRemove = new Set([idx]);
      if (idx > 0 && items[idx - 1].kind === "op") {
        toRemove.add(idx - 1);
      } else if (idx + 1 < items.length && items[idx + 1].kind === "op") {
        toRemove.add(idx + 1);
      }
      const newItems = items.filter((_, i) => !toRemove.has(i));
      console.log("[RemoveRule] Removed rule id:", id, "Removed indices:", Array.from(toRemove), "Next rules:", newItems);
      return { ...prev, rules: newItems };
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
  
    if (!formData.name.trim()) {
      newErrors.name = "Segment name is required";
    }
  
    // Validate rules
    formData.rules.forEach((rule, index) => {
      if (rule.kind === "rule") {
        if (!rule.field) {
          newErrors[`rule_${index}_field`] = "Field is required";
        }
        if (!rule.operator) {
          newErrors[`rule_${index}_operator`] = "Operator is required";
        }
        if (!rule.value.toString().trim()) {
          newErrors[`rule_${index}_value`] = "Value is required";
        }
      }
    });
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const generateRulesText = () => {
    const parts = [];
    formData.rules.forEach((item) => {
      if (item.kind === "rule") {
        const field = fieldOptions.find((f) => f.value === item.field)?.label || item.field;
        const operator = operatorOptions.find((o) => o.value === item.operator)?.label || item.operator;
        parts.push(`${field} ${operator} ${item.value}`);
      } else if (item.kind === "op") {
        parts.push(item.op);
      }
    });
    return parts.join(" ");
  };
  
  const calculateAudienceSize = async () => {
    try {
      setCalculatingAudience(true);
      
      // Convert rules to DSL format for backend
      const operatorValueToSymbol = {
        gte: ">=",
        lte: "<=",
        eq: "==",
        gt: ">",
        lt: "<",
        contains: "contains",
        not_contains: "not_contains",
      };

      const map = new Map();
      const firstOp = (formData.rules.find((x) => x.kind === "op")?.op) || "AND";
      map.set("operator", firstOp);
      let previousRuleId = null;
      
      formData.rules.forEach((item) => {
        if (item.kind === "rule") {
          map.set(`rule-${item.id}`, {
            id: item.id,
            field: item.field,
            operator: operatorValueToSymbol[item.operator] || item.operator,
            value: item.value,
          });
          if (previousRuleId !== null) {
            const opBetween = formData.rules.find((x, idx, arr) => {
              const prevIdx = arr.findIndex((r) => r.id === previousRuleId);
              const myIdx = arr.findIndex((r) => r.id === item.id);
              return idx === prevIdx + 1 && x.kind === "op" && myIdx === prevIdx + 2;
            });
            if (opBetween) {
              map.set(`op-${previousRuleId}_${item.id}`, opBetween.op);
            }
          }
          previousRuleId = item.id;
        }
      });

      const dslEntries = Array.from(map.entries());
      
      const API_BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
      const response = await axios.post(
        `${API_BASE}/api/segments/calculate-audience`,
        { dsl: dslEntries, rules: formData.rules },
        { withCredentials: true }
      );
      
      setAudienceSize(response.data.audienceSize);
      console.log("[Calculate Audience] Size:", response.data.audienceSize);
    } catch (error) {
      console.error("[Calculate Audience] Error:", error);
      alert(`Failed to calculate audience: ${error.response?.data?.error || error.message}`);
      setAudienceSize(null);
    } finally {
      setCalculatingAudience(false);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Convert mixed rule/op list into DSL entries for backend Map
      const operatorValueToSymbol = {
        gte: ">=",
        lte: "<=",
        eq: "==",
        gt: ">",
        lt: "<",
        contains: "contains",
        not_contains: "not_contains",
      };

      const map = new Map();
      // derive overall operator from the first op (fallback AND)
      const firstOp = (formData.rules.find((x) => x.kind === "op")?.op) || "AND";
      map.set("operator", firstOp);
      let previousRuleId = null;
      formData.rules.forEach((item) => {
        if (item.kind === "rule") {
          map.set(`rule-${item.id}`, {
            id: item.id,
            field: item.field,
            operator: operatorValueToSymbol[item.operator] || item.operator,
            value: item.value,
          });
          if (previousRuleId !== null) {
            const opBetween = formData.rules.find((x, idx, arr) => {
              const prevIdx = arr.findIndex((r) => r.id === previousRuleId);
              const myIdx = arr.findIndex((r) => r.id === item.id);
              return idx === prevIdx + 1 && x.kind === "op" && myIdx === prevIdx + 2;
            });
            if (opBetween) {
              map.set(`op-${previousRuleId}_${item.id}`, opBetween.op);
            }
          }
          previousRuleId = item.id;
        }
      });

      const dslEntries = Array.from(map.entries());

      const segmentData = {
        name: formData.name,
        description: formData.description,
        rulesText: generateRulesText(),
        rules: formData.rules, // mixed list with ids
        dsl: dslEntries, // entries to reconstruct Map on backend
        audienceSize: audienceSize || 0,
      };

      const API_BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
      const url = `${API_BASE}/api/segments`;

      console.log("[Submit] POST", url, segmentData);

      axios.post(url, segmentData, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" }
      })
        .then((res) => {
          console.log("[Submit:success]", res.data);
          navigate("/dashboard/segments");
        })
        .catch((err) => {
          console.error("[Submit:error]", err);
          const errorMessage = err.response?.data?.error || err.message || "Failed to create segment";
          alert(`Failed to create segment: ${errorMessage}`);
        });
    }
  };
  
  const handleCancel = () => {
    navigate("/dashboard/segments");
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
      rules: (rec.rules || []).map((r, index) => ({
        id: generateId("rule"),
        kind: "rule",
        field: r.field,
        operator: r.operator,
        value: r.value
      }))
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
  
            {formData.rules.map((item, index) => (
              <div key={item.id}>
                {item.kind === "rule" ? (
                  <div className={`rule-group ${isDarkMode ? "dark" : ""}`}>
                    <div className="rule-header">
                      <span className={`rule-label ${isDarkMode ? "dark" : ""}`}>
                        {(() => {
                          const ruleNumber = formData.rules
                            .slice(0, index + 1)
                            .filter((x) => x.kind === "rule").length;
                          return `Rule ${ruleNumber}`;
                        })()}
                      </span>
                      {formData.rules.filter((x) => x.kind === "rule").length > 1 && (
                        <button
                          type="button"
                          className="remove-rule-btn"
                          onClick={() => removeRule(item.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
  
                    <div className="rule-inputs">
                      <div className="form-group">
                        <select
                          value={item.field}
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
                          value={item.operator}
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
                          value={item.value}
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
                ) : (
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
                        className={`logic-option and ${item.op === "AND" ? "active" : ""}`}
                        onClick={() => {
                          const next = [...formData.rules];
                          const before = next[index];
                          next[index] = { ...before, op: "AND" };
                          console.log("[OpToggle]", { id: before?.id, from: before?.op, to: "AND", next });
                          setFormData((prev) => ({ ...prev, rules: next }));
                        }}
                        style={{
                          flex: 1,
                          background:
                            item.op === "AND"
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
                            color: item.op === "AND" ? "#111827" : "#374151",
                          }}
                        >
                          AND
                        </span>
                        <span
                          className="logic-description"
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            color: item.op === "AND" ? "#374151" : "#6b7280",
                            textAlign: "center",
                            lineHeight: 1.2,
                          }}
                        >
                          All conditions must be met
                        </span>
                      </button>
                      <button
                        type="button"
                        className={`logic-option or ${item.op === "OR" ? "active" : ""}`}
                        onClick={() => {
                          const next = [...formData.rules];
                          const before = next[index];
                          next[index] = { ...before, op: "OR" };
                          console.log("[OpToggle]", { id: before?.id, from: before?.op, to: "OR", next });
                          setFormData((prev) => ({ ...prev, rules: next }));
                        }}
                        style={{
                          flex: 1,
                          background:
                            item.op === "OR"
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
                            color: item.op === "OR" ? "#581c87" : "#7c3aed",
                          }}
                        >
                          OR
                        </span>
                        <span
                          className="logic-description"
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            color: item.op === "OR" ? "#7c3aed" : "#8b5cf6",
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
            <div className="rules-header">
              <h2 className={`section-title ${isDarkMode ? "dark" : ""}`}>Preview</h2>
              <button 
                type="button" 
                className="add-rule-btn" 
                onClick={calculateAudienceSize}
                disabled={calculatingAudience || formData.rules.filter(r => r.kind === 'rule' && r.value).length === 0}
                style={{ marginLeft: "auto" }}
              >
                {calculatingAudience ? (
                  <>
                    <span className="spinner-small"></span>
                    Calculating...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Calculate Audience
                  </>
                )}
              </button>
            </div>
            <div className={`preview-box ${isDarkMode ? "dark" : ""}`}>
              <p className={isDarkMode ? "dark" : ""}>
                <strong>Rules:</strong> {generateRulesText() || "No rules defined"}
              </p>
              <p className={isDarkMode ? "dark" : ""}>
                <strong>Estimated Audience:</strong>{" "}
                {audienceSize !== null ? (
                  <span style={{ color: "#10b981", fontWeight: "600" }}>
                    ~{audienceSize.toLocaleString()} users
                  </span>
                ) : (
                  <span style={{ color: "#6b7280" }}>
                    Click "Calculate Audience" to estimate
                  </span>
                )}
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
