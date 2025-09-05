import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import "./CreateSegmentModal.css";

const CreateSegmentModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    rules: [{ field: "totalSpend", operator: "gte", value: "" }],
  });
  const [errors, setErrors] = useState({});

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
      onSubmit(segmentData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Create New Segment</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label htmlFor="name">Segment Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter segment name"
                className={errors.name ? "error" : ""}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe this segment (optional)"
                rows="3"
              />
            </div>
          </div>

          <div className="form-section">
            <div className="rules-header">
              <h3>Segment Rules</h3>
              <button type="button" className="add-rule-btn" onClick={addRule}>
                <Plus size={16} />
                Add Rule
              </button>
            </div>

            {formData.rules.map((rule, index) => (
              <div key={index} className="rule-group">
                <div className="rule-header">
                  <span>Rule {index + 1}</span>
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
                      className={errors[`rule_${index}_field`] ? "error" : ""}
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
                      className={errors[`rule_${index}_operator`] ? "error" : ""}
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
                      className={errors[`rule_${index}_value`] ? "error" : ""}
                    />
                    {errors[`rule_${index}_value`] && (
                      <span className="error-text">{errors[`rule_${index}_value`]}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="form-section">
            <h3>Preview</h3>
            <div className="preview-box">
              <p>
                <strong>Rules:</strong> {generateRulesText() || "No rules defined"}
              </p>
              <p>
                <strong>Estimated Audience:</strong> ~{estimateAudienceSize()} users
              </p>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Create Segment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSegmentModal;
