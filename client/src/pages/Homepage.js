import { Col, Row, Input } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ItemList from "../components/ItemList";
import DefaultLayout from "../components/DefaultLayout";
const Homepage = () => {
  const [itemsData, setItemsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selecedCategory, setSelecedCategory] = useState("All");
  const cartItems = useSelector((state) => state.cart?.items || []);

  const categories = [
    { name: "All" },
    { name: "Cake" },
    { name: "Pastry" },
    { name: "Savory" },
    { name: "Trading" },
    { name: "Other" },
  ];

  const dispatch = useDispatch();
  const filteredItems = itemsData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selecedCategory === "All" || item.category === selecedCategory)
  );

  useEffect(() => {
    const getAllItems = async () => {
      try {
        dispatch({ type: "SHOW_LOADING" });
        const { data } = await axios.get("/api/items/get-item");
        setItemsData(data);
        dispatch({ type: "HIDE_LOADING" });
        console.log(data);
      } catch (error) {
        console.log(error);
      }
    };
    getAllItems();
  }, [dispatch]);

  return (
    <DefaultLayout>
      <div style={{ position: "relative" }}>
        <Input
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: 20, width: "100%" }}
        />

      </div>
      <div className="d-flex" style={{ display: "flex", gap: "10px", justifyContent: "space-between", flexWrap: "nowrap" }}>
        {categories.map((category) => (
          <div
            key={category.name}
            className={`d-flex category ${selecedCategory === category.name && "category-active"}`}
            onClick={() => setSelecedCategory(category.name)}
            style={{
              padding: "10px 20px",
              backgroundColor: selecedCategory === category.name ? "#ff69b4" : "#f5f5f5",
              borderRadius: "8px",
              cursor: "pointer",
              textAlign: "center",
              flex: "1",
              minWidth: "100px",
              whiteSpace: "nowrap"
            }}
          >
            <h2>{category.name}</h2>
          </div>
        ))}
      </div>
      <Row gutter={[16, 16]}>
        {filteredItems.map((item) => (
          <Col xs={24} lg={6} md={12} sm={6} key={item.id}>
            <ItemList item={item} />
          </Col>
        ))}
      </Row>
    </DefaultLayout>
  );
};

export default Homepage;