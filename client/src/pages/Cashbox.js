import {
  Button,
  Form,
  InputNumber,
  Table,
  message,
  Modal,
  Select,
  Card,
  Input,
  Row,
  Col,
  Switch,
  Collapse,
  DatePicker,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import DefaultLayout from "../components/DefaultLayout";
import moment from "moment-timezone";

const { Panel } = Collapse;

const CashBox = () => {
  const dispatch = useDispatch();
  const [balances, setBalances] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [isStartOfDay, setIsStartOfDay] = useState(false);
  const [todaySummary, setTodaySummary] = useState({ totalCash: 0, totalBills: 0 });

  const getAllBalances = async () => {
    try {
      const { data } = await axios.get("/api/items/get-balance");
      setBalances(data || []);
    } catch (error) {
      console.error("Error fetching balances:", error);
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
      console.error("Error fetching bills:", error);
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
      (values.rs100 || 0) * 100 +
      (values.rs50 || 0) * 50;

    const payload = {
      ...values,
      total,
      userName: values.cashier,
      note: values.note || "0",
      isStartOfDay,
      time: moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
    };

    try {
      await axios.post("/api/items/add-balance", payload);
      message.success("Balance added successfully");
      getAllBalances();
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error adding balance:", error);
      message.error("Failed to add balance");
    }
  };

  const handleExpenseSubmit = async (values) => {
    const amount = Number(values.amount);
    if (!amount || isNaN(amount)) {
      message.error("Please enter a valid amount");
      return;
    }

    const payload = {
      ...values,
      amount,
    date: values.date.toDate(), // use date picked by user

    };

    try {
      await axios.post("/api/items/add-expense", payload);
      message.success("Expense added successfully");
      setIsExpenseModalVisible(false);
    } catch (error) {
      console.error("Error adding expense:", error);
      message.error("Failed to add expense");
    }
  };

  useEffect(() => {
    getAllBalances();
    getTodayBills();
  }, []);

  const startOfDayBalance = balances
    .filter((b) => b.isStartOfDay)
    .reduce((latest, b) => (!latest || new Date(b.time) > new Date(latest.time) ? b : latest), null) || {
    total: 0,
  };

  const latestBalance = balances.length > 0
    ? balances.reduce((latest, b) => (!latest || new Date(b.time) > new Date(latest.time) ? b : latest), null)
    : null;

  const isLatestStartOfDay = latestBalance?.isStartOfDay || false;

  const currentBalance = latestBalance ? (isLatestStartOfDay ? 0 : latestBalance.total) : "--";

  const netBalance =
    latestBalance && !isLatestStartOfDay ?  (latestBalance.total - startOfDayBalance.total) - todaySummary.totalCash : "--";

  const netBalanceColor =
    latestBalance && !isLatestStartOfDay && Math.abs(netBalance) > 300
      ? "red"
      : "inherit";



  return (
    <DefaultLayout>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card bordered={false} style={{ backgroundColor: "beige" }}>
            <h4>Start of Day</h4>
            <p>₹{startOfDayBalance.total}</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ backgroundColor: "beige" }}>
            <h4>Cash in Box</h4>
            <p>{currentBalance}</p>
          </Card>
        </Col>

        <Col span={6}>
          <Card bordered={false} style={{ backgroundColor: "bisque" }}>
            <h4>Today's Billing Cash</h4>
            <p>₹{todaySummary.totalCash}</p>
          </Card>
        </Col>

        <Col span={6}>
          <Card bordered={false} style={{ backgroundColor: "bisque", color: netBalanceColor }}>
            <h4>Excess / Short</h4>
            <p>{netBalance}</p>
          </Card>
        </Col>
      </Row>

      <Button type="primary" onClick={() => setIsModalVisible(true)} style={{ marginRight: 10 }}>
        Add Balance
      </Button>
      <Button type="dashed" onClick={() => setIsExpenseModalVisible(true)}>
        Add Expense
      </Button>



      {/* Add Balance Modal */}
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
          <Form.Item name="rs50" label="₹50">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="cashier"
            label="Cashier"
            rules={[{ required: true, message: "Please select a cashier" }]}
          >
            <Select placeholder="Select a cashier">
              <Select.Option value="Ankita">Ankita</Select.Option>
              <Select.Option value="Priya">Priya</Select.Option>
              <Select.Option value="Shrabani">Shrabani</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="note" label="Note">
            <Input.TextArea rows={3} placeholder="Add any note or remark" />
          </Form.Item>
          <Form.Item label="Set as Start of Day">
            <Switch checked={isStartOfDay} onChange={setIsStartOfDay} />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Add Balance
          </Button>
        </Form>
      </Modal>

      {/* Add Expense Modal */}
      <Modal
        title="Add Expense"
        visible={isExpenseModalVisible}
        onCancel={() => setIsExpenseModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleExpenseSubmit}>
          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: "Please enter an amount" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="reason"
            label="Reason"
            rules={[{ required: true, message: "Please provide a reason" }]}
          >
            <Input placeholder="Reason for the expense" />
          </Form.Item>
          <Form.Item
            name="expenseType"
            label="Expense Type"
            rules={[{ required: true, message: "Please select expense type" }]}
          >
            <Select defaultValue="Cash">
              <Select.Option value="Cash">Cash</Select.Option>
              <Select.Option value="Online">Online</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="userName"
            label="Cashier"
            rules={[{ required: true, message: "Please select a cashier" }]}
          >
            <Select placeholder="Select a cashier">
              <Select.Option value="Ankita">Ankita</Select.Option>
              <Select.Option value="Priya">Priya</Select.Option>
              <Select.Option value="Shrabani">Shrabani</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Additional notes (optional)" />
          </Form.Item>
<Form.Item
  name="date"
  label="Date"
  initialValue={moment()}  // Default to today
  rules={[{ required: true, message: 'Please select a date' }]}
>
  <DatePicker style={{ width: '100%' }} />
</Form.Item>


          <Button type="primary" htmlType="submit">
            Add Expense
          </Button>
        </Form>
      </Modal>

      <Collapse defaultActiveKey={[]} style={{ marginTop: 20 }}>
        <Panel header="Show Cash Balances" key="1">
          <Table
            dataSource={balances || []}
            columns={[
              { title: "User", dataIndex: "userName" },
              { title: "₹500", dataIndex: "rs500" },
              { title: "₹200", dataIndex: "rs200" },
              { title: "₹100", dataIndex: "rs100" },
              { title: "₹50", dataIndex: "rs50" },
              { title: "Total Amount", dataIndex: "total" },
              {
                title: "Time",
                dataIndex: "time",
                render: (date) =>
                  moment(date).tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
              },
              { title: "Note", dataIndex: "note" },
              {
                title: "Start of Day",
                dataIndex: "isStartOfDay",
                render: (value) => (value ? "Yes" : "No"),
              },
            ]}
            rowKey="_id"
            style={{ marginTop: 10 }}
          />
        </Panel>
      </Collapse>



    </DefaultLayout>
  );
};

export default CashBox;
