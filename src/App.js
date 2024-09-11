import React, { useState } from "react";
import "./App.css";

function App() {
  const [productInfo, setProductInfo] = useState("");
  const [books, setBooks] = useState([]);
  const [bookDetails, setBookDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchMade, setSearchMade] = useState(false); // Track if a search has been made

  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);

  const fetchProductInfo = async () => {
    const barcode = document.getElementById("barcode").value;
    if (barcode) {
      showLoading();
      try {
        const response = await fetch(
          `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
        );
        const data = await response.json();
        if (data.status === 1) {
          const product = data.product;
          setProductInfo(`
            <h3>${product.product_name || "No name available"}</h3>
            <p>Brand: ${product.brand || "No brand available"}</p>
            <p>Category: ${
              product.categories_tags
                ? product.categories_tags.join(", ")
                : "No categories available"
            }</p>
            <p>Quantity: ${product.quantity || "No quantity available"}</p>
            <p>Ingredients: ${
              product.ingredients_text || "No ingredients available"
            }</p>
            <p>Nutrition Grade: ${
              product.nutrition_grades_tags
                ? product.nutrition_grades_tags.join(", ")
                : "No grade available"
            }</p>
            <img src="${
              product.image_url || "https://via.placeholder.com/150"
            }" alt="${product.product_name || "Product Image"}" />
          `);
        } else {
          setProductInfo("<p>No product found</p>");
        }
      } catch (error) {
        setProductInfo("<p>Error fetching product information</p>");
      } finally {
        hideLoading();
      }
    } else {
      alert("Please enter a barcode.");
    }
  };

  const handleBookSearch = async (e) => {
    e.preventDefault();
    const query = document.getElementById("search-input").value;
    if (query) {
      showLoading();
      setSearchMade(true); // Set searchMade to true
      try {
        const response = await fetch(
          `https://openlibrary.org/search.json?q=${query}`
        );
        const data = await response.json();
        const books = data.docs;
        setBooks(books);
        if (books.length === 0) {
          setBooks([]);
        }
      } catch (error) {
        setBooks([]);
      } finally {
        hideLoading();
      }
    } else {
      alert("Please enter a search query.");
    }
  };

  const handleBookClick = async (bookId) => {
    showLoading();
    try {
      const response = await fetch(`https://openlibrary.org${bookId}.json`);
      const bookData = await response.json();
      setBookDetails(`
        <h2>${bookData.title}</h2>
        <p><strong>Author:</strong> ${
          bookData.authors
            ? bookData.authors.map((author) => author.name).join(", ")
            : "Unknown"
        }</p>
        <p><strong>Published:</strong> ${bookData.publish_date || "N/A"}</p>
        <p><strong>Subjects:</strong> ${
          bookData.subjects ? bookData.subjects.join(", ") : "None"
        }</p>
        <p><strong>ISBN:</strong> ${
          bookData.isbn_13 ? bookData.isbn_13.join(", ") : "N/A"
        }</p>
        ${
          bookData.cover
            ? `<img src="https://covers.openlibrary.org/b/id/${bookData.cover.id}-L.jpg" alt="${bookData.title}" />`
            : ""
        }
      `);
    } catch (error) {
      setBookDetails("<p>Error fetching book details.</p>");
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="App">
      {/* Hero Section */}
      <section className="hero text-center text-light">
        <div className="hero-content">
          <h1>Discover Product Information & Your Next Great Read</h1>
          <p>Explore food product details and search for books with ease.</p>
        </div>
      </section>

      {/* Main Section */}
      <main>
        {/* Barcode Lookup Section */}
        <section id="barcode-section" className="container my-5">
          <h2>Search Product</h2>
          <input
            type="text"
            id="barcode"
            className="form-control mb-3"
            placeholder="Enter product barcode"
          />
          <button
            id="fetchButton"
            className="btn btn-primary btn-block"
            onClick={fetchProductInfo}
          >
            Fetch Product Info
          </button>
          <div
            id="productInfo"
            className="mt-4"
            dangerouslySetInnerHTML={{ __html: productInfo }}
          ></div>
        </section>

        {/* Web Library Section */}
        <section id="library-section" className="container my-5">
          <h2>Search Book</h2>
          <form id="search-form" className="mb-4" onSubmit={handleBookSearch}>
            <input
              type="text"
              id="search-input"
              className="form-control mb-2"
              placeholder="Search for books or authors..."
              required
            />
            <button
              type="submit"
              id="search-button"
              className="btn btn-primary"
            >
              Search
            </button>
          </form>
          <div
            id="results"
            className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"
          >
            {books.length === 0 && searchMade && <p>No books found</p>}
            {books.map((book) => (
              <div className="col" key={book.key}>
                <div className="book">
                  <img
                    src={
                      book.cover_i
                        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                        : "https://via.placeholder.com/150"
                    }
                    alt={book.title}
                  />
                  <h3>{book.title}</h3>
                  <p>
                    {book.author_name
                      ? book.author_name.join(", ")
                      : "Unknown Author"}
                  </p>
                  <button
                    className="btn btn-info view-details"
                    onClick={() => handleBookClick(book.key)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div
            id="loading"
            className={`hidden text-center ${loading ? "" : "hidden"}`}
          >
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
          <div
            id="book-details"
            className={`hidden ${bookDetails ? "" : "hidden"}`}
            dangerouslySetInnerHTML={{ __html: bookDetails }}
          ></div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3">
        <p>
          &copy; 2024 Product Info & Web Library by Macaraeg. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;
