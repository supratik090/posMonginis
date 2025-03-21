import React, { useState, useEffect, useCallback } from 'react';
import { DatePicker, Card, Col, Row, Statistic, Typography } from 'antd';
import axios from 'axios';
import moment from 'moment';
import DefaultLayout from "../components/DefaultLayout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Title } = Typography;

const Adashboard = () => {
  const [selectedDate, setSelectedDate] = useState(moment());
  const [totalSales, setTotalSales] = useState(0);
  const [averageDailySales, setAverageDailySales] = useState(0);
  const [salesByCategory, setSalesByCategory] = useState([]);

 const fetchData = useCallback(async (date) => {
   const formattedDate = date.format('YYYY-MM');

   try {
     const { data } = await axios.get(`/api/bills/total-sales?date=${formattedDate}`);
     setTotalSales(data.totalSales || 0);
     setAverageDailySales(data.averageDailySales || 0);

     // Fetch daily sales by category
     const salesResponse = await axios.get(`/api/bills/total-sales-category?month=${formattedDate}`);

     // Ensure data is an array
     const salesData = Array.isArray(salesResponse.data) ? salesResponse.data : [];

     setSalesByCategory(salesData);
   } catch (error) {
     console.error('Error fetching sales data:', error);
     setTotalSales(0);
     setSalesByCategory([]); // Ensure it's an array
   }
 }, []);


  useEffect(() => {
    fetchData(selectedDate);
  }, [fetchData, selectedDate]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchData(date);
  };

  // Transform data for Recharts stacked bar format
//  const transformedChartData = salesByCategory.reduce((acc, category) => {
//    category.dailySales.forEach((day) => {
//      const existingEntry = acc.find((entry) => entry.day === day.day.toString());
//      if (existingEntry) {
//        existingEntry[category.category] = day.totalSales;
//      } else {
//        acc.push({ day: day.day.toString(), [category.category]: day.totalSales });
//      }
//    });
//    return acc;
//  }, []);


const transformedChartData = salesByCategory.reduce((acc, category) => {
  category.dailySales.forEach((day) => {
    let existingEntry = acc.find((entry) => entry.day === day.day.toString());

    if (existingEntry) {
      existingEntry[category.category] = day.totalSales;
      existingEntry.totalSales += day.totalSales; // ✅ Add to total sales per day
    } else {
      acc.push({
        day: day.day.toString(),
        [category.category]: day.totalSales,
        totalSales: day.totalSales, // ✅ Initialize total sales per day
      });
    }
  });
  return acc;
}, []);


const categoryColors = [
  "#0D47A1", // Dark Blue
  "#1976D2", // Medium Blue
  "#42A5F5", // Light Blue
  "#00ACC1", // Cyan
  "#00897B", // Teal
  "#43A047", // Dark Green
  "#66BB6A", // Medium Green
  "#9CCC65", // Light Green
  "#2E7D32"  // Deep Green
];



  return (
    <DefaultLayout>
      <div>
        <Title level={2}>Sales Dashboard</Title>
        <DatePicker
          picker="month"
          value={selectedDate}
          onChange={handleDateChange}
          format="MMMM YYYY"
          style={{ marginBottom: 20 }}
        />

        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic title="Total Sales" value={totalSales} precision={2} valueStyle={{ color: '#3f8600' }} prefix="₹" />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="Average Sales per day" value={averageDailySales} precision={2} valueStyle={{ color: '#3f8600' }} prefix="₹" />
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 20 }}>
          <Col span={24}>
            <Card title="Daily Sales by Category">
              <ResponsiveContainer width="100%" height={400}>
           <BarChart width={800} height={500} data={transformedChartData}>
             <XAxis dataKey="day" tick={{ fontSize: 12 }} />
             <YAxis />
             <Tooltip
               content={({ payload, label }) => {
                 if (!payload || payload.length === 0) return null;

                 // Calculate total sales for the day
                 const totalSales = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
                 const dayOfWeekShort = moment(label, "D").format("ddd"); // Get weekday name (e.g., "Fri")

                 return (
                   <div style={{ background: "#fff", padding: "8px", border: "1px solid #ccc" }}>
                     <p><strong>{dayOfWeekShort} (Day {label})</strong></p>
                     {payload.map((entry, index) => (
                       <p key={index} style={{ color: entry.color }}>
                         {entry.name}: ₹{entry.value}
                       </p>
                     ))}
                     <hr />
                     <p><strong>Total Sales: ₹{totalSales}</strong></p> {/* ✅ Total only in tooltip */}
                   </div>
                 );
               }}
             />


             {salesByCategory.map((category, index) => (
               <Bar
                 key={category.category}
                 dataKey={category.category}
                 stackId="a"
                 fill={categoryColors[index % categoryColors.length]}
               />
             ))}
           </BarChart>

              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

      </div>
    </DefaultLayout>
  );
};

export default Adashboard;
