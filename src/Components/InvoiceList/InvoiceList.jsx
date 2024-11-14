import { useEffect, useState } from 'react';
import './InvoiceList.css';
import { useNavigate } from 'react-router-dom';

export default function InvoiceList() {
  const [invoiceData, setInvoiceData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('http://localhost:3000/invoices');
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      setInvoiceData(data);
    } catch (error) {
      setError("Failed to load invoices");
      console.error("Error fetching invoices:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:3000/customers');
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomerData(data);
    } catch (error) {
      setError("Failed to load customers");
      console.error("Error fetching customers:", error);
    }
  };

  const handleEdit = (invoiceId) => {
    navigate(`/invoiceForm/${invoiceId}`);
  };

  const handleDelete = async (invoiceId) => {
    try {
      const response = await fetch(`http://localhost:3000/invoices/${invoiceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete invoice');
      
      // Update local state only after successful server update
      setInvoiceData(prev => prev.filter(invoice => invoice.id !== invoiceId));
    } catch (error) {
      setError("Failed to delete invoice");
      console.error("Error deleting invoice:", error);
    }
  };

  const handlePaid = async (invoiceId) => {
    try {
      const invoice = invoiceData.find(inv => inv.id === invoiceId);
      const response = await fetch(`http://localhost:3000/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...invoice,
          status: 'paid'
        })
      });

      if (!response.ok) throw new Error('Failed to update invoice status');
      
      // Update local state only after successful server update
      setInvoiceData(prev => 
        prev.map(invoice => 
          invoice.id === invoiceId 
            ? { ...invoice, status: 'paid' } 
            : invoice
        )
      );
    } catch (error) {
      setError("Failed to update invoice status");
      console.error("Error updating invoice status:", error);
    }
  };

  // Filter and sort invoices based on search term and status
  const filteredInvoices = invoiceData
    .sort((a, b) => {
      // Sort by createdAt timestamp, fallback to id if createdAt doesn't exist
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      // Fallback to sorting by ID (assuming newer invoices have higher IDs)
      return b.id.localeCompare(a.id);
    })
    .filter(invoice => {
      const customer = customerData.find(c => c.id === invoice.customerId);
      const customerName = (customer?.name || '').toLowerCase();
      const projectName = (invoice.projectName || '').toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = !searchTerm || 
        customerName.includes(searchLower) || 
        projectName.includes(searchLower);
      
      const matchesStatus = statusFilter === 'all' || 
        invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

  // Add this helper function to format the date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    // Split the date string and create a new date using components
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);  // month is 0-based in JS
    
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="invoice-list-page">
      <h1>Invoice List</h1>
      
      <div className="search-filter-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by project or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="status-filter">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-select"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <button 
          className="button-85" 
          onClick={() => navigate('/invoiceForm')}
        >
          New Invoice
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}
      
      <div className="invoice-list-container">
        {filteredInvoices.length === 0 ? (
          <p className="no-results">No invoices found matching your criteria.</p>
        ) : (
          filteredInvoices.map((invoice) => {
            const customer = customerData.find(c => c.id === invoice.customerId);
            return (
              <div key={invoice.id} className="invoice-card">
                <div className="invoice-info">
                  <h2>{customer?.name}</h2>
                  <p><strong>Project Name:</strong> {invoice.projectName}</p>
                  <p><strong>Due Date:</strong> {formatDate(invoice.dueDate)}</p>
                  <p><strong>Phone:</strong> {customer?.phone}</p>
                  <p><strong>Amount Due:</strong> ${invoice.total.toFixed(2)}</p>
                  <p><strong>Status:</strong> <span className={`${invoice.status}`}>{invoice.status.toUpperCase()}</span></p>
                </div>
                <div className="invoice-list-actions">
                  <button className="button-85" onClick={() => handleEdit(invoice.id)}>Edit</button>
                  <button className="button-85" onClick={() => handleDelete(invoice.id)}>Delete</button>
                  {invoice.status !== 'paid' && (
                    <button className="button-85" onClick={() => handlePaid(invoice.id)}>
                      Mark as Paid
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
