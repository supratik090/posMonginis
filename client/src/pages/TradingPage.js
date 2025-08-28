import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Input, Table, Modal, Form, message, DatePicker, Switch, Tabs ,Tooltip} from "antd";
import { EditOutlined } from "@ant-design/icons";
import DefaultLayout from "../components/DefaultLayout";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Collapse } from "antd";
const { Panel } = Collapse;
dayjs.extend(utc);

const { TabPane } = Tabs;

const TradingPage = () => {
  const [data, setData] = useState([]);
  const [newItems, setNewItems] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [popupModal, setPopupModal] = useState(false);
  const [updatedInventory, setUpdatedInventory] = useState({});
  const [form] = Form.useForm();
  const [hasMissingManufacturedDate, setHasMissingManufacturedDate] = useState(false);
  const [hasUpcomingReturns, setHasUpcomingReturns] = useState(false);
  const [showEditItems, setShowEditItems] = useState(false);
const [editSearchText, setEditSearchText] = useState("");
const [editFilteredData, setEditFilteredData] = useState([]);
const [editSource, setEditSource] = useState(null);



  const [sorter, setSorter] = useState({});
  const [activeTabKey, setActiveTabKey] = useState("1"); // Track the active tab key

  const handleTableChange = (pagination, filters, sorter) => {
    if (sorter.field === "returnDate") {
      setSorter({
        field: sorter.field,
        order: sorter.order || "descend",  // Default to descending order
      });
    }
  };

  // Fetch trading inventory
  const fetchTradingInventory = async () => {
    try {
      const res =  await axios.get("http://localhost:4000/api/items/get-trading");

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

      // Check for missing manufactured dates
// Find all active items missing manufactured date
const missingItems = sorted.filter(
  (item) => item.isActive && !item.manufacturedDt
);

// Debug log
console.log("Active items missing manufactured date:", missingItems);

// Boolean flag for blinking / highlighting
const anyMissing = missingItems.length > 0;
setHasMissingManufacturedDate(anyMissing);


      const today = dayjs();
      const twoDaysAgo = today.subtract(2, "day");

      const hasReturnsSoon = sorted.some(item => {
        const returnDt = item.returnDate ? dayjs(item.returnDate) : null;
        return returnDt && returnDt.isAfter(twoDaysAgo, 'day');
      });

      setHasUpcomingReturns(hasReturnsSoon);

      localStorage.setItem("tradingNeedsAttention", anyMissing || hasReturnsSoon);


      setData(sorted);
      setFilteredData(sorted);
      setEditFilteredData(sorted);
 const filteredNewItems = sorted.filter(item => item.manufacturedDt === undefined ) ;


        setNewItems(filteredNewItems);
    } catch (err) {
      message.error("Failed to fetch trading inventory");
    }
  };

const handleEditSearch = (value) => {
  setEditSearchText(value);
  const filtered = filteredData.filter(
    (item) =>
      item.itemName.toLowerCase().includes(value.toLowerCase()) ||
      item.code.toLowerCase().includes(value.toLowerCase())
  );
  setEditFilteredData(filtered);
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
      setEditSource("editItems");
    setUpdatedInventory({
      _id: record._id,
      manufacturedDt: record.manufacturedDt ? dayjs(record.manufacturedDt, "YYYY-MM-DD") : null,
      shelfLife: record.shelfLife || 0, // Default shelf life if not available
      returnDate: record.manufacturedDt ? dayjs(record.manufacturedDt).add(record.shelfLife, 'day') : null,
      isActive: record.isActive ?? true, // fallback to true if undefined
    });
     // ✅ set form values explicitly
     form.setFieldsValue({
        manufacturedDt: record.manufacturedDt ? dayjs(record.manufacturedDt) : null,
        returnDate: record.returnDate ? dayjs(record.returnDate) : null,
        isActive: record.isActive,
      });
    setPopupModal(true); // Open the modal
  };

  // Handle edit functionality
    const handleEditFromUpcomingReturns = (record) => {
      setEditingRow(record._id);
        setEditSource("upcomingReturns");
      setUpdatedInventory({
        _id: record._id,
        manufacturedDt: record.manufacturedDt ? dayjs(record.manufacturedDt, "YYYY-MM-DD") : null,
        shelfLife: record.shelfLife || 0, // Default shelf life if not available
        returnDate: record.manufacturedDt ? dayjs(record.manufacturedDt).add(record.shelfLife, 'day') : null,
        isActive: record.isActive ?? true, // fallback to true if undefined
      });
       // ✅ set form values explicitly
       form.setFieldsValue({
          manufacturedDt: record.manufacturedDt ? dayjs(record.manufacturedDt) : null,
          returnDate: record.returnDate ? dayjs(record.returnDate) : null,
          isActive: record.isActive,
        });
      setPopupModal(true); // Open the modal
    };

  // Handle saving updated inventory
  const handleSave = async () => {
    try {
      await axios.post("http://localhost:4000/api/items/update-inventory", {
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
    {
      title: "Code",
      dataIndex: "code",
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: "Name",
      dataIndex: "itemName",
      sorter: (a, b) => a.itemName.localeCompare(b.itemName),
    },
        {
          title: "Invoice",
          dataIndex: "invoiceNumber",
          sorter: (a, b) => a.invoiceNumber.localeCompare(b.invoiceNumber),
                render: (text) => {
                    if (typeof text === "string") {
                     const cleaned = text.replace(/\s+/g, " ").trim(); // replace all kinds of whitespace
                          return cleaned.split(" ")[0]; // take only the first segment

                    }
                    return text;
                  },
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
        return date.isValid() ? date.format("DD-MM-YYYY") : "-";
      }
    },
    {
      title: "Manufactured Date",
      dataIndex: "manufacturedDt",
 render: (_, record) => {
     const manufacturedDate = record.manufacturedDt;

  // Apply style if manufactured date is undefined
     const style = (manufacturedDate === undefined || manufacturedDate === null) ? { backgroundColor: '#f8d7da' } : {};

     return (
       <div style={style}>
         {manufacturedDate ? dayjs.utc(manufacturedDate).add(1, "day").format("DD-MM-YYYY") : "--"}
       </div>
     );
   },
      sorter: (a, b) => {
        const dateA = a.manufacturedDt ? new Date(a.manufacturedDt) : null;
        const dateB = b.manufacturedDt ? new Date(b.manufacturedDt) : null;
        if (!dateA && !dateB) return 0;
        if (!dateA) return -1;
        if (!dateB) return 1;
        return dateA - dateB;
      },
      defaultSortOrder: 'ascend',
    },
    {
      title: "Return Date",
      dataIndex: "returnDate",
      render: (text) => {
        const returnDate = dayjs(text);

        let color = "#fff";
        const today = dayjs();
        const sevenDaysFromNow = today.add(3, 'days');

if (returnDate.isSame(today, 'day')) {
  color = "#CD001A";
} else if (returnDate.isBefore(today, 'day')) {
  color = "#f5c6cb"; // 🔴 Overdue
} else if (returnDate.isAfter(today, 'day') && returnDate.isBefore(sevenDaysFromNow, 'day')) {
  color = "#ffeeba"; // 🟡 Due soon
} else if (returnDate.isSame(sevenDaysFromNow, 'day') || returnDate.isAfter(sevenDaysFromNow, 'day')) {
  color = "#c3e6cb"; // 🟢 Future return
}


        return (
          <div style={{ backgroundColor: color, padding: "5px", borderRadius: "4px" }}>
            {returnDate.isValid() ? returnDate.format("DD-MM-YYYY") : "-"}
          </div>
        );
      },
      sorter: (a, b) => {
        const dateA = a.returnDate ? new Date(a.returnDate) : new Date(0);
        const dateB = b.returnDate ? new Date(b.returnDate) : new Date(0);
        return dateA - dateB;
      },
    },
    {
      title: "Shelf Life (days)",
      dataIndex: "shelfLife",
      sorter: (a, b) => a.shelfLife - b.shelfLife,
    },
      {
          title: "Price",
          dataIndex: "price",
          sorter: (a, b) => a.price - b.price,
        },
        {
          title: "Quantity",
          dataIndex: "quantity",
          sorter: (a, b) => a.quantity - b.quantity
        },

    {
      title: "Active",
      dataIndex: "isActive",
      render: (active) => (active ? "Yes" : "No"),
      sorter: (a, b) => a.isActive - b.isActive,
    },

  ];


    const columnsReturns = [
    {
      title: "Actions",
      dataIndex: "_id",
      render: (id, record) => (
        <div>
          <EditOutlined
            style={{ cursor: "pointer" }}
            onClick={() => handleEditFromUpcomingReturns(record)} // ✅ reuse same handler
          />
        </div>
      ),
    },

      {
        title: "Code",
        dataIndex: "code",
        sorter: (a, b) => a.code.localeCompare(b.code),
      },
      {
        title: "Name",
        dataIndex: "itemName",
        sorter: (a, b) => a.itemName.localeCompare(b.itemName),
      },
      {
        title: "Price",
        dataIndex: "price",
        sorter: (a, b) => a.price - b.price,
      },
      {
        title: "Quantity",
        dataIndex: "quantity",
        sorter: (a, b) => a.quantity - b.quantity
      },
          {
            title: "Invoice",
            dataIndex: "invoiceNumber",
            sorter: (a, b) => a.invoiceNumber.localeCompare(b.invoiceNumber),
                  render: (text) => {
                      if (typeof text === "string") {
                       const cleaned = text.replace(/\s+/g, " ").trim(); // replace all kinds of whitespace
                            return cleaned.split(" ")[0]; // take only the first segment

                      }
                      return text;
                    },
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
          return date.isValid() ? date.format("DD-MM-YYYY") : "-";
        },

      },
      {
        title: "Manufactured Date",
        dataIndex: "manufacturedDt",
   render: (_, record) => {
       const manufacturedDate = record.manufacturedDt;

    // Apply style if manufactured date is undefined
       const style = (manufacturedDate === undefined || manufacturedDate === null) ? { backgroundColor: '#f8d7da' } : {};

       return (
         <div style={style}>
           {manufacturedDate ? dayjs.utc(manufacturedDate).add(1, "day").format("DD-MM-YYYY") : "--"}
         </div>
       );
     },
        sorter: (a, b) => {
          const dateA = a.manufacturedDt ? new Date(a.manufacturedDt) : null;
          const dateB = b.manufacturedDt ? new Date(b.manufacturedDt) : null;
          if (!dateA && !dateB) return 0;
          if (!dateA) return -1;
          if (!dateB) return 1;
          return dateA - dateB;
        },
      },
      {
        title: "Return Date",
        dataIndex: "returnDate",
        render: (text) => {
          const returnDate = dayjs(text);

          let color = "#fff";
          const today = dayjs();
          const sevenDaysFromNow = today.add(7, 'days');
if (returnDate.isSame(today, 'day')) {
  color = "#CD001A"; // 🟡 Highlight for "due today"
} else if (returnDate.isBefore(today, 'day')) {
  color = "#f5c6cb"; // 🔴 Overdue
} else if (returnDate.isAfter(today, 'day') && returnDate.isBefore(sevenDaysFromNow, 'day')) {
  color = "#ffeeba"; // 🟡 Due soon
} else if (returnDate.isSame(sevenDaysFromNow, 'day') || returnDate.isAfter(sevenDaysFromNow, 'day')) {
  color = "#c3e6cb"; // 🟢 Future return
}


          return (
            <div style={{ backgroundColor: color, padding: "5px", borderRadius: "4px" }}>
              {returnDate.isValid() ? returnDate.format("DD-MM-YYYY") : "-"}
            </div>
          );
        },
        defaultSortOrder: 'ascend',
        sorter: (a, b) => {
          const dateA = a.returnDate ? new Date(a.returnDate) : new Date(0);
          const dateB = b.returnDate ? new Date(b.returnDate) : new Date(0);
          return dateA - dateB;
        },
      },
      {
        title: "Shelf Life (days)",
        dataIndex: "shelfLife",
        sorter: (a, b) => a.shelfLife - b.shelfLife,
      },
    ];

  // Function to determine the row class based on return date
  const getRowClass = (record) => {
    const returnDate = new Date(record.returnDate);
    const today = new Date();
    const diffInTime = returnDate - today;
    const diffInDays = diffInTime / (1000 * 3600 * 24);

    if (diffInDays < 0) {
      return "past-return";
    } else if (diffInDays <= 3) {
      return "near-return";
    } else {
      return "future-return";
    }
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTabKey(key);
    if (key === "2") {
      // Sort by return date in descending order when the View Returns tab is selected
      setFilteredData((prevData) =>
        prevData.sort((a, b) => new Date(b.returnDate) - new Date(a.returnDate))
      );
    }
  };

  return (
    <DefaultLayout>
      <Collapse defaultActiveKey={["3"]} accordion>


        {/* Returns Section */}
        <Panel
          header={
            hasUpcomingReturns ? (
              <Tooltip title="Some items are due for return soon. Please review.">
                <h4 className="tab-alert">Upcoming Returns ⚠️</h4>
              </Tooltip>
            ) : (
              <h4>Upcoming Returns</h4>
            )
          }
          key="3"
        >
          <h1>Items Near or Past Return Date</h1>
          <div style={{ overflowX: "auto" }}>
            <Table
              columns={columnsReturns   }
              dataSource={data
                .filter((item) => {
                  const returnDt = item.returnDate ? dayjs(item.returnDate) : null;
                  return returnDt && returnDt.isBefore(dayjs().add(10, "day"), "day");
                })
                .sort((a, b) => new Date(a.returnDate) - new Date(b.returnDate))
              }
              rowKey="_id"
              bordered
              pagination={{ pageSize: 10 }}
              rowClassName={(record) => getRowClass(record)}
              scroll={{ x: "max-content" }}
            />
          </div>
        </Panel>

         <Panel
                  header={
                    newItems.length > 0 ? (
                      <Tooltip title="Some items are missing Manufactured Date. Please update.">
                        <h4 className="tab-alert" >New Items ⚠️</h4>
                      </Tooltip>
                    ) : (
                       <h4 >New Items</h4>
                    )
                  }
                  key="1"
                >
                  <div className="d-flex justify-content-between">
                    <h1>Trading Inventory</h1>
                    <Input.Search
                      placeholder="Search"
                      value={searchText}
                      onChange={(e) => handleSearch(e.target.value)}
                      style={{ width: 800 }}
                    />

                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <Table
                      columns={columns}
                      dataSource={newItems} // Unfiltered for edit section
                      rowKey="_id"
                      bordered
                      pagination={{ pageSize: 10 }}
                      rowClassName={(record) => getRowClass(record)}
                      scroll={{ x: "max-content" }}
                      onChange={handleTableChange}
                    />
                  </div>
                </Panel>

        {/* Edit Dates Section */}




      </Collapse>

      {/* 🔘 Toggle button above Edit Items */}
      <div className="mt-4">
        <Button
          type="primary"
          onClick={() => setShowEditItems(!showEditItems)}
        >
          {showEditItems ? "Hide Edit Items" : "Show Edit Items"}
        </Button>

        {showEditItems && (
          <div className="mt-3">
            <h4>Edit Items</h4>

             {/* 🔍 Search just for Edit Items */}
                  <div className="mb-3 d-flex justify-content-end">
                    <Input.Search
                      placeholder="Search Edit Items"
                      value={editSearchText}
                      onChange={(e) => handleEditSearch(e.target.value)}
                      style={{ width: 400 }}
                    />
                  </div>
            <Table
              rowKey="_id"
              columns={columns}
              dataSource={editFilteredData}   // ✅ fixed
              rowClassName={getRowClass}
              pagination={{ pageSize: 5 }}
            />
          </div>
        )}
      </div>



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
              manufacturedDt: dayjs("2025-01-01"),
              returnDate: dayjs("2025-01-01"),
              isActive: updatedInventory.isActive,
            }}
            onFinish={() => handleSave(editingRow)}
            form={form}
          >
            <Form.Item label="Shelf Life (Days)">
              <Input value={updatedInventory.shelfLife} disabled />
            </Form.Item>

            {editSource !== "upcomingReturns" && (
                <>
                  <Form.Item
                    name="manufacturedDt"
                    label="Manufactured Date"
                    rules={[{ required: true, message: "Please select a manufactured date" }]}
                  >
                    <DatePicker
                      value={updatedInventory.manufacturedDt}
                      format="DD-MM-YYYY"
                      onChange={(date) => {
                        const newReturnDate =
                          date && updatedInventory.shelfLife
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
                      format="DD-MM-YYYY"
                      onChange={(date) =>
                        setUpdatedInventory((prev) => ({ ...prev, returnDate: date }))
                      }
                    />
                  </Form.Item>
                </>
              )}

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
