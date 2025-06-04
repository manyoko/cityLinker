import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const cellStyle = {
  padding: "0.5rem",
  textAlign: "center",
  fontWeight: "bold",
  borderBottom: "1px solid #ccc",
};

const rowCellStyle = {
  padding: "0.5rem",
  textAlign: "center",
  borderBottom: "1px solid #eee",
  fontSize: "0.9rem",
  color: "#333",
};

function ProviderDetail() {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showGalleryView, setShowGalleryView] = useState(false);
  const [heroImages, setHeroImages] = useState([]);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const heroSlideInterval = useRef(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/providers/${id}`)
      .then((response) => {
        console.log(response.data);
        setProvider(response.data);

        // Create hero images array with main image and other images
        const allImages = [];
        // Push main image if it exists and is a string
        if (response.data.images) {
          allImages.push(response.data.images);
        }
        if (
          Array.isArray(response.data.images) &&
          response.data.images.length > 0
        ) {
          // Take up to 4 additional images for the hero carousel
          allImages.push(...response.data.images.slice(0, 4));
        }

        setHeroImages(allImages);
        console.log(allImages);

        return axios.get(`http://localhost:5000/api/reviews/provider/${id}`);
      })
      .then((response) => {
        setReviews(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching provider details:", error);
        setError("Failed to load provider details. Please try again later.");
        setLoading(false);
      });
  }, [id]);

  // Setup hero image carousel
  useEffect(() => {
    if (heroImages.length > 1) {
      // Start the carousel interval
      heroSlideInterval.current = setInterval(() => {
        setCurrentHeroSlide((prev) => (prev + 1) % heroImages.length);
      }, 5000); // Change slide every 5 seconds
    }

    // Cleanup on unmount
    return () => {
      if (heroSlideInterval.current) {
        clearInterval(heroSlideInterval.current);
      }
    };
  }, [heroImages.length]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        style={{ color: i < rating ? "#FFD700" : "#DDD", fontSize: "24px" }}
      >
        ★
      </span>
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const openModal = (imageUrl, index) => {
    setModalImage(imageUrl);
    setActiveImageIndex(index);
  };

  const closeModal = () => {
    setModalImage(null);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    if (provider.images && provider.images.length > 0) {
      const nextIndex = (activeImageIndex + 1) % provider.images.length;
      setActiveImageIndex(nextIndex);
      setModalImage(provider.images[nextIndex]);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (provider.images && provider.images.length > 0) {
      const prevIndex =
        (activeImageIndex - 1 + provider.images.length) %
        provider.images.length;
      setActiveImageIndex(prevIndex);
      setModalImage(provider.images[prevIndex]);
    }
  };

  const toggleGalleryView = () => {
    setShowGalleryView(!showGalleryView);
  };

  if (loading)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "3rem",
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(to bottom, #f9f9f9, #e9e9e9)",
        }}
      >
        <div>
          <div
            style={{
              border: "4px solid #f3f3f3",
              borderTop: "4px solid green",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              animation: "spin 2s linear infinite",
              margin: "0 auto 20px",
            }}
          ></div>
          <p style={{ fontSize: "18px", color: "#555" }}>
            Loading amazing content...
          </p>
          <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        </div>
      </div>
    );

  if (error)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "3rem",
          color: "#d9534f",
          background: "linear-gradient(to bottom, #ffebee, #ffcdd2)",
          borderRadius: "10px",
          maxWidth: "800px",
          margin: "3rem auto",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        }}
      >
        <h2>Oops!</h2>
        <p style={{ fontSize: "18px" }}>{error}</p>
        <Link
          to="/"
          style={{
            color: "white",
            textDecoration: "none",
            background: "green",
            padding: "10px 20px",
            borderRadius: "30px",
            display: "inline-block",
            marginTop: "20px",
            transition: "all 0.3s ease",
          }}
        >
          Back to Home
        </Link>
      </div>
    );

  if (!provider)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "3rem",
          background: "linear-gradient(to bottom, #f9f9f9, #e9e9e9)",
          borderRadius: "10px",
          maxWidth: "800px",
          margin: "3rem auto",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        }}
      >
        <h2>Provider Not Found</h2>
        <p style={{ fontSize: "18px" }}>
          We couldn't find the provider you're looking for.
        </p>
        <Link
          to="/"
          style={{
            color: "white",
            textDecoration: "none",
            background: "green",
            padding: "10px 20px",
            borderRadius: "30px",
            display: "inline-block",
            marginTop: "20px",
            transition: "all 0.3s ease",
          }}
        >
          Back to Home
        </Link>
      </div>
    );

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "Arial",
        maxWidth: "1200px",
        margin: "0 auto",
        background: "#f5f7fa",
      }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <Link
          to="/"
          style={{
            color: "green",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            fontWeight: "bold",
            transition: "transform 0.2s ease",
          }}
        >
          <span style={{ marginRight: "8px", fontSize: "20px" }}>←</span> Back
          to Providers
        </Link>
      </div>

      {/* Hero Section with Carousel */}
      <div
        style={{
          borderRadius: "15px",
          overflow: "hidden",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          backgroundColor: "white",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            position: "relative",
            height: "400px", // Reduced height for better mobile experience
            overflow: "hidden",
          }}
        >
          {/* Carousel Container */}
          <div
            style={{
              position: "relative",
              height: "100%",
              width: "100%",
            }}
          >
            {/* Image Slides */}
            {heroImages.map((image, index) => (
              <div
                key={index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  opacity: index === currentHeroSlide ? 1 : 0,
                  transition: "opacity 1s ease-in-out",
                  zIndex: index === currentHeroSlide ? 1 : 0,
                }}
              >
                <img
                  src={`http://localhost:5000${image}`}
                  alt={`${provider.name} - Slide ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "brightness(0.85)",
                  }}
                />
              </div>
            ))}

            {/* Slide Navigation Dots */}
            {heroImages.length > 1 && (
              <div
                style={{
                  position: "absolute",
                  bottom: "130px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  justifyContent: "center",
                  zIndex: 10,
                }}
              >
                {heroImages.map((_, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setCurrentHeroSlide(index);
                      // Reset interval
                      if (heroSlideInterval.current) {
                        clearInterval(heroSlideInterval.current);
                        heroSlideInterval.current = setInterval(() => {
                          setCurrentHeroSlide(
                            (prev) => (prev + 1) % heroImages.length
                          );
                        }, 5000);
                      }
                    }}
                    style={{
                      width: index === currentHeroSlide ? "12px" : "10px",
                      height: index === currentHeroSlide ? "12px" : "10px",
                      borderRadius: "50%",
                      backgroundColor:
                        index === currentHeroSlide
                          ? "white"
                          : "rgba(255, 255, 255, 0.5)",
                      margin: "0 6px",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow:
                        index === currentHeroSlide
                          ? "0 0 6px rgba(255, 255, 255, 0.8)"
                          : "none",
                    }}
                  />
                ))}
              </div>
            )}

            {/* Slide Navigation Arrows */}
            {heroImages.length > 1 && (
              <>
                <div
                  onClick={() => {
                    const newIndex =
                      (currentHeroSlide - 1 + heroImages.length) %
                      heroImages.length;
                    setCurrentHeroSlide(newIndex);
                    // Reset interval
                    if (heroSlideInterval.current) {
                      clearInterval(heroSlideInterval.current);
                      heroSlideInterval.current = setInterval(() => {
                        setCurrentHeroSlide(
                          (prev) => (prev + 1) % heroImages.length
                        );
                      }, 5000);
                    }
                  }}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "20px",
                    transform: "translateY(-50%)",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    zIndex: 10,
                    transition: "background-color 0.3s ease",
                    fontSize: "20px",
                    color: "white",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  ←
                </div>
                <div
                  onClick={() => {
                    const newIndex = (currentHeroSlide + 1) % heroImages.length;
                    setCurrentHeroSlide(newIndex);
                    // Reset interval
                    if (heroSlideInterval.current) {
                      clearInterval(heroSlideInterval.current);
                      heroSlideInterval.current = setInterval(() => {
                        setCurrentHeroSlide(
                          (prev) => (prev + 1) % heroImages.length
                        );
                      }, 5000);
                    }
                  }}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "20px",
                    transform: "translateY(-50%)",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    zIndex: 10,
                    transition: "background-color 0.3s ease",
                    fontSize: "20px",
                    color: "white",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  →
                </div>
              </>
            )}
          </div>

          {/* Text Overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
              padding: "6rem 2rem 2rem",
              color: "white",
              textAlign: "center",
              zIndex: 5,
            }}
          >
            <h1
              style={{
                fontSize: "clamp(1.5rem, 5vw, 3rem)", // Responsive font size
                marginBottom: "1rem",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              {provider.name}
            </h1>
            <div
              style={{
                fontSize: "clamp(1rem, 3vw, 1.7rem)",
                marginBottom: "1rem",
              }}
            >
              {renderStars(provider.rating)}{" "}
              <span
                style={{
                  fontSize: "clamp(0.8rem, 2vw, 1.2rem)",
                  marginLeft: "10px",
                }}
              >
                ({provider.reviewCount} reviews)
              </span>
            </div>
            {provider.location && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "clamp(0.8rem, 2vw, 1.2rem)",
                }}
              >
                <span style={{ marginRight: "5px" }}>📍</span>
                <span>
                  {provider.location.address}, {provider.location.city}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* About Section */}
        <div style={{ padding: "2rem" }}>
          <h2
            style={{
              color: "#2E4057",
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              position: "relative",
              paddingBottom: "15px",
              marginBottom: "1.5rem",
            }}
          >
            About
            <span
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "60px",
                height: "4px",
                background: "green",
                borderRadius: "2px",
              }}
            ></span>
          </h2>
          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              color: "#444",
              lineHeight: "1.8",
              letterSpacing: "0.01em",
            }}
          >
            {provider.description}
          </p>
        </div>
      </div>

      {/* Carousel Gallery Preview */}
      {provider.images && provider.images.length > 3 && (
        <div
          style={{
            borderRadius: "15px",
            overflow: "hidden",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            backgroundColor: "white",
            marginBottom: "2rem",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1.5rem 2rem",
              borderBottom: "1px solid #eee",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#2E4057",
                fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
              }}
            >
              Featured Gallery
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              padding: "2rem",
              overflow: "auto", // Changed to auto for horizontal scrolling on mobile
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "1rem",
                width: "100%",
              }}
            >
              {provider.images.slice(0, 6).map((img, index) => (
                <div
                  key={index}
                  onClick={() => openModal(img, index)}
                  style={{
                    cursor: "pointer",
                    flexShrink: 0,
                    width: "clamp(160px, 30vw, 33.333%)", // Responsive width
                    height: "clamp(120px, 25vw, 280px)", // Responsive height
                    borderRadius: "10px",
                    overflow: "hidden",
                    position: "relative",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                    transition: "transform 0.3s ease",
                  }}
                >
                  <img
                    src={img}
                    alt={`Gallery preview ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.5s ease",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "3rem 1rem 1rem",
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                      color: "white",
                      fontWeight: "bold",
                      opacity:
                        index === 3 && provider.images.length > 6 ? 1 : 0,
                      transition: "opacity 0.3s ease",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {index === 3 &&
                      provider.images.length > 6 &&
                      `+ ${provider.images.length - 6} more`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full Photo Gallery Card */}
      {provider.images && provider.images.length > 0 && (
        <div
          style={{
            borderRadius: "15px",
            overflow: "hidden",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            backgroundColor: "white",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1.5rem 2rem",
              borderBottom: "1px solid #eee",
              flexWrap: "wrap", // Allow wrapping on small screens
              gap: "1rem", // Add gap for wrapped buttons
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#2E4057",
                fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
              }}
            >
              Photo Gallery
            </h2>
            <button
              onClick={toggleGalleryView}
              style={{
                background: "green",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "30px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "1rem",
              }}
            >
              {showGalleryView ? "Grid View" : "All Photos"}
            </button>
          </div>

          {showGalleryView ? (
            <div style={{ padding: "2rem" }}>
              {provider.images.map((img, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "1.5rem",
                    borderRadius: "10px",
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  <img
                    src={img}
                    alt={`Gallery ${index}`}
                    onClick={() => openModal(img, index)}
                    style={{
                      width: "100%",
                      height: "auto",
                      cursor: "pointer",
                      transition: "transform 0.3s ease",
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "2rem" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", // Smaller minmax for mobile
                  gap: "1rem",
                }}
              >
                {provider.images.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => openModal(img, index)}
                    style={{
                      cursor: "pointer",
                      borderRadius: "10px",
                      overflow: "hidden",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      height: "clamp(120px, 25vw, 200px)", // Responsive height
                      position: "relative",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    }}
                  >
                    <img
                      src={img}
                      alt={`Gallery ${index}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.2)",
                        opacity: 0,
                        transition: "opacity 0.3s ease",
                      }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Grid */}
      <div
        style={{
          borderRadius: "15px",
          overflow: "hidden",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          backgroundColor: "white",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            padding: "1.5rem 2rem",
            borderBottom: "1px solid #eee",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#2E4057",
              fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
            }}
          >
            Information
          </h2>
        </div>

        {/* RESPONSIVE GRID LAYOUT - Updated for better mobile experience */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", // Reduced from 350px to 280px
            gap: "1.5rem",
            padding: "2rem",
          }}
        >
          {/* Services Card */}

          <div
            style={{
              backgroundColor: "#f8f9fb",
              padding: "1.5rem",
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                backgroundColor: "#e3f2fd",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                fontSize: "1.5rem",
                color: "#2E7D32",
              }}
            >
              🧭➡️
            </div>
            <h3
              style={{
                textAlign: "center",
                marginBottom: "1.5rem",
                color: "#2E4057",
                fontSize: "clamp(1rem, 2vw, 1.2rem)",
              }}
            >
              Location Description
            </h3>

            {provider.services &&
              provider.services.map((service, index) => (
                <div
                  key={index}
                  style={{
                    padding: "1rem",
                    borderBottom:
                      index !== provider.services.length - 1
                        ? "1px solid #eee"
                        : "none",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
                      marginBottom: "0.3rem",
                      color: "#2E4057",
                    }}
                  >
                    {service.name}
                  </h4>
                  <p
                    style={{
                      fontSize: "clamp(0.8rem, 1.8vw, 0.95rem)",
                      marginBottom: "0.3rem",
                      color: "#555",
                    }}
                  >
                    {service.description}
                  </p>
                  <p
                    style={{
                      fontSize: "clamp(0.9rem, 2vw, 1rem)",
                      fontWeight: "bold",
                      color: "#388E3C",
                    }}
                  >
                    {service.price}
                  </p>
                </div>
              ))}
          </div>

          <div
            style={{
              backgroundColor: "#f8f9fb",
              padding: "1.5rem",
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                backgroundColor: "#e3f2fd",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                fontSize: "1.5rem",
                color: "#2E7D32",
              }}
            >
              🛠️
            </div>
            <h3
              style={{
                textAlign: "center",
                marginBottom: "1.5rem",
                color: "#2E4057",
                fontSize: "clamp(1rem, 2vw, 1.2rem)",
              }}
            >
              Our Services
            </h3>

            {provider.services &&
              provider.services.map((service, index) => (
                <div
                  key={index}
                  style={{
                    padding: "1rem",
                    borderBottom:
                      index !== provider.services.length - 1
                        ? "1px solid #eee"
                        : "none",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
                      marginBottom: "0.3rem",
                      color: "#2E4057",
                    }}
                  >
                    {service.name}
                  </h4>
                  <p
                    style={{
                      fontSize: "clamp(0.8rem, 1.8vw, 0.95rem)",
                      marginBottom: "0.3rem",
                      color: "#555",
                    }}
                  >
                    {service.description}
                  </p>
                  <p
                    style={{
                      fontSize: "clamp(0.9rem, 2vw, 1rem)",
                      fontWeight: "bold",
                      color: "#388E3C",
                    }}
                  >
                    {service.price}
                  </p>
                </div>
              ))}
          </div>

          {/*end */}
          <div
            style={{
              backgroundColor: "#f8f9fb",
              padding: "1.5rem",
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                backgroundColor: "#e3f2fd",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                fontSize: "1.5rem",
                color: "#2E7D32",
              }}
            >
              📌
            </div>
            <h3
              style={{
                textAlign: "center",
                marginBottom: "1.5rem",
                color: "#2E4057",
                fontSize: "clamp(1rem, 2vw, 1.2rem)",
              }}
            >
              announcements
            </h3>
          </div>

          {/* Business Hours Card */}
          <div
            style={{
              backgroundColor: "#f8f9fb",
              padding: "1.5rem",
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                backgroundColor: "#e3f2fd",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                fontSize: "1.5rem",
                color: "#2E7D32",
              }}
            >
              🕒
            </div>
            <h3
              style={{
                textAlign: "center",
                marginBottom: "1.5rem",
                color: "#2E4057",
                fontSize: "clamp(1rem, 2vw, 1.2rem)",
              }}
            >
              Business Hours
            </h3>

            <div style={{ overflowX: "auto" }}>
              {" "}
              {/* Add horizontal scroll for small screens */}
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "250px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#e3f2fd", color: "#2E4057" }}>
                    <th style={cellStyle}>Day</th>
                    <th style={cellStyle}>Opening</th>
                    <th style={cellStyle}>Closing</th>
                  </tr>
                </thead>
                <tbody>
                  {provider.businessHours &&
                    Object.entries(provider.businessHours).map(
                      ([day, hours]) => (
                        <tr key={day}>
                          <td style={rowCellStyle}>
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </td>
                          <td style={rowCellStyle}>{hours.open}</td>
                          <td style={rowCellStyle}>{hours.close}</td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Social Media Card */}
          <div
            style={{
              backgroundColor: "#f8f9fb",
              padding: "1.5rem",
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                backgroundColor: "#e3f2fd",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                fontSize: "1.5rem",
                color: "#2E7D32",
              }}
            >
              🌐
            </div>
            <h3
              style={{
                textAlign: "center",
                marginBottom: "1.5rem",
                color: "#2E4057",
                fontSize: "clamp(1rem, 2vw, 1.2rem)",
              }}
            >
              Connect With Us
            </h3>

            {provider.socialMedia &&
            Object.keys(provider.socialMedia).length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "1rem",
                  justifyContent: "center",
                }}
              >
                {provider.socialMedia.facebook && (
                  <a
                    href={provider.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "3rem",
                      height: "3rem",
                      borderRadius: "50%",
                      backgroundColor: "#3b5998",
                      color: "white",
                      fontSize: "1.5rem",
                      textDecoration: "none",
                    }}
                  >
                    f
                  </a>
                )}

                {provider.socialMedia.instagram && (
                  <a
                    href={provider.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "3rem",
                      height: "3rem",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                      color: "white",
                      fontSize: "1.5rem",
                      textDecoration: "none",
                    }}
                  >
                    📷
                  </a>
                )}

                {provider.socialMedia.twitter && (
                  <a
                    href={provider.socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "3rem",
                      height: "3rem",
                      borderRadius: "50%",
                      backgroundColor: "#1da1f2",
                      color: "white",
                      fontSize: "1.5rem",
                      textDecoration: "none",
                    }}
                  >
                    🐦
                  </a>
                )}

                {provider.socialMedia.linkedin && (
                  <a
                    href={provider.socialMedia.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "3rem",
                      height: "3rem",
                      borderRadius: "50%",
                      backgroundColor: "#0077b5",
                      color: "white",
                      fontSize: "1.5rem",
                      textDecoration: "none",
                    }}
                  >
                    in
                  </a>
                )}

                {provider.socialMedia.youtube && (
                  <a
                    href={provider.socialMedia.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "3rem",
                      height: "3rem",
                      borderRadius: "50%",
                      backgroundColor: "#ff0000",
                      color: "white",
                      fontSize: "1.5rem",
                      textDecoration: "none",
                    }}
                  >
                    ▶️
                  </a>
                )}
              </div>
            ) : (
              <p style={{ textAlign: "center", color: "#666" }}>
                No social media information available
              </p>
            )}
          </div>

          {/* Contact Card */}
          <div
            style={{
              backgroundColor: "#f8f9fb",
              padding: "1.5rem",
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                backgroundColor: "#e3f2fd",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                fontSize: "1.5rem",
                color: "#2E7D32",
              }}
            >
              📞
            </div>
            <h3
              style={{
                textAlign: "center",
                marginBottom: "1.5rem",
                color: "#2E4057",
                fontSize: "clamp(1rem, 2vw, 1.2rem)",
              }}
            >
              Contact Information
            </h3>

            <div
              style={{
                padding: "0.5rem 0",
                borderBottom: "1px solid #eee",
                marginBottom: "0.5rem",
              }}
            >
              <p
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "clamp(0.9rem, 2vw, 1rem)",
                  color: "#333",
                  margin: "0.5rem 0",
                }}
              >
                <span
                  style={{
                    marginRight: "10px",
                    color: "#2E7D32",
                    fontWeight: "bold",
                  }}
                >
                  📱
                </span>
                <a
                  href={`tel:${provider.phone}`}
                  style={{ color: "#2E7D32", textDecoration: "none" }}
                >
                  {provider.phone}
                </a>
              </p>
            </div>

            <div
              style={{
                padding: "0.5rem 0",
                borderBottom: "1px solid #eee",
                marginBottom: "0.5rem",
              }}
            >
              <p
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "clamp(0.9rem, 2vw, 1rem)",
                  color: "#333",
                  margin: "0.5rem 0",
                }}
              >
                <span
                  style={{
                    marginRight: "10px",
                    color: "#2E7D32",
                    fontWeight: "bold",
                  }}
                >
                  ✉️
                </span>
                <a
                  href={`mailto:${provider.email}`}
                  style={{ color: "#2E7D32", textDecoration: "none" }}
                >
                  {provider.email}
                </a>
              </p>
            </div>

            {provider.website && (
              <div
                style={{
                  padding: "0.5rem 0",
                }}
              >
                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "clamp(0.9rem, 2vw, 1rem)",
                    color: "#333",
                    margin: "0.5rem 0",
                  }}
                >
                  <span
                    style={{
                      marginRight: "10px",
                      color: "#2E7D32",
                      fontWeight: "bold",
                    }}
                  >
                    🌐
                  </span>
                  <a
                    href={provider.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#2E7D32", textDecoration: "none" }}
                  >
                    {provider.website}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div
        style={{
          borderRadius: "15px",
          overflow: "hidden",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          backgroundColor: "white",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            padding: "1.5rem 2rem",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#2E4057",
              fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
            }}
          >
            Customer Reviews
          </h2>
          <div>
            {renderStars(provider.rating)}{" "}
            <span style={{ marginLeft: "10px", fontWeight: "bold" }}>
              {" "}
              stars
            </span>
          </div>
        </div>

        <div style={{ padding: "2rem" }}>
          {reviews && reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div
                key={index}
                style={{
                  marginBottom: index !== reviews.length - 1 ? "2rem" : 0,
                  padding: "1.5rem",
                  borderRadius: "10px",
                  backgroundColor: "#f8f9fb",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      backgroundColor: "#e3f2fd",
                      color: "#2E7D32",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                      marginRight: "1rem",
                    }}
                  >
                    {review.userName
                      ? review.userName.charAt(0).toUpperCase()
                      : "A"}
                  </div>
                  <div>
                    <h4
                      style={{
                        margin: "0 0 0.3rem 0",
                        color: "#2E4057",
                        fontSize: "clamp(1rem, 2vw, 1.1rem)",
                      }}
                    >
                      {review.userName || "Anonymous"}
                    </h4>
                    <div style={{ fontSize: "0.9rem" }}>
                      {renderStars(review.rating)}
                      <span
                        style={{
                          marginLeft: "10px",
                          color: "#666",
                          fontSize: "0.8rem",
                        }}
                      >
                        • {formatDate(review.date)}
                      </span>
                    </div>
                  </div>
                </div>
                <p
                  style={{
                    margin: "0",
                    color: "#444",
                    lineHeight: "1.6",
                    fontSize: "clamp(0.9rem, 2vw, 1rem)",
                  }}
                >
                  {review.comment}
                </p>
              </div>
            ))
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "#666",
              }}
            >
              <p>No reviews yet. Be the first to leave a review!</p>
            </div>
          )}
        </div>

        <div
          style={{
            padding: "1.5rem 2rem",
            borderTop: "1px solid #eee",
            textAlign: "center",
          }}
        >
          <button
            style={{
              background: "green",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "30px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "1rem",
              boxShadow: "0 4px 12px rgba(46, 125, 50, 0.2)",
              transition: "all 0.3s ease",
            }}
          >
            Write a Review
          </button>
        </div>
      </div>

      {/* Map Section */}
      {provider.location && provider.location.coordinates && (
        <div
          style={{
            borderRadius: "15px",
            overflow: "hidden",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            backgroundColor: "white",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              padding: "1.5rem 2rem",
              borderBottom: "1px solid #eee",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#2E4057",
                fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
              }}
            >
              Location
            </h2>
          </div>

          <div
            style={{
              height: "400px",
              background: "#f1f1f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Map would go here - placeholder for now */}
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
              }}
            >
              {/* Get Directions Button */}
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  `${provider.location.address}, ${provider.location.city}, ${provider.location.state} ${provider.location.zip}`
                )}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  padding: "0.8rem 1.5rem",
                  backgroundColor: "#2E7D32",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "30px",
                  fontWeight: "bold",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  transition: "all 0.3s ease",
                }}
              >
                Get Directions
              </a>
              <p style={{ fontWeight: "bold" }}>
                📍 {provider.location.address}, {provider.location.city},{" "}
                {provider.location.state} {provider.location.zip}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {modalImage && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
            }}
          >
            <img
              src={modalImage}
              alt="Expanded view"
              style={{
                maxWidth: "100%",
                maxHeight: "90vh",
                objectFit: "contain",
              }}
            />

            {/* Navigation */}
            {provider.images && provider.images.length > 1 && (
              <>
                <div
                  onClick={prevImage}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "-50px",
                    transform: "translateY(-50%)",
                    width: "40px",
                    height: "40px",
                    backgroundColor: "rgba(255,255,255,0.5)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "20px",
                  }}
                >
                  ←
                </div>
                <div
                  onClick={nextImage}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "-50px",
                    transform: "translateY(-50%)",
                    width: "40px",
                    height: "40px",
                    backgroundColor: "rgba(255,255,255,0.5)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "20px",
                  }}
                >
                  →
                </div>
              </>
            )}

            {/* Close button */}
            <div
              onClick={closeModal}
              style={{
                position: "absolute",
                top: "-50px",
                right: "0",
                backgroundColor: "white",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "20px",
              }}
            >
              ×
            </div>

            {/* Image counter */}
            {provider.images && provider.images.length > 1 && (
              <div
                style={{
                  position: "absolute",
                  bottom: "-40px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                {activeImageIndex + 1} / {provider.images.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Call to Action Footer */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "2rem",
        }}
      >
        <h2
          style={{
            color: "#2E4057",
            marginBottom: "1rem",
            fontSize: "clamp(1.5rem, 4vw, 2rem)",
          }}
        >
          Ready to Get Started?
        </h2>
        <p
          style={{
            color: "#555",
            marginBottom: "2rem",
            fontSize: "clamp(1rem, 2vw, 1.2rem)",
          }}
        >
          Contact {provider.name} today to schedule your appointment!
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <a
            href={`tel:${provider.phone}`}
            style={{
              background: "green",
              color: "white",
              textDecoration: "none",
              padding: "12px 24px",
              borderRadius: "30px",
              fontWeight: "bold",
              fontSize: "1rem",
              display: "inline-flex",
              alignItems: "center",
              boxShadow: "0 4px 12px rgba(46, 125, 50, 0.2)",
            }}
          >
            <span style={{ marginRight: "8px" }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="100"
                height="100"
                viewBox="0 0 50 50"
              >
                <path d="M 25 2 C 12.318 2 2 12.318 2 25 C 2 28.96 3.0228906 32.853062 4.9628906 36.289062 L 2.0371094 46.730469 C 1.9411094 47.073469 2.03325 47.440312 2.28125 47.695312 C 2.47225 47.892313 2.733 48 3 48 C 3.08 48 3.1612344 47.989703 3.2402344 47.970703 L 14.136719 45.271484 C 17.463719 47.057484 21.21 48 25 48 C 37.682 48 48 37.682 48 25 C 48 12.318 37.682 2 25 2 z M 16.642578 14 C 17.036578 14 17.428437 14.005484 17.773438 14.021484 C 18.136437 14.039484 18.624516 13.883484 19.103516 15.021484 C 19.595516 16.189484 20.775875 19.058563 20.921875 19.351562 C 21.069875 19.643563 21.168656 19.984047 20.972656 20.373047 C 20.776656 20.762047 20.678813 21.006656 20.382812 21.347656 C 20.086813 21.688656 19.762094 22.107141 19.496094 22.369141 C 19.200094 22.660141 18.892328 22.974594 19.236328 23.558594 C 19.580328 24.142594 20.765484 26.051656 22.521484 27.597656 C 24.776484 29.583656 26.679531 30.200188 27.269531 30.492188 C 27.859531 30.784188 28.204828 30.734703 28.548828 30.345703 C 28.892828 29.955703 30.024969 28.643547 30.417969 28.060547 C 30.810969 27.477547 31.204094 27.572578 31.746094 27.767578 C 32.288094 27.961578 35.19125 29.372062 35.78125 29.664062 C 36.37125 29.956063 36.766062 30.102703 36.914062 30.345703 C 37.062062 30.587703 37.062312 31.754234 36.570312 33.115234 C 36.078313 34.477234 33.717984 35.721672 32.583984 35.888672 C 31.565984 36.037672 30.277281 36.10025 28.863281 35.65625 C 28.006281 35.38625 26.907047 35.028734 25.498047 34.427734 C 19.575047 31.901734 15.706156 26.012047 15.410156 25.623047 C 15.115156 25.234047 13 22.46275 13 19.59375 C 13 16.72475 14.524406 15.314469 15.066406 14.730469 C 15.608406 14.146469 16.248578 14 16.642578 14 z"></path>
              </svg>
            </span>{" "}
            Whatsapp {provider.phone}
          </a>

          <a
            href={`mailto:${provider.email}`}
            style={{
              background: "white",
              color: "green",
              textDecoration: "none",
              padding: "12px 24px",
              borderRadius: "30px",
              fontWeight: "bold",
              fontSize: "1rem",
              display: "inline-flex",
              alignItems: "center",
              border: "2px solid green",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <span style={{ marginRight: "8px" }}>✉️</span> Send Email
          </a>
        </div>
      </div>

      {/* Add a floating "back to top" button */}
      <div
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "50px",
          height: "50px",
          backgroundColor: "green",
          color: "white",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
          cursor: "pointer",
          fontSize: "20px",
          opacity: "0.8",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          zIndex: "100",
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ↑
      </div>
    </div>
  );
}

export default ProviderDetail;
