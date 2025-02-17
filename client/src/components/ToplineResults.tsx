import React, { useState, useEffect } from "react";
import { SurveyResult } from "../types";
import FilterGroup from "./FilterGroup";
import { Pie } from "react-chartjs-2";

type ToplineResultsProps = {
  results: SurveyResult[];
  selectedPoll: string;
};

const ToplineResults: React.FC<ToplineResultsProps> = ({
  results,
  selectedPoll,
}) => {
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

  const [selectedSubgroup, setSelectedSubgroup] = useState<string>("");
  const [sliderValue, setSliderValue] = useState<number>(50);

  useEffect(() => {
    setSliderValue(50);
    setSelectedSubgroup("");
  }, [selectedPoll]);

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

  const filteredResults = results.filter(
    (res) =>
      filterAges.includes(res.age) &&
      filterGenders.includes(res.gender) &&
      filterRaces.includes(res.race) &&
      filterIncomes.includes(res.income) &&
      filterUrbanities.includes(res.urbanity) &&
      filterEducations.includes(res.education)
  );

  const baseCandidateWeights: { [key: string]: number } = {};
  filteredResults.forEach((res) => {
    baseCandidateWeights[res.candidate] =
      (baseCandidateWeights[res.candidate] || 0) + res.weight;
  });

  const candidateOrder = ["Candidate A", "Candidate B"];

  const adjustedCandidateWeights = { ...baseCandidateWeights };

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
    subgroupDiffs = {
      diffA: Math.round(sliderValue - rawPercentA),
      diffB: Math.round(100 - sliderValue - rawPercentB),
    };

    const newA = (sliderValue / 100) * subgroupWeight;
    const newB = subgroupWeight - newA;
    adjustedCandidateWeights["Candidate A"] =
      (adjustedCandidateWeights["Candidate A"] || 0) - rawA + newA;
    adjustedCandidateWeights["Candidate B"] =
      (adjustedCandidateWeights["Candidate B"] || 0) - rawB + newB;
  }

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

  const pieData = {
    labels: candidateOrder,
    datasets: [
      {
        data: candidateOrder.map((cand) => adjustedCandidateWeights[cand] || 0),
        backgroundColor: ["#FF6B6B", "#4A90E2"],
      },
    ],
  };

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
  }, [selectedSubgroup, filteredResults]);

  return (
    <div className="topline-results card">
      <h3>Topline Results</h3>
      <div className="blurb">
        <p>
          View the survey results. They are weighted (if IPF has been run).
          Filter to specific demographics with the toggles. See hypothetical
          results if demographics changed their voting behavior with the
          dropdown.
        </p>
      </div>
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

      <div className="interactive-controls">
        <div className="dropdown-group">
          <label htmlFor="subgroup-dropdown">
            Reallocate Subgroup Vote Share:
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
              Reallocate votes in {selectedSubgroup}: Candidate A:{" "}
              <strong>{sliderValue}%</strong>
              {subgroupDiffs && (
                <span>
                  {" "}
                  ({subgroupDiffs.diffA >= 0 ? "+" : ""}
                  {subgroupDiffs.diffA}%)
                </span>
              )}{" "}
              | Candidate B: <strong>{100 - sliderValue}%</strong>
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

export default ToplineResults;
