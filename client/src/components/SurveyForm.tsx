import React, { useState } from "react";
import { SurveyResult } from "../types";
import { API_BASE_URL } from "../constants";

type SurveyFormProps = {
  selectedPoll: string;
  pollCandidates: { [poll: string]: string[] };
  onNewResult: (result: SurveyResult) => void;
};

const ageOptions = [
  { value: "18-29", label: "18-29" },
  { value: "30-44", label: "30-44" },
  { value: "45-64", label: "45-64" },
  { value: "65+", label: "65+" },
];

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

const raceOptions = [
  { value: "White", label: "White" },
  { value: "Black", label: "Black" },
  { value: "Hispanic", label: "Hispanic" },
  { value: "Asian", label: "Asian" },
];

const incomeOptions = [
  { value: "<50k", label: "<50k" },
  { value: "50-100k", label: "50-100k" },
  { value: ">100k", label: ">100k" },
];

const urbanityOptions = [
  { value: "rural", label: "Rural" },
  { value: "urban", label: "Urban" },
  { value: "suburban", label: "Suburban" },
];

const educationOptions = [
  { value: "college degree", label: "College Degree" },
  { value: "no college degree", label: "No College Degree" },
];

const SurveyForm: React.FC<SurveyFormProps> = ({
  selectedPoll,
  pollCandidates,
  onNewResult,
}) => {
  const candidateOptions = pollCandidates[selectedPoll] || [];

  const [formData, setFormData] = useState({
    candidate: "",
    age: "",
    gender: "",
    race: "",
    income: "",
    urbanity: "",
    education: "",
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(formData).some((v) => !v)) {
      alert("Please fill out all fields.");
      return;
    }
    const newResult: SurveyResult = {
      id: 0, // Backend assigns a real id.
      poll: selectedPoll,
      weight: 1.0,
      ...formData,
    };
    try {
      const response = await fetch(`${API_BASE_URL}/survey-results/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newResult),
      });
      if (!response.ok) throw new Error("Failed to submit vote");
      const createdResult: SurveyResult = await response.json();
      onNewResult(createdResult);
      setFormData({
        candidate: "",
        age: "",
        gender: "",
        race: "",
        income: "",
        urbanity: "",
        education: "",
      });
    } catch (error) {
      console.error(error);
      alert("Error submitting vote.");
    }
  };

  return (
    <form className="survey-form card" onSubmit={handleSubmit}>
      <h2>Vote in {selectedPoll}</h2>
      <div className="blurb">
        <p>
          Add a survey response to the PostgreSQL database. Scroll down for data
          analysis features.
        </p>
      </div>
      <div className="form-group">
        <label>Who do you vote for?</label>
        <div className="radio-group">
          {candidateOptions.map((cand) => (
            <div key={cand} className="radio-item">
              <label className="custom-radio">
                <input
                  type="radio"
                  name="candidate"
                  value={cand}
                  checked={formData.candidate === cand}
                  onChange={() => handleChange("candidate", cand)}
                />
                <span className="radio-label-text">{cand}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="dropdown-group">
        <div className="form-group compact-group">
          <label>Age</label>
          <select
            value={formData.age}
            onChange={(e) => handleChange("age", e.target.value)}
            required
            className="compact-select"
          >
            <option value="">Select Age</option>
            {ageOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group compact-group">
          <label>Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
            required
            className="compact-select"
          >
            <option value="">Select Gender</option>
            {genderOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group compact-group">
          <label>Race</label>
          <select
            value={formData.race}
            onChange={(e) => handleChange("race", e.target.value)}
            required
            className="compact-select"
          >
            <option value="">Select Race</option>
            {raceOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group compact-group">
          <label>Household Income</label>
          <select
            value={formData.income}
            onChange={(e) => handleChange("income", e.target.value)}
            required
            className="compact-select"
          >
            <option value="">Select Income</option>
            {incomeOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group compact-group">
          <label>Urbanity</label>
          <select
            value={formData.urbanity}
            onChange={(e) => handleChange("urbanity", e.target.value)}
            required
            className="compact-select"
          >
            <option value="">Select Urbanity</option>
            {urbanityOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group compact-group">
          <label>Education</label>
          <select
            value={formData.education}
            onChange={(e) => handleChange("education", e.target.value)}
            required
            className="compact-select"
          >
            <option value="">Select Education</option>
            {educationOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button type="submit" className="primary-btn">
        Submit Vote
      </button>
    </form>
  );
};

export default SurveyForm;
