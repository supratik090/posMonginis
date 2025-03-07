import { EyeOutlined } from "@ant-design/icons";
import { Button, Modal, Table,Input,DatePicker  } from "antd";
import axios from "axios";
import moment from "moment";
import momenttz from "moment-timezone";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useReactToPrint } from "react-to-print";
import DefaultLayout from "../components/DefaultLayout";
import "../styles/InvoiceStyles.css";


const BillsPage = () => {
  const componentRef = useRef();
  const dispatch = useDispatch();
  const [billsData, setBillsData] = useState([]);
 const [filteredBills, setFilteredBills] = useState([]); // <-- Added state for filtered bills
  const [searchText, setSearchText] = useState("");
  const [popupModal, setPopupModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showSalesSummary, setShowSalesSummary] = useState(false);

const [selectedDate, setSelectedDate] = useState(null);
const todayMumbai = momenttz().tz("Asia/Kolkata").format("DD-MM-YYYY");

const handleDateChange = (date, dateString) => {
  if (date) {
    setSelectedDate(dateString); // Store formatted date
    getAllBills(dateString); // Fetch bills using formatted date
  }
};




  const [bills, setBills] = useState([]);
    const [summary, setSummary] = useState({
      totalSales: 0,
      totalBills: 0,
      totalCash: 0,
      totalUpi: 0,
      totalOthers: 0,
      totalCard: 0,
      totalOnline: 0,
      paymentModes: {},
    });


    const [salesSummary, setSalesSummary] = useState({
      morningSales: 0,
      afternoonSales: 0,
    });



const groupBillsByTime = (billsData) => {
  let morningSales = 0;
  let afternoonSales = 0;

  billsData.forEach((bill) => {
    const billTime = momenttz.utc(bill.date).tz("Asia/Kolkata");
    const isMorning = billTime.hour() < 15 || (billTime.hour() === 15 && billTime.minute() < 30);

    if (isMorning) {
      morningSales += bill.totalAmount;
    } else {
      afternoonSales += bill.totalAmount;
    }
  });

  return { morningSales, afternoonSales };
};


 const calculateSummary = (billsData) => {
     let totalSales = 0;
     const totalBills = billsData.length;

       let categoryCounts = {
         cake: 0,
         pastry: 0,
         savory: 0,
         trading:0,
         others:0,
       };

       let categoryAmounts = {
          cake: 0,
          pastry: 0,
          savory: 0,
          trading:0,
          others:0,
        };

     // Start with an empty paymentModes object
     const paymentModes = {};

     billsData.forEach((bill) => {
       totalSales += bill.totalAmount;
       // Normalize payment mode (e.g., "Cash", "cash" -> "cash")
       const mode = bill.paymentMode.toLowerCase();

       // For known modes, use them directly; otherwise, group them as 'other'
       const modeKey = mode === "cash" || mode === "upi" || mode === "card" || mode === "online" ? mode : "other";

       // Initialize if not available
       if (!paymentModes[modeKey]) {
         paymentModes[modeKey] = { count: 0, sales: 0 };
       }
       paymentModes[modeKey].count += 1;
       paymentModes[modeKey].sales += bill.totalAmount;

       if(bill.cartItems){

        bill.cartItems.forEach((item) => {
                  const category = item.category?.toLowerCase(); // Ensure case consistency
                  if (category && categoryCounts.hasOwnProperty(category)) {
                   if("cake"==category){
                    console.log(categoryAmounts[category]);
                     console.log(item.price);
                    console.log(item.name)
                   }
                    categoryCounts[category] += item.quantity;
                    categoryAmounts[category]+=item.price;
                  }
                });
       }
     });


         // Categorize items sold


     // Use conditional operators to handle the case when a mode might be missing
     const totalCash = paymentModes.cash ? paymentModes.cash.sales : 0;
     const totalUpi = paymentModes.upi ? paymentModes.upi.sales : 0;
     const totalOthers = paymentModes.other ? paymentModes.other.sales : 0;
const totalCard = paymentModes.card ? paymentModes.card.sales : 0;
const totalOnline = paymentModes.online ? paymentModes.online.sales : 0;

     setSummary({
       totalSales,
       totalBills,
       totalCash,
       totalUpi,
       totalOthers,
       totalCard,
       totalOnline,
       paymentModes,
       categoryCounts,
       categoryAmounts,
     });
};

const targetMorning = 3000;
const targetAfternoon = 12000;

const getTargetClass = (actual, target) => (actual >= target ? "text-green-600 font-bold" : "text-red-600 font-bold");

 const getAllBills = async (selectedDate) => {
   try {
     dispatch({ type: "SHOW_LOADING" });

     // Convert the selected date to a format the backend understands
     const formattedDate = moment(selectedDate, "DD-MM-YYYY").format("YYYY-MM-DD");

     const { data } = await axios.get(`/api/bills/get-bills?date=${formattedDate}`);

     setBillsData(data);
     setFilteredBills(data);
     calculateSummary(data);

     const groupedSales = groupBillsByTime(data);
     setSalesSummary(groupedSales);

     dispatch({ type: "HIDE_LOADING" });
   } catch (error) {
     dispatch({ type: "HIDE_LOADING" });
     console.log(error);
   }
 };

  //useEffect
  useEffect(() => {
    getAllBills(todayMumbai);
    //eslint-disable-next-line
  }, []);
  //print function
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

    // Function to handle search
const handleSearch = (e) => {
  const value = e.target.value.toLowerCase();
  setSearchText(value);

  const filtered = billsData.filter((bill) =>
    bill.cashier.toLowerCase().includes(value) ||
    bill.cartItems.some((item) => item.name.toLowerCase().includes(value))
  );

  setFilteredBills(filtered);
};


  //table data
  const columns = [
{
  title: "Date",
  dataIndex: "date",
  render: (date) => momenttz.utc(date).tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss"),
  sorter: (a, b) => new Date(a.date) - new Date(b.date),
},

    { title: "Cashier", dataIndex: "cashier" ,
     sorter: (a, b) => a.cashier.localeCompare(b.cashier),},
//    { title: "Subtotal", dataIndex: "subTotal" },
//    { title: "Tax", dataIndex: "tax" },
  { title: "Total Amount", dataIndex: "totalAmount" ,sorter: (a, b) => a.totalAmount - b.totalAmount,},
   { title: "Payment Mode", dataIndex: "paymentMode" ,sorter: (a, b) => a.paymentMode.localeCompare(b.paymentMode),},
{ title: "Items ", dataIndex: "cartItems" , render : (f) => (f.map(item => item.name).join(", "))},
    {
      title: "Actions",
      dataIndex: "_id",
      render: (id, record) => (
        <div>
          <EyeOutlined
            style={{ cursor: "pointer" }}
            onClick={() => {
              setSelectedBill(record);
              setPopupModal(true);
            }}
          />
        </div>
      ),
    },
  ];

    const columnsSummary = [
  { title: "Date", dataIndex: "date" },
  { title: "Items ", dataIndex: "cartItems" , render : (f) => (f.map(item => item.name).join(", "))},
   ];
  console.log(selectedBill);
  return (
    <DefaultLayout>


    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
<div className="grid grid-cols-2 gap-4 mb-4">
        <DatePicker
          onChange={handleDateChange}
          format="DD-MM-YYYY"
          defaultValue={moment(todayMumbai, "DD-MM-YYYY")}
          className="mb-4 p-2 border border-gray-300 rounded text-blue-500"
        />
  <div className="bg-white p-3 rounded-lg shadow">
    <table>
      <thead>
        <tr>
          <th>Sales Amount</th>
          <th>Sales Count</th>
          <th>Cash</th>
          <th>UPI</th>
          <th>Card</th>
          <th>Online</th>
          <th>Other</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>₹{summary.totalSales}</td>
          <td>{summary.totalBills}</td>
          <td>₹{summary.totalCash}</td>
          <td>₹{summary.totalUpi}</td>
          <td>₹{summary.totalCard}</td>
          <td>₹{summary.totalOnline}</td>
          <td>₹{summary.totalOthers}</td>
        </tr>
      </tbody>
    </table>
    <button
      onClick={() => setShowSalesSummary(!showSalesSummary)}
      className="mt-4 px-4 py-2 bg-blue-500 text-blue rounded">
      {showSalesSummary ? "Hide Sales Summary" : "Show Sales Summary"}
    </button>
    {showSalesSummary && (
      <div>
        <br />
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Session</th>
              <th className="border p-2">Actual Sales</th>
              <th className="border p-2">Target</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">Morning (Before 3:30 PM)</td>
              <td className={`border p-2 ${getTargetClass(salesSummary.morningSales, targetMorning)}`}>
                ₹{salesSummary.morningSales}
              </td>
              <td className="border p-2">₹{targetMorning}</td>
            </tr>
            <tr>
              <td className="border p-2">Afternoon (After 3:30 PM)</td>
              <td className={`border p-2 ${getTargetClass(salesSummary.afternoonSales, targetAfternoon)}`}>
                ₹{salesSummary.afternoonSales}
              </td>
              <td className="border p-2">₹{targetAfternoon}</td>
            </tr>
          </tbody>
        </table>
        <br />
        <table className="w-full border-collapse border border-gray-300 mt-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Category</th>
              <th className="border p-2">Count</th>
              <th className="border p-2">Count Amount</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(summary.categoryCounts || {}).map(([category, count]) => (
              <tr key={category}>
                <td className="border p-2 capitalize">{category}</td>
                <td className="border p-2">{count}</td>
                <td className="border p-2">{summary.categoryAmounts?.[category] || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
</div>
    </div>

    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
    </div>


 <div className="d-flex justify-content-between">
        <h1>Today's invoice</h1>



         </div>
                 <Input
                   placeholder="Search by cashier or item name"
                   value={searchText}
                   onChange={handleSearch}
                   className="mb-4 p-2 border border-gray-300 rounded text-blue-500"
                 />
        <Table columns={columns} dataSource={filteredBills} bordered />

      {popupModal && (
        <Modal
          width={800}
          pagination={false}
          title="Invoice Details"
          visible={popupModal}
          onCancel={() => {
            setPopupModal(false);
          }}
          footer={false}
        >
          {/* ============ invoice modal start ==============  */}
          <div id="invoice-POS" ref={componentRef}>
            <center id="top">
              <div className="info">
                <h2>Monginis Vikhroli(E)</h2>
                <p> Contact : +9372778330 <br/> Mumbai </p>
              </div>
              {/*End Info*/}
            </center>
            {/*End InvoiceTop*/}
            <div id="mid">
              <div className="mt-2">
                <p>
                  Customer Name : <b>{selectedBill.customerName}</b>
                  <br />
                  Phone No :  <b>{selectedBill.customerNumber}</b>
                  <br />
                  Date :{" "}
                  <b>
                    <b>{moment.utc(selectedBill.date).tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss")}</b>

                  </b>

                  <br />
                  <p> Notes <b>{selectedBill.notes}</b>
                  </p>
                  <p> PaymentMode <b>{selectedBill.paymentMode}</b>
                  </p>
                  <p> Object Id <b>{selectedBill._id}</b>
                                    </p>
                </p>
                <hr style={{ margin: "5px" }} />
              </div>
            </div>
            {/*End Invoice Mid*/}
            <div id="bot">
              <div id="table">
                <table>
                  <tbody>
                    <tr className="tabletitle">
                      <td className="item table-header">
                        <p>
                          <b>Item</b>
                        </p>
                      </td>
                      <td className="Hours table-header">
                        <p>
                          <b>Quantity</b>
                        </p>
                      </td>
                      <td className="Rate table-header">
                        <p>
                          <b>Price</b>
                        </p>
                      </td>
                      <td className="Rate table-header">
                        <p>
                          <b>Total</b>
                        </p>
                      </td>
                    </tr>
                    {selectedBill.cartItems.map((item) => (
                      <tr className="service" key={item._id}>
                        <td className="tableitem">
                          <p className="itemtext">{item.name}</p>
                        </td>
                        <td className="tableitem">
                          <p className="itemtext">{item.quantity}</p>
                        </td>
                        <td className="tableitem">
                          <p className="itemtext">{item.price}</p>
                        </td>
                        <td className="tableitem">
                          <p className="itemtext">
                            {item.quantity * item.price}
                          </p>
                        </td>
                      </tr>
                    ))}

                    <tr className="tabletitle">
                      <td />
                      <td />
                      <td className="Rate table-header">
                        <p className="grand-total-label"><b>Grand Total</b></p>
                      </td>
                      <td className="payment">
                        <p className="grand-total-value">
                          <b>Rs {selectedBill.totalAmount}</b>
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/*End Table*/}
              <div id="legalcopy">
                <p className="legal">
                  <strong>Thank you for your order!</strong>
                </p>
              </div>
            </div>
            {/*End InvoiceBot*/}
          </div>
          {/*End Invoice*/}
          <div className="d-flex justify-content-end mt-3">
            <Button type="primary" onClick={handlePrint}>
              Print
            </Button>
          </div>
          {/* ============ invoice modal ends ==============  */}
        </Modal>
      )}
    </DefaultLayout>
  );
};

export default BillsPage;
