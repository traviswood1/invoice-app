import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import html2pdf from 'html2pdf.js';
import "./InvoiceForm.css";

export default function InvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    customerId: "",
    invoiceNumber: "",
    projectName: "",
    date: new Date().toISOString().split('T')[0],
    dueDate: "",
    items: [{ description: "", quantity: 0, rate: 0, amount: 0 }],
    total: 0,
    status: "pending",
  });
  const invoiceRef = useRef(null);

  // Fetch invoice data if editing
  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return;
      
      try {
        const response = await fetch(`http://localhost:3000/invoices/${id}`);
        if (!response.ok) throw new Error('Failed to fetch invoice');
        const data = await response.json();
        setFormData(data);
      } catch (error) {
        console.error("Error fetching invoice:", error);
        setError("Failed to load invoice");
      }
    };

    fetchInvoice();
  }, [id]);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/customers");
        if (!response.ok) throw new Error('Failed to fetch customers');
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setError("Failed to load customers");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    
    // Handle numeric fields
    if (field === 'quantity' || field === 'rate') {
      // Convert to number and handle invalid inputs
      const numValue = parseFloat(value) || 0;
      newItems[index][field] = numValue;
      // Calculate amount
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    } else {
      // Handle non-numeric fields (like description)
      newItems[index][field] = value;
    }

    // Calculate total (with safeguard against NaN)
    const total = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);

    setFormData(prev => ({
      ...prev,
      items: newItems,
      total: total
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 0, rate: 0, amount: 0 }]
    }));
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    
    // Recalculate total
    const total = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);

    setFormData(prev => ({
      ...prev,
      items: newItems,
      total
    }));
  };

  // Prevent removing the last item
  const canRemoveItem = formData.items.length > 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const invoiceData = {
        ...formData,
        createdAt: new Date().toISOString(),
      };

      const response = await fetch('http://localhost:3000/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData)
      });

      if (!response.ok) throw new Error(`Failed to ${id ? 'update' : 'create'} invoice`);
      
      // Navigate back to invoice list on success
      navigate('/invoiceList');
    } catch (error) {
      console.error("Error submitting invoice:", error);
      setError(`Failed to ${id ? 'update' : 'create'} invoice`);
    }
  };

  // Add the same date formatting function from InvoiceList
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getPreviewInvoiceNumber = () => {
    if (formData.invoiceNumber) return formData.invoiceNumber;
    const timestamp = new Date().getTime();
    const randomDigits = Math.floor(Math.random() * 1000);
    return `INV-${timestamp.toString().slice(-4)}-${randomDigits}`;
  };

  const generatePDF = () => {
    const element = invoiceRef.current;
    const opt = {
      margin: 1,
      filename: `invoice-${getPreviewInvoiceNumber()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="invoice-form-container">
      <h1>{id ? 'Edit Invoice' : 'New Invoice'}</h1>
      {error && <p className="error">{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-header">
          <div className="form-group">
            <label htmlFor="customer">Customer:</label>
            <select 
              id="customer" 
              name="customerId" 
              className="customer-select-dropdown"
              value={formData.customerId}
              onChange={handleChange}
              required
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">

            <div className="form-group">
              <label htmlFor="date">Date:</label>
              <input 
                type="date" 
                id="date" 
                name="date" 
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date:</label>
              <input 
                type="date" 
                id="dueDate" 
                name="dueDate" 
                value={formData.dueDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="projectName">Project Name:</label>
            <input 
              type="text" 
              id="projectName" 
              name="projectName" 
              value={formData.projectName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="items-section">
          <h3>Items</h3>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Item description"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={item.quantity || 0}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate || 0}
                      onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                      required
                    />
                  </td>
                  <td>${item.amount?.toFixed(2) || '0.00'}</td>
                  <td>
                    {canRemoveItem && (
                      <button 
                        type="button" 
                        onClick={() => removeItem(index)}
                        className="remove-button"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="button-85" type="button" onClick={addItem}>Add Item</button>
        </div>

        <div className="totals-section">
          <div className="total-row">
            <span>Total:</span>
            <span>${formData.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="button-85">
            {id ? 'Update Invoice' : 'Create Invoice'}
          </button>
          <button 
            type="button" 
            className="button-85" 
            onClick={() => navigate('/invoiceList')}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="button-85"
            onClick={generatePDF}
          >
            Download PDF
          </button>
        </div>
      </form>

      {/* PDF Preview Section */}
      <div ref={invoiceRef} className="invoice-pdf-content">
        <div className="invoice-header">
          <div className="invoice-header-text"> 
            <h2>INVOICE</h2>
            <h3>McProperty Improvements</h3>
            <p>Email: mcpropertiesia@gmail.com</p>
            <p>Address: 2743 Fair Ln, Denison, IA</p>
            <p>Phone: 712-210-2950</p>
          </div>
          <div className="invoice-details">
            <p>
              <strong>Invoice Number:</strong> {getPreviewInvoiceNumber()}
            </p>
            <p><strong>Date:</strong> {formatDate(formData.date)}</p>
            <p><strong>Due Date:</strong> {formatDate(formData.dueDate)}</p>
          </div>
        </div>

        <div className="customer-section">
          <h3>Bill To:</h3>
          <p>{customers.find(c => c.id === formData.customerId)?.name}</p>
          <p>{customers.find(c => c.id === formData.customerId)?.address}</p>
        </div>

        <div className="project-section">
          <h3>Project Details:</h3>
          <p><strong>Project Name:</strong> {formData.projectName}</p>
        </div>

        <table className="invoice-items">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {formData.items.map((item, index) => (
              <tr key={index}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>${item.rate.toFixed(2)}</td>
                <td>${item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" className="total-label">Total:</td>
              <td className="total-amount">${formData.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        <p className="invoice-footer">Thank you for your business!</p>
      </div>
    </div>
  );
}
