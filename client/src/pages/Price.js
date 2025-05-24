import {
  Button,
  Form,
  InputNumber,
  Table,
  message,
  Modal,
  Select,
  Card,
  Input,
  Row,
  Col,
  Switch,
  Collapse,
  DatePicker,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import DefaultLayout from "../components/DefaultLayout";
import moment from "moment-timezone";

const { Panel } = Collapse;

const Price = () => {


   // price lookup
   const priceTable = [
     { flavour: "Photo cake", shape: "Truffle", weight: "1kg", price: 1050 },
     { flavour: "Photo cake", shape: "Pineapple", weight: "1kg", price: 1050 },
     { flavour: "Photo cake", shape: "Black Forest", weight: "1kg", price: 1050 },
     { flavour: "Photo cake", shape: "Pista", weight: "1kg", price: 1150 },

     { flavour: "Photo cake", shape: "Butter Scotch", weight: "1kg", price: 1050 },
     { flavour: "Photo cake", shape: "Alpine Choco", weight: "1kg", price: 1050 },
     { flavour: "Photo cake", shape: "Dutch Almond", weight: "1kg", price: 1150 },
     { flavour: "Photo cake", shape: "Zebra Torte", weight: "1kg", price: 1050 },

     { flavour: "Photo cake", shape: "Strawberry", weight: "1kg", price: 1150 },
     { flavour: "Photo cake", shape: "Mango", weight: "1kg", price: 1150 },
     { flavour: "Photo cake", shape: "Dutch choco", weight: "1kg", price: 1050 },
     { flavour: "Photo cake", shape: "Butter scotch Caramello", weight: "1kg", price: 1150 },



     { flavour: "Photo cake", shape: "Fresh Fruit", weight: "1kg", price: 1150 },
     { flavour: "Photo cake", shape: "Devil Delight", weight: "1kg", price: 1050 },
     { flavour: "Photo cake", shape: "Hazlenut", weight: "1kg", price: 1050 },
     { flavour: "Photo cake", shape: "Dutch Brownie", weight: "1kg", price: 1050 },

     { flavour: "Photo cake", shape: "Blue berry", weight: "1kg", price: 1050 },
     { flavour: "Photo cake", shape: "Red Velvet", weight: "1kg", price: 1150 },
     { flavour: "Photo cake", shape: "Morning Dew", weight: "1kg", price: 1150 },
     { flavour: "Photo cake", shape: "Moose", weight: "1kg", price: 1150 },

     { flavour: "Photo cake", shape: "Choco overload", weight: "1kg", price: 1150 },
     { flavour: "Photo cake", shape: "Choco Bite", weight: "1kg", price: 1150 },
     { flavour: "Photo cake", shape: "Rasmalai", weight: "1kg", price: 1150 },
     { flavour: "Photo cake", shape: "Cruncy Almond", weight: "1kg", price: 1150 },

// 1.5 kg photo cake

     { flavour: "Photo cake", shape: "Truffle", weight: "1.5kg", price: 1600 },
     { flavour: "Photo cake", shape: "Pineapple", weight: "1.5kg", price: 1600 },
     { flavour: "Photo cake", shape: "Black Forest", weight: "1.5kg", price: 1600 },
     { flavour: "Photo cake", shape: "Pista", weight: "1.5kg", price: 1750 },

     { flavour: "Photo cake", shape: "Butter Scotch", weight: "1.5kg", price: 1600 },
     { flavour: "Photo cake", shape: "Alpine Choco", weight: "1.5kg", price: 1600 },
     { flavour: "Photo cake", shape: "Dutch Almond", weight: "1.5kg", price: 1750 },
     { flavour: "Photo cake", shape: "Zebra Torte", weight: "1.5kg", price: 1600 },

     { flavour: "Photo cake", shape: "Strawberry", weight: "1.5kg", price: 1750 },
     { flavour: "Photo cake", shape: "Mango", weight: "1.5kg", price: 1750 },
     { flavour: "Photo cake", shape: "Dutch choco", weight: "1.5kg", price: 1600 },
     { flavour: "Photo cake", shape: "Butter scotch Caramello", weight: "1.5kg", price: 1750 },



     { flavour: "Photo cake", shape: "Fresh Fruit", weight: "1.5kg", price: 1750 },
     { flavour: "Photo cake", shape: "Devil Delight", weight: "1.5kg", price: 1600 },
     { flavour: "Photo cake", shape: "Hazlenut", weight: "1.5kg", price: 1600 },
     { flavour: "Photo cake", shape: "Dutch Brownie", weight: "1.5kg", price: 1600 },

     { flavour: "Photo cake", shape: "Blue berry", weight: "1.5kg", price: 1600 },
     { flavour: "Photo cake", shape: "Red Velvet", weight: "1.5kg", price: 1750 },
     { flavour: "Photo cake", shape: "Morning Dew", weight: "1.5kg", price: 1750 },
     { flavour: "Photo cake", shape: "Moose", weight: "1.5kg", price: 1750 },

     { flavour: "Photo cake", shape: "Choco overload", weight: "1.5kg", price: 1750 },
     { flavour: "Photo cake", shape: "Choco Bite", weight: "1.5kg", price: 1750 },
     { flavour: "Photo cake", shape: "Rasmalai", weight: "1.5kg", price: 1750 },
     { flavour: "Photo cake", shape: "Cruncy Almond", weight: "1.5kg", price: 1750 },


     { flavour: "Round Cake", shape: "Pineapple", weight: "1.5kg", price: 1050 },
     { flavour: "Round Cake", shape: "Black Forest", weight: "1.5kg", price: 1150 },
     { flavour: "Round Cake", shape: "Alpine Choco", weight: "1.5kg", price: 1150 },
     { flavour: "Round Cake", shape: "Classic Truffle", weight: "1.5kg", price: 1050 },
     { flavour: "Round Cake", shape: "Hazlenut", weight: "1.5kg", price: 1050 },
     { flavour: "Round Cake", shape: "Butter scotch Caremello", weight: "1.5kg", price: 1150 },
     { flavour: "Round Cake", shape: "Choco overload", weight: "1.5kg", price: 1200 },
     { flavour: "Round Cake", shape: "Choco Bite", weight: "1.5kg", price: 1200 },

     { flavour: "Rectangle Cake", shape: "Pineapple", weight: "1.5kg", price: 1050 },
     { flavour: "Rectangle Cake", shape: "Black Forest", weight: "1.5kg", price: 1150 },
     { flavour: "Rectangle Cake", shape: "Alpine Choco", weight: "1.5kg", price: 1150 },
     { flavour: "Rectangle Cake", shape: "Classic Truffle", weight: "1.5kg", price: 1050 },
     { flavour: "Rectangle Cake", shape: "Hazlenut", weight: "1.5kg", price: 1050 },
     { flavour: "Rectangle Cake", shape: "Butter scotch Caremello", weight: "1.5kg", price: 1150 },
     { flavour: "Rectangle Cake", shape: "Choco overload", weight: "1.5kg", price: 1200 },
     { flavour: "Rectangle Cake", shape: "Choco Bite", weight: "1.5kg", price: 1200 },


     { flavour: "Rectangle Cake", shape: "Pineapple", weight: "1.5kg", price: 1050 },
     { flavour: "Rectangle Cake", shape: "Black Forest", weight: "1.5kg", price: 1150 },
     { flavour: "Rectangle Cake", shape: "Alpine Choco", weight: "1.5kg", price: 1150 },
     { flavour: "Rectangle Cake", shape: "Classic Truffle", weight: "1.5kg", price: 1050 },
     { flavour: "Rectangle Cake", shape: "Hazlenut", weight: "1.5kg", price: 1050 },
     { flavour: "Rectangle Cake", shape: "Butter scotch Caremello", weight: "1.5kg", price: 1150 },
     { flavour: "Rectangle Cake", shape: "Choco overload", weight: "1.5kg", price: 1200 },
     { flavour: "Rectangle Cake", shape: "Choco Bite", weight: "1.5kg", price: 1200 },


     { flavour: "Rectangle Cake", shape: "Pineapple", weight: "2Kg", price: 1400 },
     { flavour: "Rectangle Cake", shape: "Black Forest", weight: "2Kg", price: 1550 },
     { flavour: "Rectangle Cake", shape: "Alpine Choco", weight: "2Kg", price: 1550 },
     { flavour: "Rectangle Cake", shape: "Classic Truffle", weight: "2Kg", price: 1400 },
     { flavour: "Rectangle Cake", shape: "Hazlenut", weight: "2Kg", price: 1400 },
     { flavour: "Rectangle Cake", shape: "Butter scotch Caremello", weight: "2Kg", price: 1550 },
     { flavour: "Rectangle Cake", shape: "Choco overload", weight: "2Kg", price: 1600 },
     { flavour: "Rectangle Cake", shape: "Choco Bite", weight: "2Kg", price: 1600 },


     { flavour: "Round Cake", shape: "Pineapple", weight: "2Kg", price: 1400 },
     { flavour: "Round Cake", shape: "Black Forest", weight: "2Kg", price: 1550 },
     { flavour: "Round Cake", shape: "Alpine Choco", weight: "2Kg", price: 1550 },
     { flavour: "Round Cake", shape: "Classic Truffle", weight: "2Kg", price: 1400 },
     { flavour: "Round Cake", shape: "Hazlenut", weight: "2Kg", price: 1400 },
     { flavour: "Round Cake", shape: "Butter scotch Caremello", weight: "2Kg", price: 1550 },
     { flavour: "Round Cake", shape: "Choco overload", weight: "2Kg", price: 1600 },
     { flavour: "Round Cake", shape: "Choco Bite", weight: "2Kg", price: 1600 },


     { flavour: "Square Cake", shape: "Pineapple", weight: "2Kg", price: 1400 },
     { flavour: "Square Cake", shape: "Black Forest", weight: "2Kg", price: 1550 },
     { flavour: "Square Cake", shape: "Alpine Choco", weight: "2Kg", price: 1550 },
     { flavour: "Square Cake", shape: "Classic Truffle", weight: "2Kg", price: 1400 },
     { flavour: "Square Cake", shape: "Hazlenut", weight: "2Kg", price: 1400 },
     { flavour: "Square Cake", shape: "Butter scotch Caremello", weight: "2Kg", price: 1550 },
     { flavour: "Square Cake", shape: "Choco overload", weight: "2Kg", price: 1600 },
     { flavour: "Square Cake", shape: "Choco Bite", weight: "2Kg", price: 1600 },



     { flavour: "Rectangle Cake", shape: "Pineapple", weight: "3kg", price: 2100 },
     { flavour: "Rectangle Cake", shape: "Black Forest", weight: "3kg", price: 2350 },
     { flavour: "Rectangle Cake", shape: "Alpine Choco", weight: "3kg", price: 2350 },
     { flavour: "Rectangle Cake", shape: "Classic Truffle", weight: "3kg", price: 2100 },
     { flavour: "Rectangle Cake", shape: "Hazlenut", weight: "3kg", price: 2100 },
     { flavour: "Rectangle Cake", shape: "Butter scotch Caremello", weight: "3kg", price: 2350 },
     { flavour: "Rectangle Cake", shape: "Choco overload", weight: "3kg", price: 2400 },
     { flavour: "Rectangle Cake", shape: "Choco Bite", weight: "3kg", price: 2400 },


     { flavour: "Round Cake", shape: "Pineapple", weight: "3kg", price: 2100 },
     { flavour: "Round Cake", shape: "Black Forest", weight: "3kg", price: 2350 },
     { flavour: "Round Cake", shape: "Alpine Choco", weight: "3kg", price: 2350 },
     { flavour: "Round Cake", shape: "Classic Truffle", weight: "3kg", price: 2100 },
     { flavour: "Round Cake", shape: "Hazlenut", weight: "3kg", price: 2100 },
     { flavour: "Round Cake", shape: "Butter scotch Caremello", weight: "3kg", price: 2350 },
     { flavour: "Round Cake", shape: "Choco overload", weight: "3kg", price: 2400 },
     { flavour: "Round Cake", shape: "Choco Bite", weight: "3kg", price: 2400 },


     { flavour: "Square Cake", shape: "Pineapple", weight: "3kg", price: 2100 },
     { flavour: "Square Cake", shape: "Black Forest", weight: "3kg", price: 2350 },
     { flavour: "Square Cake", shape: "Alpine Choco", weight: "3kg", price: 2350 },
     { flavour: "Square Cake", shape: "Classic Truffle", weight: "3kg", price: 2100 },
     { flavour: "Square Cake", shape: "Hazlenut", weight: "3kg", price: 2100 },
     { flavour: "Square Cake", shape: "Butter scotch Caremello", weight: "3kg", price: 2350 },
     { flavour: "Square Cake", shape: "Choco overload", weight: "3kg", price: 2400 },
     { flavour: "Square Cake", shape: "Choco Bite", weight: "3kg", price: 2400 },

     { flavour: "Custom Cake", shape: "Any", weight: "1kg", price: 1325 },
      { flavour: "Custom Cake", shape: "Any", weight: "1.5kg", price: 2000 },
    { flavour: "Custom Cake", shape: "Any", weight: "2kg", price: 2650 },
    { flavour: "Custom Cake", shape: "Any", weight: "3kg", price: 3975 },
    { flavour: "Custom Cake", shape: "Any", weight: "4kg", price: 5300 },
    { flavour: "Custom Cake", shape: "Any", weight: "5kg", price: 6625 },
    { flavour: "Custom Cake", shape: "Any", weight: "6kg", price: 8000 },


   ];



const [flavour, setFlavour] = useState(null);
const [shape, setShape] = useState(null);
const [weight, setWeight] = useState(null);
const [matchedPrice, setMatchedPrice] = useState(null);

const flavourOptions = [...new Set(priceTable.map((item) => item.flavour))];

const shapeOptions = flavour
  ? [...new Set(priceTable.filter((item) => item.flavour === flavour).map((item) => item.shape))]
  : [];

const weightOptions = flavour && shape
  ? [...new Set(priceTable
      .filter((item) => item.flavour === flavour && item.shape === shape)
      .map((item) => item.weight))]
  : [];




  return (
    <DefaultLayout>

 <Card title="Special cake price lookup" style={{ marginTop: 30 }}>
   <Row gutter={16}>
     <Col span={6}>
       <Select
         placeholder="Select Type"
         style={{ width: "100%" }}
         value={flavour}
         onChange={(value) => {
           setFlavour(value);
           setShape(null);
           setWeight(null);
           setMatchedPrice(null);
         }}
       >
         {flavourOptions.map((flav) => (
           <Select.Option key={flav} value={flav}>
             {flav}
           </Select.Option>
         ))}
       </Select>
     </Col>

     <Col span={6}>
       <Select
         placeholder="Select Flavour"
         style={{ width: "100%" }}
         value={shape}
         disabled={!flavour}
         onChange={(value) => {
           setShape(value);
           setWeight(null);
           setMatchedPrice(null);
         }}
       >
         {shapeOptions.map((sh) => (
           <Select.Option key={sh} value={sh}>
             {sh}
           </Select.Option>
         ))}
       </Select>
     </Col>

     <Col span={6}>
       <Select
         placeholder="Select Weight"
         style={{ width: "100%" }}
         value={weight}
         disabled={!flavour || !shape}
         onChange={(value) => {
           setWeight(value);
           setMatchedPrice(null);
         }}
       >
         {weightOptions.map((w) => (
           <Select.Option key={w} value={w}>
             {w}
           </Select.Option>
         ))}
       </Select>
     </Col>

     <Col span={6}>
       <Button
         type="primary"
         onClick={() => {
           const result = priceTable.find(
             (item) =>
               item.flavour === flavour &&
               item.shape === shape &&
               item.weight === weight
           );
           setMatchedPrice(result?.price || "Not Found");
         }}
         disabled={!flavour || !shape || !weight}
       >
         Get Price
       </Button>
     </Col>
   </Row>

   {matchedPrice !== null && (
     <div style={{ marginTop: 20 }}>
       <strong>Price:</strong> ₹{matchedPrice}
     </div>
   )}
 </Card>


    </DefaultLayout>
  );
};

export default Price;
