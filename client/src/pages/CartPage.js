import {
  DeleteOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Select, Row, Col, Table, message } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "../components/DefaultLayout";

const CartPage = () => {
  const [subTotal, setSubTotal] = useState(0);
  const [adjustment, setAdjustment] = useState(0); // New state for adjustment
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.rootReducer);

const [cashReceived, setCashReceived] = useState(0);
const [changeDue, setChangeDue] = useState(0);

const [paymentMode, setPaymentMode] = useState(null);
const handlePaymentModeChange = (value) => {
  setPaymentMode(value);
  if (value !== "cash") {
    setCashReceived(0);
    setChangeDue(0);
  }
};


const handleCashReceivedChange = (e) => {
  const cash = Number(e.target.value) || 0;
  setCashReceived(cash);
  setChangeDue(cash - (subTotal + adjustment)); // Calculate change
};


  useEffect(() => {
    let temp = 0;
    cartItems.forEach((item) => (temp += item.price * item.quantity));
    setSubTotal(temp);
  }, [cartItems]);

  const handleIncrement = (record) => {
    dispatch({
      type: "UPDATE_CART",
      payload: { _id: record._id, quantity: record.quantity + 1 },
    });
  };


const [cashier, setCashier] = useState(localStorage.getItem("lastCashier") || "");

const handleCashierChange = (value) => {
  setCashier(value);
  localStorage.setItem("lastCashier", value); // Save selection
};



  const handleDecrement = (record) => {
    if (record.quantity > 1) {
      dispatch({
        type: "UPDATE_CART",
        payload: { _id: record._id, quantity: record.quantity - 1 },
      });
    }
  };

  const handleAdjustmentChange = (e) => {
    setAdjustment(Number(e.target.value) || 0); // Ensure it's a number
  };

  const columns = [
    { title: "Name", dataIndex: "name" },
    {
      title: "Price",
      dataIndex: "price",
      render: (text) => `₹ ${text.toFixed(2)}`,
    },
    {
      title: "Quantity",
      dataIndex: "_id",
      render: (id, record) => (
        <div>
          <PlusCircleOutlined className="mx-3" style={{ cursor: "pointer" }} onClick={() => handleIncrement(record)} />
          <b>{record.quantity}</b>
          <MinusCircleOutlined className="mx-3" style={{ cursor: "pointer" }} onClick={() => handleDecrement(record)} />
        </div>
      ),
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      render: (text, record) => `₹ ${(record.price * record.quantity).toFixed(2)}`,
    },
    {
      title: "Actions",
      dataIndex: "_id",
      render: (id, record) => (
        <DeleteOutlined
          style={{ cursor: "pointer" }}
          onClick={() => dispatch({ type: "DELETE_FROM_CART", payload: record })}
        />
      ),
    },
  ];



 const handleSubmit = async (value) => {
   const user = localStorage.getItem("user");
   if (!user) {
     message.error("User not found. Please log in.");
     return;
   }
   const totalAmount = subTotal + adjustment;

   const newObject = {
     ...value,
     cartItems,
     subTotal,
     adjustment,
     totalAmount,
     userId: JSON.parse(user)._id,
   };

   try {
     await axios.post("/api/bills/add-bills", newObject);
     message.success("Bill Generated");

     // Dispatch action to clear cart
     dispatch({ type: "CLEAR_CART" });

     navigate("/bills");
   } catch (error) {
     message.error("Something went wrong");
     console.log(error);
   }
 };


  return (
    <DefaultLayout>
      <h1>Cart Page</h1>
      <Table columns={columns} dataSource={cartItems} bordered rowKey="_id" />

      {/* Invoice Form */}
      <div className="invoice-form mt-4 p-4 border rounded shadow-sm" style={{ maxWidth: "800px", margin: "auto" }}>
        <Form layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="customerName" label="Customer Name">
                <Input placeholder="Enter Customer Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customerNumber" label="Contact Number">
                <Input placeholder="Enter Contact Number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="paymentMode" label="Payment Method" rules={[{ required: true, message: "Please select payment method" }]}>
               <Select placeholder="Select Payment Method" onChange={handlePaymentModeChange}>
                  <Select.Option value="cash">Cash</Select.Option>
                  <Select.Option value="upi">UPI</Select.Option>
                  <Select.Option value="card">Card</Select.Option>
                   <Select.Option value="other">Other</Select.Option>
                   <Select.Option value="online">Online</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="cashier" label="Cashier" rules={[{ required: true, message: "Please select Cashier" }]}>
                <Select placeholder="Select Cashier" value={cashier} onChange={handleCashierChange} allowClear>
                  <Select.Option value="Prachi">Prachi</Select.Option>
                  <Select.Option value="Ankita">Ankita</Select.Option>
                  <Select.Option value="Shrabani">Shrabani</Select.Option>
                  <Select.Option value="Others">Others</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* New Adjustment Field */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="adjustment" label="Adjustment">
                <Input type="number" placeholder="Enter Adjustment Amount" onChange={handleAdjustmentChange} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="notes" label="Notes">
                <Input.TextArea rows={2} placeholder="Enter reason for adjustment" />
              </Form.Item>
            </Col>
          </Row>

{paymentMode === "cash" && (
  <Row gutter={16} className="mt-3">
    <Col span={12}>
      <Form.Item label="💰 Cash Received">
        <Input type="number" placeholder="Enter cash received" value={cashReceived} onChange={handleCashReceivedChange} />
      </Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item label="💵 Change Due">
        <Input type="text" style={{ fontSize: "14px", fontWeight: "bold", color: "blue" }} value={`₹ ${changeDue.toFixed(2)}`} readOnly />
      </Form.Item>
    </Col>
  </Row>
)}



{/* Total Calculation */}
<div className="bill-summary d-flex justify-content-between align-items-center mt-3 p-2"
     style={{ fontSize: "14px", borderTop: "1px solid #ddd" }}>
  <span>Subtotal: ₹ {subTotal.toFixed(2)}</span>
  <span>Adjustment: ₹ {adjustment.toFixed(2)}</span>
  <span style={{ fontSize: "18px", fontWeight: "bold", color: "#d9534f" }}>
    Total: ₹ {(subTotal + adjustment).toFixed(2)}
  </span>
</div>


          <div className="d-flex justify-content-end" style={{ marginTop: "20px" }}>
            <Button type="primary" htmlType="submit">
              Save Invoice
            </Button>
          </div>
        </Form>
      </div>
    </DefaultLayout>
  );
};

export default CartPage;
