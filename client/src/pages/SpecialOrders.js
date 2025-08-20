import { useEffect, useState } from "react";
import { Table, Button, Checkbox, Tooltip } from "antd";
import moment from "moment";
import DefaultLayout from "../components/DefaultLayout";
import "../styles/SpecialOrders.css";


export default function SpecialOrders() {
  const [orders, setOrders] = useState([]);
  const [doneState, setDoneState] = useState({});

  // Clean quotes and format drive links
  const clean = (val) => val?.replace(/^"|"$/g, "").trim();

  const fixDriveLink = (url) => {
    if (!url) return "";
    let cleanUrl = clean(url);

    // Replace encoded "&amp;" with "&"
    cleanUrl = cleanUrl.replace(/&amp;/g, "&");

    // If it's a "file/d/.../view" link, convert to uc?export=view&id=...
    const match = cleanUrl.match(/\/file\/d\/(.*?)\//);
    if (match) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }

    return cleanUrl;
  };

  // Load saved "done" states from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("specialOrdersDone");
    if (saved) {
      setDoneState(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const sheetUrl =
      "https://docs.google.com/spreadsheets/d/1T4dHMMexwLsGlW2or3LD1mX0uKFsq29XFYqeeC3YQcg/gviz/tq?tqx=out:csv";

    fetch(sheetUrl)
      .then((res) => res.text())
      .then((csv) => {
        const rows = csv.split("\n").slice(1); // skip header
        const data = rows
          .filter((r) => r.trim() !== "")
          .map((row, index) => {
            const cols = row.split(",");
            const rowKey = `${index}-${clean(cols[1])}`; // unique key

            return {
              key: rowKey,
              timestamp: moment(clean(cols[0]), "DD/MM/YYYY HH:mm:ss").toDate(),
              shop: clean(cols[1]),
              deliveryDate: moment(clean(cols[2]), "DD/MM/YYYY").toDate(),
              billImage: fixDriveLink(cols[3]),
              notes: clean(cols[4]),
              cakeImage: fixDriveLink(cols[5]),
              done: doneState[rowKey] || false, // restore saved state
            };
          });

        // sort by delivery date (latest first)
        data.sort((a, b) => b.deliveryDate - a.deliveryDate);

        setOrders(data);
      });
  }, [doneState]);

  // Handle Done checkbox toggle
  const toggleDone = (record) => {
    const updated = { ...doneState, [record.key]: !doneState[record.key] };
    setDoneState(updated);
    localStorage.setItem("specialOrdersDone", JSON.stringify(updated));
    setOrders((prev) =>
      prev.map((o) =>
        o.key === record.key ? { ...o, done: updated[record.key] } : o
      )
    );
  };

  const columns = [
    {
      title: "Shop",
      dataIndex: "shop",
      key: "shop",
    },
    {
      title: "Delivery Date",
      dataIndex: "deliveryDate",
      key: "deliveryDate",
      render: (val) => moment(val).format("DD/MM/YYYY"),
    },
    {
      title: "Delivery Bill",
      dataIndex: "billImage",
      key: "billImage",
      render: (src) =>
        src ? (
          <Tooltip
            placement="right"
            overlayInnerStyle={{ maxWidth: "none" }}
            title={
              <img
                src={src}
                alt="Bill"
                style={{ width: 200, height: "auto", borderRadius: 6 }}
              />
            }
          >
            <a href={src} target="_blank" rel="noopener noreferrer">
              Download Bill
            </a>
          </Tooltip>
        ) : null,
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Reference Photo",
      dataIndex: "cakeImage",
      key: "cakeImage",
      render: (src) =>
        src ? (
          <Tooltip
            placement="right"
            overlayInnerStyle={{ maxWidth: "none" }}
            title={
              <img
                src={src}
                alt="Cake"
                style={{ width: 200, height: "auto", borderRadius: 6 }}
              />
            }
          >
            <a href={src} target="_blank" rel="noopener noreferrer">
              Download Photo
            </a>
          </Tooltip>
        ) : null,
    },
    {
      title: "Done",
      dataIndex: "done",
      key: "done",
      render: (_, record) => (
        <Checkbox
          checked={doneState[record.key] || false}
          onChange={() => toggleDone(record)}
        />
      ),
    },
  ];

  return (
    <DefaultLayout>
      <div className="p-4">
        <h2>Special Orders</h2>
        <br />
        <div className="mb-4">
          <Button
            type="primary"
            href="https://docs.google.com/forms/d/e/1FAIpQLSc73dBIAgtm3AgOCWZ30xQNEFx76P6h8tpP2xV_I9RMC12X8Q/viewform?usp=sharing"
            target="_blank"
          >
            Upload Special Order
          </Button>
        </div>
        <Table
          dataSource={orders}
          columns={columns}
          rowKey={(record) => record.key}
          bordered
          rowClassName={(record) => {
            const today = moment().startOf("day");
            const tomorrow = moment().add(1, "day").startOf("day");

            const isToday = moment(record.deliveryDate).isSame(today, "day");
            const isTomorrow = moment(record.deliveryDate).isSame(tomorrow, "day");

            if (record.done) {
              return "row-done";
            } else if (isToday || isTomorrow) {
              return "row-urgent";
            } else {
              return "row-pending";
            }
          }}
        />
      </div>
    </DefaultLayout>
  );
}
