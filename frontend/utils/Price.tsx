import React from "react";

const Price = ({ price, currency }: { price: number; currency?: string }) => {
  const formattedPrice = new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  return <>{formattedPrice} Baht</>;
};

export default Price;
