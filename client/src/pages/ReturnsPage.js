import React, { useEffect, useState } from "react";
import { Table, DatePicker, Card, Typography, message } from "antd";
import axios from "axios";
import moment from "moment";
import DefaultLayout from "../components/DefaultLayout";

const { Title } = Typography;

function ReturnsPage() {
  const [selectedMonth, setSelectedMonth] = useState(moment());
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({ totalDeductedAmount: 0, totalReturnAmount: 0, count: 0 });
  const [loading, setLoading] = useState(false);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/items/get-returns", {
        params: { month: selectedMonth.format("YYYY-MM") },
      });
      setData(res.data.expenses || []);
      setSummary({
        totalDeductedAmount: res.data.totalDeductedAmount,
        totalReturnAmount: res.data.totalReturnAmount,
        count: res.data.count,
      });
      setLoading(false);
    } catch (error) {
      message.error("Failed to fetch return data.");
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [selectedMonth]);

  // Flatten returnItems with reference to parent return
  const flatReturnItems = data.flatMap((ret) =>
    (ret.returnItems || []).map((item, index) => ({
      ...item,
      returnDate: ret.returnDate,
      creditNote: ret.creditNote,
      key: `${ret._id}_${index}`, // unique key
    }))
  );

  const summaryColumns = [
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
      render: () => selectedMonth.format("MMMM YYYY"),
    },
    {
      title: "Total Return Amount",
      dataIndex: "totalReturnAmount",
      key: "totalReturnAmount",
      render: () => `₹ ${(summary.totalReturnAmount ?? 0).toFixed(2)}`,
    },
    {
      title: "Total Deducted Amount",
      dataIndex: "totalDeductedAmount",
      key: "totalDeductedAmount",
      render: () => `₹ ${(summary.totalDeductedAmount ?? 0).toFixed(2)}`,
    },
    {
      title: "Total Returns",
      dataIndex: "count",
      key: "count",
      render: () => summary.count ?? 0,
    },
  ];

  const itemColumns = [
    {
      title: "Credit Note",
      dataIndex: "creditNote",
      key: "creditNote",
    },
    {
      title: "Return Date",
      dataIndex: "returnDate",
      key: "returnDate",
    },
    {
      title: "Item Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Item Name",
      dataIndex: "name",
      key: "name",
      render: (text) => text || "-",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (value) => `₹ ${(value ?? 0).toFixed(2)}`,
    },
  ];

  return (
    <DefaultLayout>
      <Title level={3}>Returns Overview</Title>

      <DatePicker
        picker="month"
        value={selectedMonth}
        onChange={(date) => setSelectedMonth(date)}
        allowClear={false}
        style={{ marginBottom: 16 }}
      />

      <Card title="Monthly Summary" style={{ marginBottom: 24 }}>
        <Table
          dataSource={[summary]}
          columns={summaryColumns}
          pagination={false}
          rowKey={() => "summary"}
        />
      </Card>

      <Card title="All Return Items">
        <Table
          dataSource={flatReturnItems}
          columns={itemColumns}
          loading={loading}
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </DefaultLayout>
  );
}

export default ReturnsPage;
