import { Button, Card } from "antd";
import React from "react";
import { useDispatch } from "react-redux";

const ItemList = ({ item }) => {
  const dispatch = useDispatch();
  //update cart handler
  const handleAddTOCart = () => {
    dispatch({
      type: "ADD_TO_CART",
      payload: { ...item, quantity: 1 },
    });
  };
  const { Meta } = Card;
  return (
    <div>
      <Card
        style={{ width: 300, marginBottom: 20 }}
        cover={<img alt={item.name} src={item.image} style={{ height: 0 }} />}
      >
        <Meta title={item.name} />
        <h6>Rs {item.price}</h6>
        <div className="item-button">
        <Button onClick={() => handleAddTOCart()}>Add to cart</Button>
        </div>
      </Card>
    </div>
  );
};

export default ItemList;
