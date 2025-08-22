// DefaultLayout.js

import {
  CopyOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingCartOutlined,
  UnorderedListOutlined,
  DollarOutlined,
  UserOutlined,
  PieChartOutlined ,
  StockOutlined,
  RollbackOutlined,
  TagOutlined ,
  GiftOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme } from "antd";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "../styles/DefaultLayout.css";
import Spinner from "./Spinner";
const { Header, Sider, Content } = Layout;

const DefaultLayout = ({ children }) => {
  const navigate = useNavigate();
  const { cartItems, loading } = useSelector((state) => state.rootReducer);
  const [collapsed, setCollapsed] = useState(false);


  const [shouldFlashTrading, setShouldFlashTrading] = useState(false);

  useEffect(() => {
    const flag = localStorage.getItem("tradingNeedsAttention") === "true";
    setShouldFlashTrading(flag);
  }, []);



  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const toggle = () => {
    setCollapsed(!collapsed);
  };
  //to get localstorage data
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  return (
    <Layout>
      {loading && <Spinner />}
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo"></div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[window.location.pathname]}
        >
          <Menu.Item
            key="/"
            icon={<HomeOutlined />}
            onClick={() => navigate("/")}
          >
            Home
          </Menu.Item>
          <Menu.Item
            key="/bills"
            icon={<CopyOutlined />}
            onClick={() => navigate("/bills")}
          >
            Bills
          </Menu.Item>
          <Menu.Item
            key="/items"
            icon={<UnorderedListOutlined />}
            onClick={() => navigate("/items")}
          >
            Items
          </Menu.Item>

          <Menu.Item
            key="/delivery"
            icon={<CopyOutlined />}
            onClick={() => navigate("/delivery")}
          >
            Morning delivery
          </Menu.Item>
                              <Menu.Item
                      key="/inventory"
                      icon={<UnorderedListOutlined />}
                      onClick={() => navigate("/inventory")}
                    >
                      Inventory
                    </Menu.Item>
            <Menu.Item
                      key="/trading"
                      icon={<StockOutlined />}
                      onClick={() => navigate("/trading")}
                      className={shouldFlashTrading ? "flashing-tab" : ""}
                    >
                      Trading
                    </Menu.Item>
            <Menu.Item
                      key="/returns"
                      icon={<RollbackOutlined />}
                      onClick={() => navigate("/returns")}
                    >
                      Returns
                    </Menu.Item>
          <Menu.Item
            key="/customers"
            icon={<UserOutlined />}
            onClick={() => navigate("/customers")}
          >
            Customers
          </Menu.Item>
          <Menu.Item
            key="/cashBox"
            icon={<DollarOutlined />}
            onClick={() => navigate("/cashbox")}
          >
            Cash Box
          </Menu.Item>
          <Menu.Item
            key="/specialOrders"
            icon={<GiftOutlined />}
            onClick={() => navigate("/specialOrders")}
          >
            Special Orders
          </Menu.Item>
          <Menu.Item
            key="/price"
            icon={<TagOutlined  />}
            onClick={() => navigate("/price")}
          >
            Price Inquiry
          </Menu.Item>

          <Menu.Item
            key="/logout"
            icon={<LogoutOutlined />}
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/login");
            }}
          >
            Logout
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
       <Header
         style={{
           margin: 8,
           padding: "0 16px",
           borderRadius: 8,
           background: colorBgContainer,
           display: "flex",
           alignItems: "center",
           justifyContent: "space-between",
         }}
       >
         <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
           {React.createElement(
             collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
             {
               className: "trigger",
               onClick: toggle,
             }
           )}
           <h2 style={{ margin: 0 }}>🎂  Monginis  {process.env.REACT_APP_SHOP_NAME || " Vikhroli R3701"}</h2>

         </div>

         <div
           className="cart-item d-flex jusitfy-content-space-between flex-row"
           onClick={() => navigate("/cart")}
           style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
         >
           <p style={{ margin: 0 }}>{cartItems.length}</p>
           <ShoppingCartOutlined />
         </div>
       </Header>
        <Content className="content">{children}</Content>
      </Layout>
    </Layout>
  );
};

export default DefaultLayout;
