import React, { useEffect, useState } from "react";
import { Table, DatePicker, Card, Typography, message, InputNumber } from "antd";
import axios from "axios";
import moment from "moment";
import DefaultLayout from "../components/DefaultLayout";
import "../styles/SpecialOrders.css";

const { Title } = Typography;

function ReturnsPage() {

  const [selectedDate, setSelectedDate] = useState(moment().add(1, "day"));

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/bills/get-todays-returns", {
        params: { returnDate: selectedDate.format("YYYY-MM-DD") },
      });

      // Add editable inventory + computed return
       let enriched = res.data.data.map((row) => {
           // Rule 1: if shelfLife = 2 → force T-3 = 0
           if (row.shelfLife === 2) {
             row.t3 = 0;
           }

           return {
             ...row,
             inventory: 0,
             returnValue: 0,
           };
         });

         // Rule 2: filter out rows where ( T-2 + T-3) = 0
         enriched = enriched.filter((row) => (row.t2 + row.t3) > 0);

      setData(enriched);
    } catch (err) {
      message.error("Failed to fetch pastry returns");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [selectedDate]);

const handleInventoryChange = (value, record) => {
  const newData = data.map((row) => {
    if (row.code !== record.code) return row;

    let returnValue = value;

    if (row.shelfLife === 2) {
      returnValue = value - (row.t1 || 0) ;
    } else if (row.shelfLife === 3) {
      returnValue = value - (row.t1 || 0) - (row.t2 || 0) ;
    }

returnValue = Math.max(0, returnValue);

    return {
      ...row,
      inventory: value,
      returnValue,
    };
  });

  setData(newData);
};


  const columns = [
    { title: "Item", dataIndex: "name", key: "name" },
    { title: "Shelf Life", dataIndex: "shelfLife", key: "shelfLife" },
    { title: "Inventory", dataIndex: "inventory", key: "inventory",
      render: (_, record) => (
        <InputNumber
          min={0}
          value={record.inventory}
          onChange={(val) => handleInventoryChange(val, record)}
        />
      )
    },
    {  title: `(${selectedDate.clone().subtract(1, "days").format("DD-MMM")})`, dataIndex: "t1", key: "t1" },
    {  title: `(${selectedDate.clone().subtract(2, "days").format("DD-MMM")})`, dataIndex: "t2", key: "t2" },
    {  title: `(${selectedDate.clone().subtract(3, "days").format("DD-MMM")})`, dataIndex: "t3", key: "t3" },
    { title: "Return", dataIndex: "returnValue", key: "returnValue" },
  ];

  return (
    <DefaultLayout>
      <Title level={3}>Pastry Returns</Title>

      <DatePicker
        value={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        allowClear={false}
        style={{ marginBottom: 16 }}
      />

      <Card>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="code"
          loading={loading}
          pagination={false}
          rowClassName={(record) => {
              return record.returnValue > 1 ? "row-red" : "";
            }}
        />
      </Card>
    </DefaultLayout>
  );
}

export default ReturnsPage;
