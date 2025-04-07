import React, { useState, useEffect, useCallback } from 'react';
import { DatePicker, Card, Col, Row, Statistic, Typography, Select, Empty, Table, Panel } from 'antd';
import axios from 'axios';
import moment from 'moment';
import DefaultLayout from "../components/DefaultLayout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Title } = Typography;
const { Option } = Select;

const Adashboard = () => {
  const [selectedDate, setSelectedDate] = useState(moment());
  const [totalSales, setTotalSales] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [averageDailySales, setAverageDailySales] = useState(0);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loadingTopProducts, setLoadingTopProducts] = useState(false);
  const [chartMetric, setChartMetric] = useState("totalSales");
   const [totalReceipts, setTotalReceipts] = useState(0); // New state for Total Receipts
  const [grossMargin, setGrossMargin] = useState(0); // New state for Gross Margin
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);



  const fetchData = useCallback(async (date) => {
    const formattedDate = date.format('YYYY-MM');

    try {
      const { data } = await axios.get(`/api/bills/total-sales?date=${formattedDate}`);
      setTotalSales(data.totalSales || 0);
      setAverageDailySales(data.averageDailySales || 0);


       // Fetch total receipts for the month
            const receiptsResponse = await axios.get(`/api/bills/total-receipts?date=${formattedDate}`);
            setTotalReceipts(receiptsResponse.data.totalReceipts || 0);




      const salesResponse = await axios.get(`/api/bills/total-sales-category?month=${formattedDate}`);
      const salesData = Array.isArray(salesResponse.data) ? salesResponse.data : [];
      setSalesByCategory(salesData);
      setSelectedCategories(salesData.map((category) => category.category));




      const expenseResponse = await axios.get(`/api/items/get-expense?month=${formattedDate}`);
      setTotalExpense(expenseResponse.data.totalExpense || 0);
      setMonthlyExpenses(expenseResponse.data.expenses || []);

                  // Calculate gross margin
                  setGrossMargin(data.totalSales - receiptsResponse.data.totalReceipts- expenseResponse.data.totalExpense);

      if (salesData.length > 0) {
        setSelectedCategory(salesData[0].category);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setTotalSales(0);
      setTotalReceipts(0);
      setTotalExpense( 0);

      setSalesByCategory([]);
    }
  }, []);

  const sortedProducts = [...topProducts]
    .sort((a, b) => b[chartMetric] - a[chartMetric]) // Sort descending based on selected metric
    .map((product) => ({
      ...product,
      displayName: `${product._id} (Qty: ${product.totalSold})`, // Y-axis label
    }));


  useEffect(() => {
    console.log("Updated Top Products State:", topProducts);
  }, [topProducts]);


  useEffect(() => {
    if (selectedDate) {
      fetchData(selectedDate);
    }
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

    console.log("Raw API Response:", response); // Log full response
    console.log("Response Data Type:", typeof response.data); // Should be "object"
    console.log("Response Data (JSON):", JSON.stringify(response.data, null, 2)); // Should be an array

    // Ensure the response is an array
    if (Array.isArray(response.data)) {
      setTopProducts(response.data);
    } else {
      console.error("Expected an array but received:", response.data);
      setTopProducts([]);
    }
  } catch (error) {
    console.error("Error fetching top products:", error);
    setTopProducts([]);
  } finally {
    setLoadingTopProducts(false);
  }
};



  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

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
                    <Statistic title="Total Receipts" value={totalReceipts} precision={2} valueStyle={{ color: '#3f8600' }} prefix="₹" />
                 </Card>
             </Col>
             <Col span={8}>
                 <Card>
                    <Statistic title="Expense" value={totalExpense} precision={2} valueStyle={{ color: '#3f8600' }} prefix="₹" />
                 </Card>
             </Col>
                          <Col span={8}>
                              <Card>
                                 <Statistic title="Gross Margin" value={grossMargin} precision={2} valueStyle={{ color: '#3f8600' }} prefix="₹" />
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
    <Tooltip
      content={({ payload }) => {
        if (!payload || payload.length === 0) return null;

        const totalSales = payload[0].payload.totalSales;

        return (
          <div style={{ background: "white", padding: "10px", border: "1px solid #ddd" }}>
            <p><strong>Day:</strong> {payload[0].payload.day}</p>
            <p><strong>Total Sales:</strong> ₹{totalSales.toFixed(2)}</p>
            {payload.map((entry) => (
              <p key={entry.dataKey} style={{ color: entry.color }}>
                {entry.name}: ₹{entry.value.toFixed(2)}
              </p>
            ))}
          </div>
        );
      }}
    />
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
                <Col span={12}>
                  <Select
                    value={chartMetric}
                    onChange={(value) => setChartMetric(value)}
                    placeholder="Select Metric"
                    style={{ width: "100%" }}
                  >
                    <Option value="totalSales">Total Sales (₹)</Option>
                    <Option value="totalSold">Total Quantity Sold</Option>
                  </Select>
                </Col>
              </Row>


              {topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={500}>
                  <BarChart
                    data={sortedProducts} // Use sorted data
                    layout="vertical"
                    margin={{ left: 200, right: 20, top: 20, bottom: 20 }}
                  >
                    <XAxis type="number" />
                    <YAxis
                      dataKey="displayName"
                      type="category"
                      width={200}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Legend
                      formatter={(value) => value.length > 15 ? value.substring(0, 15) + "..." : value}
                    />
                    <Bar
                      dataKey={chartMetric}
                      fill={chartMetric === "totalSales" ? "#82ca9d" : "#8884d8"}
                      name={chartMetric === "totalSales" ? "Total Sales (₹)" : "Total Quantity Sold"}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>


              ) : (
                <Empty description="No data available for this category" />
              )}

            </Card>
          </Col>
        </Row>
      </div>
<Row gutter={16} style={{ marginTop: 20 }}>
  <Col span={24}>
    <Card title={`Monthly Expenses - Total ₹${totalExpense}`}>
      <Table
        dataSource={monthlyExpenses}
        columns={[
          {
            title: "Date",
            dataIndex: "date",
            render: (date) => moment(date).format("DD-MM-YYYY"),
          },
          {
            title: "Amount (₹)",
            dataIndex: "amount",
          },
          {
            title: "Reason",
            dataIndex: "reason",
          },
          {
            title: "Type",
            dataIndex: "expenseType",
          },
          {
            title: "User",
            dataIndex: "userName",
          },
          {
            title: "Notes",
            dataIndex: "notes",
          },
        ]}
        rowKey="_id"
        pagination={{ pageSize: 8 }}
      />
    </Card>
  </Col>
</Row>


    </DefaultLayout>
  );
};

export default Adashboard;
