// Campus Book - Data Store & Mock Seed Data
(function() {
  const DEFAULT_BOOKS = [
    {
      id: "book-1",
      title: "알고리즘 개론 (Introduction to Algorithms)",
      author: "Thomas H. Cormen",
      publisher: "한빛아카데미",
      price: 28000,
      category: "전공교재",
      condition: "매우 좋음",
      desc: "컴퓨터공학과 전공 필수 교재입니다. 앞부분 30페이지 정도만 연필로 옅게 필기되어 있고 나머지 뒷부분은 거의 새 책입니다. \n대면 직거래는 학생회관 앞이나 정보공학관 로비에서 가능해요!",
      images: [], // empty images fallback to generated gradient
      sellerId: "student1@snu.ac.kr",
      sellerName: "코딩왕김학우",
      sellerSchool: "서울대학교",
      sellerManner: 39.5,
      createdAt: Date.now() - 3600000 * 24 * 2, // 2 days ago
      status: "판매중"
    },
    {
      id: "book-2",
      title: "맨큐의 경제학 (Principles of Economics) 8판",
      author: "N. Gregory Mankiw",
      publisher: "Cengage Learning",
      price: 19000,
      category: "교양교재",
      condition: "사용감 있음",
      desc: "경제학원론 수업 때 들었던 교재입니다. 책 밑둥에 이름이 적혀있고, 형광펜 밑줄이 좀 쳐져 있는 편입니다. \n공부하시는 데 지장 없을 겁니다! 사회과학대 로비 혹은 중앙도서관 앞에서 대면 거래 원해요.",
      images: [],
      sellerId: "student2@yonsei.ac.kr",
      sellerName: "경영돌이",
      sellerSchool: "연세대학교",
      sellerManner: 37.2,
      createdAt: Date.now() - 3600000 * 12, // 12 hours ago
      status: "판매중"
    },
    {
      id: "book-3",
      title: "일반물리학실험 (연습서)",
      author: "물리실험교재편찬위원회",
      publisher: "북스힐",
      price: 8000,
      category: "수업 연습서",
      condition: "새책 수준",
      desc: "실험 보고서 쓸 때 꼭 필요한 책입니다. 중간고사 기말고사 연습 문제 풀이도 포함되어 있습니다. \n필기나 낙서 전혀 없는 완전 새 책입니다. \n과학기술관 입구에서 빠르게 직거래 가능합니다.",
      images: [],
      sellerId: "student3@korea.ac.kr",
      sellerName: "물리마스터",
      sellerSchool: "고려대학교",
      sellerManner: 41.0,
      createdAt: Date.now() - 3600000 * 3, // 3 hours ago
      status: "판매중"
    },
    {
      id: "book-4",
      title: "대학 핵심 영어 글쓰기 (Academic Writing)",
      author: "Alice Oshima",
      publisher: "Pearson",
      price: 15000,
      category: "교양교재",
      condition: "필기 많음",
      desc: "대학 필수 교양 영어 글쓰기 교재입니다. 볼펜이랑 형광펜 필기가 꽤 있습니다. 대신 저렴하게 판매합니다! \n언어교육원이나 인문관 근처 거래 선호합니다.",
      images: [],
      sellerId: "student1@snu.ac.kr",
      sellerName: "코딩왕김학우",
      sellerSchool: "서울대학교",
      sellerManner: 39.5,
      createdAt: Date.now() - 3600000 * 48, // 48 hours ago
      status: "거래완료"
    },
    {
      id: "book-5",
      title: "미적분학 및 연습 1",
      author: "김홍종",
      publisher: "서울대학교출판문화원",
      price: 12000,
      category: "전공교재",
      condition: "매우 좋음",
      desc: "미적분학 1 수업 필수 서적입니다. 필기 조금 있고 깨끗한 편입니다. 편하게 연락 주세요!",
      images: [],
      sellerId: "student4@snu.ac.kr",
      sellerName: "미적귀신",
      sellerSchool: "서울대학교",
      sellerManner: 36.5,
      createdAt: Date.now() - 3600000 * 1, // 1 hour ago
      status: "판매중"
    }
  ];

  const DEFAULT_USERS = [
    {
      email: "admin@snu.ac.kr",
      password: "password123",
      nickname: "캠퍼스매니저",
      school: "서울대학교",
      manner: 36.5
    },
    {
      email: "student1@snu.ac.kr",
      password: "password123",
      nickname: "코딩왕김학우",
      school: "서울대학교",
      manner: 39.5
    },
    {
      email: "student2@yonsei.ac.kr",
      password: "password123",
      nickname: "경영돌이",
      school: "연세대학교",
      manner: 37.2
    },
    {
      email: "student3@korea.ac.kr",
      password: "password123",
      nickname: "물리마스터",
      school: "고려대학교",
      manner: 41.0
    },
    {
      email: "student4@snu.ac.kr",
      password: "password123",
      nickname: "미적귀신",
      school: "서울대학교",
      manner: 36.5
    }
  ];

  const DEFAULT_CHATS = [
    {
      roomId: "room-1",
      bookId: "book-2",
      bookTitle: "맨큐의 경제학 (Principles of Economics) 8판",
      buyerId: "student1@snu.ac.kr",
      buyerName: "코딩왕김학우",
      sellerId: "student2@yonsei.ac.kr",
      sellerName: "경영돌이",
      messages: [
        {
          senderId: "student1@snu.ac.kr",
          senderName: "코딩왕김학우",
          text: "안녕하세요! 맨큐의 경제학 책 구매하고 싶어서 쪽지 드립니다.",
          time: Date.now() - 3600000 * 2
        },
        {
          senderId: "student2@yonsei.ac.kr",
          senderName: "경영돌이",
          text: "안녕하세요! 네, 아직 판매 중입니다. 연세대 신촌캠퍼스 직거래 가능하신가요?",
          time: Date.now() - 3600000 * 1.9
        },
        {
          senderId: "student1@snu.ac.kr",
          senderName: "코딩왕김학우",
          text: "제가 이번 주 목요일 오후 3시쯤 연세대 근처에 가는데, 학생회관 앞이나 신촌역에서 뵐 수 있을까요?",
          time: Date.now() - 3600000 * 1.8
        },
        {
          senderId: "student2@yonsei.ac.kr",
          senderName: "경영돌이",
          text: "아 좋습니다! 그럼 목요일 3시에 학생회관 1층 로비에서 뵐게요.",
          time: Date.now() - 3600000 * 1.7
        }
      ]
    }
  ];

  // Helper to safely read/write localStorage
  window.DB = {
    getBooks: function() {
      const data = localStorage.getItem("campus_books");
      return data ? JSON.parse(data) : [];
    },
    saveBooks: function(books) {
      localStorage.setItem("campus_books", JSON.stringify(books));
    },
    getUsers: function() {
      const data = localStorage.getItem("campus_users");
      return data ? JSON.parse(data) : [];
    },
    saveUsers: function(users) {
      localStorage.setItem("campus_users", JSON.stringify(users));
    },
    getChats: function() {
      const data = localStorage.getItem("campus_chats");
      return data ? JSON.parse(data) : [];
    },
    saveChats: function(chats) {
      localStorage.setItem("campus_chats", JSON.stringify(chats));
    },
    getBookmarks: function(userEmail) {
      if (!userEmail) return [];
      const data = localStorage.getItem(`bookmarks_${userEmail}`);
      return data ? JSON.parse(data) : [];
    },
    saveBookmarks: function(userEmail, bookmarks) {
      if (!userEmail) return;
      localStorage.setItem(`bookmarks_${userEmail}`, JSON.stringify(bookmarks));
    },
    
    // Add dummy gradient image generator
    getBookGradient: function(title) {
      // Create a deterministic gradient based on the book title
      let hash = 0;
      for (let i = 0; i < title.length; i++) {
        hash = title.charCodeAt(i) + ((hash << 5) - hash);
      }
      const hue1 = Math.abs(hash) % 360;
      const hue2 = (hue1 + 40) % 360;
      return `linear-gradient(135deg, hsl(${hue1}, 70%, 65%) 0%, hsl(${hue2}, 80%, 45%) 100%)`;
    }
  };

  // Initialize databases if not present
  if (!localStorage.getItem("campus_books")) {
    window.DB.saveBooks(DEFAULT_BOOKS);
  }
  if (!localStorage.getItem("campus_users")) {
    window.DB.saveUsers(DEFAULT_USERS);
  }
  if (!localStorage.getItem("campus_chats")) {
    window.DB.saveChats(DEFAULT_CHATS);
  }
})();
