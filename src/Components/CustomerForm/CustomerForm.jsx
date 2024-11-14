import { useState, useEffect } from "react";
import "./CustomerForm.css";
import { useNavigate, useParams } from "react-router-dom";

export default function CustomerForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch customer data if editing
  useEffect(() => {
    const fetchCustomer = async () => {
      if (id) {
        try {
          const response = await fetch(`http://localhost:3000/customers/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch customer');
          }
          const customer = await response.json();
          setName(customer.name);
          setEmail(customer.email);
          setAddress(customer.address);
        } catch (error) {
          console.error("Error fetching customer:", error);
          setError("Failed to load customer data");
        }
      }
    };

    fetchCustomer();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!name) {
        setError("Name is required");
        return;
      }
      
      // Determine if we're updating or creating
      const method = id ? 'PUT' : 'POST';
      const url = id 
        ? `http://localhost:3000/customers/${id}`
        : 'http://localhost:3000/customers';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          address
        })
      });

      if (!response.ok) {
        throw new Error(id ? 'Failed to update customer' : 'Failed to add customer');
      }

      // Clear form
      setName("");
      setEmail("");
      setAddress("");
      setError("");

      navigate("/customerList");
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Failed to save customer. Please try again.");
    }
  };

  return (
    <>
      <h1>New Customer Form</h1>
      {error && <p className="error">{error}</p>}
      <form>
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" name="name" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="address">Address:</label>
        <input type="text" id="address" name="address" placeholder="Enter address" value={address} onChange={(e) => setAddress(e.target.value)} />
        <button type="submit" className="button-85" onClick={handleSubmit}>Submit</button>
      </form>
    </>
  );
}
