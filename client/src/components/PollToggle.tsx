import React from "react";

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

export default PollToggle;
