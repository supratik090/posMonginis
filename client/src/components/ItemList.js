import { Button, Card } from "antd";
import { useDispatch } from "react-redux";
import React, { useState } from "react";

const ItemList = ({ item }) => {
  const dispatch = useDispatch();

   const [isDisabled, setIsDisabled] = useState(false);

  //update cart handler
  const handleAddTOCart = () => {

   if (isDisabled) return;

      // Disable button
      setIsDisabled(true);

    dispatch({
      type: "ADD_TO_CART",
      payload: { ...item, quantity: 1 },
    });

      // Re-enable button after 1 second
        setTimeout(() => setIsDisabled(false), 1000);
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
