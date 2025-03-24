import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";

const SalesTrendChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
          const response = await axios.get("/api/bills/5minLineChart");
                  if (Array.isArray(response.data)) {
                    setData(response.data);
                  } else {
                    setData([]);
                    console.error("Unexpected data format:", response.data);
                  }

      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };

    if (selectedDate) {
      fetchSalesData();
    }
  }, [selectedDate]);



  return (
    <div style={{ width: "100%", height: 400, textAlign: "center" }}>
      <h3>Sales Trend (5-Minute Intervals)</h3>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : data.length === 0 ? (
        <p>No sales data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default SalesTrendChart;
