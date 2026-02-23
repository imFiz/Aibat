import { BoostOption, Task } from "./types";

export const CONFIG = {
  FOLLOW_REWARD: 10,
  BASE_CHECKIN_REWARD: 50,
  STREAK_BONUS: 10,
  MAX_CHECKIN_REWARD: 150,
  DAILY_FOLLOW_LIMIT: 10,
};

export const MOCK_TASKS: Task[] = [
  { id: 'real1', name: "gLGbcf6vKA85ZPg", handle: "gLGbcf6vKA85ZPg", avatar: "https://picsum.photos/100/100?random=1", isOnline: true, price: 10, isFollowBack: true },
  { id: 'real2', name: "Kristal6861", handle: "Kristal6861", avatar: "https://picsum.photos/100/100?random=2", isOnline: true, price: 10, isFollowBack: true },
  { id: 'real3', name: "FennecBTC", handle: "FennecBTC", avatar: "https://picsum.photos/100/100?random=3", isOnline: true, price: 10 },
  { id: 'real4', name: "Alex Megas", handle: "alexmegas1992", avatar: "https://picsum.photos/100/100?random=4", isOnline: false, price: 10 },
  { id: 'real5', name: "Ilgar", handle: "Ilgar43876456", avatar: "https://picsum.photos/100/100?random=5", isOnline: false, price: 10 },
  { id: 'real6', name: "iTor", handle: "_iTor_", avatar: "https://picsum.photos/100/100?random=6", isOnline: true, price: 10 },
  { id: 'real7', name: "Polymira", handle: "Polymira", avatar: "https://picsum.photos/100/100?random=7", isOnline: false, price: 10 },
  { id: 'real8', name: "Kolyan Trend", handle: "kolyan_trend", avatar: "https://picsum.photos/100/100?random=8", isOnline: true, price: 10 },
];

export const BOOST_OPTIONS: BoostOption[] = [
  { count: 10, price: 1000 },
  { count: 50, price: 4500, best: true },
  { count: 100, price: 8000 }
];