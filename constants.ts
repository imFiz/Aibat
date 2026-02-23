import { BoostOption, Task } from "./types";

export const CONFIG = {
  FOLLOW_REWARD: 10,
  BASE_CHECKIN_REWARD: 50,
  STREAK_BONUS: 10,
  MAX_CHECKIN_REWARD: 150,
  DAILY_FOLLOW_LIMIT: 10,
};

export const MOCK_TASKS: Task[] = [
  { id: 'real1', name: "gLGbcf6vKA85ZPg", handle: "gLGbcf6vKA85ZPg", avatar: "https://randomuser.me/api/portraits/men/32.jpg", isOnline: true, price: 10, isFollowBack: true },
  { id: 'real2', name: "Kristal6861", handle: "Kristal6861", avatar: "https://randomuser.me/api/portraits/women/44.jpg", isOnline: true, price: 10, isFollowBack: true },
  { id: 'real3', name: "FennecBTC", handle: "FennecBTC", avatar: "https://randomuser.me/api/portraits/men/86.jpg", isOnline: true, price: 10 },
  { id: 'real4', name: "Alex Megas", handle: "alexmegas1992", avatar: "https://randomuser.me/api/portraits/men/11.jpg", isOnline: false, price: 10 },
  { id: 'real5', name: "Ilgar", handle: "Ilgar43876456", avatar: "https://randomuser.me/api/portraits/men/65.jpg", isOnline: false, price: 10 },
  { id: 'real6', name: "iTor", handle: "_iTor_", avatar: "https://randomuser.me/api/portraits/men/3.jpg", isOnline: true, price: 10 },
  { id: 'real7', name: "Polymira", handle: "Polymira", avatar: "https://randomuser.me/api/portraits/women/68.jpg", isOnline: false, price: 10 },
  { id: 'real8', name: "Kolyan Trend", handle: "kolyan_trend", avatar: "https://randomuser.me/api/portraits/men/91.jpg", isOnline: true, price: 10 },
];

export const BOOST_OPTIONS: BoostOption[] = [
  { count: 10, price: 1000 },
  { count: 50, price: 4500, best: true },
  { count: 100, price: 8000 }
];