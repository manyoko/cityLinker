import React, { useState, useEffect } from "react";
import { handleAuthError } from "./utils/errorHandler";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Filter,
  X,
  Check,
  AlertCircle,
  Building2,
  Users,
  TrendingUp,
  Calendar,
} from "lucide-react";
import "./admin.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const [notification, setNotification] = useState(null);
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // 'add', 'edit', 'view'
  const [currentProvider, setCurrentProvider] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const promoteUserToAdmin = async (userId) => {
    const token = localStorage.getItem("userToken"); // Get admin's token

    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/promote/${userId}`,
        {}, // No request body needed as ID is in URL
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data.message);
      // Refresh user list or update local state to reflect the change
    } catch (error) {
      console.error(
        "Failed to promote user:",
        error.response?.data?.message || error.message
      );
      alert(error.response?.data?.message || "Error promoting user.");
    }
  };

  const demoteAdminToUser = async (userId) => {
    const token = localStorage.getItem("userToken");
    const isOAuth = localStorage.getItem("isOAuth") === "true";

    const headers = {
      "Content-Type": "application/json",
    };

    if (!isOAuth && token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/demote/${userId}`, // URL
        {}, // No request body
        {
          headers,
          withCredentials: true, // Ensure cookies are sent for OAuth
        }
      );

      console.log(response.data.message);
      // Refresh user list or update local state
    } catch (error) {
      console.error(
        "Failed to demote user:",
        error.response?.data?.message || error.message
      );
      alert(error.response?.data?.message || "Error demoting user.");
    }
  };

  useEffect(() => {
    // Fetch all categories
    axios
      .get("http://localhost:5000/api/categories")
      .then((response) => {
        setCategories(response.data);
        // Fetch featured providers
        return axios.get("http://localhost:5000/api/providers");
      })
      .then((response) => {
        setProviders(response.data);
        setFilteredProviders(response.data);
        setLoading(false);
      })
      .catch((error) => {
        const authError = handleAuthError(error);
        if (authError) {
          setNotification(authError);
        }
        console.error("There was an error fetching the data:", error);
        setLoading(false);
      });
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = providers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (provider) =>
          provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          provider.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          provider.location.city
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(
        (provider) => provider.category._id === selectedCategory
      );
    }

    // Sorting
    filtered = [...filtered].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "createdAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProviders(filtered);
  }, [providers, searchTerm, selectedCategory, sortBy, sortOrder]);

  const openModal = (type, provider = null) => {
    setModalType(type);
    setCurrentProvider(provider);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentProvider(null);
    setModalType("");
  };

  {
    /*const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this provider?")) {
      setProviders(providers.filter((p) => p._id !== id));
    }
  }; */
  }

  const handleDelete = async (id) => {
    const token = localStorage.getItem("userToken");
    const isOAuth = localStorage.getItem("isOAuth") === "true";
    const headers = {
      "Content-Type": "application/json",
    };

    if (!isOAuth && token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (window.confirm("Are you sure you want to delete this provider?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/providers/${id}`,
          {
            method: "DELETE",
            headers,
            body: JSON.stringify({ id }),
            credentials: "include", // allow cookies to be sent with request
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Failed to delete provider: ${
              errorData.message || response.statusText
            }`
          );
        }

        // Update local UI state
        setProviders(providers.filter((p) => p._id !== id));
        alert("Provider deleted successfully!");
      } catch (error) {
        console.error("Error deleting provider:", error);
        alert("Error deleting provider. Please try again.");
      }
    }
  };

  const toggleFeatured = (id) => {
    setProviders(
      providers.map((p) => (p._id === id ? { ...p, featured: !p.featured } : p))
    );
  };

  const toggleVerified = (id) => {
    setProviders(
      providers.map((p) => (p._id === id ? { ...p, verified: !p.verified } : p))
    );
  };

  const stats = {
    total: providers.length,
    verified: providers.filter((p) => p.verified).length,
    featured: providers.filter((p) => p.featured).length,
    avgRating:
      providers.reduce((sum, p) => sum + p.averageRating, 0) /
        providers.length || 0,
  };

  return (
    <div className="admin-panel">
      {/* Header */}
      {notification && (
        <div className={`notification ${notification.severity}`}>
          <h3>{notification.title}</h3>
          <p>{notification.message}</p>
          <button onClick={() => setNotification(null)}>Dismiss</button>
        </div>
      )}
      <header className="admin-header">
        <div className="admin-header-container">
          <div className="admin-header-content">
            <div className="admin-header-left">
              <Building2 className="admin-header-icon" />
              <h1 className="admin-header-title">Provider Admin Panel</h1>
            </div>
            <button
              onClick={() => navigate("/CreateProvider")}
              className="admin-header-button"
            >
              <Plus className="admin-header-button-icon" />
              <span>Add Provider</span>
            </button>
          </div>
        </div>
      </header>

      <div className="admin-container">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-content">
              <div>
                <p className="stat-card-title">Total Providers</p>
                <p className="stat-card-value">{stats.total}</p>
              </div>
              <Users className="stat-card-icon" />
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-content">
              <div>
                <p className="stat-card-title">Verified</p>
                <p className="stat-card-value stat-card-value-verified">
                  {stats.verified}
                </p>
              </div>
              <Check className="stat-card-icon" />
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-content">
              <div>
                <p className="stat-card-title">Featured</p>
                <p className="stat-card-value stat-card-value-featured">
                  {stats.featured}
                </p>
              </div>
              <Star className="stat-card-icon" />
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-content">
              <div>
                <p className="stat-card-title">User Management</p>
                <div className="stat-card-value stat-card-value-rating">
                  users count
                </div>
              </div>
              <TrendingUp className="stat-card-icon" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="search-container">
          <div className="search-content">
            <div className="search-input-group">
              <div className="search-input-wrapper">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Search providers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="filter-button"
              >
                <Filter className="filter-icon" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="filter-panel">
              <div className="filter-options">
                <div>
                  <label className="filter-option">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="filter-select"
                  >
                    <option value="createdAt">Date Created</option>
                    <option value="name">Name</option>
                    <option value="averageRating">Rating</option>
                    <option value="reviewCount">Review Count</option>
                  </select>
                </div>
                <div>
                  <label className="filter-option">Order</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="filter-select"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Providers Table */}
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Provider</th>
                  <th className="table-header-cell">Category</th>
                  <th className="table-header-cell">Location</th>
                  <th className="table-header-cell">Rating</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProviders.map((provider) => (
                  <tr key={provider._id} className="table-row">
                    <td className="table-cell">
                      <div className="provider-cell">
                        <div className="provider-avatar">
                          <div className="provider-avatar-inner">
                            <Building2 className="provider-avatar-icon" />
                          </div>
                        </div>
                        <div className="provider-info">
                          <div className="provider-name">{provider.name}</div>
                          <div className="provider-contact">
                            {provider.contact}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="category-badge">
                        {
                          categories.filter(
                            (category) => category._id === provider.category
                          )[0].name
                        }
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="location-cell">
                        <MapPin className="location-icon" />
                        {provider.location.city}, {provider.location.district}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="rating-cell">
                        <Star className="rating-icon" />
                        <span className="text-sm text-gray-900">
                          {provider.averageRating}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          ({provider.reviewCount})
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        {provider.verified && (
                          <span className="status-badge status-badge-verified">
                            Verified
                          </span>
                        )}
                        {provider.featured && (
                          <span className="status-badge status-badge-featured">
                            Featured
                          </span>
                        )}
                        {!provider.verified && (
                          <span className="status-badge status-badge-unverified">
                            Unverified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="action-buttons">
                        <button
                          onClick={() => openModal("view", provider)}
                          className="action-button action-button-view"
                          title="View Details"
                        >
                          <Eye className="action-icon" />
                        </button>
                        <button
                          onClick={() => openModal("edit", provider)}
                          className="action-button action-button-edit"
                          title="Edit"
                        >
                          <Edit className="action-icon" />
                        </button>
                        <button
                          onClick={() => toggleVerified(provider._id)}
                          className={`action-button ${
                            provider.verified
                              ? "action-button-unverify"
                              : "action-button-verify"
                          }`}
                          title={
                            provider.verified
                              ? "Remove Verification"
                              : "Verify Provider"
                          }
                        >
                          {provider.verified ? (
                            <X className="action-icon" />
                          ) : (
                            <Check className="action-icon" />
                          )}
                        </button>
                        <button
                          onClick={() => toggleFeatured(provider._id)}
                          className={`action-button ${
                            provider.featured
                              ? "action-button-feature"
                              : "action-button-feature-inactive"
                          }`}
                          title={
                            provider.featured
                              ? "Remove from Featured"
                              : "Add to Featured"
                          }
                        >
                          <Star className="action-icon" />
                        </button>
                        <button
                          onClick={() => handleDelete(provider._id)}
                          className="action-button action-button-delete"
                          title="Delete"
                        >
                          <Trash2 className="action-icon" />
                        </button>

                        <button
                          onClick={() => promoteUserToAdmin(provider._id)}
                          className="action-button action-button-delete"
                          title="Set Admin"
                        >
                          <Edit className="action-icon" />
                        </button>

                        <button
                          onClick={() => demoteAdminToUser(provider._id)}
                          className="action-button action-button-delete"
                          title="Remove Admin"
                        >
                          <Trash2 className="action-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title">
                  {modalType === "add" && "Add New Provider"}
                  {modalType === "edit" && "Edit Provider"}
                  {modalType === "view" && "Provider Details"}
                </h2>
                <button onClick={closeModal} className="modal-close-button">
                  <X className="modal-close-icon" />
                </button>
              </div>

              {modalType === "view" && currentProvider && (
                <div className="space-y-6">
                  <div className="modal-body">
                    <div>
                      <h3 className="modal-section-title">Basic Information</h3>
                      <div className="space-y-3">
                        <div className="modal-field">
                          <span className="modal-field-label">Name:</span>
                          <p className="modal-field-value">
                            {currentProvider.name}
                          </p>
                        </div>
                        <div className="modal-field">
                          <span className="modal-field-label">Category:</span>
                          <div className="modal-field-value">
                            {
                              categories.filter((category) =>
                                category._id === currentProvider.category
                                  ? category.name
                                  : "category not specified"
                              )[0].name
                            }
                          </div>
                        </div>
                        <div className="modal-field">
                          <span className="modal-field-label">
                            Description:
                          </span>
                          <p className="modal-field-value">
                            {currentProvider.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="modal-section-title">
                        Contact Information
                      </h3>
                      <div className="space-y-3">
                        {currentProvider.phone && (
                          <div className="modal-contact-item">
                            <Phone className="modal-contact-icon" />
                            <span className="modal-field-value">
                              {currentProvider.phone}
                            </span>
                          </div>
                        )}
                        {currentProvider.email && (
                          <div className="modal-contact-item">
                            <Mail className="modal-contact-icon" />
                            <span className="modal-field-value">
                              {currentProvider.email}
                            </span>
                          </div>
                        )}
                        {currentProvider.website && (
                          <div className="modal-contact-item">
                            <Globe className="modal-contact-icon" />
                            <a
                              href={currentProvider.website}
                              className="modal-link"
                            >
                              {currentProvider.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="modal-section-title">Location</h3>
                    <div className="modal-location">
                      <MapPin className="modal-location-icon" />
                      <div>
                        <p className="modal-field-value">
                          {currentProvider.location.address}
                        </p>
                        <p className="modal-field-value">
                          {currentProvider.location.city},{" "}
                          {currentProvider.location.district}{" "}
                          {currentProvider.location.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>

                  {currentProvider.services &&
                    currentProvider.services.length > 0 && (
                      <div>
                        <h3 className="modal-section-title">Services</h3>
                        <div className="space-y-3">
                          {currentProvider.services.map((service, index) => (
                            <div key={index} className="modal-service-card">
                              <h4 className="modal-service-name">
                                {service.name}
                              </h4>
                              <p className="modal-service-description">
                                {service.description}
                              </p>
                              <p className="modal-service-price">
                                {service.price}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Star className="rating-icon" />
                        <span className="modal-field-value">
                          {currentProvider.averageRating} (
                          {currentProvider.reviewCount} reviews)
                        </span>
                      </div>
                      {currentProvider.verified && (
                        <span className="status-badge status-badge-verified">
                          Verified
                        </span>
                      )}
                      {currentProvider.featured && (
                        <span className="status-badge status-badge-featured">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="modal-field-value">
                      Created:{" "}
                      {new Date(currentProvider.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}

              {(modalType === "add" || modalType === "edit") && (
                <div className="space-y-6">
                  <div className="placeholder-container">
                    <AlertCircle className="placeholder-icon" />
                    <h3
                      className="placeholder-title"
                      onClick={() =>
                        navigate(`/EditProvider/${currentProvider._id}`)
                      }
                    >
                      click to edit and update provider details
                    </h3>
                    <p className="placeholder-text">
                      This would dierect you to a comprehensive form with all
                      the fields to update Provider Details.
                    </p>
                  </div>
                </div>
              )}

              <div className="modal-footer">
                <button onClick={closeModal} className="modal-cancel-button">
                  {modalType === "view" ? "Close" : "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
