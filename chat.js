// Campus Book - Chat coordination logic
(function() {
  let currentUser = null;
  let activeRoomId = null;

  // Auto-replies array for simulation bot
  const BOT_REPLIES = [
    "네, 확인했습니다! 그 시간도 괜찮습니다.",
    "혹시 학생회관 앞 말고 다른 곳도 직거래 가능한가요?",
    "상태는 기재한 대로 정말 깨끗해요. 직거래 하실 때 편하게 보시고 말씀하세요!",
    "좋습니다. 그럼 내일 조율한 장소에서 뵙겠습니다. 도착하면 연락 주세요!",
    "아, 그 시간에는 수업이 있어서 30분 정도 늦을 것 같은데 괜찮으실까요?",
    "계좌이체랑 현금 모두 가능합니다. 편하신 방법으로 해주세요!"
  ];

  // Protect page
  function checkAuth() {
    currentUser = window.Auth.getCurrentUser();
    if (!currentUser) {
      window.Auth.requireAuth();
      return false;
    }
    return true;
  }

  // Load chat rooms sidebar
  function loadChatRooms() {
    const listContainer = document.getElementById("chat-rooms-container");
    if (!listContainer) return;

    const chats = window.DB.getChats();
    const users = window.DB.getUsers();

    // Filter chats where user is buyer or seller
    const myChats = chats.filter(c => c.buyerId === currentUser.email || c.sellerId === currentUser.email);

    if (myChats.length === 0) {
      listContainer.innerHTML = `
        <div style="padding: 40px 20px; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
          참여 중인 대화방이 없습니다.<br>
          교재 상세에서 쪽지를 보내보세요!
        </div>
      `;
      return;
    }

    // Sort by latest message timestamp
    myChats.sort((a, b) => {
      const aTime = a.messages.length > 0 ? a.messages[a.messages.length - 1].time : 0;
      const bTime = b.messages.length > 0 ? b.messages[b.messages.length - 1].time : 0;
      return bTime - aTime;
    });

    listContainer.innerHTML = myChats.map(room => {
      const isBuyer = room.buyerId === currentUser.email;
      const partnerName = isBuyer ? room.sellerName : room.buyerName;
      const partnerEmail = isBuyer ? room.sellerId : room.buyerId;
      const isActive = room.roomId === activeRoomId ? "active" : "";
      
      const lastMsgObj = room.messages[room.messages.length - 1];
      const lastMsgText = lastMsgObj ? lastMsgObj.text : "대화가 개설되었습니다.";
      const lastMsgTime = lastMsgObj ? formatTime(lastMsgObj.time) : "";

      return `
        <div class="chat-room-item ${isActive}" onclick="selectChatRoom('${room.roomId}')">
          <div class="chat-room-avatar">${partnerName.charAt(0)}</div>
          <div class="chat-room-info">
            <div class="chat-room-top">
              <span class="chat-room-name">${partnerName}</span>
              <span class="chat-room-date">${lastMsgTime}</span>
            </div>
            <div class="chat-room-book">교재: ${room.bookTitle}</div>
            <div class="chat-room-msg">${lastMsgText}</div>
          </div>
        </div>
      `;
    }).join("");
  }

  // Format timestamp helper
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 is 12
    return `${ampm} ${hours}:${minutes}`;
  }

  // Select a chat room
  window.selectChatRoom = function(roomId) {
    activeRoomId = roomId;
    
    // Update sidebar styles
    loadChatRooms();

    const noRoomPlaceholder = document.getElementById("no-room-placeholder");
    const activeInterface = document.getElementById("active-chat-interface");
    
    if (!activeInterface) return;

    const chats = window.DB.getChats();
    const room = chats.find(c => c.roomId === roomId);

    if (!room) {
      noRoomPlaceholder.style.display = "flex";
      activeInterface.style.display = "none";
      return;
    }

    noRoomPlaceholder.style.display = "none";
    activeInterface.style.display = "flex";

    // Set Header partner info
    const isBuyer = room.buyerId === currentUser.email;
    const partnerName = isBuyer ? room.sellerName : room.buyerName;
    const partnerEmail = isBuyer ? room.sellerId : room.buyerId;

    // Look up partner's university
    const partnerUser = window.DB.getUsers().find(u => u.email === partnerEmail);
    const partnerSchool = partnerUser ? partnerUser.school : "알 수 없는 대학";

    document.getElementById("chat-header-partner-name").textContent = partnerName;
    document.getElementById("chat-header-partner-school").textContent = partnerSchool;
    
    const bookLink = document.getElementById("chat-header-book-link");
    bookLink.textContent = room.bookTitle;
    bookLink.href = `detail.html?id=${room.bookId}`;

    renderMessages(room);
  };

  // Render messages in chat window
  function renderMessages(room) {
    const container = document.getElementById("chat-messages-container");
    if (!container) return;

    container.innerHTML = room.messages.map(msg => {
      if (msg.senderId === "system") {
        return `
          <div style="align-self: center; background-color: var(--border-color); color: var(--text-sub); font-size: 0.75rem; padding: 4px 12px; border-radius: var(--radius-full); margin: 10px 0;">
            ${msg.text}
          </div>
        `;
      }

      const isMe = msg.senderId === currentUser.email;
      const bubbleWrapperClass = isMe ? "me" : "other";
      const formattedTime = formatTime(msg.time);

      return `
        <div class="chat-bubble-wrapper ${bubbleWrapperClass}">
          <div class="chat-bubble">${msg.text}</div>
          <span class="chat-bubble-time">${formattedTime}</span>
        </div>
      `;
    }).join("");

    // Auto scroll to bottom
    container.scrollTop = container.scrollHeight;
  }

  // Handle Send Message Form submit
  window.handleSendMessage = function(e) {
    e.preventDefault();

    const input = document.getElementById("chat-message-input");
    const text = input.value.trim();
    if (!text || !activeRoomId) return;

    const chats = window.DB.getChats();
    const roomIndex = chats.findIndex(c => c.roomId === activeRoomId);
    
    if (roomIndex === -1) return;

    const room = chats[roomIndex];
    const newMessage = {
      senderId: currentUser.email,
      senderName: currentUser.nickname,
      text: text,
      time: Date.now()
    };

    room.messages.push(newMessage);
    window.DB.saveChats(chats);
    
    input.value = "";
    renderMessages(room);
    loadChatRooms(); // update sidebar snippet

    // Trigger simulation reply bot
    const isBuyer = room.buyerId === currentUser.email;
    const partnerEmail = isBuyer ? room.sellerId : room.buyerId;
    const partnerName = isBuyer ? room.sellerName : room.buyerName;

    // Check if the partner is a seeded mock user (emails starting with student)
    if (partnerEmail.startsWith("student")) {
      setTimeout(() => {
        // Double check user hasn't switched rooms in the mean time
        if (activeRoomId !== room.roomId) return;
        
        const randomReply = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
        const systemReply = {
          senderId: partnerEmail,
          senderName: partnerName,
          text: randomReply,
          time: Date.now()
        };

        const currentChats = window.DB.getChats();
        const activeRoom = currentChats.find(c => c.roomId === activeRoomId);
        if (activeRoom) {
          activeRoom.messages.push(systemReply);
          window.DB.saveChats(currentChats);
          
          renderMessages(activeRoom);
          loadChatRooms();
        }
      }, 1500);
    }
  };

  // Initial loading checks
  if (checkAuth()) {
    document.addEventListener("DOMContentLoaded", () => {
      loadChatRooms();
      
      // Auto-select room from query params if specified
      const urlParams = new URLSearchParams(window.location.search);
      const roomIdParam = urlParams.get("roomId");
      if (roomIdParam) {
        selectChatRoom(roomIdParam);
      }
    });
  }
})();
