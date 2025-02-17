import React, { useState, useEffect } from "react";
import { TargetWeights } from "../types";

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
      <div className="blurb">
        <p>
          Run Iterative Proportional Fitting on the survey data with custom
          target weights. Running IPF generates a convergence graph and
          iteration stats.
        </p>
      </div>
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

export default TargetWeightsForm;
