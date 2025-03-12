import React, { useEffect, useState } from "react";
import { Table, Button, Input, Modal, Form, message, Tag, DatePicker } from "antd";
import axios from "axios";
import moment from "moment";
import DefaultLayout from "../components/DefaultLayout";

const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ Prevent multiple clicks
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCustomers();
  }, []);

 const fetchCustomers = async () => {
   try {
     const { data } = await axios.get("/api/bills/get-customer");
     if (Array.isArray(data)) {
       // ✅ Sort by nearest upcoming birthday including today
       const sortedData = data.sort((a, b) => {
         const today = moment();
         const dateA = moment(a.dateOfBirth).year(today.year());
         const dateB = moment(b.dateOfBirth).year(today.year());

         // ✅ Handle birthday wrap-around (Dec to Jan)
         if (dateA.isBefore(today)) {
           dateA.add(1, "year");
         }
         if (dateB.isBefore(today)) {
           dateB.add(1, "year");
         }

         return dateA.diff(today) - dateB.diff(today);
       });

       setCustomers(sortedData);
     } else {
       setCustomers([]);
     }
   } catch (error) {
     console.error("Error fetching customers", error);
     setCustomers([]);
   }
 };


const handleAddCustomer = async (values) => {
  setLoading(true);
  try {
    // ✅ Create date using selected Day & Month, always setting Year = 2000
    const fixedDOB = moment()
      .year(2000)
      .month(values.month - 1) // Month is 0-based
      .date(values.day)
      .toDate();

    values.dateOfBirth = fixedDOB;
    delete values.day;
    delete values.month;

    const response = await axios.post("/api/bills/add-customer", values);

    if (response.data.success === false && response.data.message === "DUPLICATE_USER") {
      message.error("This phone number already exists. Please use a different phone.");
      setLoading(false);
      return;
    }

    message.success("Customer added successfully!");
    fetchCustomers();
    setIsModalOpen(false);
    form.resetFields();
  } catch (error) {
    message.error("Failed to add customer. Try again.");
  } finally {
    setLoading(false);
  }
};

  // ✅ Compare only date & month without year for upcoming birthday
  const isBirthdayUpcoming = (dob) => {
    const birthday = moment(dob).set("year", moment().year()); // Set current year
    const today = moment();
    const twoWeeksLater = moment().add(14, 'days');

    // Check only Date & Month without Year
    return birthday.format('MM-DD') >= today.format('MM-DD') &&
           birthday.format('MM-DD') <= twoWeeksLater.format('MM-DD');
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Date of Birth",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (dob) => (
        <span>
          {moment(dob).format("DD-MM")} {/* Only show Date & Month */}
          {isBirthdayUpcoming(dob) && <Tag color="green">🎉 Upcoming Birthday</Tag>}
        </span>
      ),
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (text) => text || "-",
    },
  ];

  return (
    <DefaultLayout>
    <div>
      <h2>Customers</h2>
      <Input
        placeholder="Search by name, phone, or address"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: 20 }}
      />
      <Button
        type="primary"
        onClick={() => setIsModalOpen(true)}
        disabled={loading} // ✅ Disable button while processing
      >
        Add Customer
      </Button>

      {/* ✅ Show Customers Sorted by Upcoming Birthday */}
      <Table
        columns={columns}
        dataSource={customers.filter(customer =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm) ||
          customer.address.toLowerCase().includes(searchTerm.toLowerCase())
        )}
        rowKey="_id"
      />

      {/* ✅ Add Customer Modal */}
      <Modal
        title="Add Customer"
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={loading} // ✅ Disable submit button
      >
        <Form form={form} onFinish={handleAddCustomer} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input />
          </Form.Item>
<Form.Item name="dateOfBirth" label="Date of Birth" rules={[{ required: true }]}>
  <div style={{ display: "flex", gap: "10px" }}>
    {/* Day Dropdown */}
    <Form.Item name="day" noStyle rules={[{ required: true, message: "Select day" }]}>
      <select style={{ width: "100px", padding: "5px" }}>
        <option value="">Day</option>
        {Array.from({ length: 31 }, (_, i) => (
          <option key={i + 1} value={i + 1}>{i + 1}</option>
        ))}
      </select>
    </Form.Item>

    {/* Month Dropdown */}
    <Form.Item name="month" noStyle rules={[{ required: true, message: "Select month" }]}>
      <select style={{ width: "120px", padding: "5px" }}>
        <option value="">Month</option>
        {moment.months().map((month, index) => (
          <option key={index} value={index + 1}>{month}</option>
        ))}
      </select>
    </Form.Item>
  </div>
</Form.Item>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Add notes about customer (optional)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
    </DefaultLayout>
  );
};

export default CustomerPage;
