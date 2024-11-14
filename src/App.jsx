import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Navigation, InvoiceList, CustomerList, InvoiceForm, CustomerForm } from "./Components";
import data from "../db.json";
import "./index.css";

const router = createBrowserRouter([
  { 
    path: "/", 
    element: <Navigation />,
    children: [
      { 
        path: "/invoiceList", 
        element: <InvoiceList invoiceData={data} /> 
      },
      { 
        path: "/invoiceForm", 
        element: <InvoiceForm invoiceData={data} />,
        children: [
          {
            path: "/invoiceForm/:id",
            element: <InvoiceForm invoiceData={data.invoices} />
          }
        ]
      },
      { 
        path: "/customerList", 
        element: <CustomerList customerData={data.customers} /> 
      },
      { 
        path: "/customerForm", 
        element: <CustomerForm customerData={data.customers} />,
        children: [
          {
            path: "/customerForm/:id",
            element: <CustomerForm customerData={data.customers} />
          }
        ]
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App
