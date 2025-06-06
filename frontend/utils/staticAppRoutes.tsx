const STATIC_APP_ROUTES: { name: string; route: string }[] = [
  { name: "Home", route: "/" },
  { name: "Explore", route: "/explore" },
  { name: "Edit Profile", route: "/edit-profile" },
  { name: "Shipping Address", route: "/shipping-address" },
  { name: "Cart", route: "/cart" },
  { name: "Dashboard", route: "/(tabs)/dashboard" },
  { name: "All Products", route: "/admin/products/all-product-manage" },
  { name: "Add Product", route: "/admin/products/add-new-product" },
  { name: "Calendar", route: "/calender" },
  // ...add more as needed
];

export default STATIC_APP_ROUTES;
