import React, { useState } from "react";
import { SurveyResult } from "../types";
import { API_BASE_URL } from "../constants";

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
      <div className="blurb">
        <p>
          Scroll through results stored in the database. Delete unwanted
          results. See weights change in real-time.
        </p>
      </div>
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

export default ResultsTable;
