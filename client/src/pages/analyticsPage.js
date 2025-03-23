import React, { useState, useEffect, useCallback } from 'react';
import { DatePicker, Card, Col, Row, Statistic, Typography, Select, Empty } from 'antd';
import axios from 'axios';
import moment from 'moment';
import DefaultLayout from "../components/DefaultLayout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Title } = Typography;
const { Option } = Select;

const Adashboard = () => {
  const [selectedDate, setSelectedDate] = useState(moment());
  const [totalSales, setTotalSales] = useState(0);
  const [averageDailySales, setAverageDailySales] = useState(0);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loadingTopProducts, setLoadingTopProducts] = useState(false);

  const fetchData = useCallback(async (date) => {
    const formattedDate = date.format('YYYY-MM');

    try {
      const { data } = await axios.get(`/api/bills/total-sales?date=${formattedDate}`);
      setTotalSales(data.totalSales || 0);
      setAverageDailySales(data.averageDailySales || 0);

      const salesResponse = await axios.get(`/api/bills/total-sales-category?month=${formattedDate}`);
      const salesData = Array.isArray(salesResponse.data) ? salesResponse.data : [];
      setSalesByCategory(salesData);
      setSelectedCategories(salesData.map((category) => category.category));

      if (salesData.length > 0) {
        setSelectedCategory(salesData[0].category);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setTotalSales(0);
      setSalesByCategory([]);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedDate);
  }, [fetchData, selectedDate]);

  useEffect(() => {
    if (!selectedCategory) return;
    fetchTopProducts(selectedCategory, selectedDate);
  }, [selectedCategory, selectedDate]);

  const fetchTopProducts = async (category, date) => {
    setLoadingTopProducts(true);
    const formattedMonth = date.format('YYYY-MM');

    try {
      const response = await axios.get(`/api/bills/top-products?category=${category}&month=${formattedMonth}`);
      console.log("Top Products Response:", response.data); // Debugging
      setTopProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching top products:', error);
      setTopProducts([]);
    } finally {
      setLoadingTopProducts(false);
    }
  };

  const handleDateChange = (date) => setSelectedDate(date);

  const handleCategoryChange = (selectedValues) => {
    if (selectedValues.includes("all")) {
      setSelectedCategories(salesByCategory.map((category) => category.category));
    } else {
      setSelectedCategories(selectedValues);
    }
  };

  const handleSelectedCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const transformedChartData = salesByCategory.reduce((acc, category) => {
    if (!selectedCategories.includes(category.category)) return acc;

    category.dailySales.forEach((day) => {
      let existingEntry = acc.find((entry) => entry.day === day.day.toString());

      if (!existingEntry) {
        existingEntry = { day: day.day.toString(), totalSales: 0 };
        acc.push(existingEntry);
      }

      existingEntry[category.category] = (existingEntry[category.category] || 0) + day.totalSales;
      existingEntry.totalSales += day.totalSales;
    });

    return acc;
  }, []);

  const categoryColors = ["#0D47A1", "#1976D2", "#42A5F5", "#00ACC1", "#00897B", "#43A047", "#66BB6A", "#9CCC65", "#2E7D32"];

  return (
    <DefaultLayout>
      <div>
        <Title level={2}>Sales Dashboard</Title>

        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={12}>
            <DatePicker
              picker="month"
              value={selectedDate}
              onChange={handleDateChange}
              format="MMMM YYYY"
              style={{ width: "100%" }}
            />
          </Col>
        </Row>

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
              <Row style={{ marginBottom: 20 }}>
                <Col span={12}>
                  <Select
                    mode="multiple"
                    allowClear
                    style={{ width: "100%" }}
                    placeholder="Filter by Category"
                    value={selectedCategories}
                    onChange={handleCategoryChange}
                  >
                    <Option key="all" value="all">Select All Categories</Option>
                    {salesByCategory.map((category) => (
                      <Option key={category.category} value={category.category}>{category.category}</Option>
                    ))}
                  </Select>
                </Col>
              </Row>

              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={transformedChartData}>
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {selectedCategories.map((category, index) => (
                    <Bar key={category} dataKey={category} stackId="a" fill={categoryColors[index % categoryColors.length]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 20 }}>
          <Col span={24}>
            <Card title="Top 20 Products by Sales">
              <Row style={{ marginBottom: 20 }}>
                <Col span={12}>
                  <Select
                    value={selectedCategory}
                    onChange={handleSelectedCategoryChange}
                    placeholder="Select Category"
                    style={{ width: "100%" }}
                  >
                    {selectedCategories.map((category) => (
                      <Option key={category} value={category}>{category}</Option>
                    ))}
                  </Select>
                </Col>
              </Row>

              {topProducts.length === 0 ? (
                <Empty description="No data available for this category" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topProducts}>
                    <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalSales" fill="#82ca9d" name="Total Sales (₹)" />
                    <Bar dataKey="totalSold" fill="#8884d8" name="Total Quantity Sold" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </DefaultLayout>
  );
};

export default Adashboard;
