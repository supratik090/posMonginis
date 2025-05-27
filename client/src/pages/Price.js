import {
  Button,
  Card,
  Col,
  Row,
  Select,
} from "antd";
import React, { useState } from "react";
import DefaultLayout from "../components/DefaultLayout";


// Define allowed weights per flavour
const weightOptionsByFlavour = {
  "Photo cake": ["1kg", "1.5kg", "2kg", "3kg","4kg", "5kg", "6kg"],
  "Custom Cake": ["1kg", "1.5kg", "2kg", "3kg","4kg", "5kg", "6kg"],
   "Rectangle Cake": [ "1.5kg", "2kg", "3kg","4kg", "5kg", "6kg"],
   "Round Cake": [ "1.5kg", "2kg", "3kg","4kg", "5kg", "6kg"],
    "Square Cake": [ "1.5kg", "2kg", "3kg","4kg", "5kg", "6kg"],
  // Add more flavours as needed
};

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





     { flavour: "Custom Cake", shape: "Any", weight: "1kg", price: 1325 },
      { flavour: "Custom Cake", shape: "Any", weight: "1.5kg", price: 2000 },
    { flavour: "Custom Cake", shape: "Any", weight: "2kg", price: 2650 },
    { flavour: "Custom Cake", shape: "Any", weight: "3kg", price: 3975 },
    { flavour: "Custom Cake", shape: "Any", weight: "4kg", price: 5300 },
    { flavour: "Custom Cake", shape: "Any", weight: "5kg", price: 6625 },
    { flavour: "Custom Cake", shape: "Any", weight: "6kg", price: 8000 },



          { flavour: "Rectangle Cake", shape: "Pineapple", weight: "1Kg", price: 700 },
         { flavour: "Rectangle Cake", shape: "Black Forest", weight: "1Kg", price: 780 },
         { flavour: "Rectangle Cake", shape: "Alpine Choco", weight: "1kg", price: 780 },
         { flavour: "Rectangle Cake", shape: "Classic Truffle", weight: "1kg", price: 700 },
         { flavour: "Rectangle Cake", shape: "Hazlenut", weight: "1kg", price: 700 },
         { flavour: "Rectangle Cake", shape: "Butter scotch Caremello", weight: "1kg", price: 780 },
         { flavour: "Rectangle Cake", shape: "Choco overload", weight: "1kg", price: 800 },
         { flavour: "Rectangle Cake", shape: "Choco Bite", weight: "1kg", price: 800 },
         { flavour: "Rectangle Cake", shape: "Dutch Choco", weight: "1kg", price: 780 },
          { flavour: "Rectangle Cake", shape: "Devils Delight", weight: "1kg", price: 800 },
          { flavour: "Rectangle Cake", shape: "Rasmalai", weight: "1kg", price: 1050 },
          { flavour: "Rectangle Cake", shape: "Mango", weight: "1kg", price: 780 },
          { flavour: "Rectangle Cake", shape: "Royal Beauty", weight: "1kg", price: 800 },
          { flavour: "Rectangle Cake", shape: "Blue berry Rush", weight: "1kg", price: 780 },

          { flavour: "Rectangle Cake", shape: "Tiramisu", weight: "1kg", price: 1500 },


         { flavour: "Round Cake", shape: "Pineapple", weight: "1kg", price: 700 },
         { flavour: "Round Cake", shape: "Black Forest", weight: "1kg", price: 780 },
         { flavour: "Round Cake", shape: "Alpine Choco", weight: "1kg", price: 780 },
         { flavour: "Round Cake", shape: "Classic Truffle", weight: "1kg", price: 700 },
         { flavour: "Round Cake", shape: "Hazlenut", weight: "1kg", price: 700 },
         { flavour: "Round Cake", shape: "Butter scotch Caremello", weight: "1kg", price: 780 },
         { flavour: "Round Cake", shape: "Choco overload", weight: "1kg", price: 800 },
         { flavour: "Round Cake", shape: "Choco Bite", weight: "1kg", price: 800 },
         { flavour: "Round Cake", shape: "Dutch Choco", weight: "1kg", price: 780 },

                 { flavour: "Round Cake", shape: "Devils Delight", weight: "1kg", price: 800 },
                   { flavour: "Round Cake", shape: "Rasmalai", weight: "1kg", price: 1050 },
                   { flavour: "Round Cake", shape: "Mango", weight: "1kg", price: 780 },
                   { flavour: "Round Cake", shape: "Royal Beauty", weight: "1kg", price: 800 },
                   { flavour: "Round Cake", shape: "Blue berry Rush", weight: "1kg", price: 780 },

              { flavour: "Round Cake", shape: "Tiramisu", weight: "1kg", price: 1500 },


         { flavour: "Square Cake", shape: "Pineapple", weight: "1kg", price: 700 },
         { flavour: "Square Cake", shape: "Black Forest", weight: "1kg", price: 780 },
         { flavour: "Square Cake", shape: "Alpine Choco", weight: "1kg", price: 780 },
         { flavour: "Square Cake", shape: "Classic Truffle", weight: "1kg", price: 700 },
         { flavour: "Square Cake", shape: "Hazlenut", weight: "1kg", price: 700 },
         { flavour: "Square Cake", shape: "Butter scotch Caremello", weight: "1kg", price: 780 },
         { flavour: "Square Cake", shape: "Choco overload", weight: "1kg", price: 800 },
         { flavour: "Square Cake", shape: "Choco Bite", weight: "1kg", price: 800 },
         { flavour: "Square Cake", shape: "Dutch Choco", weight: "1kg", price: 780 },

                          { flavour: "Square Cake", shape: "Devils Delight", weight: "1kg", price: 800 },
                            { flavour: "Square Cake", shape: "Rasmalai", weight: "1kg", price: 1050 },
                            { flavour: "Square Cake", shape: "Mango", weight: "1kg", price: 780 },
                            { flavour: "Square Cake", shape: "Royal Beauty", weight: "1kg", price: 800 },
                            { flavour: "Square Cake", shape: "Blue berry Rush", weight: "1kg", price: 780 },
          { flavour: "Square Cake", shape: "Tiramisu", weight: "1kg", price: 1500 },

   ];



const Price = () => {
  const [flavour, setFlavour] = useState(null);
  const [shape, setShape] = useState(null);
  const [weight, setWeight] = useState(null);
  const [matchedPrice, setMatchedPrice] = useState(null);

  const flavourOptions = [...new Set(priceTable.map((item) => item.flavour))];

  const shapeOptions = flavour
    ? [...new Set(priceTable.filter((item) => item.flavour === flavour).map((item) => item.shape))]
    : [];

  const weightOptions = flavour ? weightOptionsByFlavour[flavour] || [] : [];

  const calculatePrice = () => {
const baseItem = priceTable.find(
  (item) =>
    item.flavour === flavour &&
    item.shape === shape &&
    item.weight.toLowerCase() === "1kg"
);


    if (!baseItem) {
      setMatchedPrice("Base price not found");
      return;
    }

    const weightNumber = parseFloat(weight.replace("kg", ""));
    const price = Math.round(baseItem.price * weightNumber);
    setMatchedPrice(price);
  };

  return (
    <DefaultLayout>
      <Card title="Special Cake Price Lookup" style={{ marginTop: 30 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Select
              placeholder="Select Flavour"
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
              placeholder="Select Shape"
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
              onClick={calculatePrice}
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
