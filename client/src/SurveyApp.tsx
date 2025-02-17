// App.tsx
import React, { useEffect, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import "chart.js/auto";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  ScriptableContext,
} from "chart.js";
import "./App.css";

const pollCandidates = {
  "Ohio Senate Primary": ["Alice Johnson", "Bob Smith"],
  "Florida Senate Primary": ["Carol Lee", "David Kim"],
  "New Hampshire Senate Primary": ["Eve Davis", "Frank Miller"],
};

export interface SurveyResult {
  id: number;
  poll: string;
  candidate: string;
  age: string;
  gender: string;
  race: string;
  income: string;
  urbanity: string;
  education: string;
  weight: number;
}

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

/* ---------------------------------------------------------------------------
   PollToggle Component (Button Group with Enhanced Contrast)
--------------------------------------------------------------------------- */
type PollToggleProps = {
  selectedPoll: string;
  setSelectedPoll: (poll: string) => void;
};

const PollToggle: React.FC<PollToggleProps> = ({
  selectedPoll,
  setSelectedPoll,
}) => {
  const polls = [
    "Ohio Senate Primary",
    "Florida Senate Primary",
    "New Hampshire Senate Primary",
  ];
  return (
    <div className="poll-toggle">
      {polls.map((poll) => (
        <button
          key={poll}
          className={`poll-button ${selectedPoll === poll ? "active" : ""}`}
          onClick={() => setSelectedPoll(poll)}
        >
          {poll}
        </button>
      ))}
    </div>
  );
};

/* ---------------------------------------------------------------------------
   SurveyForm Component
--------------------------------------------------------------------------- */

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
      id: 0, // Backend will assign a real id.
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

/* ============================
   ResultsTable Component
============================ */
type ResultsTableProps = {
  results: SurveyResult[];
  onDeleteResult: (id: number) => void;
};
const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  onDeleteResult,
}) => {
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(results.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentResults = results.slice(indexOfFirst, indexOfLast);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/survey-results/${id}/`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      onDeleteResult(id);
    } catch (error) {
      console.error(error);
      alert("Error deleting record.");
    }
  };

  return (
    <div className="results-table card">
      <div className="table-container" style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Poll</th>
              <th>Candidate</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Race</th>
              <th>Income</th>
              <th>Urbanity</th>
              <th>Education</th>
              <th>Weight</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {currentResults.map((res) => (
              <tr key={res.id}>
                <td>{res.poll}</td>
                <td>{res.candidate}</td>
                <td>{res.age}</td>
                <td>{res.gender}</td>
                <td>{res.race}</td>
                <td>{res.income}</td>
                <td>{res.urbanity}</td>
                <td>{res.education}</td>
                <td>{res.weight.toFixed(2)}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(res.id)}
                  >
                    &times;
                  </button>
                </td>
              </tr>
            ))}
            {currentResults.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: "center" }}>
                  No Results
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={handlePrev} disabled={currentPage === 1}>
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button onClick={handleNext} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

/* ---------------------------------------------------------------------------
   FilterGroup Component (Reusable Chip-Style Filter)
--------------------------------------------------------------------------- */
type FilterGroupProps = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
};

const FilterGroup: React.FC<FilterGroupProps> = ({
  label,
  options,
  selected,
  onChange,
}) => {
  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((o) => o !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="filter-group">
      <label>{label}</label>
      <div className="chips">
        {options.map((option) => (
          <button
            key={option}
            className={`chip ${selected.includes(option) ? "selected" : ""}`}
            onClick={() => toggleOption(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------------------
   ToplineResults Component with Chip-Style Graph Filters (All Selected by Default)
--------------------------------------------------------------------------- */
interface ToplineResultsProps {
  results: SurveyResult[];
  selectedPoll: string;
}

const ToplineResults: React.FC<
  ToplineResultsProps & { selectedPoll: string }
> = ({ results, selectedPoll }) => {
  // Existing filter state for chip-style filters.
  const [filterAges, setFilterAges] = useState<string[]>([
    "18-29",
    "30-44",
    "45-64",
    "65+",
  ]);
  const [filterGenders, setFilterGenders] = useState<string[]>([
    "Male",
    "Female",
  ]);
  const [filterRaces, setFilterRaces] = useState<string[]>([
    "White",
    "Black",
    "Hispanic",
    "Asian",
  ]);
  const [filterIncomes, setFilterIncomes] = useState<string[]>([
    "<50k",
    "50-100k",
    ">100k",
  ]);
  const [filterUrbanities, setFilterUrbanities] = useState<string[]>([
    "rural",
    "urban",
    "suburban",
  ]);
  const [filterEducations, setFilterEducations] = useState<string[]>([
    "college degree",
    "no college degree",
  ]);

  // New state for the demographic subgroup and vote reallocation slider.
  const [selectedSubgroup, setSelectedSubgroup] = useState<string>("");
  const [sliderValue, setSliderValue] = useState<number>(50); // Candidate A's percentage for the subgroup

  // Reset slider and subgroup when selected poll changes.
  useEffect(() => {
    setSliderValue(50);
    setSelectedSubgroup("");
  }, [selectedPoll]);

  // Define demographic subgroup options.
  const demographicOptions = [
    { label: "None", value: "" },
    { label: "Age: 18-29", value: "age: 18-29" },
    { label: "Age: 30-44", value: "age: 30-44" },
    { label: "Age: 45-64", value: "age: 45-64" },
    { label: "Age: 65+", value: "age: 65+" },
    { label: "Gender: Male", value: "gender: Male" },
    { label: "Gender: Female", value: "gender: Female" },
    { label: "Race: White", value: "race: White" },
    { label: "Race: Black", value: "race: Black" },
    { label: "Race: Hispanic", value: "race: Hispanic" },
    { label: "Race: Asian", value: "race: Asian" },
  ];

  // Apply chip filters as before.
  const filteredResults = results.filter(
    (res) =>
      filterAges.includes(res.age) &&
      filterGenders.includes(res.gender) &&
      filterRaces.includes(res.race) &&
      filterIncomes.includes(res.income) &&
      filterUrbanities.includes(res.urbanity) &&
      filterEducations.includes(res.education)
  );

  // Calculate the base candidate weights from filtered results.
  const baseCandidateWeights: { [key: string]: number } = {};
  filteredResults.forEach((res) => {
    baseCandidateWeights[res.candidate] =
      (baseCandidateWeights[res.candidate] || 0) + res.weight;
  });

  // For our demo, assume only Candidate A and Candidate B exist.
  const candidateOrder = ["Candidate A", "Candidate B"];

  // Create a copy of baseCandidateWeights that we can adjust.
  const adjustedCandidateWeights = { ...baseCandidateWeights };

  // Compute subgroup raw data and differences only if a subgroup is selected.
  let subgroupDiffs: { diffA: number; diffB: number } | null = null;
  if (selectedSubgroup) {
    const [dimension, value] = selectedSubgroup.split(":").map((s) => s.trim());
    const subgroupResults = filteredResults.filter(
      (res) =>
        res[dimension as keyof SurveyResult] === value &&
        (res.candidate === "Candidate A" || res.candidate === "Candidate B")
    );
    const subgroupWeight = subgroupResults.reduce(
      (sum, res) => sum + res.weight,
      0
    );
    const rawA = subgroupResults
      .filter((res) => res.candidate === "Candidate A")
      .reduce((sum, res) => sum + res.weight, 0);
    const rawB = subgroupResults
      .filter((res) => res.candidate === "Candidate B")
      .reduce((sum, res) => sum + res.weight, 0);
    const rawPercentA = subgroupWeight > 0 ? (rawA / subgroupWeight) * 100 : 0;
    const rawPercentB = subgroupWeight > 0 ? (rawB / subgroupWeight) * 100 : 0;
    // Compute differences as (new - raw) for each candidate.
    subgroupDiffs = {
      diffA: Math.round(sliderValue - rawPercentA),
      diffB: Math.round(100 - sliderValue - rawPercentB),
    };

    // Reallocate the subgroup's weight according to the slider.
    const newA = (sliderValue / 100) * subgroupWeight;
    const newB = subgroupWeight - newA;
    adjustedCandidateWeights["Candidate A"] =
      (adjustedCandidateWeights["Candidate A"] || 0) - rawA + newA;
    adjustedCandidateWeights["Candidate B"] =
      (adjustedCandidateWeights["Candidate B"] || 0) - rawB + newB;
  }

  // Compute overall adjusted total weight and percentages.
  const adjustedTotalWeight = candidateOrder.reduce(
    (sum, cand) => sum + (adjustedCandidateWeights[cand] || 0),
    0
  );
  const adjustedCandidatePercentages = candidateOrder.map((candidate) => ({
    candidate,
    percentage: adjustedTotalWeight
      ? (adjustedCandidateWeights[candidate] / adjustedTotalWeight) * 100
      : 0,
  }));

  // Prepare data for the pie chart.
  const pieData = {
    labels: candidateOrder,
    datasets: [
      {
        data: candidateOrder.map((cand) => adjustedCandidateWeights[cand] || 0),
        backgroundColor: ["#FF6B6B", "#4A90E2"],
      },
    ],
  };

  // Auto-update the slider value only when the subgroup selection changes.
  useEffect(() => {
    if (selectedSubgroup) {
      const [dimension, value] = selectedSubgroup
        .split(":")
        .map((s) => s.trim());
      const subgroupResults = filteredResults.filter(
        (res) =>
          res[dimension as keyof SurveyResult] === value &&
          (res.candidate === "Candidate A" || res.candidate === "Candidate B")
      );
      const subgroupWeight = subgroupResults.reduce(
        (sum, res) => sum + res.weight,
        0
      );
      const rawA = subgroupResults
        .filter((res) => res.candidate === "Candidate A")
        .reduce((sum, res) => sum + res.weight, 0);
      const newSliderValue =
        subgroupWeight > 0 ? Math.round((rawA / subgroupWeight) * 100) : 50;
      setSliderValue(newSliderValue);
    }
  }, [selectedSubgroup]);

  return (
    <div className="topline-results card">
      <h3>Topline Results</h3>
      <div className="filters">
        {/* Existing chip-style filters */}
        <FilterGroup
          label="Age"
          options={["18-29", "30-44", "45-64", "65+"]}
          selected={filterAges}
          onChange={setFilterAges}
        />
        <FilterGroup
          label="Gender"
          options={["Male", "Female"]}
          selected={filterGenders}
          onChange={setFilterGenders}
        />
        <FilterGroup
          label="Race"
          options={["White", "Black", "Hispanic", "Asian"]}
          selected={filterRaces}
          onChange={setFilterRaces}
        />
        <FilterGroup
          label="Income"
          options={["<50k", "50-100k", ">100k"]}
          selected={filterIncomes}
          onChange={setFilterIncomes}
        />
        <FilterGroup
          label="Urbanity"
          options={["rural", "urban", "suburban"]}
          selected={filterUrbanities}
          onChange={setFilterUrbanities}
        />
        <FilterGroup
          label="Education"
          options={["college degree", "no college degree"]}
          selected={filterEducations}
          onChange={setFilterEducations}
        />
      </div>

      {/* New interactive controls */}
      <div className="interactive-controls">
        <div className="dropdown-group">
          <label htmlFor="subgroup-dropdown">
            Select Demographic Subgroup:
          </label>
          <select
            id="subgroup-dropdown"
            value={selectedSubgroup}
            onChange={(e) => setSelectedSubgroup(e.target.value)}
          >
            {demographicOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {selectedSubgroup && (
          <div className="slider-group">
            <label htmlFor="vote-slider">
              Reallocate votes in {selectedSubgroup}:&nbsp; Candidate A:{" "}
              <strong>{sliderValue}%</strong>
              {subgroupDiffs && (
                <span>
                  {" "}
                  ({subgroupDiffs.diffA >= 0 ? "+" : ""}
                  {subgroupDiffs.diffA}%)
                </span>
              )}
              &nbsp;|&nbsp;Candidate B: <strong>{100 - sliderValue}%</strong>
              {subgroupDiffs && (
                <span>
                  {" "}
                  ({subgroupDiffs.diffB >= 0 ? "+" : ""}
                  {subgroupDiffs.diffB}%)
                </span>
              )}
            </label>
            <input
              id="vote-slider"
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={(e) => setSliderValue(parseInt(e.target.value))}
            />
          </div>
        )}
      </div>

      <div className="candidate-percentages">
        {adjustedCandidatePercentages.map((cp) => (
          <p key={cp.candidate}>
            {cp.candidate}: {cp.percentage.toFixed(1)}%
          </p>
        ))}
      </div>
      <div className="pie-chart-container">
        <Pie data={pieData} options={{ maintainAspectRatio: false }} />
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------------------
   TargetWeightsForm Component (Condensed; Different Defaults per Poll)
--------------------------------------------------------------------------- */
export interface TargetWeights {
  age: { [key: string]: number };
  gender: { [key: string]: number };
  race: { [key: string]: number };
  income: { [key: string]: number };
  urbanity: { [key: string]: number };
  education: { [key: string]: number };
}

type TargetWeightsFormProps = {
  poll: string;
  onSubmit: (weights: TargetWeights) => void;
};

const TargetWeightsForm: React.FC<TargetWeightsFormProps> = ({
  poll,
  onSubmit,
}) => {
  const defaultTargetWeights: { [poll: string]: TargetWeights } = {
    "Ohio Senate Primary": {
      age: { "18-29": 0.25, "30-44": 0.25, "45-64": 0.25, "65+": 0.25 },
      gender: { Male: 0.5, Female: 0.5 },
      race: { White: 0.5, Black: 0.2, Hispanic: 0.2, Asian: 0.1 },
      income: { "<50k": 0.33, "50-100k": 0.33, ">100k": 0.34 },
      urbanity: { rural: 0.33, urban: 0.33, suburban: 0.34 },
      education: { "college degree": 0.5, "no college degree": 0.5 },
    },
    "Florida Senate Primary": {
      age: { "18-29": 0.3, "30-44": 0.25, "45-64": 0.25, "65+": 0.2 },
      gender: { Male: 0.45, Female: 0.55 },
      race: { White: 0.55, Black: 0.15, Hispanic: 0.2, Asian: 0.1 },
      income: { "<50k": 0.3, "50-100k": 0.4, ">100k": 0.3 },
      urbanity: { rural: 0.25, urban: 0.5, suburban: 0.25 },
      education: { "college degree": 0.6, "no college degree": 0.4 },
    },
    "New Hampshire Senate Primary": {
      age: { "18-29": 0.2, "30-44": 0.3, "45-64": 0.3, "65+": 0.2 },
      gender: { Male: 0.5, Female: 0.5 },
      race: { White: 0.6, Black: 0.1, Hispanic: 0.2, Asian: 0.1 },
      income: { "<50k": 0.35, "50-100k": 0.35, ">100k": 0.3 },
      urbanity: { rural: 0.4, urban: 0.4, suburban: 0.2 },
      education: { "college degree": 0.55, "no college degree": 0.45 },
    },
  };

  const [weights, setWeights] = useState<TargetWeights>(
    defaultTargetWeights[poll]
  );

  useEffect(() => {
    setWeights(defaultTargetWeights[poll]);
  }, [poll]);

  const handleChange = (
    dimension: keyof TargetWeights,
    category: string,
    value: number
  ) => {
    setWeights((prev) => ({
      ...prev,
      [dimension]: {
        ...prev[dimension],
        [category]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(weights);
  };

  return (
    <form onSubmit={handleSubmit} className="target-weights-form card">
      <h2>Target Weights for {poll}</h2>
      {Object.entries(weights).map(([dimension, categories]) => (
        <div key={dimension} className="condensed-group">
          <div className="dimension-label">
            {dimension.charAt(0).toUpperCase() + dimension.slice(1)}:
          </div>
          <div className="dimension-inputs">
            {Object.entries(categories).map(([cat, val]) => (
              <div key={cat} className="input-cell">
                <label>{cat}</label>
                <input
                  type="number"
                  step="0.01"
                  value={val as number}
                  onChange={(e) =>
                    handleChange(
                      dimension as keyof TargetWeights,
                      cat,
                      parseFloat(e.target.value)
                    )
                  }
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button type="submit" className="primary-btn">
        Run IPF
      </button>
    </form>
  );
};

/* ---------------------------------------------------------------------------
   IpfResults Component (Display IPF Output with Convergence Graph)
--------------------------------------------------------------------------- */
interface IpfResultsProps {
  iterations: number;
  finalChange: number;
  l1Errors: number[];
}

const IpfResults: React.FC<IpfResultsProps> = ({
  iterations,
  finalChange,
  l1Errors,
}) => {
  // Create labels for each iteration (1-indexed)
  const labels = l1Errors.map((_, index) => `${index}`);

  const data = {
    labels: labels,
    datasets: [
      {
        label: "L1 Norm Error",
        data: l1Errors,
        fill: false,
        borderColor: "#4A90E2",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Convergence of IPF (L1 Norm Error per Iteration)",
      },
    },
  };

  return (
    <div className="ipf-results card">
      <h3>IPF Results</h3>
      <p>Iterations: {iterations}</p>
      {l1Errors.length > 0 ? (
        <div style={{ height: "300px", width: "100%" }}>
          <Line data={data} options={options} />
        </div>
      ) : (
        <p>No convergence data available.</p>
      )}
    </div>
  );
};

/* ---------------------------------------------------------------------------
   PredictionSection Component
--------------------------------------------------------------------------- */
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PredictionSectionProps {
  selectedPoll: string;
}

interface ProbabilityDistribution {
  [candidate: string]: number;
}

interface ShapExplanation {
  [feature: string]: number;
}

const PredictionSection: React.FC<PredictionSectionProps> = ({
  selectedPoll,
}) => {
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [race, setRace] = useState<string>("");
  const [income, setIncome] = useState<string>("");
  const [urbanity, setUrbanity] = useState<string>("");
  const [education, setEducation] = useState<string>("");
  const [prediction, setPrediction] = useState<string | null>(null);
  const [trainingStatus, setTrainingStatus] = useState<string | null>(null);
  const [probabilityDistribution, setProbabilityDistribution] =
    useState<ProbabilityDistribution | null>(null);
  const [shapExplanation, setShapExplanation] =
    useState<ShapExplanation | null>(null);

  // Clear all prediction-related state when the selected poll changes.
  useEffect(() => {
    setPrediction(null);
    setProbabilityDistribution(null);
    setShapExplanation(null);
    setTrainingStatus(null);
    // Optionally, clear the form fields if desired.
    setAge("");
    setGender("");
    setRace("");
    setIncome("");
    setUrbanity("");
    setEducation("");
  }, [selectedPoll]);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      poll: selectedPoll,
      age,
      gender,
      race,
      income,
      urbanity,
      education,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/predict-vote/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Prediction failed");
      }
      setPrediction(`Predicted Vote: ${result.predicted_candidate}`);
      setProbabilityDistribution(result.probability_distribution);
      setShapExplanation(result.shap_explanation);
    } catch (error) {
      console.error(error);
      alert("Error predicting vote");
    }
  };

  const handleTrainModel = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/train-vote-model/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poll: selectedPoll }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Training failed");
      }
      setTrainingStatus(result.message);
      alert(result.message);
    } catch (error) {
      console.error(error);
      alert("Error training model.");
    }
  };

  // Build data for the probability distribution Pie chart.
  const probabilityChartData: ChartData<"pie", number[], string> | null =
    probabilityDistribution
      ? {
          labels: Object.keys(probabilityDistribution),
          datasets: [
            {
              data: Object.values(probabilityDistribution),
              backgroundColor: Object.keys(probabilityDistribution).map(
                (_, i) => {
                  const colors = [
                    "#FF6B6B",
                    "#4A90E2",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF",
                    "#FF9F40",
                  ];
                  return colors[i % colors.length];
                }
              ),
            },
          ],
        }
      : null;

  // Build waterfall chart data for the SHAP explanation.
  let waterfallChartData: ChartData<"bar", number[], string> | null = null;
  if (shapExplanation) {
    const features = Object.keys(shapExplanation);
    const contributions = Object.values(shapExplanation);
    const valueData: number[] = contributions.map((v) => v);
    waterfallChartData = {
      labels: features,
      datasets: [
        {
          label: "Contribution",
          data: valueData,
          backgroundColor: valueData.map((v) =>
            v >= 0 ? "#4A90E2" : "#FF6B6B"
          ),
          stack: "stack1",
        },
      ],
    };
  }

  const waterfallChartOptions: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        stacked: true,
        beginAtZero: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="prediction-section card">
      <h2>Vote Prediction</h2>
      <form onSubmit={handlePredict}>
        <div className="dropdown-group">
          <div className="form-group">
            <label>Age</label>
            <select
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            >
              <option value="">Select Age</option>
              <option value="18-29">18-29</option>
              <option value="30-44">30-44</option>
              <option value="45-64">45-64</option>
              <option value="65+">65+</option>
            </select>
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className="form-group">
            <label>Race</label>
            <select
              value={race}
              onChange={(e) => setRace(e.target.value)}
              required
            >
              <option value="">Select Race</option>
              <option value="White">White</option>
              <option value="Black">Black</option>
              <option value="Hispanic">Hispanic</option>
              <option value="Asian">Asian</option>
            </select>
          </div>
          <div className="form-group">
            <label>Household Income</label>
            <select
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              required
            >
              <option value="">Select Income</option>
              <option value="<50k">&lt;50k</option>
              <option value="50-100k">50-100k</option>
              <option value=">100k">&gt;100k</option>
            </select>
          </div>
          <div className="form-group">
            <label>Urbanity</label>
            <select
              value={urbanity}
              onChange={(e) => setUrbanity(e.target.value)}
              required
            >
              <option value="">Select Urbanity</option>
              <option value="rural">Rural</option>
              <option value="urban">Urban</option>
              <option value="suburban">Suburban</option>
            </select>
          </div>
          <div className="form-group">
            <label>Education</label>
            <select
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              required
            >
              <option value="">Select Education</option>
              <option value="college degree">College Degree</option>
              <option value="no college degree">No College Degree</option>
            </select>
          </div>
        </div>
        <button type="submit" className="primary-btn">
          Predict Vote
        </button>
      </form>

      {prediction && <p className="prediction-result">{prediction}</p>}

      {probabilityChartData && (
        <div className="chart-container">
          <h3>Probability Distribution</h3>
          <Pie data={probabilityChartData} />
        </div>
      )}

      {waterfallChartData && (
        <div className="chart-container">
          <h3>SHAP Waterfall Explanation</h3>
          <Bar data={waterfallChartData} options={waterfallChartOptions} />
        </div>
      )}

      <hr />
      <button onClick={handleTrainModel} className="primary-btn">
        Train Vote Model
      </button>
      {trainingStatus && <p className="training-status">{trainingStatus}</p>}
    </div>
  );
};

/* ---------------------------------------------------------------------------
   Main App Component
--------------------------------------------------------------------------- */

// Define an interface for IPF results
interface IpfResultType {
  iterations: number;
  finalChange: number;
  l1Errors: number[];
}

const App: React.FC = () => {
  const [selectedPoll, setSelectedPoll] = useState("Ohio Senate Primary");
  const [results, setResults] = useState<SurveyResult[]>([]);
  const [ipfResults, setIpfResults] = useState<IpfResultType | null>(null);

  const fetchResults = async (poll: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/survey-results/?poll=${encodeURIComponent(poll)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }
      const data: SurveyResult[] = await response.json();
      setResults(data);
    } catch (error) {
      console.error(error);
      alert("Error fetching survey results.");
    }
  };

  useEffect(() => {
    fetchResults(selectedPoll);
    // Clear IPF results when survey changes.
    setIpfResults(null);
  }, [selectedPoll]);

  const addResult = (newResult: SurveyResult) => {
    if (newResult.poll === selectedPoll) {
      setResults((prev) => [newResult, ...prev]);
    }
  };

  const removeResult = (id: number) => {
    setResults((prev) => prev.filter((result) => result.id !== id));
  };

  const handleTargetWeightsSubmit = async (weights: TargetWeights) => {
    try {
      const response = await fetch(`${API_BASE_URL}/run-ipf/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_weights: weights, poll: selectedPoll }),
      });
      if (!response.ok) {
        throw new Error("Failed to run IPF");
      }
      const data = await response.json();
      // Map the API response fields to our state.
      setIpfResults({
        iterations: data.iterations,
        finalChange: data.final_change,
        l1Errors: data.l1_errors,
      });
      // Re-fetch the updated survey results (with updated weights).
      fetchResults(selectedPoll);
    } catch (error) {
      console.error(error);
      alert("Error running IPF");
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Alex Shieh's DOGE Demo</h1>
      </header>
      <PollToggle
        selectedPoll={selectedPoll}
        setSelectedPoll={setSelectedPoll}
      />
      <SurveyForm
        selectedPoll={selectedPoll}
        onNewResult={addResult}
        pollCandidates={pollCandidates}
      />
      <TargetWeightsForm
        poll={selectedPoll}
        onSubmit={handleTargetWeightsSubmit}
      />
      {ipfResults && (
        <IpfResults
          iterations={ipfResults.iterations}
          finalChange={ipfResults.finalChange}
          l1Errors={ipfResults.l1Errors}
        />
      )}
      <ResultsTable results={results} onDeleteResult={removeResult} />
      <ToplineResults results={results} selectedPoll={selectedPoll} />
      <PredictionSection selectedPoll={selectedPoll} />
    </div>
  );
};

export default App;
