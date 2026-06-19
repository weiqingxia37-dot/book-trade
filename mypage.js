// Campus Book - My Page Management Script
(function() {
  let currentUser = null;
  let activeTab = "listings";

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

  // Format Price
  function formatPrice(num) {
    return num.toLocaleString() + "원";
  }

  // Protect page
  function checkAuth() {
    currentUser = window.Auth.getCurrentUser();
    if (!currentUser) {
      window.Auth.requireAuth();
      return false;
    }
    return true;
  }

  // Render User Profile Information
  function renderProfile() {
    if (!currentUser) return;
    document.getElementById("profile-nickname").textContent = currentUser.nickname;
    document.getElementById("profile-school").textContent = currentUser.school;
    document.getElementById("profile-email").textContent = currentUser.email;
    document.getElementById("profile-avatar").textContent = currentUser.nickname.charAt(0);

    const manner = currentUser.manner || 36.5;
    document.getElementById("profile-trust-value").textContent = manner.toFixed(1);
    document.getElementById("profile-trust-bar").style.width = `${Math.min(manner, 100)}%`;
  }

  // Render My Listings Tab
  function renderMyListings() {
    const grid = document.getElementById("my-listings-grid");
    const countSpan = document.getElementById("listings-count");
    if (!grid) return;

    const allBooks = window.DB.getBooks();
    const myListings = allBooks.filter(b => b.sellerId === currentUser.email);

    // Sort by latest created
    myListings.sort((a, b) => b.createdAt - a.createdAt);

    countSpan.textContent = myListings.length;

    if (myListings.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <i class="ri-article-line"></i>
          <h3>등록된 도서가 없습니다</h3>
          <p>판매하고 싶은 대학교재를 등록해 보세요!</p>
          <a href="register.html" class="btn btn-primary" style="margin-top: 16px;">교재 등록하러 가기</a>
        </div>
      `;
      return;
    }

    grid.innerHTML = myListings.map(book => {
      // Determine image tag
      let imgTag = "";
      if (book.images && book.images.length > 0) {
        imgTag = `<img src="${book.images[0]}" alt="${book.title}" class="book-img">`;
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
      
      const toggleStatusText = book.status === "거래완료" ? "판매중으로 변경" : "거래완료로 변경";
      const toggleStatusBtnClass = book.status === "거래완료" ? "btn-accent" : "btn-secondary";

      return `
        <div class="book-card">
          <div class="book-img-wrapper" onclick="window.location.href='detail.html?id=${book.id}'" style="cursor: pointer;">
            ${imgTag}
            <div class="book-badge-overlay">
              ${statusBadge}
              <span class="badge badge-info">${book.condition}</span>
            </div>
          </div>
          <div class="book-content" style="padding-bottom: 8px;">
            <span class="book-card-category">${book.category}</span>
            <h3 class="book-card-title" onclick="window.location.href='detail.html?id=${book.id}'" style="cursor: pointer;">${book.title}</h3>
            <div class="book-card-footer">
              <span class="book-card-price">${formatPrice(book.price)}</span>
              <span class="book-card-date">${formatRelativeDate(book.createdAt)}</span>
            </div>
          </div>
          <!-- Management Row -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 12px 18px 18px 18px; border-top: 1px solid var(--border-color);">
            <button onclick="editMyBook('${book.id}')" class="btn btn-secondary" style="padding: 8px; font-size: 0.85rem;"><i class="ri-edit-line"></i> 수정</button>
            <button onclick="deleteMyBook('${book.id}')" class="btn btn-danger" style="padding: 8px; font-size: 0.85rem;"><i class="ri-delete-bin-line"></i> 삭제</button>
            <button onclick="toggleMyBookStatus('${book.id}')" class="btn ${toggleStatusBtnClass}" style="grid-column: 1 / -1; padding: 8px; font-size: 0.85rem; margin-top: 4px;">
              <i class="ri-exchange-line"></i> ${toggleStatusText}
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  // Render My Bookmarks Tab
  function renderMyBookmarks() {
    const grid = document.getElementById("my-bookmarks-grid");
    const countSpan = document.getElementById("bookmarks-count");
    if (!grid) return;

    const bookmarks = window.DB.getBookmarks(currentUser.email);
    const allBooks = window.DB.getBooks();

    // Load actual book details for bookmarks
    const myBookmarkedBooks = allBooks.filter(b => bookmarks.includes(b.id));

    countSpan.textContent = myBookmarkedBooks.length;

    if (myBookmarkedBooks.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <i class="ri-heart-line"></i>
          <h3>찜한 도서가 없습니다</h3>
          <p>마음에 드는 교재를 찜하고 모아서 확인해 보세요!</p>
          <a href="index.html" class="btn btn-primary" style="margin-top: 16px;">교재 둘러보러 가기</a>
        </div>
      `;
      return;
    }

    grid.innerHTML = myBookmarkedBooks.map(book => {
      // Determine image tag
      let imgTag = "";
      if (book.images && book.images.length > 0) {
        imgTag = `<img src="${book.images[0]}" alt="${book.title}" class="book-img">`;
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

      return `
        <div class="book-card" onclick="window.location.href='detail.html?id=${book.id}'">
          <div class="book-img-wrapper">
            ${imgTag}
            <div class="book-badge-overlay">
              ${statusBadge}
              <span class="badge badge-info">${book.condition}</span>
            </div>
            <button class="book-bookmark-btn active" onclick="unbookmarkFromMyPage(event, '${book.id}')" aria-label="찜 취소" style="color: var(--danger);">
              <i class="ri-heart-fill"></i>
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

  // Switch tabs
  window.switchMyTab = function(tab) {
    activeTab = tab;
    const listingsBtn = document.getElementById("tab-listings-btn");
    const bookmarksBtn = document.getElementById("tab-bookmarks-btn");
    const listingsContent = document.getElementById("tab-listings-content");
    const bookmarksContent = document.getElementById("tab-bookmarks-content");

    if (tab === "listings") {
      listingsBtn.classList.add("active");
      bookmarksBtn.classList.remove("active");
      listingsContent.style.display = "block";
      bookmarksContent.style.display = "none";
    } else {
      listingsBtn.classList.remove("active");
      bookmarksBtn.classList.add("active");
      listingsContent.style.display = "none";
      bookmarksContent.style.display = "block";
    }
  };

  // Edit action
  window.editMyBook = function(bookId) {
    window.location.href = `register.html?edit=${bookId}`;
  };

  // Delete action
  window.deleteMyBook = function(bookId) {
    if (confirm("정말 이 도서 판매글을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.")) {
      const books = window.DB.getBooks();
      const updatedBooks = books.filter(b => b.id !== bookId);
      window.DB.saveBooks(updatedBooks);
      
      // Clean bookmark for current user if deleted
      let bookmarks = window.DB.getBookmarks(currentUser.email);
      const bIdx = bookmarks.indexOf(bookId);
      if (bIdx > -1) {
        bookmarks.splice(bIdx, 1);
        window.DB.saveBookmarks(currentUser.email, bookmarks);
      }

      renderMyListings();
      renderMyBookmarks();
    }
  };

  // Toggle status action
  window.toggleMyBookStatus = function(bookId) {
    const books = window.DB.getBooks();
    const bookIndex = books.findIndex(b => b.id === bookId);
    
    if (bookIndex > -1) {
      const currentStatus = books[bookIndex].status;
      books[bookIndex].status = currentStatus === "판매중" ? "거래완료" : "판매중";
      window.DB.saveBooks(books);
      
      renderMyListings();
      renderMyBookmarks();
    }
  };

  // Unbookmark action (inside bookmark tab)
  window.unbookmarkFromMyPage = function(event, bookId) {
    event.stopPropagation(); // stop click navigating to detail page

    let bookmarks = window.DB.getBookmarks(currentUser.email);
    const idx = bookmarks.indexOf(bookId);
    
    if (idx > -1) {
      bookmarks.splice(idx, 1);
      window.DB.saveBookmarks(currentUser.email, bookmarks);
      
      renderMyBookmarks();
    }
  };

  // Initialize
  if (checkAuth()) {
    document.addEventListener("DOMContentLoaded", () => {
      renderProfile();
      renderMyListings();
      renderMyBookmarks();
    });
  }
})();
