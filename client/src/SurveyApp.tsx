import React, { useState, useEffect } from "react";
import "./App.css";
import PollToggle from "./components/PollToggle";
import SurveyForm from "./components/SurveyForm";
import ResultsTable from "./components/ResultsTable";
import ToplineResults from "./components/ToplineResults";
import TargetWeightsForm from "./components/TargetWeightsForm";
import IpfResults from "./components/IpfResults";
import PredictionSection from "./components/PredictionSection";
import { SurveyResult, IpfResultType } from "./types";
import { API_BASE_URL } from "./constants";
import { pollCandidates } from "./pollCandidates";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SurveyApp: React.FC = () => {
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

  const handleTargetWeightsSubmit = async (weights: any) => {
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
      setIpfResults({
        iterations: data.iterations,
        finalChange: data.final_change,
        l1Errors: data.l1_errors,
      });
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
      <div className="outer-blurb">
        <p>
          This is an interactive data analysis demo built from scratch in under
          48 hours to support my application to DOGE. While I’ve worked on
          large-scale polling projects before — including proprietary software
          that powered over a million robocalls and was cited by major news
          outlets like Fox News and MSNBC — this project was an opportunity to
          build an open-source alternative from first principles. The source
          code and design analysis is at{" "}
          <a
            href="https://github.com/alexshieh25/dogedemo"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://github.com/alexshieh25/dogedemo
          </a>
          .
        </p>
      </div>
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

export default SurveyApp;
