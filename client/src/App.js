import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import BillsPage from "./pages/BillsPage";
import CartPage from "./pages/CartPage";
import CustomerPage from "./pages/CustomerPage";
import Homepage from "./pages/Homepage";
import ItemPage from "./pages/ItemPage";
import InventoryPage from "./pages/InventoryPage";
import CashBox from "./pages/Cashbox";
import MorningDeliveryPage from "./pages/MorningDeliveryPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AnalyticsPage from "./pages/analyticsPage";
import TradingPage from "./pages/TradingPage";
import ReturnsPage from "./pages/ReturnsPage";
import Price from "./pages/Price";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Homepage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/items"
            element={
              <ProtectedRoute>
                <ItemPage />
              </ProtectedRoute>
            }
          />
          <Route
                      path="/inventory"
                      element={
                        <ProtectedRoute>
                          <InventoryPage/>
                        </ProtectedRoute>
                      }
                    />

          <Route
                      path="/trading"
                      element={
                        <ProtectedRoute>
                          <TradingPage/>
                        </ProtectedRoute>
                      }
                    />
          <Route
                      path="/returns"
                      element={
                        <ProtectedRoute>
                          <ReturnsPage/>
                        </ProtectedRoute>
                      }
                    />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bills"
            element={
              <ProtectedRoute>
                <BillsPage />
              </ProtectedRoute>
            }
          />
           <Route
                                path="/delivery"
                                element={
                                  <ProtectedRoute>
                                    <MorningDeliveryPage/>
                                  </ProtectedRoute>
                                }
                              />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <CustomerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cashbox"
            element={
              <ProtectedRoute>
                <CashBox />
              </ProtectedRoute>
            }
          />
          <Route
            path="/price"
            element={
              <ProtectedRoute>
                <Price />
              </ProtectedRoute>
            }
          />
                    <Route
                      path="/analytics"
                      element={
                        <ProtectedRoute>
                          <AnalyticsPage />
                        </ProtectedRoute>
                      }
                    />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}



export function ProtectedRoute({ children }) {
  if (localStorage.getItem("user")) {
    return children;
  } else {
    return <Navigate to="/login" />;
  }
}

export default App