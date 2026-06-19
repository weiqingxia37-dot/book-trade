// Campus Book - Textbook Register & Editor Script
(function() {
  let editId = null;
  let currentUser = null;
  let uploadedBase64Image = "";

  // Guard page for logged-in users only
  function checkAuth() {
    currentUser = window.Auth.getCurrentUser();
    if (!currentUser) {
      window.Auth.requireAuth();
      return false;
    }
    return true;
  }

  // Pre-fill form if in edit mode
  function checkEditMode() {
    const urlParams = new URLSearchParams(window.location.search);
    editId = urlParams.get("edit");

    if (!editId) return; // creation mode

    const books = window.DB.getBooks();
    const book = books.find(b => b.id === editId);

    if (!book) {
      alert("해당 교재 정보를 찾을 수 없습니다.");
      window.location.href = "index.html";
      return;
    }

    // Check listing ownership
    if (book.sellerId !== currentUser.email) {
      alert("자신이 등록한 교재만 수정할 수 있습니다.");
      window.location.href = "index.html";
      return;
    }

    // Adjust Page Headers and button
    document.getElementById("register-page-title").textContent = "판매 교재 수정";
    document.getElementById("submit-btn").textContent = "수정 완료";

    // Pre-fill Inputs
    document.getElementById("book-title").value = book.title;
    document.getElementById("book-author").value = book.author;
    document.getElementById("book-publisher").value = book.publisher || "";
    document.getElementById("book-price").value = book.price;
    document.getElementById("book-category").value = book.category;
    document.getElementById("book-desc").value = book.desc;

    // Check appropriate radio for condition
    const radio = document.querySelector(`input[name="book-condition"][value="${book.condition}"]`);
    if (radio) radio.checked = true;

    // Display image if exists
    if (book.images && book.images.length > 0) {
      uploadedBase64Image = book.images[0];
      showPreview(uploadedBase64Image);
    }
  }

  // File Upload -> Base64
  window.processImageUpload = function(input) {
    const file = input.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    // Capping file sizes in localStorage to avoid storage limits (e.g. max 1.5MB after base64)
    if (file.size > 2 * 1024 * 1024) {
      alert("이미지 용량이 너무 큽니다. 2MB 이하의 이미지만 업로드 가능합니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedBase64Image = e.target.result;
      showPreview(uploadedBase64Image);
    };
    reader.readAsDataURL(file);
  };

  function showPreview(base64Str) {
    const previewContainer = document.getElementById("image-preview-container");
    const previewImg = document.getElementById("image-preview-img");
    const uploadArea = document.querySelector(".image-upload-area");

    if (previewContainer && previewImg) {
      previewImg.src = base64Str;
      previewContainer.style.display = "block";
      uploadArea.style.display = "none";
    }
  }

  window.removeUploadedImage = function() {
    uploadedBase64Image = "";
    
    const previewContainer = document.getElementById("image-preview-container");
    const uploadArea = document.querySelector(".image-upload-area");
    const fileInput = document.getElementById("book-image-input");

    if (previewContainer) {
      previewContainer.style.display = "none";
      uploadArea.style.display = "flex";
      if (fileInput) fileInput.value = "";
    }
  };

  // Form Submission
  window.handleFormSubmit = function(e) {
    e.preventDefault();

    const title = document.getElementById("book-title").value.trim();
    const author = document.getElementById("book-author").value.trim();
    const publisher = document.getElementById("book-publisher").value.trim();
    const price = parseInt(document.getElementById("book-price").value, 10);
    const category = document.getElementById("book-category").value;
    const desc = document.getElementById("book-desc").value.trim();

    const conditionRadio = document.querySelector('input[name="book-condition"]:checked');
    if (!conditionRadio) {
      alert("도서 상태를 선택해 주세요.");
      return;
    }
    const condition = conditionRadio.value;

    const books = window.DB.getBooks();

    if (editId) {
      // Edit mode: update existing book
      const bookIndex = books.findIndex(b => b.id === editId);
      if (bookIndex > -1) {
        books[bookIndex].title = title;
        books[bookIndex].author = author;
        books[bookIndex].publisher = publisher;
        books[bookIndex].price = price;
        books[bookIndex].category = category;
        books[bookIndex].condition = condition;
        books[bookIndex].desc = desc;
        books[bookIndex].images = uploadedBase64Image ? [uploadedBase64Image] : [];
        // Note: keeping status, seller info, and createdAt as is
        
        window.DB.saveBooks(books);
        alert("교재 정보가 성공적으로 수정되었습니다.");
        window.location.href = `detail.html?id=${editId}`;
      } else {
        alert("도서 정보를 업데이트하지 못했습니다.");
      }
    } else {
      // Creation mode: append new book
      const newBookId = "book-" + Date.now();
      const newBook = {
        id: newBookId,
        title: title,
        author: author,
        publisher: publisher,
        price: price,
        category: category,
        condition: condition,
        desc: desc,
        images: uploadedBase64Image ? [uploadedBase64Image] : [],
        sellerId: currentUser.email,
        sellerName: currentUser.nickname,
        sellerSchool: currentUser.school,
        sellerManner: currentUser.manner || 36.5,
        createdAt: Date.now(),
        status: "판매중"
      };

      books.push(newBook);
      window.DB.saveBooks(books);
      alert("교재가 정상적으로 등록되었습니다!");
      window.location.href = `detail.html?id=${newBookId}`;
    }
  };

  // Run on start
  if (checkAuth()) {
    document.addEventListener("DOMContentLoaded", checkEditMode);
  }
})();
