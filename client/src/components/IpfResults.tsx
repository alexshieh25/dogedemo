import React from "react";
import { Line } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js";

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
  const labels = l1Errors.map((_, index) => `${index}`);

  const data: ChartData<"line", number[], string> = {
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

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
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
      <div className="blurb">
        <p>
          This panel plots the L1 norm throughout successive iterations of IPF.
        </p>
      </div>
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

export default IpfResults;
