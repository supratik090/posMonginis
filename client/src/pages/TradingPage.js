import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Input, Table, Modal, Form, message, DatePicker,Switch } from "antd";
import { EditOutlined } from "@ant-design/icons";
import DefaultLayout from "../components/DefaultLayout";
import dayjs from "dayjs";

const TradingPage = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [popupModal, setPopupModal] = useState(false);
  const [updatedInventory, setUpdatedInventory] = useState({});
  const [form] = Form.useForm();

  // Fetch trading inventory
const fetchTradingInventory = async () => {
  try {
    const res = await axios.get("/api/items/get-trading");

    // Sort: Manufactured Date (nulls first), then Invoice Date (newest first)
    const sorted = res.data.sort((a, b) => {
      const mA = a.manufacturedDt ? new Date(a.manufacturedDt) : null;
      const mB = b.manufacturedDt ? new Date(b.manufacturedDt) : null;

      if (!mA && mB) return -1;
      if (mA && !mB) return 1;
      if (!mA && !mB) {
        // fallback to invoiceDate
        const iA = new Date(a.invoiceDate);
        const iB = new Date(b.invoiceDate);
        return iB - iA;
      }

      const diff = mA - mB;
      if (diff !== 0) return diff;

      const iA = new Date(a.invoiceDate);
      const iB = new Date(b.invoiceDate);
      return iB - iA;
    });

    setData(sorted);
    setFilteredData(sorted);
  } catch (err) {
    message.error("Failed to fetch trading inventory");
  }
};


  useEffect(() => {
    fetchTradingInventory();
  }, []);

  // Handle search functionality
  const handleSearch = (value) => {
    setSearchText(value);
    const lower = value.toLowerCase();
    const filtered = data.filter((item) =>
      Object.keys(item).some((key) => {
        if (!item[key]) return false;
        if (typeof item[key] === "string") return item[key].toLowerCase().includes(lower);
        return false;
      })
    );
    setFilteredData(filtered);
  };

  // Handle edit functionality
  const handleEdit = (record) => {
    setEditingRow(record._id);
    setUpdatedInventory({
      _id: record._id,
      manufacturedDt: record.manufacturedDt ? dayjs(record.manufacturedDt, "YYYY-MM-DD") : null,
      shelfLife: record.shelfLife || 0, // Default shelf life if not available
      returnDate: record.manufacturedDt ? dayjs(record.manufacturedDt).add(record.shelfLife, 'day') : null,
      isActive: record.isActive ?? true, // fallback to true if undefined
    });
    setPopupModal(true); // Open the modal
  };

  // Handle changes in manufactured date
  const handleManufacturedDateChange = (date) => {
    setUpdatedInventory((prev) => {
      const newReturnDate = date ? dayjs(date).add(prev.shelfLife, 'day') : null;
      return { ...prev, manufacturedDt: date, returnDate: newReturnDate };
    });
  };

  // Handle changes in shelf life
  const handleShelfLifeChange = (e) => {
    const newShelfLife = parseInt(e.target.value, 10);
    setUpdatedInventory((prev) => {
      const newReturnDate = prev.manufacturedDt
        ? dayjs(prev.manufacturedDt).add(newShelfLife, 'day')
        : null;
      return { ...prev, shelfLife: newShelfLife, returnDate: newReturnDate };
    });
  };

  // Handle saving updated inventory
  const handleSave = async () => {
    try {
      await axios.post("/api/items/update-inventory", {
        id: updatedInventory._id,
        manufacturedDt: updatedInventory.manufacturedDt,
        returnDate: updatedInventory.returnDate,
        shelfLife: updatedInventory.shelfLife,
        isActive: updatedInventory.isActive,
      });
      message.success("Inventory updated");
      setEditingRow(null);
      setPopupModal(false);
      fetchTradingInventory();
    } catch (err) {
      message.error("Failed to update");
    }
  };

  // Columns for the table
const columns = [
  {
    title: "Code",
    dataIndex: "code",
    sorter: (a, b) => a.code.localeCompare(b.code),
  },
  {
    title: "Name",
    dataIndex: "itemName",
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    title: "Price",
    dataIndex: "price",
    sorter: (a, b) => a.price - b.price,
  },
  {
    title: "Quantity",
    dataIndex: "quantity",
    sorter: (a, b) => a.quantity - b.quantity,
  },
{
  title: "Invoice Date",
  dataIndex: "invoiceDate",
  sorter: (a, b) => {
    const dateA = a.invoiceDate ? dayjs(a.invoiceDate, ["DD/MM/YYYY", "YYYY-MM-DD"]).toDate() : new Date(0);
    const dateB = b.invoiceDate ? dayjs(b.invoiceDate, ["DD/MM/YYYY", "YYYY-MM-DD"]).toDate() : new Date(0);
    return dateA - dateB;
  },
  render: (text) => {
    const date = dayjs(text, ["DD/MM/YYYY", "YYYY-MM-DD"]);
    return date.isValid() ? date.format("YYYY-MM-DD") : "-";
  }
},
{
  title: "Manufactured Date",
  dataIndex: "manufacturedDt",
  render: (_, record) => {
    const backgroundColor = record.manufacturedDt ? "#d4f5d3" : "#f5d4d4";
    return editingRow === record._id ? (
      <DatePicker
        value={updatedInventory.manufacturedDt}
        onChange={(date) =>
          setUpdatedInventory((prev) => ({
            ...prev,
            manufacturedDt: date,
            returnDate: record.shelfLife
              ? dayjs(date).add(record.shelfLife, "day")
              : null,
          }))
        }
        style={{ backgroundColor }}
      />
    ) : record.manufacturedDt ? (
      <div style={{ backgroundColor, padding: "5px", borderRadius: "4px" }}>
        {dayjs(record.manufacturedDt).format("YYYY-MM-DD")}
      </div>
    ) : (
      <div style={{ backgroundColor, padding: "5px", borderRadius: "4px" }}>-</div>
    );
  },
  sorter: (a, b) => {
    const dateA = a.manufacturedDt ? new Date(a.manufacturedDt) : null;
    const dateB = b.manufacturedDt ? new Date(b.manufacturedDt) : null;

    if (!dateA && !dateB) return 0;
    if (!dateA) return -1; // a comes first if no date
    if (!dateB) return 1;  // b comes first if no date
    return dateA - dateB;
  },
},

  {
    title: "Return Date",
    dataIndex: "returnDate",
    render: (text) => (text ? dayjs(text).format("YYYY-MM-DD") : "-"),
    sorter: (a, b) =>
      new Date(a.returnDate || "1970-01-01") - new Date(b.returnDate || "1970-01-01"),
  },
  {
    title: "Shelf Life (days)",
    dataIndex: "shelfLife",
    sorter: (a, b) => a.shelfLife - b.shelfLife,
  },
  {
    title: "Active",
    dataIndex: "isActive",
    render: (active) => (active ? "Yes" : "No"),
    sorter: (a, b) => a.isActive - b.isActive,
  },
  {
    title: "Actions",
    dataIndex: "_id",
    render: (id, record) => (
      <div>
        <EditOutlined
          style={{ cursor: "pointer", marginRight: 8 }}
          onClick={() => handleEdit(record)}
        />
      </div>
    ),
  },
];


  return (
    <DefaultLayout>
      <div className="d-flex justify-content-between">
        <h1>Trading Inventory</h1>
        <Input.Search
          placeholder="Search"
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 800 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="_id"
        bordered
        pagination={{ pageSize: 10 }}
      />

    {popupModal && (
      <Modal
        title="Edit Item"
        open={popupModal}
        onCancel={() => {
          setPopupModal(false);
          setEditingRow(null);
        }}
        footer={false}
      >
        <Form
          layout="vertical"
          initialValues={{
            manufacturedDt: updatedInventory.manufacturedDt,
            returnDate: updatedInventory.returnDate,
            isActive: updatedInventory.isActive,
          }}
          onFinish={() => handleSave(editingRow)}
          form={form}
        >
          <Form.Item label="Shelf Life (Days)">
            <Input value={updatedInventory.shelfLife} disabled />
          </Form.Item>

          <Form.Item
            name="manufacturedDt"
            label="Manufactured Date"
            rules={[{ required: true, message: "Please select a manufactured date" }]}
          >
            <DatePicker
              value={updatedInventory.manufacturedDt}
              onChange={(date) => {
                const newReturnDate = date && updatedInventory.shelfLife
                  ? date.clone().add(updatedInventory.shelfLife, "day")
                  : null;
                setUpdatedInventory((prev) => ({
                  ...prev,
                  manufacturedDt: date,
                  returnDate: newReturnDate,
                }));
                form.setFieldsValue({ returnDate: newReturnDate });
              }}
            />
          </Form.Item>

          <Form.Item name="returnDate" label="Return Date">
            <DatePicker
              value={updatedInventory.returnDate}
              onChange={(date) =>
                setUpdatedInventory((prev) => ({ ...prev, returnDate: date }))
              }
            />
          </Form.Item>

          <Form.Item name="isActive" label="Is Active" valuePropName="checked">
            <Switch
              checked={updatedInventory.isActive}
              onChange={(checked) =>
                setUpdatedInventory((prev) => ({ ...prev, isActive: checked }))
              }
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Save
          </Button>
        </Form>
      </Modal>
    )}


    </DefaultLayout>
  );
};

export default TradingPage;
