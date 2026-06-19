// Campus Book - Main Landing Page Script
(function() {
  let currentCategory = "전체";
  let searchKeyword = "";

  // Relative Date Helper
  function formatRelativeDate(timestamp) {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  }

  // Format Price Helper
  function formatPrice(num) {
    return num.toLocaleString() + "원";
  }

  // Handle book card click (except bookmark)
  window.navigateToDetail = function(bookId) {
    window.location.href = `detail.html?id=${bookId}`;
  };

  // Toggle Bookmark logic
  window.toggleBookmark = function(event, bookId) {
    event.stopPropagation(); // Prevents navigating to detail
    
    const currentUser = window.Auth.getCurrentUser();
    if (!currentUser) {
      alert("북마크 기능은 로그인 후 이용하실 수 있습니다.");
      window.location.href = "login.html";
      return;
    }

    let bookmarks = window.DB.getBookmarks(currentUser.email);
    const index = bookmarks.indexOf(bookId);
    
    let isAdded = false;
    if (index > -1) {
      bookmarks.splice(index, 1);
    } else {
      bookmarks.push(bookId);
      isAdded = true;
    }
    
    window.DB.saveBookmarks(currentUser.email, bookmarks);
    
    // Update visual state of button
    const btn = event.currentTarget;
    if (isAdded) {
      btn.classList.add("active");
      btn.querySelector("i").className = "ri-heart-fill";
      btn.style.color = "var(--danger)";
    } else {
      btn.classList.remove("active");
      btn.querySelector("i").className = "ri-heart-line";
      btn.style.color = "";
    }
  };

  // Render book grid
  function renderBooks() {
    const container = document.getElementById("books-grid-container");
    const listCountBadge = document.getElementById("list-count-badge");
    const listTitle = document.getElementById("list-title");
    
    if (!container) return;

    let books = window.DB.getBooks();
    const currentUser = window.Auth.getCurrentUser();
    const bookmarks = currentUser ? window.DB.getBookmarks(currentUser.email) : [];

    // 1. Filter by Category
    if (currentCategory !== "전체") {
      books = books.filter(b => b.category === currentCategory);
    }

    // 2. Filter by Search Keyword
    if (searchKeyword.trim() !== "") {
      const kw = searchKeyword.toLowerCase();
      books = books.filter(b => 
        b.title.toLowerCase().includes(kw) || 
        b.author.toLowerCase().includes(kw) || 
        (b.publisher && b.publisher.toLowerCase().includes(kw)) ||
        (b.desc && b.desc.toLowerCase().includes(kw))
      );
    }

    // Sort: "판매중" books first, then latest by createdAt
    books.sort((a, b) => {
      if (a.status === "판매중" && b.status !== "판매중") return -1;
      if (a.status !== "판매중" && b.status === "판매중") return 1;
      return b.createdAt - a.createdAt;
    });

    listCountBadge.textContent = `검색 결과 ${books.length}개`;
    if (searchKeyword) {
      listTitle.textContent = `"${searchKeyword}" 검색 결과`;
    } else {
      listTitle.textContent = currentCategory === "전체" ? "최신 등록 도서" : `${currentCategory} 목록`;
    }

    if (books.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <i class="ri-book-open-line"></i>
          <h3>등록된 도서가 없습니다</h3>
          <p>첫 번째 도서의 판매자가 되어보세요!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = books.map(book => {
      const isBookmarked = bookmarks.includes(book.id);
      const bookmarkClass = isBookmarked ? "active" : "";
      const bookmarkIcon = isBookmarked ? "ri-heart-fill" : "ri-heart-line";
      const bookmarkColor = isBookmarked ? "style='color: var(--danger)'" : "";
      
      // Determine image tag
      let imgTag = "";
      if (book.images && book.images.length > 0) {
        imgTag = `<img src="${book.images[0]}" alt="${book.title}" class="book-img" loading="lazy">`;
      } else {
        const grad = window.DB.getBookGradient(book.title);
        imgTag = `
          <div style="width: 100%; height: 100%; background: ${grad}; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; color: white;">
            <i class="ri-book-read-fill" style="font-size: 2.2rem; margin-bottom: 8px;"></i>
            <span style="font-size: 0.85rem; font-weight: 600; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.3;">${book.title}</span>
          </div>
        `;
      }

      // Badges
      const statusBadge = book.status === "거래완료" 
        ? `<span class="badge badge-muted">거래완료</span>` 
        : `<span class="badge badge-success">판매중</span>`;
      
      let conditionBadgeClass = "badge-info";
      if (book.condition === "새책 수준") conditionBadgeClass = "badge-primary";
      else if (book.condition === "사용감 있음") conditionBadgeClass = "badge-warning";
      else if (book.condition === "필기 많음") conditionBadgeClass = "badge-muted";

      return `
        <div class="book-card" onclick="navigateToDetail('${book.id}')">
          <div class="book-img-wrapper">
            ${imgTag}
            <div class="book-badge-overlay">
              ${statusBadge}
              <span class="badge ${conditionBadgeClass}">${book.condition}</span>
            </div>
            <button class="book-bookmark-btn ${bookmarkClass}" onclick="toggleBookmark(event, '${book.id}')" aria-label="찜하기" ${bookmarkColor}>
              <i class="${bookmarkIcon}"></i>
            </button>
          </div>
          <div class="book-content">
            <span class="book-card-category">${book.category}</span>
            <h3 class="book-card-title">${book.title}</h3>
            <div class="book-card-school">
              <i class="ri-map-pin-2-fill"></i>
              <span>${book.sellerSchool}</span>
            </div>
            <div class="book-card-footer">
              <span class="book-card-price">${formatPrice(book.price)}</span>
              <span class="book-card-date">${formatRelativeDate(book.createdAt)}</span>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // Setup Event Listeners
  document.addEventListener("DOMContentLoaded", function() {
    // 1. Setup Category Clicks
    const chipsContainer = document.getElementById("category-chips-container");
    if (chipsContainer) {
      chipsContainer.addEventListener("click", function(e) {
        const button = e.target.closest(".category-chip");
        if (!button) return;

        // Toggle Active
        chipsContainer.querySelectorAll(".category-chip").forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        currentCategory = button.getAttribute("data-category");
        renderBooks();
      });
    }

    // 2. Setup FAB link checks
    const fabRegister = document.getElementById("fab-register");
    if (fabRegister) {
      fabRegister.addEventListener("click", function(e) {
        e.preventDefault();
        if (window.Auth.requireAuth()) {
          window.location.href = "register.html";
        }
      });
    }

    // Render initially
    renderBooks();
  });

  // Global search form handler
  window.handleSearchSubmit = function(e) {
    e.preventDefault();
    const searchInput = document.getElementById("main-search-input");
    searchKeyword = searchInput ? searchInput.value : "";
    renderBooks();
  };
})();
