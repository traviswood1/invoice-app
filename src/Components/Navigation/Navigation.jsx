import { NavLink, Outlet } from "react-router-dom";
import "./Navigation.css";

export default function Navigation() {
  return (
    <>
      <nav>
        <NavLink to="/invoiceList">Invoices</NavLink>
        <NavLink to="/invoiceForm">New Invoice</NavLink>
        <NavLink to="/customerList">Customers</NavLink>
        <NavLink to="/customerForm">New Customer</NavLink>
      </nav>
      <Outlet />
    </>
  );
}
