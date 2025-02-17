import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../constants";
import { ChartData, ChartOptions } from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

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

  useEffect(() => {
    setPrediction(null);
    setProbabilityDistribution(null);
    setShapExplanation(null);
    setTrainingStatus(null);
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
      <div className="blurb">
        <p>
          When you press train model, the backend uses an XGBoost algorithm to
          train a model on the current survey data. Then you can predict how an
          individual with known demographic characteristics would vote. It also
          outputs a probability distribution and SHAP analysis, showing how each
          of the user's demographic traits contribute to the result.
        </p>
      </div>
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
          <h3>SHAP Waterfall</h3>
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

export default PredictionSection;
