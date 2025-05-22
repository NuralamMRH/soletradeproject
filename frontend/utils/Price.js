const Price = ({ price, currency }) => {
  const formattedPrice = new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: currency ? currency : "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  return <>{formattedPrice}</>;
};

export default Price;
