import { useState, useEffect } from 'react';
import axios from 'axios';


function App() {
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    // Fetch all categories
    axios.get('http://localhost:5000/api/categories')
      .then(response => {
        setCategories(response.data);
        // Fetch featured providers initially
        return axios.get('http://localhost:5000/api/providers/featured');
      })
      .then(response => {
        setProviders(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("There was an error fetching the data:", error);
        setLoading(false);
      });
  }, []);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setLoading(true);
    
    // Updated to use the /api/providers endpoint with category query parameter
    axios.get(`http://localhost:5000/api/providers/category/${category._id}`)
      .then(response => {
        // Sort the data client-side based on the sortBy value
        const sortedData = sortProviders(response.data, sortBy);
        console.log(sortedData);
        setProviders(sortedData);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching providers by category:", error);
        setLoading(false);
      });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Still using the search endpoint
    axios.get(`http://localhost:5000/api/providers/search?term=${searchTerm}&category=${selectedCategory?._id || ''}`)
      .then(response => {
        setProviders(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error searching providers:", error);
        setLoading(false);
      });
  };

  const handleSortChange = (e) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    
    // Sort the current providers array without making a new API call
    const sortedProviders = sortProviders([...providers], newSortBy);
    setProviders(sortedProviders);
  };

  // Helper function to sort providers based on sortBy value
  const sortProviders = (providersArray, sortCriteria) => {
    switch (sortCriteria) {
      case 'rating':
        return [...providersArray].sort((a, b) => b.rating - a.rating);
      case 'reviews':
        return [...providersArray].sort((a, b) => b.reviewCount - a.reviewCount);
      case 'name':
        return [...providersArray].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return providersArray;
    }
  };

  // Helper function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<span key={i} style={{ color: '#FFD700' }}>★</span>);
      } else {
        stars.push(<span key={i} style={{ color: '#DDD' }}>★</span>);
      }
    }
    return stars;
  };

  // Helper function to get provider details
  const handleProviderClick = (providerId) => {
    // Navigate to the provider detail page
    window.location.href = `/provider/${providerId}`;
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, color: 'green' }}>MBEYA CITY</h1>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Search providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <button type="submit" style={{ 
            padding: '8px 16px', 
            backgroundColor: 'green', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Search
          </button>
        </form>
      </header>
      
      {/* Display Categories */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '2rem' }}>
        {categories.map((category) => (
          <div 
            key={category.id} 
            style={{ 
              padding: '15px', 
              minWidth: '150px',
              textAlign: 'center',
              backgroundColor: selectedCategory?.id === category.id ? 'green' : 'green', 
              color: selectedCategory?.id === category.id ? 'white' : '#333',
              borderRadius: '8px', 
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease'
            }} 
            onClick={() => handleCategoryClick(category)}
          >
            <h3 style={{ margin: '0' }}>{category.name}</h3>
          </div>
        ))}
      </div>

      {/* Filters and Sorting */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>
          {selectedCategory ? `${selectedCategory.name} Providers` : 'Top Providers'}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="sort">Sort by:</label>
          <select 
            id="sort" 
            value={sortBy} 
            onChange={handleSortChange}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="rating">Highest Rated</option>
            <option value="reviews">Most Reviews</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading providers...</p>
        </div>
      )}

      {/* No Results State */}
      {!loading && providers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f8f8f8', borderRadius: '8px' }}>
          <p>No providers found. Try a different category or search term.</p>
        </div>
      )}

      {/* Display Providers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {!loading && providers.map((provider) => (
          <div 
            key={provider.id} 
            style={{ 
              padding: '20px', 
              borderRadius: '8px',
              boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
              backgroundColor: 'white',
              transition: 'transform 0.2s ease',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            onClick={() => handleProviderClick(provider._id)}
          >
            {provider.image && (
              <div style={{ marginBottom: '15px', height: '180px', overflow: 'hidden', borderRadius: '6px' }}>
                <img 
                  src={provider.image} 
                  alt={provider.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
            <h2 style={{ margin: '0 0 10px 0', color: '#2E4057' }}>{provider.name}</h2>
            <div style={{ marginBottom: '10px', fontSize: '18px' }}>
              {renderStars(provider.rating)}
              <span style={{ marginLeft: '5px', color: '#666', fontSize: '14px' }}>
                ({provider.reviewCount} reviews)
              </span>
            </div>
            <p style={{ margin: '0 0 15px 0', color: '#666' }}>{provider.description}</p>
            <div style={{ marginTop: 'auto' }}>
              <p style={{ margin: '5px 0', color: '#555' }}>
                <strong>Contact:</strong> {provider.contact}
              </p>
              {/*<p style={{ margin: '5px 0', color: '#555' }}>
                <strong>Location:</strong> {provider.location.city}
              </p> */}
              {provider.website && (
                <p style={{ margin: '5px 0' }}>
                  <a 
                    href={provider.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ color: '#4D9DE0', textDecoration: 'none' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Visit Website
                  </a>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;