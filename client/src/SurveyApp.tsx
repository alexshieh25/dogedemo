// App.tsx
import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import "./App.css";

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
  onNewResult: (result: SurveyResult) => void;
};

const SurveyForm: React.FC<SurveyFormProps> = ({
  selectedPoll,
  onNewResult,
}) => {
  const [candidate, setCandidate] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [race, setRace] = useState("");
  const [income, setIncome] = useState("");
  const [urbanity, setUrbanity] = useState("");
  const [education, setEducation] = useState("");

  const candidateOptions = ["Candidate A", "Candidate B", "Candidate C"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !candidate ||
      !age ||
      !gender ||
      !race ||
      !income ||
      !urbanity ||
      !education
    ) {
      alert("Please fill out all fields.");
      return;
    }
    const newResult = {
      id: 0, // Backend will assign real id.
      poll: selectedPoll,
      candidate,
      age,
      gender,
      race,
      income,
      urbanity,
      education,
      weight: 1.0,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/survey-results/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newResult),
      });
      if (!response.ok) {
        throw new Error("Failed to submit vote");
      }
      const createdResult: SurveyResult = await response.json();
      onNewResult(createdResult);
      setCandidate("");
      setAge("");
      setGender("");
      setRace("");
      setIncome("");
      setUrbanity("");
      setEducation("");
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
        {candidateOptions.map((cand) => (
          <div key={cand} className="radio-group">
            <input
              type="radio"
              id={cand}
              name="candidate"
              value={cand}
              checked={candidate === cand}
              onChange={() => setCandidate(cand)}
            />
            <label htmlFor={cand}>{cand}</label>
          </div>
        ))}
      </div>
      <div className="form-group">
        <label>Age</label>
        <select value={age} onChange={(e) => setAge(e.target.value)} required>
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
        <select value={race} onChange={(e) => setRace(e.target.value)} required>
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
      <button type="submit" className="primary-btn">
        Submit Vote
      </button>
    </form>
  );
};

/* ---------------------------------------------------------------------------
   ResultsTable Component
--------------------------------------------------------------------------- */
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
      if (response.ok) {
        onDeleteResult(id);
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting record.");
    }
  };

  return (
    <div className="results-table card">
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
type ToplineResultsProps = {
  results: SurveyResult[];
};

const ToplineResults: React.FC<ToplineResultsProps> = ({ results }) => {
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

  const filteredResults = results.filter(
    (res) =>
      filterAges.includes(res.age) &&
      filterGenders.includes(res.gender) &&
      filterRaces.includes(res.race) &&
      filterIncomes.includes(res.income) &&
      filterUrbanities.includes(res.urbanity) &&
      filterEducations.includes(res.education)
  );

  const candidateOrder = ["Candidate A", "Candidate B", "Candidate C"];

  const candidateWeights: { [key: string]: number } = {};
  filteredResults.forEach((res) => {
    candidateWeights[res.candidate] =
      (candidateWeights[res.candidate] || 0) + res.weight;
  });

  // Ensure we have keys in our desired order.
  const orderedCandidates = candidateOrder.filter(
    (cand) => cand in candidateWeights
  );

  const totalWeight = orderedCandidates.reduce(
    (sum, cand) => sum + candidateWeights[cand],
    0
  );
  const candidatePercentages = orderedCandidates.map((candidate) => ({
    candidate,
    percentage: totalWeight
      ? ((candidateWeights[candidate] / totalWeight) * 100).toFixed(1)
      : "0",
  }));

  const pieData = {
    labels: orderedCandidates,
    datasets: [
      {
        data: orderedCandidates.map((candidate) => candidateWeights[candidate]),
        backgroundColor: ["#007BFF", "#28A745", "#DC3545"],
      },
    ],
  };

  return (
    <div className="topline-results card">
      <h3>Topline Results</h3>
      <div className="filters">
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
      <div className="candidate-percentages">
        {candidatePercentages.map((cp) => (
          <p key={cp.candidate}>
            {cp.candidate}: {cp.percentage}%
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
   IpfResults Component (Display IPF Output)
--------------------------------------------------------------------------- */
interface IpfResultsProps {
  iterations: number;
  finalChange: number;
}

const IpfResults: React.FC<IpfResultsProps> = ({ iterations, finalChange }) => {
  return (
    <div className="ipf-results card">
      <h3>IPF Results</h3>
      <p>Iterations: {iterations}</p>
      <p>Final Change: {finalChange.toFixed(4)}</p>
    </div>
  );
};

/* ---------------------------------------------------------------------------
   PredictionSection Component
--------------------------------------------------------------------------- */
interface PredictionSectionProps {
  selectedPoll: string;
}

const PredictionSection: React.FC<PredictionSectionProps> = ({
  selectedPoll,
}) => {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [race, setRace] = useState("");
  const [income, setIncome] = useState("");
  const [urbanity, setUrbanity] = useState("");
  const [education, setEducation] = useState("");
  const [prediction, setPrediction] = useState<string | null>(null);
  const [trainingStatus, setTrainingStatus] = useState<string | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    // Collect all fields including the poll.
    const payload = {
      poll: selectedPoll, // Make sure this is sent.
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
      alert(result.message);
    } catch (error) {
      console.error(error);
      alert("Error training model.");
    }
  };

  return (
    <div className="prediction-section card">
      <h2>Vote Prediction</h2>
      <form onSubmit={handlePredict}>
        <div className="form-group">
          <label>Age</label>
          <select value={age} onChange={(e) => setAge(e.target.value)} required>
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
        <button type="submit" className="primary-btn">
          Predict Vote
        </button>
      </form>
      {prediction && <p className="prediction-result">{prediction}</p>}
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
const App: React.FC = () => {
  const [selectedPoll, setSelectedPoll] = useState("Ohio Senate Primary");
  const [results, setResults] = useState<SurveyResult[]>([]);
  const [ipfResults, setIpfResults] = useState<{
    iterations: number;
    finalChange: number;
  } | null>(null);

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
      // Expecting data.iterations and data.final_change in the response.
      setIpfResults({
        iterations: data.iterations,
        finalChange: data.final_change,
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
      <SurveyForm selectedPoll={selectedPoll} onNewResult={addResult} />
      <TargetWeightsForm
        poll={selectedPoll}
        onSubmit={handleTargetWeightsSubmit}
      />
      {ipfResults && (
        <IpfResults
          iterations={ipfResults.iterations}
          finalChange={ipfResults.finalChange}
        />
      )}
      <ResultsTable results={results} onDeleteResult={removeResult} />
      <ToplineResults results={results} />
      <PredictionSection selectedPoll={selectedPoll} />
    </div>
  );
};

export default App;
