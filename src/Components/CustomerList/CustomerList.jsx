import "./CustomerList.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function CustomerList({ customerData }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = (id) => {
    console.log(`Deleting customer with id: ${id}`);
    fetch(`http://localhost:3000/customers/${id}`, {
      method: 'DELETE'
    });
    navigate(`/customerList`);
  };

  const handleEdit = (id) => {
    console.log(`Editing customer with id: ${id}`);
    navigate(`/customerForm/${id}`);
  };

  // Filter customers based on search term
  const filteredCustomers = customerData.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return customer.name.toLowerCase().includes(searchLower) ||
           customer.email.toLowerCase().includes(searchLower);
  });

  return (
    <div className="customer-list-page">
      <h1>Customer List</h1>

      <div className="search-filter-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <button 
          className="button-85" 
          onClick={() => navigate('/customerForm')}
        >
          New Customer
        </button>
      </div>

      <div className="customer-list-container">
        {filteredCustomers.length === 0 ? (
          <p className="no-results">No customers found matching your criteria.</p>
        ) : (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="customer-card">
              <div className="customer-info">
                <h2>{customer.name}</h2>
                <p><strong>Email:</strong> {customer.email}</p>
                <p><strong>Address:</strong> {customer.address}</p>
                <p><strong>Phone:</strong> {customer.phone}</p>
              </div>
              <div className="customer-list-actions">
                <button className="button-85" onClick={() => handleEdit(customer.id)}>
                  Edit
                </button>
                <button className="button-85" onClick={() => handleDelete(customer.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

