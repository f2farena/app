// src/mock/tournamentData.js
// Giả lập ID của người dùng đang đăng nhập
const CURRENT_USER_ID = 'user_001';

// Hàm tạo người dùng ngẫu nhiên
const createRandomUser = (index) => ({
  id: `user_${String(index).padStart(3, '0')}`,
  name: `Trader ${String(index).padStart(3, '0')}`,
  avatar: `https://i.pravatar.cc/50?u=user${index}`,
  score: Math.floor(Math.random() * 10000) + 500,
  rank: index,
  volume: Math.floor(Math.random() * 500000) + 50000,
  status: 'Advanced to Round of 64'
});

// Hàm tạo một trận đấu
const createMatch = (id, player1, player2, day) => {
  const matchDate = new Date();
  matchDate.setDate(matchDate.getDate() + day - 1);
  const hour = Math.floor(Math.random() * 12) + 9; // Giờ thi đấu từ 9h đến 20h
  matchDate.setHours(hour, 0, 0, 0);

  return {
    id: `match_${day}_${id}`,
    player1,
    player2,
    time: matchDate.toISOString(),
    status: 'upcoming', // 'upcoming', 'live', 'completed'
    winner: null,
  };
};

// Tạo danh sách 200 người chơi
const users = Array.from({ length: 200 }, (_, i) => createRandomUser(i + 1));
users.sort((a, b) => b.score - a.score).forEach((user, index) => {
  user.rank = index + 1;
});

// Tạo lịch thi đấu cho các ngày
const generateSchedule = (players, matchesPerPlayer, day) => {
  const schedule = [];
  const opponents = [...players];
  for (let i = 0; i < players.length; i++) {
    for (let j = 0; j < matchesPerPlayer; j++) {
      // Đảm bảo không tự đấu với chính mình
      let opponentIndex = Math.floor(Math.random() * opponents.length);
      while (opponents[opponentIndex].id === players[i].id) {
        opponentIndex = Math.floor(Math.random() * opponents.length);
      }
      const matchId = `${i}_${j}`;
      schedule.push(createMatch(matchId, players[i], opponents[opponentIndex], day));
    }
  }
  return schedule;
};

// Dữ liệu mô phỏng hoàn chỉnh cho giải đấu
export const getOngoingTournamentData = (tournamentId) => {
  const currentUser = users.find(u => u.id === CURRENT_USER_ID);

  // === LOGIC MỚI: TẠO DỮ LIỆU CÁC VÒNG ĐẤU ===
  const roundsData = [
    { name: `Qualifying Round - ${users.slice(0, 128).length}`, participants: users.slice(0, 128) },
    { name: `Round of 64 - ${users.slice(0, 64).length}`, participants: users.slice(0, 64) },
    { name: `Quarter-finals - ${users.slice(0, 8).length}`, participants: users.slice(0, 8) },
    { name: `Semi-finals - ${users.slice(0, 4).length}`, participants: users.slice(0, 4) },
    { name: `Final - ${users.slice(0, 2).length}`, participants: users.slice(0, 2) },
  ];
  
  // Tạo 5 trận đấu thủ công cho currentUser (giữ nguyên logic từ lần trước)
  const now = new Date();
  const manualMatches = [
    { id: `match_m_1`, player1: currentUser, player2: users.find(u => u.id === 'user_101'), time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), status: 'completed', winner: currentUser.id, scoreChange: 152 },
    { id: `match_m_2`, player1: users.find(u => u.id === 'user_088'), player2: currentUser, time: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), status: 'completed', winner: 'user_088', scoreChange: -89 },
    { id: `match_m_3`, player1: currentUser, player2: users.find(u => u.id === 'user_055'), time: new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString(), status: 'upcoming', winner: null },
    { id: `match_m_4`, player1: users.find(u => u.id === 'user_123'), player2: currentUser, time: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(), status: 'upcoming', winner: null },
  ];

  const liveMatchesData = [
    {
      id: 'live_01',
      player1: { ...users[10], score: 1254 },
      player2: { ...users[11], score: 980 },
      startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), 
      durationHours: 1,
    },
    {
      id: 'live_02',
      player1: { ...users[12], score: 2103 },
      player2: { ...users[13], score: 2310 },
      startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      durationHours: 1,
    },
    {
      id: 'live_03',
      player1: { ...users[14], score: 750 },
      player2: { ...users[15], score: 890 },
      startTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      durationHours: 2,
    }
  ];

  return {
    id: tournamentId,
    title: 'Summer Trading Championship 2025',
    status: 'Ongoing',
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    users: users,
    rounds: roundsData,
    myMatches: manualMatches,
    liveMatches: liveMatchesData, // THÊM DỮ LIỆU MỚI VÀO ĐÂY
    currentUser: currentUser,
    currentDay: 2,
    results: {
      topPrizes: [
        { rank: 1, name: users[0].name, prize: '5,000 USDT', avatar: users[0].avatar },
        { rank: 2, name: users[1].name, prize: '2,500 USDT', avatar: users[1].avatar },
        { rank: 3, name: users[2].name, prize: '1,000 USDT', avatar: users[2].avatar },
      ],
      consolationPrizes: users.slice(3, 10).map(user => ({ id: user.id, name: user.name, prize: '100 USDT' })),
      teamPrizes: [
        { id: 'team1', name: 'Alpha Traders', prize: '1,500 USDT' },
        { id: 'team2', name: 'Crypto Warriors', prize: '1,000 USDT' },
      ]
    }
  };
};

export const getTournamentList = () => {
  return [
    {
      id: 1,
      title: 'GIẢI ĐẤU GIẢ LẬP (ĐANG DIỄN RA)',
      thumbnail: 'https://placehold.co/500x220/00cec9/ffffff?text=Ongoing+Tournament',
      event_time: new Date().toISOString(),
      prize_pool: '10,000',
      participants: 200,
      symbol: 'BTC/USDT',
      status: 'Ongoing' // TRẠNG THÁI QUAN TRỌNG
    },
    {
      id: 2,
      title: 'Giải Đấu Sắp Tới',
      thumbnail: 'https://placehold.co/500x220/a29bfe/ffffff?text=Upcoming+Event',
      event_time: new Date(Date.now() + 86400000).toISOString(),
      prize_pool: '5,000',
      participants: 100,
      symbol: 'ETH/USDT',
      status: 'Upcoming'
    }
  ];
};