import { Checkbox, Button, Input, DatePicker, Table, Card, Statistic, Row, Col } from "antd";
import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import DefaultLayout from "../components/DefaultLayout";
import moment from "moment";

const MorningDeliveryPage = () => {
  const dispatch = useDispatch();
  const [itemsData, setItemsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(moment());

  const getAllItems = useCallback(async () => {
    try {
      dispatch({ type: "SHOW_LOADING" });
      const { data } = await axios.get(`/api/items/get-inventory`);
      const filteredData = data
        .map(item => ({ ...item, received: false }))
        .filter(item =>
          item.invoiceDate === (selectedDate ? selectedDate.format("DD/MM/YYYY") : moment().format("DD/MM/YYYY"))
        );
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
    const updatedData = itemsData.map(item =>
      item._id === record._id ? { ...item, received: !item.received } : item
    );
    setItemsData(updatedData);
  };

  const handleClearAll = () => {
    const resetData = itemsData.map(item => ({ ...item, received: false }));
    setItemsData(resetData);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const filteredData = itemsData.filter(item =>
    item.name.toLowerCase().includes(searchTerm)
  );

  const pendingData = filteredData.filter(item => !item.received);
  const receivedData = filteredData.filter(item => item.received);

  const columns = [
    {
      title: "✔",
      dataIndex: "received",
      render: (received, record) => (
        <Checkbox
          checked={received}
          onChange={() => handleReceivedChange(record)}
          style={{ backgroundColor: '#7FFFD4', padding: '5px', borderRadius: '4px' }}
        />
      ),
    },
    { title: "Name", dataIndex: "name" },
    { title: "Code", dataIndex: "code" },
    { title: "Price", dataIndex: "price" },
    { title: "Quantity", dataIndex: "quantity" },
    { title: "Invoice Date", dataIndex: "invoiceDate" }
  ];

  return (
    <DefaultLayout>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <DatePicker
          value={selectedDate}
          format="YYYY-MM-DD"
          onChange={handleDateChange}
           style={{ backgroundColor: '#7FFFD4', padding: '5px', borderRadius: '4px' }}
        />
        <Input
          placeholder="Search by Name"
          onChange={handleSearchChange}
          style={{ width: 300, backgroundColor: '#7FFFD4', padding: '5px', borderRadius: '4px' }}
        />
        <Button type="primary" onClick={handleClearAll}>
          Clear All Received
        </Button>
      </Row>

      <Card>
        <Row gutter={16}>
          <Col span={12}>
            <Statistic title="Pending Items" value={pendingData.length} />
          </Col>
          <Col span={12}>
            <Statistic title="Received Items" value={receivedData.length} />
          </Col>
        </Row>
      </Card>

      <h4 style={{ marginTop: 20 }}>Pending Items</h4>
      <Table
        columns={columns}
        dataSource={pendingData}
        bordered
        rowClassName={(record) => record.received ? 'bg-light-green' : 'bg-light-pink'}
        style={{ border: '1px solid #ffe6e6' }}
      />

      <h4 style={{ marginTop: 20 }}>Received Items</h4>
      <Table
        columns={columns}
        dataSource={receivedData}
        bordered
        rowClassName={() => 'bg-light-green'}
        style={{ border: '1px solid #d4edda' }}
      />
    </DefaultLayout>
  );
};

export default MorningDeliveryPage;
