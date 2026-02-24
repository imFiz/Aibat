import React, { useState, useEffect, useCallback } from 'react';
import { Twitter, Shield, Smartphone, Users, Zap, CheckCircle, Info, AlertTriangle, Rocket } from 'lucide-react';

import { User, Task, Tab, HistoryItem, BoostOption, ActiveBoost } from './types';
import { CONFIG, MOCK_TASKS } from './constants';
import { auth, db, doc, setDoc, getDoc, GoogleAuthProvider, TwitterAuthProvider, signInWithPopup, signOut, collection, getDocs, query, where, limit } from './services/firebaseService';

import Dashboard from './components/Dashboard';
import Earn from './components/Earn';
import Boost from './components/Boost';
import Modal from './components/Modal';

// --- MAIN COMPONENT ---

const App: React.FC = () => {
    // State
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [loading, setLoading] = useState<boolean>(true);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [activeBoosts, setActiveBoosts] = useState<ActiveBoost[]>([]);
    const [walletAddress, setWalletAddress] = useState<string | null>(localStorage.getItem('xb_wallet'));
    const [processingTask, setProcessingTask] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

    // Modals
    const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | 'history' | null>(null);

    // Daily counters
    const [dailyFollowCount, setDailyFollowCount] = useState<number>(() => {
        const saved = localStorage.getItem('xb_daily_follows');
        if (saved) {
            const { date, count } = JSON.parse(saved);
            if (date === new Date().toDateString()) return count;
        }
        return 0;
    });

    // --- EFFECTS ---

    useEffect(() => {
        // Initial Auth Check
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                // Construct user object
                let currentUser: User;

                // 1. Fetch cloud data first
                const userDocRef = doc(db, "users", firebaseUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                const cloudData = userDocSnap.exists() ? userDocSnap.data() : null;

                // 2. Fetch local data (for migration/fallback)
                const storedUser = localStorage.getItem(`xb_user_${firebaseUser.uid}`);
                const localData = storedUser ? JSON.parse(storedUser) : null;

                // 3. Merge strategy: Cloud overrides Local, Local overrides Defaults
                currentUser = {
                    uid: firebaseUser.uid,
                    username: cloudData?.name || localData?.username || firebaseUser.displayName || 'User',
                    handle: cloudData?.handle || localData?.handle || (firebaseUser as any).reloadUserInfo?.screenName || 'user',
                    avatar: cloudData?.avatar || localData?.avatar || (firebaseUser.photoURL || 'https://picsum.photos/200').replace('_normal', ''),
                    score: cloudData?.score !== undefined ? cloudData.score : (localData?.score ?? 500),
                    streak: cloudData?.streak !== undefined ? cloudData.streak : (localData?.streak ?? 0),
                    lastCheckIn: cloudData?.lastCheckIn || localData?.lastCheckIn || undefined,
                    followers: 0,
                    following: 0
                };

                if (currentUser.avatar && currentUser.avatar.includes('_normal')) {
                    currentUser.avatar = currentUser.avatar.replace('_normal', '');
                }

                // Load History from Cloud vs LocalStorage
                const storedHistory = localStorage.getItem(`xb_history_${firebaseUser.uid}`);
                if (cloudData?.history && cloudData.history.length > 0) {
                    setHistory(cloudData.history);
                    localStorage.setItem(`xb_history_${firebaseUser.uid}`, JSON.stringify(cloudData.history));
                } else if (storedHistory) {
                    setHistory(JSON.parse(storedHistory));
                }

                // Load Completed Tasks from Cloud vs LocalStorage
                const completedTaskIds = JSON.parse(localStorage.getItem(`xb_completed_tasks_${currentUser.uid}`) || '[]');
                if (cloudData?.completedTasks) {
                    const mergedTasks = Array.from(new Set([...completedTaskIds, ...cloudData.completedTasks]));
                    localStorage.setItem(`xb_completed_tasks_${currentUser.uid}`, JSON.stringify(mergedTasks));
                }

                // --- REALTIME DATA FETCHING ---
                try {
                    // 1. Fetch Relationships (Who follows me?)
                    const relRef = collection(db, "relationships");
                    const followersQ = query(relRef, where("followedId", "==", currentUser.uid));
                    const followersSnap = await getDocs(followersQ);
                    const followerIds = new Set<string>();
                    followersSnap.forEach(d => followerIds.add(d.data().followerId));

                    // 2. Fetch Relationships (Who do I follow?)
                    const followingQ = query(relRef, where("followerId", "==", currentUser.uid));
                    const followingSnap = await getDocs(followingQ);
                    const followingIds = new Set<string>();
                    followingSnap.forEach(d => followingIds.add(d.data().followedId));

                    // 3. Update User Counts & State
                    currentUser.followers = followerIds.size;
                    currentUser.following = followingIds.size;
                    setUser(currentUser);

                    // Sync to Firestore
                    await setDoc(doc(db, "users", currentUser.uid), {
                        uid: currentUser.uid,
                        name: currentUser.username,
                        handle: currentUser.handle,
                        avatar: currentUser.avatar,
                        isOnline: true,
                        lastSeen: new Date().toISOString(),
                        followers: followerIds.size,
                        following: followingIds.size,
                        score: currentUser.score,
                        streak: currentUser.streak,
                        lastCheckIn: currentUser.lastCheckIn || null
                    }, { merge: true });

                    // 4. Fetch Users for Tasks
                    // We need:
                    // a) People who follow me (for Follow Back) - excluding those I already follow
                    // b) Random people (for Explore) - excluding those I already follow

                    const completedTaskIds = JSON.parse(localStorage.getItem(`xb_completed_tasks_${currentUser.uid}`) || '[]');
                    const completedSet = new Set(completedTaskIds);

                    const usersRef = collection(db, "users");
                    const usersQ = query(usersRef, limit(50)); // Fetch a batch of users
                    const usersSnap = await getDocs(usersQ);

                    let fetchedTasks: Task[] = [];
                    const fetchedUserIds = new Set<string>();

                    // Process the batch
                    usersSnap.forEach((doc) => {
                        const uData = doc.data();
                        if (uData.uid === currentUser.uid) return; // Skip self
                        if (followingIds.has(uData.uid)) return; // Skip already followed
                        if (completedSet.has(uData.uid)) return; // Skip completed tasks

                        fetchedUserIds.add(uData.uid);

                        fetchedTasks.push({
                            id: uData.uid,
                            name: uData.name || 'User',
                            handle: uData.handle || 'user',
                            avatar: (uData.avatar || '').replace('_normal', '') || 'https://picsum.photos/200',
                            isOnline: uData.isOnline || false,
                            price: 10,
                            isFollowBack: followerIds.has(uData.uid)
                        });
                    });

                    // 5. Handle Missing Followers (Follow Backs not in the batch)
                    // Identify followers who are NOT in the fetched batch and NOT already followed
                    const missingFollowerIds = Array.from(followerIds).filter(id => !fetchedUserIds.has(id) && !followingIds.has(id) && !completedSet.has(id));

                    if (missingFollowerIds.length > 0) {
                        // Fetch these specific users
                        // Note: In a real app, use 'where uid in [...]' batches. Here we iterate for simplicity of the demo.
                        const missingPromises = missingFollowerIds.map(id => getDoc(doc(db, "users", id)));
                        const missingSnaps = await Promise.all(missingPromises);

                        missingSnaps.forEach(snap => {
                            if (snap.exists()) {
                                const uData = snap.data();
                                if (!completedSet.has(uData.uid)) {
                                    fetchedTasks.push({
                                        id: uData.uid,
                                        name: uData.name || 'User',
                                        handle: uData.handle || 'user',
                                        avatar: (uData.avatar || '').replace('_normal', '') || 'https://picsum.photos/200',
                                        isOnline: uData.isOnline || false,
                                        price: 10,
                                        isFollowBack: true
                                    });
                                }
                            }
                        });
                    }

                    // If no real users found at all, fallback to mocks (filtered)
                    if (fetchedTasks.length === 0 && usersSnap.empty) {
                        const availableTasks = MOCK_TASKS.filter(task => !followingIds.has(task.id) && !completedSet.has(task.id));
                        setTasks(availableTasks);
                    } else {
                        setTasks(fetchedTasks);
                    }

                } catch (error) {
                    console.error("Error fetching data:", error);
                    // Fallback
                    const completedTaskIds = JSON.parse(localStorage.getItem(`xb_completed_tasks_${firebaseUser.uid}`) || '[]');
                    const availableTasks = MOCK_TASKS.filter(task => !completedTaskIds.includes(task.id));
                    setTasks(availableTasks);
                }

            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            localStorage.setItem(`xb_user_${user.uid}`, JSON.stringify(user));
            // Sync critical game state to Firestore whenever user state updates!
            setDoc(doc(db, "users", user.uid), {
                score: user.score,
                streak: user.streak,
                lastCheckIn: user.lastCheckIn || null
            }, { merge: true }).catch(console.error);
        }
    }, [user]);

    useEffect(() => {
        if (user && history.length > 0) {
            // Keep history in sync on Cloud
            setDoc(doc(db, "users", user.uid), {
                history: history
            }, { merge: true }).catch(console.error);
        }
    }, [history, user]);

    useEffect(() => {
        const completedTaskIds = JSON.parse(localStorage.getItem(`xb_completed_tasks_${user?.uid}`) || '[]');
        if (user && completedTaskIds.length > 0) {
            // Keep completed tasks array in sync on Cloud
            setDoc(doc(db, "users", user.uid), {
                completedTasks: completedTaskIds
            }, { merge: true }).catch(console.error);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dailyFollowCount]); // dailyFollowCount increments when a task is completed, cheap proxy to sync completed array

    useEffect(() => {
        localStorage.setItem('xb_daily_follows', JSON.stringify({
            date: new Date().toDateString(),
            count: dailyFollowCount
        }));
    }, [dailyFollowCount]);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Simulate Boost Progress
    useEffect(() => {
        if (activeBoosts.length === 0) return;

        const interval = setInterval(() => {
            setActiveBoosts(prev => prev.map(boost => {
                if (boost.status === 'completed') return boost;

                // Randomly increment progress
                const increment = Math.random() > 0.7 ? 1 : 0;
                const newCount = Math.min(boost.currentCount + increment, boost.targetCount);

                return {
                    ...boost,
                    currentCount: newCount,
                    status: newCount >= boost.targetCount ? 'completed' : 'active'
                };
            }));
        }, 2000); // Check every 2 seconds

        return () => clearInterval(interval);
    }, [activeBoosts]);

    // --- HANDLERS ---

    const handleLogin = async () => {
        try {
            const provider = new TwitterAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            console.error("Login failed:", error);

            // --- PRODUCTION MODE: ERROR HANDLING ---
            // Demo mode removed. If login fails (user closes popup or network error),
            // we simply show an error toast.
            if (error.code === 'auth/popup-closed-by-user') {
                showToast("Login cancelled", 'info');
            } else {
                showToast("Login failed. Please try again.", 'error');
            }
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        localStorage.removeItem('xb_wallet');
        setWalletAddress(null);
        setDailyFollowCount(0);
    };

    const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ msg, type });
    };

    const addToHistory = (type: HistoryItem['type'], desc: string, points: number, uid: string, link?: string) => {
        const newItem: HistoryItem = {
            type,
            desc,
            points,
            date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            link: link || null
        };
        setHistory(prev => {
            const newHistory = [newItem, ...prev].slice(0, 20);
            localStorage.setItem(`xb_history_${uid}`, JSON.stringify(newHistory));
            return newHistory;
        });
    };

    // --- GAME LOGIC ---

    const handleFollow = (task: Task) => {
        setProcessingTask(task.id);

        // Simulate opening Twitter
        window.open(`https://twitter.com/${task.handle}`, '_blank');

        // Verify logic - Increased to 4.5 seconds for simulation effect
        setTimeout(async () => {
            if (!user) return;

            let points = 0;
            let msg = "";

            if (dailyFollowCount < CONFIG.DAILY_FOLLOW_LIMIT) {
                points = task.price;
                setDailyFollowCount(prev => prev + 1);
                msg = `Followed! +${points} PTS`;

                setUser(prev => prev ? ({
                    ...prev,
                    score: prev.score + points,
                    following: (prev.following || 0) + 1
                }) : null);
                addToHistory('earn', `Followed @${task.handle}`, points, user.uid, `https://twitter.com/${task.handle}`);

                // Persist completed task to localStorage IMMEDIATELY
                const completedTaskIds = JSON.parse(localStorage.getItem(`xb_completed_tasks_${user.uid}`) || '[]');
                if (!completedTaskIds.includes(task.id)) {
                    completedTaskIds.push(task.id);
                    localStorage.setItem(`xb_completed_tasks_${user.uid}`, JSON.stringify(completedTaskIds));
                }

                // Save relationship to Firestore so the other user sees "Follow Back"
                try {
                    const relationshipId = `${user.uid}_${task.id}`;
                    await setDoc(doc(db, "relationships", relationshipId), {
                        followerId: user.uid,
                        followedId: task.id,
                        timestamp: new Date().toISOString()
                    });
                } catch (e) {
                    console.error("Error saving relationship:", e);
                }
            } else {
                msg = "Followed! (Daily limit reached)";
                // Even if no points, we mark as completed so it doesn't show up again
                const completedTaskIds = JSON.parse(localStorage.getItem(`xb_completed_tasks_${user.uid}`) || '[]');
                if (!completedTaskIds.includes(task.id)) {
                    completedTaskIds.push(task.id);
                    localStorage.setItem(`xb_completed_tasks_${user.uid}`, JSON.stringify(completedTaskIds));
                }
            }

            // Remove task locally
            setTasks(prev => prev.filter(t => t.id !== task.id));

            showToast(msg, points > 0 ? 'success' : 'info');
            setProcessingTask(null);
        }, 4500); // 4.5 seconds delay
    };

    const handleCheckIn = () => {
        if (!user) return;

        const today = new Date().toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        let newStreak = user.streak;

        // Logic: If last checkin was yesterday, increment. 
        // If last checkin was today, do nothing (should be disabled).
        // If last checkin was older, reset to 1.
        if (user.lastCheckIn === yesterdayStr) {
            newStreak += 1;
        } else if (user.lastCheckIn !== today) {
            newStreak = 1;
        }

        const streakBonus = Math.min(newStreak * CONFIG.STREAK_BONUS, CONFIG.MAX_CHECKIN_REWARD - CONFIG.BASE_CHECKIN_REWARD);
        const totalReward = CONFIG.BASE_CHECKIN_REWARD + streakBonus;

        setUser(prev => prev ? ({
            ...prev,
            score: prev.score + totalReward,
            streak: newStreak,
            lastCheckIn: today
        }) : null);

        addToHistory('checkin', `Daily Check-in (Streak ${newStreak})`, totalReward, user.uid);
        showToast(`Checked in! +${totalReward} PTS`);
    };

    const handleBuyBoost = (option: BoostOption) => {
        if (!user) return;
        if (user.score < option.price) {
            showToast("Insufficient Points", 'error');
            return;
        }

        // REMOVED window.confirm because it often fails in embedded views or mobile wrappers
        // Executing directly for smoother UX
        setUser(prev => prev ? ({ ...prev, score: prev.score - option.price }) : null);

        // Add to active boosts
        const newBoost: ActiveBoost = {
            id: Date.now().toString(),
            type: 'followers',
            targetCount: option.count,
            currentCount: 0,
            status: 'active',
            timestamp: Date.now()
        };
        setActiveBoosts(prev => [newBoost, ...prev]);

        addToHistory('boost', `Boosted Profile (+${option.count})`, -option.price, user.uid);
        showToast("Boost Activated!", 'success');
    };

    // --- SOLANA LOGIC ---

    const connectWallet = async () => {
        try {
            let provider = null;

            // 1. Solana Seeker / Mobile Stack Injection
            // The "dApp Store" environment on Seeker/Saga usually injects 'window.solana'.
            // It does NOT always set 'isPhantom' to true.
            if (window.solana) {
                provider = window.solana;
            } else if (window.solflare) {
                provider = window.solflare;
            }

            if (provider) {
                const resp = await provider.connect();
                const pubKey = resp.publicKey.toString();
                setWalletAddress(pubKey);
                localStorage.setItem('xb_wallet', pubKey);
                showToast("Wallet Connected");
            } else {
                // 2. Deep Link Fallback (for Standard Android/iOS usage outside of Seeker native environment)
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

                if (isMobile) {
                    const currentUrl = encodeURIComponent(window.location.href);
                    // Using phantom link as a generic handler for now, 
                    // but Seeker users should hit the 'if (window.solana)' block above if using the dApp store.
                    const deepLink = `https://phantom.app/ul/browse/${currentUrl}?ref=${currentUrl}`;
                    window.location.href = deepLink;
                } else {
                    window.open('https://solana.com/ecosystem/explore?categories=wallet', '_blank');
                    showToast("No Solana wallet found", 'info');
                }
            }
        } catch (err) {
            console.error("Connection error:", err);
            showToast("Connection rejected or failed", 'error');
        }
    };

    const disconnectWallet = () => {
        setWalletAddress(null);
        localStorage.removeItem('xb_wallet');
        if (window.solana) window.solana.disconnect();
        if (window.solflare) window.solflare.disconnect();
        showToast("Wallet Disconnected", 'info');
    };

    // --- RENDER HELPERS ---

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black text-[#F2F0E9]">
                <Smartphone className="w-10 h-10 animate-pulse" />
            </div>
        );
    }

    // LOGIN SCREEN
    if (!user) {
        return (
            <div className="flex flex-col h-[100dvh] bg-[#000000] relative overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#1A1A1A] rounded-full blur-[100px] opacity-50 pointer-events-none"></div>

                {/* Main Content Centered */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 z-10">
                    <div className="w-24 h-24 bg-[#1A1A1A] border border-[#333] rounded-full flex items-center justify-center mb-8 shadow-2xl animate-pulse-slow">
                        <Rocket size={40} className="text-[#F2F0E9]" />
                    </div>

                    <h1 className="text-3xl font-black text-[#F2F0E9] mb-2">X-BOOSTER</h1>
                    <p className="text-neutral-500 mb-12 max-w-[250px] text-center">Boost your social presence. Join the elite network of Web3 influencers.</p>

                    <button
                        onClick={handleLogin}
                        className="w-full max-w-xs py-4 rounded-2xl bg-[#F2F0E9] text-black font-bold flex items-center justify-center space-x-3 hover:bg-white transition-all active:scale-95"
                    >
                        <Twitter size={20} />
                        <span>Connect X (Twitter)</span>
                    </button>
                </div>

                {/* Footer Links - Fixed Layout */}
                <div className="py-8 z-10 flex justify-center space-x-8 pb-10">
                    <button
                        onClick={() => setActiveModal('terms')}
                        className="text-[10px] uppercase tracking-widest text-neutral-500 hover:text-[#F2F0E9] transition-colors p-2"
                    >
                        Terms
                    </button>
                    <button
                        onClick={() => setActiveModal('privacy')}
                        className="text-[10px] uppercase tracking-widest text-neutral-500 hover:text-[#F2F0E9] transition-colors p-2"
                    >
                        Privacy
                    </button>
                </div>

                {/* Modals for Login Screen */}
                <Modal
                    isOpen={activeModal === 'terms'}
                    onClose={() => setActiveModal(null)}
                    title="Terms of Service"
                >
                    <div className="text-xs text-neutral-400 space-y-4 text-left leading-relaxed">
                        <p className="font-bold text-[#F2F0E9]">Last Updated: October 2023</p>

                        <div>
                            <h4 className="font-bold text-[#F2F0E9] mb-1">1. Acceptance of Terms</h4>
                            <p>By accessing or using X-Booster, you agree to be bound by these Terms. If you do not agree to all of these Terms, do not use the application.</p>
                        </div>

                        <div>
                            <h4 className="font-bold text-[#F2F0E9] mb-1">2. No Financial Value</h4>
                            <p>X-Booster is a gamified social engagement platform. Points (PTS), badges, ranks, and any other digital indicators within the application are for entertainment purposes only and hold <strong>no monetary value</strong>. They cannot be exchanged for cash or cryptocurrency.</p>
                        </div>

                        <div>
                            <h4 className="font-bold text-[#F2F0E9] mb-1">3. Wallet Security & Non-Custodial Service</h4>
                            <p>X-Booster is a non-custodial application. We do not have access to your private keys or recovery phrases. You are solely responsible for safeguarding your Solana wallet. We are not liable for any funds lost due to user error or third-party wallet malfunctions.</p>
                        </div>

                        <div>
                            <h4 className="font-bold text-[#F2F0E9] mb-1">4. Third-Party Platforms</h4>
                            <p>This application interacts with third-party platforms, including X (formerly Twitter). We are not affiliated with, endorsed by, or sponsored by X Corp. You agree to comply with X's Terms of Service while using our platform.</p>
                        </div>

                        <div>
                            <h4 className="font-bold text-[#F2F0E9] mb-1">5. Limitation of Liability</h4>
                            <p>The service is provided "AS IS". To the maximum extent permitted by law, X-Booster shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
                        </div>
                    </div>
                </Modal>

                <Modal
                    isOpen={activeModal === 'privacy'}
                    onClose={() => setActiveModal(null)}
                    title="Privacy Policy"
                >
                    <div className="text-xs text-neutral-400 space-y-4 text-left leading-relaxed">
                        <p>Your privacy is important to us. This policy outlines how we handle your data.</p>

                        <div>
                            <h4 className="font-bold text-[#F2F0E9] mb-1">1. Information We Collect</h4>
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>Public Social Data:</strong> Username, handle, and avatar from your connected social account.</li>
                                <li><strong>Wallet Address:</strong> Your public Solana wallet address when you connect it.</li>
                                <li><strong>Activity Data:</strong> Tasks completed, streaks, and scores within the app.</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-[#F2F0E9] mb-1">2. How We Use Information</h4>
                            <p>We use this data solely to:</p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Maintain the Leaderboard.</li>
                                <li>Verify task completion (e.g., following a user).</li>
                                <li>Prevent abuse and spam.</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-[#F2F0E9] mb-1">3. Data Storage</h4>
                            <p>We use Google Firebase for data storage and authentication. We use local browser storage (cookies/localstorage) to maintain your login session.</p>
                        </div>

                        <div>
                            <h4 className="font-bold text-[#F2F0E9] mb-1">4. Your Rights</h4>
                            <p>You may disconnect your wallet and social accounts at any time via the settings in the Dashboard. Disconnecting effectively stops data collection.</p>
                        </div>
                    </div>
                </Modal>

                {toast && (
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-red-900/80 text-white px-4 py-2 rounded-lg text-sm border border-red-500 w-64">
                        {toast.msg}
                    </div>
                )}
            </div>
        );
    }

    // MAIN APP
    const pendingFollowsCount = tasks.filter(t => t.isFollowBack).length;
    const isCheckedIn = user.lastCheckIn === new Date().toDateString();
    const canCheckIn = !isCheckedIn && pendingFollowsCount === 0;

    return (
        <div className="flex justify-center min-h-screen bg-black">
            <div className="w-full max-w-[450px] h-[100dvh] bg-[#121212] flex flex-col relative shadow-2xl border-x border-[#1E1E1E]">

                {/* HEADER */}
                <header className="px-6 py-4 flex justify-between items-center bg-[#121212]/95 backdrop-blur sticky top-0 z-20 border-b border-[#1E1E1E]">
                    <div className="flex items-center space-x-2">
                        <Rocket size={20} className="text-[#F2F0E9]" />
                        <span className="font-bold text-lg tracking-wider text-[#F2F0E9]">X-BOOSTER</span>
                    </div>
                    <div className="bg-[#1A1A1A] px-3 py-1 rounded-full border border-[#333]">
                        <span className="font-mono text-xs text-[#F2F0E9]">{user.score.toLocaleString()} PTS</span>
                    </div>
                </header>

                {/* CONTENT */}
                <main className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                    {activeTab === 'dashboard' && (
                        <Dashboard
                            user={user}
                            walletAddress={walletAddress}
                            onConnectWallet={connectWallet}
                            onDisconnectWallet={disconnectWallet}
                            onLogout={handleLogout}
                            onCheckIn={handleCheckIn}
                            isCheckedIn={isCheckedIn}
                            canCheckIn={canCheckIn}
                            pendingFollowsCount={pendingFollowsCount}
                            onOpenTerms={() => setActiveModal('terms')}
                            onOpenPrivacy={() => setActiveModal('privacy')}
                        />
                    )}
                    {activeTab === 'earn' && (
                        <Earn
                            tasks={tasks}
                            onFollow={handleFollow}
                            processingId={processingTask}
                            dailyFollowCount={dailyFollowCount}
                            onOpenHistory={() => setActiveModal('history')}
                        />
                    )}
                    {activeTab === 'boost' && (
                        <Boost
                            user={user}
                            activeBoosts={activeBoosts}
                            onBuyBoost={handleBuyBoost}
                            onPremiumClick={() => showToast("Premium features coming soon!", 'info')}
                        />
                    )}
                </main>

                {/* BOTTOM NAV */}
                <nav className="absolute bottom-0 w-full bg-[#121212] border-t border-[#1E1E1E] flex justify-around items-center px-2 pb-6 pt-2 h-20 z-30">
                    {[
                        { id: 'dashboard', icon: Smartphone, label: 'Home' },
                        { id: 'earn', icon: Users, label: 'Connect', badge: pendingFollowsCount > 0 },
                        { id: 'boost', icon: Zap, label: 'Boost' }
                    ].map((item) => {
                        const isActive = activeTab === item.id;
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as Tab)}
                                className="flex-1 flex flex-col items-center justify-center py-2 group"
                            >
                                <div className={`p-2 rounded-xl transition-all duration-300 relative ${isActive ? 'bg-[#F2F0E9] -translate-y-1' : 'bg-transparent'}`}>
                                    <Icon size={24} className={isActive ? 'text-black' : 'text-neutral-500'} />
                                    {item.badge && (
                                        <span className="absolute top-0 right-0 w-3 h-3 bg-[#F2F0E9] rounded-full border border-[#121212]"></span>
                                    )}
                                </div>
                                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-[#F2F0E9]' : 'text-neutral-600'}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>

                {/* TOAST */}
                {toast && (
                    <div className={`absolute top-20 left-1/2 transform -translate-x-1/2 w-[90%] px-4 py-3 rounded-xl shadow-2xl z-[60] flex items-center space-x-3 transition-all animate-fade-in ${toast.type === 'error'
                        ? 'bg-[#1A1A1A] border border-red-900 text-red-400'
                        : toast.type === 'info'
                            ? 'bg-[#1A1A1A] border border-[#333] text-[#F2F0E9]'
                            : 'bg-[#F2F0E9] text-black'
                        }`}>
                        {toast.type === 'error' ? <AlertTriangle size={20} /> : (toast.type === 'info' ? <Info size={20} /> : <CheckCircle size={20} />)}
                        <span className="text-sm font-bold">{toast.msg}</span>
                    </div>
                )}

                {/* MODALS */}
                <Modal
                    isOpen={activeModal === 'history'}
                    onClose={() => setActiveModal(null)}
                    title="Activity History"
                >
                    {(!history || history.length === 0) ? (
                        <p className="text-center text-neutral-500 py-4 text-sm">No recent activity</p>
                    ) : (
                        <div className="space-y-3">
                            {history.map((h, i) => (
                                <div key={i} className="flex justify-between items-center py-3 border-b border-[#333] last:border-0">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${h.type === 'earn' ? 'bg-green-500/20 text-green-400' :
                                            h.type === 'boost' ? 'bg-indigo-500/20 text-indigo-400' :
                                                'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {h.type === 'earn' ? <Users size={14} /> :
                                                h.type === 'boost' ? <Zap size={14} /> :
                                                    <CheckCircle size={14} />}
                                        </div>
                                        <div>
                                            <div className="text-xs text-[#F2F0E9] font-bold flex items-center">
                                                {h.link ? (
                                                    <a
                                                        href={h.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:underline hover:text-blue-400 transition-colors flex items-center"
                                                    >
                                                        {h.desc}
                                                        <Twitter size={10} className="ml-1 opacity-50" />
                                                    </a>
                                                ) : (
                                                    <span>{h.desc}</span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-neutral-500">{h.date} • {
                                                h.type === 'earn' ? 'Follow Reward' :
                                                    h.type === 'boost' ? 'Profile Boost' :
                                                        'Daily Streak'
                                            }</div>
                                        </div>
                                    </div>
                                    <div className={`text-xs font-mono font-bold ${h.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {h.points > 0 ? '+' : ''}{h.points}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Modal>

                {/* RE-USING TERMS AND PRIVACY MODALS FOR MAIN APP */}
                <Modal
                    isOpen={activeModal === 'terms'}
                    onClose={() => setActiveModal(null)}
                    title="Terms of Service"
                >
                    <div className="text-xs text-neutral-400 space-y-4 text-left leading-relaxed">
                        <p className="font-bold text-[#F2F0E9]">Last Updated: October 2023</p>

                        <div>
                            <h4 className="font-bold text-[#F2F0E9] mb-1">1. Acceptance of Terms</h4>
                            <p>By accessing or using X-Booster, you agree to be bound by these Terms. If you do not agree to all of these Terms, do not use the application.</p>
                        </div>

                        <div>
                            <h4 className="font-bold text-[#F2F0E9] mb-1">2. No Financial Value</h4>
                            <p>X-Booster is a gamified social engagement platform. Points (PTS), badges, ranks, and any other digital indicators within the application are for entertainment purposes only and hold <strong>no monetary value</strong>. They cannot be exchanged for cash or cryptocurrency.</p>
                        </div>

                        <div>
                            <h4 className="font-bold text-[#F2F0E9] mb-1">3. Wallet Security & Non-Custodial Service</h4>
                            <p>X-Booster is a non-custodial application. We do not have access to your private keys or recovery phrases. You are solely responsible for safeguarding your Solana wallet. We are not liable for any funds lost due to user error or third-party wallet malfunctions.</p>
                        </div>

                        <div>
                            <h4 className="font-bold text-[#F2F0E9] mb-1">4. Third-Party Platforms</h4>
                            <p>This application interacts with third-party platforms, including X (formerly Twitter). We are not affiliated with, endorsed by, or sponsored by X Corp. You agree to comply with X's Terms of Service while using our platform.</p>
                        </div>

                        <div>
                            <h4 className="font-bold text-[#F2F0E9] mb-1">5. Limitation of Liability</h4>
                            <p>The service is provided "AS IS". To the maximum extent permitted by law, X-Booster shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
                        </div>
                    </div>
                </Modal>

                <Modal
                    isOpen={activeModal === 'privacy'}
                    onClose={() => setActiveModal(null)}
                    title="Privacy Policy"
                >
                    <div className="text-xs text-neutral-400 space-y-4 text-left leading-relaxed">
                        <p>Your privacy is important to us. This policy outlines how we handle your data.</p>

                        <div>
                            <h4 className="font-bold text-[#F2F0E9] mb-1">1. Information We Collect</h4>
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>Public Social Data:</strong> Username, handle, and avatar from your connected social account.</li>
                                <li><strong>Wallet Address:</strong> Your public Solana wallet address when you connect it.</li>
                                <li><strong>Activity Data:</strong> Tasks completed, streaks, and scores within the app.</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-[#F2F0E9] mb-1">2. How We Use Information</h4>
                            <p>We use this data solely to:</p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Maintain the Leaderboard.</li>
                                <li>Verify task completion (e.g., following a user).</li>
                                <li>Prevent abuse and spam.</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-[#F2F0E9] mb-1">3. Data Storage</h4>
                            <p>We use Google Firebase for data storage and authentication. We use local browser storage (cookies/localstorage) to maintain your login session.</p>
                        </div>

                        <div>
                            <h4 className="font-bold text-[#F2F0E9] mb-1">4. Your Rights</h4>
                            <p>You may disconnect your wallet and social accounts at any time via the settings in the Dashboard. Disconnecting effectively stops data collection.</p>
                        </div>
                    </div>
                </Modal>

            </div>
        </div>
    );
};

export default App;