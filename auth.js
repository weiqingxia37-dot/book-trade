// Campus Book - Session Management & GNB Renderer
(function() {
  // Authentication Helpers
  window.Auth = {
    getCurrentUser: function() {
      const data = localStorage.getItem("campus_logged_in_user");
      return data ? JSON.parse(data) : null;
    },
    
    login: function(email, password) {
      const users = window.DB.getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        localStorage.setItem("campus_logged_in_user", JSON.stringify(user));
        return { success: true, user: user };
      }
      return { success: false, message: "이메일 또는 비밀번호가 올바르지 않습니다." };
    },
    
    register: function(email, nickname, password, school) {
      const users = window.DB.getUsers();
      if (users.find(u => u.email === email)) {
        return { success: false, message: "이미 가입된 이메일입니다." };
      }
      if (users.find(u => u.nickname === nickname)) {
        return { success: false, message: "이미 사용 중인 닉네임입니다." };
      }
      
      const newUser = {
        email: email,
        nickname: nickname,
        password: password,
        school: school,
        manner: 36.5
      };
      
      users.push(newUser);
      window.DB.saveUsers(users);
      localStorage.setItem("campus_logged_in_user", JSON.stringify(newUser));
      return { success: true, user: newUser };
    },
    
    logout: function() {
      localStorage.removeItem("campus_logged_in_user");
      window.location.href = "index.html";
    },
    
    requireAuth: function() {
      if (!this.getCurrentUser()) {
        alert("로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.");
        window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        return false;
      }
      return true;
    }
  };

  // Render Header (GNB)
  function renderHeader() {
    const headerEl = document.getElementById("gnb");
    if (!headerEl) return;

    const currentUser = window.Auth.getCurrentUser();
    const currentPath = window.location.pathname;
    const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1) || "index.html";

    // Setup active GNB link classes
    const isHomeActive = pageName === "index.html" || pageName === "" ? "active" : "";
    const isRegisterActive = pageName === "register.html" ? "active" : "";
    const isChatActive = pageName === "chat.html" ? "active" : "";
    const isMypageActive = pageName === "mypage.html" ? "active" : "";

    let navLinksHtml = `<a href="index.html" class="gnb-link ${isHomeActive}"><i class="ri-home-5-line"></i> 홈</a>`;
    let userSectionHtml = "";

    if (currentUser) {
      navLinksHtml += `
        <a href="register.html" class="gnb-link ${isRegisterActive}"><i class="ri-add-box-line"></i> 교재등록</a>
        <a href="chat.html" class="gnb-link ${isChatActive}"><i class="ri-message-3-line"></i> 쪽지함</a>
        <a href="mypage.html" class="gnb-link ${isMypageActive}"><i class="ri-user-3-line"></i> 마이페이지</a>
      `;

      userSectionHtml = `
        <div class="gnb-avatar">${currentUser.nickname.charAt(0)}</div>
        <div class="gnb-username" style="display: flex; flex-direction: column; line-height: 1.2;">
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-main);">${currentUser.nickname}</span>
          <span style="font-size: 0.7rem; color: var(--text-muted);">${currentUser.school}</span>
        </div>
        <button onclick="window.Auth.logout()" class="btn btn-ghost" style="padding: 6px 12px; font-size: 0.85rem; display: flex; align-items: center; gap: 4px;">
          <i class="ri-logout-box-r-line"></i> 로그아웃
        </button>
      `;
    } else {
      userSectionHtml = `
        <a href="login.html" class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.9rem;">로그인</a>
        <a href="login.html?tab=signup" class="btn btn-primary" style="padding: 8px 16px; font-size: 0.9rem;">회원가입</a>
      `;
    }

    const currentTheme = localStorage.getItem("campus_theme") || "light";
    const themeIcon = currentTheme === "dark" ? "ri-sun-line" : "ri-moon-line";

    headerEl.innerHTML = `
      <div class="gnb-header">
        <div class="gnb-container">
          <a href="index.html" class="gnb-logo">
            <i class="ri-graduation-cap-fill"></i>
            <span>Campus Book</span>
          </a>
          <div class="gnb-nav">
            <div class="gnb-links-group">
              ${navLinksHtml}
            </div>
            <div style="display: flex; align-items: center; gap: 16px;">
              <button id="theme-toggle-btn" class="theme-toggle" aria-label="테마 전환">
                <i class="${themeIcon}"></i>
              </button>
              <div class="gnb-user-info">
                ${userSectionHtml}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind Theme Toggle Listener
    document.getElementById("theme-toggle-btn").addEventListener("click", function() {
      const isDark = document.body.classList.toggle("dark-theme");
      localStorage.setItem("campus_theme", isDark ? "dark" : "light");
      
      const iconEl = this.querySelector("i");
      if (isDark) {
        iconEl.className = "ri-sun-line";
      } else {
        iconEl.className = "ri-moon-line";
      }
    });
  }

  // Load and apply theme and GNB on DOMContentLoaded
  document.addEventListener("DOMContentLoaded", function() {
    // Apply saved theme
    const savedTheme = localStorage.getItem("campus_theme") || "light";
    if (savedTheme === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }

    // Render GNB header
    renderHeader();

    // Auto-inject Footer if an element with class `app-footer-placeholder` is present
    const footerPlaceholder = document.getElementById("footer-placeholder");
    if (footerPlaceholder) {
      footerPlaceholder.innerHTML = `
        <footer class="app-footer">
          <div class="container">
            <p style="margin-bottom: 8px;">&copy; 2026 Campus Book. 대학생 전용 중고 교재 직거래 플랫폼</p>
            <p style="font-size: 0.8rem; color: var(--text-muted);">안전한 거래를 위해 반드시 캠퍼스 내 공공장소에서 대면으로 거래하세요.</p>
          </div>
        </footer>
      `;
    }
  });
})();
