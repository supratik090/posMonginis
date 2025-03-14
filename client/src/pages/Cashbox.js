import { Button, Form, InputNumber, Table, message, Modal, Select, Card, Input, Row, Col, Switch } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import DefaultLayout from "../components/DefaultLayout";
import moment from "moment-timezone";

const CashBox = () => {
  const dispatch = useDispatch();
  const [balances, setBalances] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isStartOfDay, setIsStartOfDay] = useState(false);
  const [todaySummary, setTodaySummary] = useState({ totalCash: 0, totalBills: 0 });

  const getAllBalances = async () => {
    try {
      const { data } = await axios.get("/api/items/get-balance");
      setBalances(data || []);
    } catch (error) {
      message.error("Failed to load balances");
      setBalances([]);
    }
  };

  const getTodayBills = async () => {
    const formattedDate = moment().format("YYYY-MM-DD");
    try {
      const { data } = await axios.get(`/api/bills/get-bills?date=${formattedDate}`);
      calculateSummary(data);
    } catch (error) {
      message.error("Failed to load today's bills");
      setTodaySummary({ totalCash: 0, totalBills: 0 });
    }
  };

  const calculateSummary = (billsData) => {
    let totalCash = 0;
    let totalBills = billsData.length;

    billsData.forEach((bill) => {
      if (bill.paymentMode.toLowerCase() === "cash") {
        totalCash += bill.totalAmount;
      }
    });

    setTodaySummary({ totalCash, totalBills });
  };

  const handleSubmit = async (values) => {
    const total =
      (values.rs500 || 0) * 500 +
      (values.rs200 || 0) * 200 +
      (values.rs100 || 0) * 100;

    const payload = {
      ...values,
      total,
      userName: values.cashier,
      note: values.note || "0",
      isStartOfDay: false,
      time: moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
    };

    try {
      await axios.post("/api/items/add-balance", payload);
      message.success("Balance added successfully");
      getAllBalances();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Failed to add balance");
    }
  };

  useEffect(() => {
    getAllBalances();
    getTodayBills();
  }, []);

  const startOfDayBalance = balances.find(b => b.isStartOfDay) || { total: 0 };
  const nonStartOfDayBalances = balances.filter(b => !b.isStartOfDay);
  const latestBalance = nonStartOfDayBalances.length > 0 ? nonStartOfDayBalances[0] : { rs500: 0, rs200: 0, rs100: 0, total: 0 };
  const netBalance = latestBalance.total - startOfDayBalance.total;

  const netBalanceColor = Math.abs(todaySummary.totalCash - netBalance) > 200 ? 'red' : 'inherit';

  return (
    <DefaultLayout>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}><Card bordered={false} style={{ backgroundColor: "beige" }}><h4>Start of Day</h4><p>₹{startOfDayBalance.total}</p></Card></Col>
        <Col span={6}><Card bordered={false} style={{ backgroundColor: "beige" }}><h4>Current Balance</h4><p>₹{latestBalance.total}</p></Card></Col>
        <Col span={6}><Card bordered={false} style={{ backgroundColor: "bisque", color: netBalanceColor }}><h4>Net Balance</h4><p>₹{netBalance}</p></Card></Col>
        <Col span={6}><Card bordered={false} style={{ backgroundColor: "bisque" }}><h4>Today's Cash</h4><p>₹{todaySummary.totalCash}</p></Card></Col>
      </Row>

      <Table
        dataSource={balances || []}
        columns={[
          { title: "User", dataIndex: "userName" },
          { title: "₹500", dataIndex: "rs500" },
          { title: "₹200", dataIndex: "rs200" },
          { title: "₹100", dataIndex: "rs100" },
          { title: "Total Amount", dataIndex: "total" },
          { title: "Time", dataIndex: "time" },
          { title: "Note", dataIndex: "note" },
          { title: "Start of Day", dataIndex: "isStartOfDay", render: (value) => (value ? 'Yes' : 'No') },
        ]}
        rowKey="_id"
        style={{ marginBottom: 20, marginTop: 20 }}
      />

      <Button type="primary" onClick={() => setIsModalVisible(true)}>Add Balance</Button>

      <Modal
        title="Add Cash Balance"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="rs500" label="₹500">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="rs200" label="₹200">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="rs100" label="₹100">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="cashier" label="Cashier">
            <Select>
              <Select.Option value="Ankita">Ankita</Select.Option>
              <Select.Option value="Prachi">Prachi</Select.Option>
              <Select.Option value="Shrabani">Shrabani</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="note" label="Note">
            <Input.TextArea rows={3} placeholder="Add any note or remark" defaultValue="0" />
          </Form.Item>
          <Form.Item label="Set as Start of Day">
            <Switch checked={isStartOfDay} onChange={setIsStartOfDay} />
          </Form.Item>
          <Button type="primary" htmlType="submit">Add Balance</Button>
        </Form>
      </Modal>
    </DefaultLayout>
  );
};

export default CashBox;
