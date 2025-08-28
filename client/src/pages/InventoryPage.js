import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Table, AutoComplete, message,DatePicker } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import DefaultLayout from "../components/DefaultLayout";
import moment from "moment";
import dayjs from "dayjs";


const InventoryPage = () => {
  const dispatch = useDispatch();
  const [itemsData, setItemsData] = useState([]); // All items from API
  const [filteredData, setFilteredData] = useState([]); // For table search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [popupModal, setPopupModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form] = Form.useForm();
  const [allItems, setAllItems] = useState([]); // Store all items
const [saveDisabled, setSaveDisabled] = useState(false);
  // Fetch all items from /api/items/get-item
  const fetchAllItems = async () => {
    try {
      const { data } =  await axios.get("http://localhost:4000/api/items/get-item");
      setAllItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };



  // Get All Items from API
  const getAllItems = async () => {
    try {
      dispatch({ type: "SHOW_LOADING" });
      const { data } =  await axios.get("http://localhost:4000/api/items/get-inventory");
      setItemsData(data);
      setFilteredData(data);
      dispatch({ type: "HIDE_LOADING" });
      console.log("Items Data:", data);
    } catch (error) {
      dispatch({ type: "HIDE_LOADING" });
      console.error(error);
    }
  };

  useEffect(() => {
    getAllItems();
    fetchAllItems();
    // eslint-disable-next-line
  }, []);

  // Handle search for table display
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = itemsData.filter((item) =>
      item.name.toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  // Handle delete
  const handleDelete = async (record) => {
    try {
      dispatch({ type: "SHOW_LOADING" });
      await axios.post("http://localhost:4000/api/items/post-delete-inventory", { itemId: record._id });
      message.success("Item Deleted Successfully");
      getAllItems();
      setPopupModal(false);
      dispatch({ type: "HIDE_LOADING" });
    } catch (error) {
      dispatch({ type: "HIDE_LOADING" });
      message.error("Something Went Wrong");
      console.error(error);
    }
  };

  // Helper functions to generate unique date filters from data
  const getUniqueDateFilters = (data, dateField) => {
    const uniqueDates = Array.from(
      new Set(
        data.map((item) => {
          // Check if field exists before formatting
          return item[dateField] ? moment(item[dateField]).format("YYYY-MM-DD") : "";
        })
      )
    ).filter((date) => date); // Remove empty strings
    return uniqueDates.map((date) => ({ text: date, value: date }));
  };

    // Helper functions to generate unique date filters from data
    const getUniqueDateFiltersInvoiceDate = (data, dateField) => {
      const uniqueDates = Array.from(
        new Set(
          data.map((item) => {
           console.log("date", item[dateField]);
            // Check if field exists before formatting
            return item[dateField] ? moment(item[dateField], "DD/MM/YYYY", true).format("DD/MM/YYYY"): "";
          })
        )
      ).filter((date) => date); // Remove empty strings
      return uniqueDates.map((date) => ({ text: date, value: date }));
    };


  // Table columns with filters on dates (without time)
  const columns = [
   {
        title: "Actions",
        dataIndex: "_id",
        render: (id, record) => (
          <div>
            <DeleteOutlined
              style={{ cursor: "pointer" }}
              onClick={() => handleDelete(record)}
            />
          </div>
        ),
      },
    { title: "Name", dataIndex: "name" },
    { title: "Code", dataIndex: "code" },
    { title: "Price", dataIndex: "price" },
     { title: "Quantity", dataIndex: "quantity" },

    { title: "Invoice Number", dataIndex: "invoiceNumber" ,
     render: (text) => {
        if (!text) return "";
        // Remove the trailing word "Invoice" (case-insensitive) and extra whitespace.
        return text.replace(/\s*Invoice\s*$/i, '').trim();
      },},
    {
      title: "Invoice date",
      dataIndex: "invoiceDate",
      render: (text) => text ? text : "",
      filters: getUniqueDateFiltersInvoiceDate(filteredData, "invoiceDate"),
      onFilter: (value, record) =>
        record.invoiceDate === value,
    },
    {
      title: "ReturnDate",
      dataIndex: "returnDate",
      render: (text) => text ? moment(text).format("YYYY-MM-DD") : "",
      filters: getUniqueDateFilters(filteredData, "returnDate"),
      onFilter: (value, record) =>
        record.returnDate &&
        moment(record.returnDate).format("YYYY-MM-DD") === value,
    },

    {
      title: "Created At",
      dataIndex: "createdAt",
      render: (text) => text ? moment(text).format("YYYY-MM-DD HH:mm") : "",
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: "descend", // shows newest first
    }

  ];

  // Handle form submit for add/edit
  const handleSubmit = async (value) => {
  setSaveDisabled(true);
  setTimeout(() => setSaveDisabled(false), 1000);
    if (editItem === null) {
      try {
        dispatch({ type: "SHOW_LOADING" });
        await axios.post("http://localhost:4000/api/items/post-inventory", value);
        message.success("Item Added Successfully");
        getAllItems();
        setPopupModal(false);
        dispatch({ type: "HIDE_LOADING" });
      } catch (error) {
        dispatch({ type: "HIDE_LOADING" });
        message.error("Something Went Wrong");
        console.error(error);
      }
    } else {
      try {
        dispatch({ type: "SHOW_LOADING" });
        await axios.put("http://localhost:4000/api/items/post-edit-inventory", {
          ...value,
          itemId: editItem._id,
        });
        message.success("Item Updated Successfully");
        getAllItems();
        setPopupModal(false);
        dispatch({ type: "HIDE_LOADING" });
      } catch (error) {
        dispatch({ type: "HIDE_LOADING" });
        message.error("Something Went Wrong");
        console.error(error);
      }
    }
  };

  // When modal opens, set or reset form values
  useEffect(() => {
    if (editItem) {
      form.setFieldsValue(editItem);
    } else {
      form.resetFields();
    }
  }, [editItem, form]);

  return (
    <DefaultLayout>
      <div className="d-flex justify-content-between">
        <h1>Inventory</h1>
        <Input
          placeholder="Search by Name"
          value={searchTerm}
          onChange={handleSearch}
          style={{ width: 800 }}
        />
        <Button type="primary" onClick={() => setPopupModal(true)}>
          Add Trading Item
        </Button>
      </div>

      <Table columns={columns} dataSource={filteredData} bordered />

      {popupModal && (
        <Modal
          title={`${editItem !== null ? "Edit Item" : "Add New Item"}`}
          visible={popupModal}
          onCancel={() => {
            setEditItem(null);
            setPopupModal(false);
          }}
          footer={false}
        >
          <Form
            layout="vertical"
          initialValues={{
                  ...editItem,
                  invoiceDate: editItem?.invoiceDate || dayjs(), // default today
                  invoiceNo: editItem?.invoiceNo || "-",         // default "-"
                }}
            onFinish={handleSubmit}
            form={form}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: "Please enter a name" }]}
            >
              <AutoComplete
                placeholder="Type item name"
                options={allItems.map(item => ({ value: item.name }))}
                onSelect={(value) => {
                  // Find the selected item by its name
                  const selectedItem = allItems.find(
                    (item) => item.name === value
                  );
                  if (selectedItem) {
                    // Auto-populate code and price fields
                    form.setFieldsValue({
                      code: selectedItem.code,
                      price: selectedItem.price,
                    });
                  }
                }}
                filterOption={(inputValue, option) =>
                  option.value.toLowerCase().includes(inputValue.toLowerCase())
                }
              />
            </Form.Item>
            <Form.Item
              name="code"
              label="Code"
              rules={[{ required: false, message: "Please enter item code" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="price"
              label="Price"
              rules={[{ required: false, message: "Please enter a price" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[{ required: true, message: "Please enter quantity" }]}
            >
              <Input />
            </Form.Item>
 {/* Manufactured Date */}
      <Form.Item
        name="manufacturedDt"
        label="Manufactured Date"
        rules={[{ required: true, message: "Please select manufactured date" }]}
      >
        <DatePicker
          format="DD-MM-YYYY"
          onChange={(date) => {
            const shelfLife = form.getFieldValue("shelfLife");
            const expiryDate =
              date && shelfLife ? date.add(shelfLife, "day") : null;

            form.setFieldsValue({ expiryDate });
          }}
        />
      </Form.Item>

      {/* Expiry Date */}
      <Form.Item
        name="expiryDate"
        label="Expiry Date"
        rules={[{ required: true, message: "Please select expiry date" }]}
      >
        <DatePicker format="DD-MM-YYYY" />
      </Form.Item>

       {/* Hidden invoice date */}
            <Form.Item name="invoiceDate" hidden>
              <Input type="hidden" />
            </Form.Item>

            {/* Hidden invoice number */}
            <Form.Item name="invoiceNo" hidden>
              <Input type="hidden" />
            </Form.Item>

            <div className="d-flex justify-content-end">
              <Button type="primary" htmlType="submit" disabled={saveDisabled}>
                SAVE
              </Button>
            </div>
          </Form>
        </Modal>
      )}
    </DefaultLayout>
  );
};

export default InventoryPage;
