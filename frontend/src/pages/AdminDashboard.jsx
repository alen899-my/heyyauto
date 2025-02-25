import React, { useState, useEffect } from 'react'; 
import { FaUsers, FaUserTie, FaCheckCircle, FaListAlt } from 'react-icons/fa'; 
import axios from 'axios'; 
import '../App.css';


const AdminDashboard = () => { 
  const [activeTab, setActiveTab] = useState('userDetails'); 
  const [users, setUsers] = useState([]); 
  const [drivers, setDrivers] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 

  // Fetch users and drivers from the database
  useEffect(() => { 
    const fetchUsersAndDrivers = async () => { 
      setLoading(true); 
      try { 
        const response = await axios.get('http://localhost:5000/api/users'); 
        console.log(response.data); // Adjust URL as per your server
       
        console.log("All Users Data:", response.data);
        const allUsers = response.data;
        setUsers(allUsers.filter(user => (user.role || '').trim().toLowerCase() === 'user'));
        setDrivers(allUsers.filter(user => (user.role || '').trim().toLowerCase() === 'driver'));
        
console.log("All Users:", allUsers);
console.log("User Roles:", allUsers.map(user => user.role));


//         setUsers(allUsers);
// setDrivers(allUsers);

        console.log("Drivers state:", drivers); 
        
      } catch (err) { 
        setError(err.message); 
      } 
      setLoading(false); 
    }; 
    fetchUsersAndDrivers(); 
  }, []);
  useEffect(() => {
    console.log("Active Tab:", activeTab);
 }, [activeTab]);
  // Handler to switch tabs
  const handleTabClick = (tab) => { 
    setActiveTab(tab); 
  };
  const deleteUser = async (userId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      console.log(response.data);
      alert('User deleted successfully');
      setUsers(users.filter((user) => user._id !== userId));
    } catch (error) {
      console.error('Delete Error:', error);
      alert('Failed to delete user');
    }
  };
  
  const approveDriver = async (driverId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');
  
      const response = await axios.patch(
        `http://localhost:5000/api/users/${driverId}`,
        { approvalStatus: 'approved' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log('Driver approved successfully:', response.data);
  
      // Update driver list
      setDrivers(
        drivers.map((driver) =>
          driver._id === driverId ? { ...driver, approvalStatus: 'approved' } : driver
        )
      );
  
      alert(response.data.msg); // Notify the admin
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          alert('Unauthorized: Please log in again.');
        } else if (err.response.status === 403) {
          alert('Forbidden: You do not have access to perform this action.');
        } else {
          alert(`Error: ${err.response.data.msg || 'Something went wrong'}`);
        }
      } else {
        alert('Failed to approve driver. Check the console for details.');
      }
      console.error('Error approving driver:', err);
    }
  };
  
  
  const rejectDriver = async (driverId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');
  
      const response = await axios.patch(
        `http://localhost:5000/api/users/${driverId}`,
        { approvalStatus: 'rejected' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // Update UI
      setDrivers(
        drivers.map((driver) =>
          driver._id === driverId ? { ...driver, approvalStatus: 'rejected' } : driver
        )
      );
      alert('Driver rejected successfully');
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          console.error('Unauthorized: Invalid or expired token.');
          alert('Unauthorized: Please log in again.');
        } else if (error.response.status === 403) {
          console.error('Forbidden: Insufficient permissions.');
          alert('Forbidden: You do not have access to perform this action.');
        } else {
          console.error('Server error:', error.response.data);
          alert('Failed to reject driver');
        }
      } else {
        console.error('Error rejecting driver:', error.message);
      }
    }
  };
  
  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Admin Dashboard</h2>
        <ul>
          <li className={activeTab === 'userDetails' ? 'active' : ''} onClick={() => handleTabClick('userDetails')}>
            <FaUsers /> <span>User Details</span>
          </li>
          <li className={activeTab === 'driverDetails' ? 'active' : ''} onClick={() => handleTabClick('driverDetails')}>
            <FaUserTie /> <span>Driver Details</span>
          </li>
          <li className={activeTab === 'driverApproval' ? 'active' : ''} onClick={() => handleTabClick('driverApproval')}>
            <FaCheckCircle /> <span>Driver Approval</span>
          </li>
          <li className={activeTab === 'totalUsers' ? 'active' : ''} onClick={() => handleTabClick('totalUsers')}>
            <FaListAlt /> <span>Total Count</span>
          </li>
        </ul>
      </div>

      {/* Content Area */}
      <div className="content">
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {activeTab === 'userDetails' && (
          <div className="details-section">
            <h3>User Details</h3>
            {users.length > 0 ? (
              <div className="grid-container">
                {users.map((user) => (
                  <div className="card" key={user._id}>
                    <h4>{user.fullName}</h4>
                    <p>Email: {user.email}</p>
                    <p>Phone: {user.phoneNumber}</p>
                    <p>Role: {user.role}</p>
                    <button className="delete-button" onClick={() => deleteUser(user._id, 'user')}>Delete User</button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No users found</p>
            )}
          </div>
        )}

        {activeTab === 'driverDetails' && (
          <div className="details-section">
            <h3>Driver Details</h3>
            {drivers.length > 0 ? (
              <div className="grid-container">
                {drivers.map((driver) => (
                  <div className="card" key={driver._id}>
                    <h4>{driver.fullName}</h4>
                    <p>Email: {driver.email}</p>
                    <p>Phone: {driver.phoneNumber}</p>

                    <p>Vehicle: {driver.vehicleNumber || 'N/A'}</p>
                    <p>License: {driver.licenseNumber || 'N/A'}</p>
                    <p>Location: {driver.Location || 'N/A'}</p>

                    <button className="delete-button" onClick={() => deleteUser(driver._id, 'driver')}>Delete Driver</button>
                    {driver.profileImage && (
  <img
    src={`http://localhost:5000/${driver.profileImage}`} // Updated to correctly interpret the path
    alt="Driver Profile"
    style={{ width: '100px', height: '100px', borderRadius: '50%' }}
  />
)}

                  </div>
                ))}
              </div>
            ) : (
              <p>No drivers found</p>
            )}
          </div>
        )}

{activeTab === 'driverApproval' && (
  <div className="details-section">
    <h3>Driver Approval Requests</h3>
    {drivers.filter((driver) => driver.approvalStatus === 'pending').length > 0 ? (
      <div className="grid-container">
        {drivers
          .filter((driver) => driver.approvalStatus === 'pending')
          .map((driver) => (
            <div className="card" key={driver._id}>
              <h4>{driver.fullName}</h4>
              <p>Email: {driver.email}</p>
              <p>Phone: {driver.phoneNumber}</p>
              <button
                className="approve-button"
                onClick={() => approveDriver(driver._id)}
              >
                Approve
              </button>
              <button
                className="reject-button"
                onClick={() => rejectDriver(driver._id)}
              >
                Reject
              </button>
            </div>
          ))}
      </div>
    ) : (
      <p>No pending approval requests</p>
    )}
  </div>
)}{activeTab === 'totalUsers' && (
  <div className="details-section">
    <h3>Total Users and Drivers</h3>
    <div className="total-counts">
      <p><strong>Total Users:</strong> {users.length}</p>
      <p><strong>Total Drivers:</strong> {drivers.length}</p>
    </div>
  </div>
)}

      </div>
      
    </div>
  );
};

export default AdminDashboard;