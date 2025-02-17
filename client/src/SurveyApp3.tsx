// App.tsx
import React, { useEffect, useState, useRef } from "react";
import { Pie, Bar } from "react-chartjs-2";
import "chart.js/auto";
import * as d3 from "d3";
import {
  sankey,
  sankeyLinkHorizontal,
  SankeyGraph,
  SankeyNodeMinimal,
} from "d3-sankey";
import "./App.css";

/* ----------------------------
   Extended Types & Interfaces
----------------------------- */
interface MySankeyNode extends SankeyNodeMinimal<{}, {}> {
  name: string;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

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

export interface TargetWeights {
  age: { [key: string]: number };
  gender: { [key: string]: number };
  race: { [key: string]: number };
  income: { [key: string]: number };
  urbanity: { [key: string]: number };
  education: { [key: string]: number };
}

interface IpfIterationData {
  iteration: number;
  candidateA: number;
  candidateB: number;
  error: number;
}

interface TargetSensitivityData {
  target: number; // Target for Candidate A; B is 100 - target
  candidateA: number;
  candidateB: number;
}

/* ----------------------------
   Constants
----------------------------- */
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

/* ============================
   PollToggle Component
============================ */
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

/* ============================
   SurveyForm Component
============================ */
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

  // Only two candidates now.
  const candidateOptions = ["Candidate A", "Candidate B"];

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
    const newResult: SurveyResult = {
      id: 0,
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
      if (!response.ok) throw new Error("Failed to submit vote");
      const createdResult: SurveyResult = await response.json();
      onNewResult(createdResult);

      // Reset fields
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
      {/* Age */}
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
      {/* Gender */}
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
      {/* Race */}
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
      {/* Income */}
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
      {/* Urbanity */}
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
      {/* Education */}
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

/* ============================
   FilterGroup Component
============================ */
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

/* ============================
   ToplineResults Component
============================ */
type ToplineResultsProps = {
  results: SurveyResult[];
};
const ToplineResults: React.FC<ToplineResultsProps> = ({ results }) => {
  const [filterAges, setFilterAges] = useState([
    "18-29",
    "30-44",
    "45-64",
    "65+",
  ]);
  const [filterGenders, setFilterGenders] = useState(["Male", "Female"]);
  const [filterRaces, setFilterRaces] = useState([
    "White",
    "Black",
    "Hispanic",
    "Asian",
  ]);
  const [filterIncomes, setFilterIncomes] = useState([
    "<50k",
    "50-100k",
    ">100k",
  ]);
  const [filterUrbanities, setFilterUrbanities] = useState([
    "rural",
    "urban",
    "suburban",
  ]);
  const [filterEducations, setFilterEducations] = useState([
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

  const candidateOrder = ["Candidate A", "Candidate B"];
  const candidateWeights: { [key: string]: number } = {};
  filteredResults.forEach((res) => {
    candidateWeights[res.candidate] =
      (candidateWeights[res.candidate] || 0) + res.weight;
  });
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
        backgroundColor: ["#007BFF", "#28A745"],
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
      <div
        className="pie-chart-container"
        style={{ maxWidth: "600px", margin: "auto" }}
      >
        <Pie data={pieData} options={{ maintainAspectRatio: false }} />
      </div>
    </div>
  );
};

/* ============================
   TargetWeightsForm Component
============================ */
type TargetWeightsFormProps = {
  poll: string;
  onSubmit: (weights: TargetWeights) => void;
};
const TargetWeightsForm: React.FC<TargetWeightsFormProps> = ({
  poll,
  onSubmit,
}) => {
  // ... same code as your previous version, no fixed heights
  // (Removed for brevity in this snippet, but it's the same as above)
  // ...
  // ^ If you need the code, see the previous snippet or the final version.
  // We'll keep the code for completeness:

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
      [dimension]: { ...prev[dimension], [category]: value },
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

/* ============================
   IpfResults Component
============================ */
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

/* ============================
   IpfDataVis Component
============================ */
interface IpfDataVisProps {
  preResults: SurveyResult[] | null;
  postResults: SurveyResult[];
}
const IpfDataVis: React.FC<IpfDataVisProps> = ({ preResults, postResults }) => {
  // Remove forced height, let the chart auto-size
  // Add marginBottom to separate from the next card
  const computePercentages = (results: SurveyResult[]) => {
    const candidateOrder = ["Candidate A", "Candidate B"];
    const candidateWeights: { [key: string]: number } = {};
    results.forEach((res) => {
      candidateWeights[res.candidate] =
        (candidateWeights[res.candidate] || 0) + res.weight;
    });
    const ordered = candidateOrder.filter((cand) => cand in candidateWeights);
    const total = ordered.reduce(
      (sum, cand) => sum + candidateWeights[cand],
      0
    );
    return ordered.map((cand) => ({
      candidate: cand,
      percentage: total ? (candidateWeights[cand] / total) * 100 : 0,
    }));
  };
  const preData = preResults ? computePercentages(preResults) : null;
  const postData = computePercentages(postResults);

  const data = {
    labels: ["Candidate A", "Candidate B"],
    datasets: [
      {
        label: "Before IPF",
        backgroundColor: "rgba(0,123,255,0.6)",
        data: preData ? preData.map((d) => d.percentage) : [50, 50],
      },
      {
        label: "After IPF",
        backgroundColor: "rgba(40,167,69,0.6)",
        data: postData.map((d) => d.percentage),
      },
    ],
  };

  return (
    <div
      className="ipf-data-vis card"
      style={{ maxWidth: "600px", margin: "2rem auto" }}
    >
      <h3>IPF Data Visualization (Bar Chart)</h3>
      <Bar data={data} height={400} options={{ maintainAspectRatio: false }} />
    </div>
  );
};

/* ============================
   IpfSankeyDiagram Component
============================ */
interface IpfSankeyDiagramProps {
  preResults: SurveyResult[] | null;
  postResults: SurveyResult[];
}
const IpfSankeyDiagram: React.FC<IpfSankeyDiagramProps> = ({
  preResults,
  postResults,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const computePercentages = (results: SurveyResult[]) => {
    const candidateOrder = ["Candidate A", "Candidate B"];
    const candidateWeights: { [key: string]: number } = {};
    results.forEach((res) => {
      candidateWeights[res.candidate] =
        (candidateWeights[res.candidate] || 0) + res.weight;
    });
    const ordered = candidateOrder.filter((cand) => cand in candidateWeights);
    const total = ordered.reduce(
      (sum, cand) => sum + candidateWeights[cand],
      0
    );
    return ordered.reduce((acc: { [key: string]: number }, cand) => {
      acc[cand] = total ? (candidateWeights[cand] / total) * 100 : 0;
      return acc;
    }, {});
  };

  const prePerc = preResults
    ? computePercentages(preResults)
    : { "Candidate A": 50, "Candidate B": 50 };
  const postPerc = computePercentages(postResults);

  const minA = Math.min(prePerc["Candidate A"], postPerc["Candidate A"]);
  const minB = Math.min(prePerc["Candidate B"], postPerc["Candidate B"]);
  const flowAtoB =
    prePerc["Candidate A"] > postPerc["Candidate A"]
      ? prePerc["Candidate A"] - minA
      : 0;
  const flowBtoA =
    prePerc["Candidate B"] > postPerc["Candidate B"]
      ? prePerc["Candidate B"] - minB
      : 0;

  const nodes = [
    { name: "Candidate A (Pre)" },
    { name: "Candidate B (Pre)" },
    { name: "Candidate A (Post)" },
    { name: "Candidate B (Post)" },
  ];
  const links: { source: number; target: number; value: number }[] = [
    { source: 0, target: 2, value: minA },
    { source: 1, target: 3, value: minB },
  ];
  if (flowAtoB > 0) {
    links.push({ source: 0, target: 3, value: flowAtoB });
  }
  if (flowBtoA > 0) {
    links.push({ source: 1, target: 2, value: flowBtoA });
  }

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 500;
    const height = 300;
    svg.attr("width", width).attr("height", height);

    const { nodes: sankeyNodes, links: sankeyLinks } = sankey()
      .nodeWidth(20)
      .nodePadding(10)
      .extent([
        [1, 1],
        [width - 1, height - 6],
      ])({
      nodes: nodes.map((d) => Object.assign({}, d)),
      links: links.map((d) => Object.assign({}, d)),
    } as SankeyGraph<any, any>);

    svg
      .append("g")
      .selectAll("path")
      .data(sankeyLinks)
      .enter()
      .append("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("fill", "none")
      .attr("stroke", "#888")
      .attr("stroke-width", (d) => Math.max(1, d.width || 1))
      .attr("opacity", 0.5);

    const node = svg
      .append("g")
      .selectAll("g")
      .data(sankeyNodes)
      .enter()
      .append("g");

    node
      .append("rect")
      .attr("x", (d) => (d as MySankeyNode).x0)
      .attr("y", (d) => (d as MySankeyNode).y0)
      .attr("height", (d) => (d as MySankeyNode).y1 - (d as MySankeyNode).y0)
      .attr("width", (d) => (d as MySankeyNode).x1 - (d as MySankeyNode).x0)
      .attr("fill", (d) =>
        (d as MySankeyNode).name.includes("A") ? "#007BFF" : "#28A745"
      )
      .attr("stroke", "#000");

    node
      .append("text")
      .attr("x", (d) => (d as MySankeyNode).x0 - 6)
      .attr("y", (d) => ((d as MySankeyNode).y1 + (d as MySankeyNode).y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .text((d) => (d as MySankeyNode).name)
      .filter((d) => (d as MySankeyNode).x0 < width / 2)
      .attr("x", (d) => (d as MySankeyNode).x1 + 6)
      .attr("text-anchor", "start");
  }, [svgRef, preResults, postResults]);

  return (
    <div
      className="ipf-sankey-diagram card"
      style={{ maxWidth: "500px", margin: "2rem auto" }}
    >
      <h3>IPF Sankey Diagram</h3>
      {preResults ? (
        <svg ref={svgRef}></svg>
      ) : (
        <p>Run IPF to see the Sankey diagram.</p>
      )}
    </div>
  );
};

/* ============================
   IpfHeatmap Component
============================ */
interface IpfHeatmapData {
  dimension: string;
  candidateA: number;
  candidateB: number;
}
const IpfHeatmap: React.FC = () => {
  const dummyData: IpfHeatmapData[] = [
    { dimension: "Age", candidateA: 30, candidateB: 70 },
    { dimension: "Gender", candidateA: 60, candidateB: 40 },
    { dimension: "Income", candidateA: 50, candidateB: 50 },
    { dimension: "Education", candidateA: 45, candidateB: 55 },
  ];
  const getColor = (value: number) => {
    const red = Math.round(255 - (value / 100) * 255);
    const green = Math.round((value / 100) * 255);
    return `rgb(${red}, ${green}, 100)`;
  };

  return (
    <div
      className="ipf-heatmap card"
      style={{ maxWidth: "600px", margin: "2rem auto" }}
    >
      <h3>IPF Heatmap</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th
              style={{
                border: "1px solid var(--border-color)",
                padding: "4px",
              }}
            >
              Dimension
            </th>
            <th
              style={{
                border: "1px solid var(--border-color)",
                padding: "4px",
              }}
            >
              Candidate A (%)
            </th>
            <th
              style={{
                border: "1px solid var(--border-color)",
                padding: "4px",
              }}
            >
              Candidate B (%)
            </th>
          </tr>
        </thead>
        <tbody>
          {dummyData.map((row) => (
            <tr key={row.dimension}>
              <td
                style={{
                  border: "1px solid var(--border-color)",
                  padding: "4px",
                }}
              >
                {row.dimension}
              </td>
              <td
                style={{
                  border: "1px solid var(--border-color)",
                  padding: "4px",
                  backgroundColor: getColor(row.candidateA),
                }}
              >
                {row.candidateA}%
              </td>
              <td
                style={{
                  border: "1px solid var(--border-color)",
                  padding: "4px",
                  backgroundColor: getColor(row.candidateB),
                }}
              >
                {row.candidateB}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ============================
   IpfConvergence Component
============================ */
const IpfConvergence: React.FC = () => {
  // Same code as above, but removed forced height
  const dummyData: IpfIterationData[] = [
    { iteration: 0, candidateA: 55, candidateB: 45, error: 5 },
    { iteration: 1, candidateA: 53, candidateB: 47, error: 4 },
    { iteration: 2, candidateA: 52, candidateB: 48, error: 3 },
    { iteration: 3, candidateA: 51, candidateB: 49, error: 2 },
    { iteration: 4, candidateA: 50.5, candidateB: 49.5, error: 1 },
    { iteration: 5, candidateA: 50, candidateB: 50, error: 0 },
  ];
  const [currentIteration, setCurrentIteration] = useState(0);
  const currentData =
    dummyData.find((d) => d.iteration === currentIteration) || dummyData[0];

  const chartData = {
    labels: ["Candidate A", "Candidate B"],
    datasets: [
      {
        label: "Vote Percentage",
        backgroundColor: ["#007BFF", "#28A745"],
        data: [currentData.candidateA, currentData.candidateB],
      },
    ],
  };

  return (
    <div
      className="ipf-convergence card"
      style={{ maxWidth: "600px", margin: "2rem auto" }}
    >
      <h3>IPF Convergence</h3>
      <div style={{ margin: "20px" }}>
        <label>
          Iteration: {currentIteration}
          <input
            type="range"
            min="0"
            max={dummyData.length - 1}
            value={currentIteration}
            onChange={(e) => setCurrentIteration(parseInt(e.target.value))}
            style={{ width: "100%" }}
          />
        </label>
      </div>
      <Bar
        data={chartData}
        height={400}
        options={{ maintainAspectRatio: false }}
      />
      <p style={{ textAlign: "center" }}>
        Convergence Error: {currentData.error}
      </p>
    </div>
  );
};

/* ============================
   TargetSensitivity Component
============================ */
const TargetSensitivity: React.FC = () => {
  const dummySensitivityData: TargetSensitivityData[] = [
    { target: 40, candidateA: 42, candidateB: 58 },
    { target: 42, candidateA: 43, candidateB: 57 },
    { target: 44, candidateA: 44, candidateB: 56 },
    { target: 46, candidateA: 45, candidateB: 55 },
    { target: 48, candidateA: 46, candidateB: 54 },
    { target: 50, candidateA: 47, candidateB: 53 },
    { target: 52, candidateA: 48, candidateB: 52 },
    { target: 54, candidateA: 49, candidateB: 51 },
    { target: 56, candidateA: 50, candidateB: 50 },
    { target: 58, candidateA: 51, candidateB: 49 },
    { target: 60, candidateA: 52, candidateB: 48 },
  ];
  const [currentTarget, setCurrentTarget] = useState(56);
  const closest = dummySensitivityData.reduce((prev, curr) =>
    Math.abs(curr.target - currentTarget) <
    Math.abs(prev.target - currentTarget)
      ? curr
      : prev
  );
  const chartData = {
    labels: ["Candidate A", "Candidate B"],
    datasets: [
      {
        label: "Predicted Vote %",
        backgroundColor: ["#007BFF", "#28A745"],
        data: [closest.candidateA, closest.candidateB],
      },
    ],
  };

  return (
    <div
      className="target-sensitivity card"
      style={{ maxWidth: "600px", margin: "2rem auto" }}
    >
      <h3>Target Sensitivity Analysis</h3>
      <div style={{ margin: "20px" }}>
        <label>
          Candidate A Target (%):
          <input
            type="range"
            min="40"
            max="60"
            step="1"
            value={currentTarget}
            onChange={(e) => setCurrentTarget(parseInt(e.target.value))}
            style={{ width: "100%" }}
          />
        </label>
        <p style={{ textAlign: "center" }}>
          Target: {currentTarget}% (Candidate B: {100 - currentTarget}%)
        </p>
      </div>
      <Bar
        data={chartData}
        height={400}
        options={{ maintainAspectRatio: false }}
      />
    </div>
  );
};

/* ============================
   XGBoostDataVis Component
============================ */
interface XGBoostDataVisProps {
  selectedPoll: string;
}
const XGBoostDataVis: React.FC<XGBoostDataVisProps> = ({ selectedPoll }) => {
  const dummyShapData = [
    { feature: "Age", shap: 0.35 },
    { feature: "Gender", shap: 0.25 },
    { feature: "Income", shap: 0.2 },
    { feature: "Education", shap: 0.2 },
  ];
  const dummyUncertaintyData = [
    { bin: "40-45%", count: 30 },
    { bin: "45-50%", count: 50 },
    { bin: "50-55%", count: 20 },
  ];

  const shapChartData = {
    labels: dummyShapData.map((d) => d.feature),
    datasets: [
      {
        label: "SHAP Value",
        backgroundColor: "#DC3545",
        data: dummyShapData.map((d) => d.shap),
      },
    ],
  };

  const uncertaintyChartData = {
    labels: dummyUncertaintyData.map((d) => d.bin),
    datasets: [
      {
        label: "Frequency",
        backgroundColor: "#6C757D",
        data: dummyUncertaintyData.map((d) => d.count),
      },
    ],
  };

  return (
    <div
      className="xgboost-data-vis card"
      style={{ maxWidth: "600px", margin: "2rem auto" }}
    >
      <h3>XGBoost Model Visualizations</h3>
      <div
        className="chart-section"
        style={{ maxWidth: "600px", margin: "1rem auto" }}
      >
        <h4>SHAP Summary Plot</h4>
        <Bar
          data={shapChartData}
          height={400}
          options={{ maintainAspectRatio: false }}
        />
      </div>
      <div
        className="chart-section"
        style={{ maxWidth: "600px", margin: "1rem auto" }}
      >
        <h4>Prediction Uncertainty Histogram</h4>
        <Bar
          data={uncertaintyChartData}
          height={400}
          options={{ maintainAspectRatio: false }}
        />
      </div>
    </div>
  );
};

/* ============================
   PredictivePolling Component
============================ */
interface PredictivePollingProps {
  selectedPoll: string;
}
const PredictivePolling: React.FC<PredictivePollingProps> = ({
  selectedPoll,
}) => {
  const ageGroups = ["18-29", "30-44", "45-64", "65+"];
  const [shifts, setShifts] = useState<{ [key: string]: number }>({
    "18-29": 0,
    "30-44": 0,
    "45-64": 0,
    "65+": 0,
  });
  const [simulatedVotes, setSimulatedVotes] = useState<{
    candidateA: number;
    candidateB: number;
  } | null>(null);

  const handleShiftChange = (group: string, value: number) => {
    setShifts((prev) => ({ ...prev, [group]: value }));
  };

  const handleSimulate = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/predictive-polling/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poll: selectedPoll, shifts }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Simulation failed");
      setSimulatedVotes({
        candidateA: result.candidateA,
        candidateB: result.candidateB,
      });
    } catch (error) {
      console.error(error);
      setSimulatedVotes({
        candidateA: 50 + Object.values(shifts).reduce((a, b) => a + b, 0),
        candidateB: 50,
      });
    }
  };

  const baseline = { candidateA: 50, candidateB: 50 };
  const chartData = {
    labels: ["Candidate A", "Candidate B"],
    datasets: [
      {
        label: "Baseline",
        backgroundColor: "rgba(0,123,255,0.6)",
        data: [baseline.candidateA, baseline.candidateB],
      },
      {
        label: "Simulated",
        backgroundColor: "rgba(40,167,69,0.6)",
        data: simulatedVotes
          ? [simulatedVotes.candidateA, simulatedVotes.candidateB]
          : [baseline.candidateA, baseline.candidateB],
      },
    ],
  };

  return (
    <div
      className="predictive-polling card"
      style={{ maxWidth: "600px", margin: "2rem auto" }}
    >
      <h3>Predictive Polling Simulator</h3>
      <div className="sliders">
        {ageGroups.map((group) => (
          <div key={group} className="slider-group">
            <label>
              {group} Shift (% towards Candidate B):
              <input
                type="range"
                min="-10"
                max="10"
                step="1"
                value={shifts[group]}
                onChange={(e) =>
                  handleShiftChange(group, parseInt(e.target.value))
                }
              />
              <span>{shifts[group]}%</span>
            </label>
          </div>
        ))}
      </div>
      <button className="primary-btn" onClick={handleSimulate}>
        Simulate Vote Shift
      </button>
      <div
        className="chart-container"
        style={{ maxWidth: "600px", margin: "1rem auto" }}
      >
        <Bar
          data={chartData}
          height={400}
          options={{ maintainAspectRatio: false }}
        />
      </div>
    </div>
  );
};

/* ============================
   PredictionSection Component
============================ */
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
      if (!response.ok) throw new Error(result.error || "Prediction failed");
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
      if (!response.ok) throw new Error(result.error || "Training failed");
      alert(result.message);
    } catch (error) {
      console.error(error);
      alert("Error training model.");
    }
  };

  return (
    <div
      className="prediction-section card"
      style={{ maxWidth: "600px", margin: "2rem auto" }}
    >
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

/* ============================
   Main App Component
============================ */
const App: React.FC = () => {
  const [selectedPoll, setSelectedPoll] = useState("Ohio Senate Primary");
  const [results, setResults] = useState<SurveyResult[]>([]);
  const [preIpfResults, setPreIpfResults] = useState<SurveyResult[] | null>(
    null
  );
  const [ipfResults, setIpfResults] = useState<{
    iterations: number;
    finalChange: number;
  } | null>(null);

  const fetchResults = async (poll: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/survey-results/?poll=${encodeURIComponent(poll)}`
      );
      if (!response.ok) throw new Error("Failed to fetch results");
      const data: SurveyResult[] = await response.json();
      setResults(data);
    } catch (error) {
      console.error(error);
      alert("Error fetching survey results.");
    }
  };

  useEffect(() => {
    fetchResults(selectedPoll);
    setIpfResults(null);
    setPreIpfResults(null);
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
      // Save "before" results for IPF visual comparison
      setPreIpfResults(results);

      const response = await fetch(`${API_BASE_URL}/run-ipf/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_weights: weights, poll: selectedPoll }),
      });
      if (!response.ok) throw new Error("Failed to run IPF");
      const data = await response.json();
      setIpfResults({
        iterations: data.iterations,
        finalChange: data.final_change,
      });

      // Refresh results after IPF
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

      {/* IPF Visualizations */}
      <IpfDataVis preResults={preIpfResults} postResults={results} />
      <IpfSankeyDiagram preResults={preIpfResults} postResults={results} />
      <IpfHeatmap />
      <IpfConvergence />
      <TargetSensitivity />

      <ResultsTable results={results} onDeleteResult={removeResult} />
      <ToplineResults results={results} />

      {/* XGBoost Visualization (Dummy) */}
      <XGBoostDataVis selectedPoll={selectedPoll} />

      {/* Predictive Polling Simulator */}
      <PredictivePolling selectedPoll={selectedPoll} />

      <PredictionSection selectedPoll={selectedPoll} />
    </div>
  );
};

export default App;
