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
    }
  return (
                   </div>
      </div>
  );
};
