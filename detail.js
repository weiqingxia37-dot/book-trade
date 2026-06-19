// Campus Book - Book Detail Page Script
(function() {
  let book = null;
  let currentUser = null;

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

  // Render detail view
  function renderDetail() {
    const loadingPlaceholder = document.getElementById("detail-loading-placeholder");
    const detailView = document.getElementById("detail-view-container");
    
    if (!loadingPlaceholder || !detailView) return;

    // Get book ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get("id");

    if (!bookId) {
      showError("도서 ID가 지정되지 않았습니다.");
      return;
    }

    const books = window.DB.getBooks();
    book = books.find(b => b.id === bookId);

    if (!book) {
      showError("요청하신 도서를 찾을 수 없거나 이미 삭제되었습니다.");
      return;
    }

    currentUser = window.Auth.getCurrentUser();

    // Populate fields
    document.getElementById("detail-title").textContent = book.title;
    document.getElementById("detail-category").textContent = book.category;
    document.getElementById("detail-condition").textContent = book.condition;
    document.getElementById("detail-author").textContent = book.author;
    document.getElementById("detail-publisher").textContent = book.publisher || "정보 없음";
    document.getElementById("detail-date").textContent = formatRelativeDate(book.createdAt);
    document.getElementById("detail-price").textContent = formatPrice(book.price);
    document.getElementById("detail-desc").textContent = book.desc || "상세 설명이 등록되지 않았습니다.";

    // Render image
    const imgWrapper = document.getElementById("detail-img-wrapper");
    if (book.images && book.images.length > 0) {
      imgWrapper.innerHTML = `<img src="${book.images[0]}" alt="${book.title}" class="detail-img">`;
    } else {
      const grad = window.DB.getBookGradient(book.title);
      imgWrapper.innerHTML = `
        <div style="width: 100%; height: 100%; background: ${grad}; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: var(--radius-md); text-align: center; color: white; padding: 40px;">
          <i class="ri-book-read-fill" style="font-size: 4.5rem; margin-bottom: 16px;"></i>
          <span style="font-size: 1.15rem; font-weight: 700; max-width: 80%; line-height: 1.4;">${book.title}</span>
        </div>
      `;
    }

    // Render seller info
    document.getElementById("seller-name").textContent = book.sellerName;
    document.getElementById("seller-school").textContent = book.sellerSchool;
    document.getElementById("seller-avatar").textContent = book.sellerName.charAt(0);
    
    const mannerTemp = book.sellerManner || 36.5;
    document.getElementById("seller-trust-value").textContent = mannerTemp.toFixed(1);
    document.getElementById("seller-trust-bar").style.width = `${Math.min(mannerTemp, 100)}%`;

    // Render condition badge color class
    const condBadge = document.getElementById("detail-condition");
    condBadge.className = "badge"; // reset
    if (book.condition === "새책 수준") condBadge.classList.add("badge-primary");
    else if (book.condition === "매우 좋음") condBadge.classList.add("badge-secondary");
    else if (book.condition === "사용감 있음") condBadge.classList.add("badge-warning");
    else if (book.condition === "필기 많음") condBadge.classList.add("badge-muted");

    // Check bookmark state
    updateBookmarkUI();

    // Toggle view states
    loadingPlaceholder.style.display = "none";
    detailView.style.display = "grid";

    // Setup action click events
    setupActionListeners();
  }

  function showError(msg) {
    const loadingPlaceholder = document.getElementById("detail-loading-placeholder");
    if (!loadingPlaceholder) return;

    loadingPlaceholder.innerHTML = `
      <div class="empty-state">
        <i class="ri-error-warning-line" style="color: var(--danger);"></i>
        <h3>데이터를 불러오지 못했습니다</h3>
        <p>${msg}</p>
        <a href="index.html" class="btn btn-primary" style="margin-top: 16px;">홈으로 가기</a>
      </div>
    `;
  }

  function updateBookmarkUI() {
    const bookmarkBtn = document.getElementById("detail-bookmark-btn");
    if (!bookmarkBtn) return;

    const bookmarks = currentUser ? window.DB.getBookmarks(currentUser.email) : [];
    const isBookmarked = book && bookmarks.includes(book.id);

    if (isBookmarked) {
      bookmarkBtn.classList.add("active");
      bookmarkBtn.querySelector("i").className = "ri-heart-fill";
      bookmarkBtn.style.color = "var(--danger)";
    } else {
      bookmarkBtn.classList.remove("active");
      bookmarkBtn.querySelector("i").className = "ri-heart-line";
      bookmarkBtn.style.color = "";
    }
  }

  function setupActionListeners() {
    const bookmarkBtn = document.getElementById("detail-bookmark-btn");
    const chatBtn = document.getElementById("detail-chat-btn");

    if (bookmarkBtn) {
      bookmarkBtn.onclick = function() {
        if (!window.Auth.requireAuth()) return;

        let bookmarks = window.DB.getBookmarks(currentUser.email);
        const idx = bookmarks.indexOf(book.id);

        if (idx > -1) {
          bookmarks.splice(idx, 1);
        } else {
          bookmarks.push(book.id);
        }

        window.DB.saveBookmarks(currentUser.email, bookmarks);
        updateBookmarkUI();
      };
    }

    if (chatBtn) {
      chatBtn.onclick = function() {
        if (!window.Auth.requireAuth()) return;

        // 1. Can't chat with self
        if (currentUser.email === book.sellerId) {
          alert("본인이 등록한 판매 교재입니다. 마이페이지에서 교재 상태를 변경하거나 수정하실 수 있습니다.");
          return;
        }

        // 2. Look for existing room
        const chats = window.DB.getChats();
        let room = chats.find(c => c.bookId === book.id && c.buyerId === currentUser.email);

        if (room) {
          window.location.href = `chat.html?roomId=${room.roomId}`;
        } else {
          // Create new chat room
          const roomId = "room-" + Date.now();
          const newRoom = {
            roomId: roomId,
            bookId: book.id,
            bookTitle: book.title,
            buyerId: currentUser.email,
            buyerName: currentUser.nickname,
            sellerId: book.sellerId,
            sellerName: book.sellerName,
            messages: [
              {
                senderId: "system",
                senderName: "시스템",
                text: `${currentUser.nickname}님이 대화를 개설하셨습니다.`,
                time: Date.now()
              },
              {
                senderId: book.sellerId,
                senderName: book.sellerName,
                text: `안녕하세요! [${book.title}] 직거래를 원하시는군요. 편하게 말씀해 주세요!`,
                time: Date.now() + 500 // slight offset
              }
            ]
          };

          chats.push(newRoom);
          window.DB.saveChats(chats);
          window.location.href = `chat.html?roomId=${roomId}`;
        }
      };
    }
  }

  document.addEventListener("DOMContentLoaded", renderDetail);
})();
