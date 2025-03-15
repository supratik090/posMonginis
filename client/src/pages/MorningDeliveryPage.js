import { Checkbox, Button, Input, DatePicker, Table, Card, Statistic, Row, Col } from "antd";
import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import DefaultLayout from "../components/DefaultLayout";
import moment from "moment";
import { debounce } from "lodash";

const styles = {
  highlightedRow: {
    backgroundColor: "#f5f5f5",
    transition: "background-color 0.5s ease-in-out"
  },
  flashCircle: {
    display: "inline-block",
    position: "relative",
    fontWeight: "bold",
    color: "#ff5722",
    animation: "flash 1.5s ease-in-out"
  },
  flashText: {
    fontWeight: "bold",
    color: "#ff5722",
    animation: "flash 1.5s ease-in-out"
  },
  checkbox: {
    backgroundColor: "#007bff",
    padding: "5px",
    borderRadius: "4px"
  },
  "@keyframes flash": {
    "0%": { boxShadow: "0 0 0px rgba(255, 87, 34, 0.5)" },
    "50%": { boxShadow: "0 0 15px rgba(255, 87, 34, 1)" },
    "100%": { boxShadow: "0 0 0px rgba(255, 87, 34, 0.5)" }
  }
};

const MorningDeliveryPage = () => {
  const dispatch = useDispatch();
  const [itemsData, setItemsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(moment());
  const [highlightedRow, setHighlightedRow] = useState(null);

  const getAllItems = useCallback(async () => {
    try {
      dispatch({ type: "SHOW_LOADING" });
      const { data } = await axios.get(`/api/items/get-inventory`);
      const filteredData = data.map(item => ({ ...item, received: false }))
        .filter(item => moment(item.invoiceDate, "DD/MM/YYYY").isSame(selectedDate, "day"));
      setItemsData(filteredData);
      dispatch({ type: "HIDE_LOADING" });
    } catch (error) {
      dispatch({ type: "HIDE_LOADING" });
      console.error(error);
    }
  }, [dispatch, selectedDate]);

  useEffect(() => {
    getAllItems();
  }, [getAllItems]);

  const handleReceivedChange = (record) => {
    setHighlightedRow(record._id);
    setTimeout(() => {
      setHighlightedRow(null);
      setItemsData(prevData => prevData.map(item => item._id === record._id ? { ...item, received: !item.received } : item));
    }, 1500);
  };

  const handleClearAll = () => {
    setItemsData(itemsData.map(item => ({ ...item, received: false })));
  };

  const handleSearchChange = debounce((e) => {
    setSearchQuery(e.target.value.toLowerCase());
  }, 300);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const filteredData = itemsData.filter(item => !item.received && item.name.toLowerCase().includes(searchQuery));

  const pendingData = itemsData.filter(item => !item.received);
  const receivedData = itemsData.filter(item => item.received);

  const columns = [
    {
      title: "✔",
      dataIndex: "received",
      render: (received, record) => (
        <Checkbox
          checked={received}
          onChange={() => handleReceivedChange(record)}
          style={styles.checkbox}
        />
      ),
    },
    { title: <b>Name</b>, dataIndex: "name", render: (text, record) => (
      <span style={highlightedRow === record._id ? styles.flashText : {}}>{text}</span>
    )},
    { title: <b>Code</b>, dataIndex: "code" },
    { title: <b>Price</b>, dataIndex: "price" },
    { title: <b>Quantity</b>, dataIndex: "quantity", render: (text, record) => (
      <span style={highlightedRow === record._id ? styles.flashCircle : {}}>{text}</span>
    )},
    { title: <b>Invoice Date</b>, dataIndex: "invoiceDate" }
  ];

  return (
    <DefaultLayout>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <DatePicker
          value={selectedDate}
          format="YYYY-MM-DD"
          onChange={handleDateChange}
        />
        <Input
          placeholder="Search by Name"
          onChange={handleSearchChange}
          style={{ width: 300, fontWeight: 'bold' }}
        />
        <Button type="primary" onClick={handleClearAll}>
          Clear All Received
        </Button>
      </Row>

      <Card>
        <Row gutter={16}>
          <Col span={12}>
            <Statistic title={<b>Pending Items</b>} value={pendingData.length} />
          </Col>
          <Col span={12}>
            <Statistic title={<b>Received Items</b>} value={receivedData.length} />
          </Col>
        </Row>
      </Card>

      <h4 style={{ marginTop: 20 }}><b>Pending Items</b></h4>
      <Table
        columns={columns}
        dataSource={filteredData}
        bordered
        rowClassName={(record) => highlightedRow === record._id ? styles.highlightedRow : ''}
      />

      <h4 style={{ marginTop: 20 }}><b>Received Items</b></h4>
      <Table
        columns={columns}
        dataSource={receivedData}
        bordered
        rowClassName={() => 'bg-light-green'}
      />
    </DefaultLayout>
  );
};

export default MorningDeliveryPage;