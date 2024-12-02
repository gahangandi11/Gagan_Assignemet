import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [apiData, setApiData] = useState(null);
  const [groupBy, setGroupBy] = useState(
    () => localStorage.getItem("groupBy") || "status"
  );
  const [sortBy, setSortBy] = useState("priority");

  useEffect(() => {

    //function to import api data
    const fetchData = async () => {
      const response = await fetch(
        "https://api.quicksell.co/v1/internal/frontend-assignment"
      );
      const data = await response.json();
      setApiData(data);
    };

    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem("groupBy", groupBy);
  }, [groupBy]);

  // Priority mapping
  const priorityLevels = {
    4: "Urgent",
    3: "High",
    2: "Medium",
    1: "Low",
    0: "No Priority",
  };

  const groupTickets = (tickets, criteria) => {
    if (criteria === "user") {
      return tickets.reduce((acc, ticket) => {
        const user = apiData.users.find((u) => u.id === ticket.userId);
        const key = user ? user.name : "Unknown User";
        if (!acc[key]) acc[key] = [];
        acc[key].push(ticket);
        return acc;
      }, {});
    } else {
      return tickets.reduce((acc, ticket) => {
        const key = ticket[criteria];
        if (!acc[key]) acc[key] = [];
        acc[key].push(ticket);
        return acc;
      }, {});
    }
  };

  const sortTickets = (tickets, criteria) => {
    if (criteria === "priority") {
      return tickets.sort((a, b) => b.priority - a.priority); // Descending priority
    } else if (criteria === "title") {
      return tickets.sort((a, b) => a.title.localeCompare(b.title)); // Ascending title
    }
    return tickets;
  };

  if (!apiData) return <div>Loading...</div>;

  const groupedTickets = groupTickets(apiData.tickets, groupBy);

  return (
    <div>
      {/* Group By and Sort By Filters */}
      <div className="filter">
        <label htmlFor="group-by">Group by:</label>
        <select
          id="group-by"
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
        >
          <option value="status">Status</option>
          <option value="user">User</option>
          <option value="priority">Priority</option>
        </select>

        <label htmlFor="sort-by" style={{ marginLeft: "20px" }}>
          Sort by:
        </label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="priority">Priority (Descending)</option>
          <option value="title">Title (Ascending)</option>
        </select>
      </div>

      {/* Display Grouped and Sorted Tickets */}
      <div className="container">
        {Object.keys(groupedTickets).map((groupKey) => (
          <div key={groupKey} className="column">
            <h2>
              {groupBy === "priority"
                ? `${priorityLevels[groupKey] || "No Priority"} (${groupKey})`
                : groupKey}
            </h2>
            {sortTickets(groupedTickets[groupKey], sortBy).map((ticket) => (
              <div key={ticket.id} className="ticket-card">
                <h4>{ticket.title}</h4>
                <p>
                  Priority: {priorityLevels[ticket.priority] || "No Priority"}
                </p>
                <p>Status: {ticket.status}</p>
                <p>
                  User:{" "}
                  {
                    apiData.users.find((user) => user.id === ticket.userId)
                      ?.name
                  }
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
