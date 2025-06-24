import React, { useState, useEffect } from "react";
import {
  User,
  Building2,
  Plus,
  Edit3,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BusinessOwnerDashboard = () => {
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newBusiness, setNewBusiness] = useState({
    name: "",
    category: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    employees: "",
    revenue: "",
    establishedYear: "",
  });

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token"); // For JWT users
    const isOAuth = localStorage.getItem("isOAuth") === "true"; // For Google OAuth users

    if (isOAuth) {
      // For OAuth users, we rely on session cookies
      return { withCredentials: true };
    } else if (token) {
      // For JWT users
      return {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    }
    return {};
  };

  // Handle unauthorized errors
  const handleUnauthorized = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isOAuth");
    navigate("/login"); // Redirect to login page
  };

  // Fetch user data and businesses on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch user profile
        const userResponse = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            withCredentials: true,
          },
          getAuthHeaders()
        );

        setUser(userResponse.data);

        // Fetch businesses associated with this user
        const businessesResponse = await axios.get(
          "http://localhost:5000/api/providers",
          {
            ...getAuthHeaders(),
            params: {
              owner: userResponse.data._id,
            },
          }
        );
        setBusinesses(businessesResponse.data);

        setLoading(false);
      } catch (err) {
        if (err.response?.status === 401) {
          handleUnauthorized();
        } else {
          setError(err.response?.data?.message || "Failed to fetch data");
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleAddBusiness = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/providers",
        {
          ...newBusiness,
          owner: user._id, // Associate business with the current user
          employees: parseInt(newBusiness.employees) || 0,
          revenue: parseFloat(newBusiness.revenue) || 0,
          establishedYear:
            parseInt(newBusiness.establishedYear) || new Date().getFullYear(),
          status: "active",
        },
        getAuthHeaders()
      );

      setBusinesses([...businesses, response.data]);
      setNewBusiness({
        name: "",
        category: "",
        description: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        employees: "",
        revenue: "",
        establishedYear: "",
      });
      setShowAddForm(false);
    } catch (err) {
      if (err.response?.status === 401) {
        handleUnauthorized();
      } else {
        setError(err.response?.data?.message || "Failed to add business");
      }
    }
  };

  const handleInputChange = (e) => {
    setNewBusiness({
      ...newBusiness,
      [e.target.name]: e.target.value,
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  if (!user) {
    return <div style={styles.error}>User not found</div>;
  }

  return (
    <div style={styles.container}>
      {/* User Details Section */}
      <div style={styles.userCard}>
        <div style={styles.userHeader}>
          <div style={styles.avatar}>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                style={styles.avatarImage}
              />
            ) : (
              <User size={32} color="#28A745" />
            )}
          </div>
          <div>
            <h1 style={styles.userName}>{user.username || user.name}</h1>
            <p style={styles.userRole}>
              {user.role ? user.role.replace("_", " ") : "User"}
            </p>
          </div>
        </div>

        <div style={styles.userDetails}>
          <div style={styles.detailItem}>
            <Mail size={16} color="#666" />
            <span style={styles.detailText}>{user.email}</span>
          </div>
          {user.phone && (
            <div style={styles.detailItem}>
              <Phone size={16} color="#666" />
              <span style={styles.detailText}>{user.phone}</span>
            </div>
          )}
          {user.joinDate && (
            <div style={styles.detailItem}>
              <Calendar size={16} color="#666" />
              <span style={styles.detailText}>
                Joined {new Date(user.joinDate).toLocaleDateString()}
              </span>
            </div>
          )}
          {user.address && (
            <div style={styles.detailItem}>
              <MapPin size={16} color="#666" />
              <span style={styles.detailText}>
                {user.address.street}, {user.address.city}, {user.address.state}{" "}
                {user.address.zipCode}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Businesses Section */}
      <div style={styles.businessCard}>
        <div style={styles.businessHeader}>
          <div style={styles.businessTitle}>
            <Building2 size={24} color="#28A745" />
            <h2 style={styles.sectionTitle}>My Businesses</h2>
            <span style={styles.businessCounter}>{businesses.length}</span>
          </div>
          <button
            onClick={() => navigate("/createProvider")}
            style={styles.addButton}
          >
            <Plus size={16} />
            <span>Add Business</span>
          </button>
        </div>

        {/* Business List */}
        {businesses.length === 0 ? (
          <div style={styles.emptyState}>
            <Building2 size={48} color="#ccc" />
            <h3 style={styles.emptyTitle}>No businesses yet</h3>
            <p style={styles.emptyText}>
              Add your first business to get started
            </p>
          </div>
        ) : (
          <div style={styles.businessGrid}>
            {businesses.map((business) => (
              <div key={business._id} style={styles.businessItem}>
                <div style={styles.businessItemHeader}>
                  <div>
                    <h3 style={styles.businessName}>{business.name}</h3>
                    <p style={styles.businessCategory}>{business.category}</p>
                  </div>
                  <div style={styles.businessActions}>
                    <span style={styles.statusActive}>{business.status}</span>
                    <button style={styles.editButton}>
                      <Edit3 size={16} />
                    </button>
                  </div>
                </div>

                <p style={styles.businessDescription}>{business.description}</p>

                <div style={styles.businessContactInfo}>
                  <div style={styles.contactItem}>
                    <MapPin size={16} color="#666" />
                    <span style={styles.contactText}>{business.address}</span>
                  </div>
                  <div style={styles.contactItem}>
                    <Phone size={16} color="#666" />
                    <span style={styles.contactText}>{business.phone}</span>
                  </div>
                  <div style={styles.contactItem}>
                    <Mail size={16} color="#666" />
                    <span style={styles.contactText}>{business.email}</span>
                  </div>
                  {business.website && (
                    <div style={styles.contactItem}>
                      <span style={styles.websiteIcon}>🌐</span>
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.websiteLink}
                      >
                        {business.website}
                      </a>
                    </div>
                  )}
                </div>

                <div style={styles.businessStats}>
                  <div style={styles.statItem}>
                    <p style={styles.statLabel}>Employees</p>
                    <p style={styles.statValue}>{business.employees}</p>
                  </div>
                  <div style={styles.statItem}>
                    <p style={styles.statLabel}>Revenue</p>
                    <p style={styles.statValue}>
                      {formatCurrency(business.revenue)}
                    </p>
                  </div>
                  <div style={styles.statItem}>
                    <p style={styles.statLabel}>Est.</p>
                    <p style={styles.statValue}>{business.establishedYear}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Styles remain the same as in previous implementation
const styles = {
  container: {
    maxWidth: "1200px",
    margin: "100px auto",
    padding: "24px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontSize: "18px",
    color: "#666",
  },
  error: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontSize: "18px",
    color: "#dc3545",
  },
  formError: {
    color: "#dc3545",
    backgroundColor: "#f8d7da",
    padding: "10px",
    borderRadius: "4px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  userCard: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    padding: "24px",
    marginBottom: "32px",
  },
  userHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
  },
  avatar: {
    width: "64px",
    height: "64px",
    backgroundColor: "#e8f5e8",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  userName: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    margin: "0 0 4px 0",
  },
  userRole: {
    color: "#666",
    margin: 0,
    textTransform: "capitalize",
  },
  userDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
  },
  detailItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  detailText: {
    color: "#333",
  },
  businessCard: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    padding: "24px",
  },
  businessHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  businessTitle: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#333",
    margin: 0,
  },
  businessCounter: {
    backgroundColor: "#e8f5e8",
    color: "#28A745",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500",
  },
  addButton: {
    backgroundColor: "#28A745",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.2s",
  },
  formContainer: {
    backgroundColor: "#f8f9fa",
    padding: "24px",
    borderRadius: "8px",
    marginBottom: "24px",
  },
  formTitle: {
    fontSize: "18px",
    fontWeight: "500",
    color: "#333",
    marginBottom: "16px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },
  inputGroupFull: {
    display: "flex",
    flexDirection: "column",
    gridColumn: "1 / -1",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
    marginBottom: "4px",
  },
  input: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  textarea: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    gridColumn: "1 / -1",
  },
  saveButton: {
    backgroundColor: "#28A745",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  emptyState: {
    textAlign: "center",
    padding: "48px 24px",
  },
  emptyTitle: {
    fontSize: "18px",
    fontWeight: "500",
    color: "#333",
    margin: "16px 0 8px 0",
  },
  emptyText: {
    color: "#666",
    margin: 0,
  },
  businessGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "24px",
  },
  businessItem: {
    border: "1px solid #e9ecef",
    borderRadius: "8px",
    padding: "24px",
    transition: "box-shadow 0.2s",
  },
  businessItemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  businessName: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
    margin: "0 0 4px 0",
  },
  businessCategory: {
    fontSize: "14px",
    color: "#666",
    margin: 0,
  },
  businessActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  statusActive: {
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  editButton: {
    background: "none",
    border: "none",
    color: "#666",
    cursor: "pointer",
    padding: "4px",
  },
  businessDescription: {
    color: "#333",
    fontSize: "14px",
    marginBottom: "16px",
    lineHeight: "1.5",
  },
  businessContactInfo: {
    marginBottom: "16px",
  },
  contactItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  },
  contactText: {
    fontSize: "14px",
    color: "#666",
  },
  websiteIcon: {
    fontSize: "16px",
  },
  websiteLink: {
    fontSize: "14px",
    color: "#28A745",
    textDecoration: "none",
  },
  businessStats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #e9ecef",
  },
  statItem: {
    textAlign: "center",
  },
  statLabel: {
    fontSize: "12px",
    color: "#666",
    margin: "0 0 4px 0",
  },
  statValue: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
    margin: 0,
  },
};

// Add hover effects
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  button:hover {
    opacity: 0.9;
  }
  input:focus, textarea:focus {
    border-color: #28A745 !important;
  }
  .business-item:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;
document.head.appendChild(styleSheet);
export default BusinessOwnerDashboard;
