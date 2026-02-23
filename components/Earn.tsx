import React from 'react';
import { UserCheck, Globe, History, Twitter, Loader2 } from 'lucide-react';
import { Task } from '../types';
import { CONFIG } from '../constants';

interface EarnProps {
  tasks: Task[];
  onFollow: (task: Task) => void;
  processingId: string | null;
  dailyFollowCount: number;
  onOpenHistory: () => void;
}

interface TaskItemProps {
  task: Task;
  isProcessing: boolean;
  onFollow: (task: Task) => void;
  dailyFollowCount: number;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, isProcessing, onFollow, dailyFollowCount }) => {
  const isDailyLimitReached = dailyFollowCount >= CONFIG.DAILY_FOLLOW_LIMIT;

  return (
    <div className="glass-panel p-3 rounded-2xl flex items-center justify-between mb-3 animate-slide-up hover:bg-[#222] transition-colors">
      <div className="flex items-center space-x-3 overflow-hidden">
        <div className="relative flex-shrink-0">
          <img 
            src={task.avatar} 
            alt={task.name}
            className="w-12 h-12 rounded-full bg-[#222] object-cover"
          />
          {task.isOnline && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#121212] rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-[#F2F0E9] rounded-full animate-pulse"></div>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 bg-[#121212] rounded-full p-0.5 border border-[#333]">
            <Twitter size={10} className="text-[#F2F0E9]" fill="currentColor" />
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-[#F2F0E9] font-bold text-sm truncate">{task.name}</div>
          <div className="text-neutral-500 text-xs truncate">@{task.handle}</div>
        </div>
      </div>

      <button 
        onClick={() => onFollow(task)}
        disabled={isProcessing}
        className={`h-9 px-4 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all border flex-shrink-0 ${
          isProcessing 
            ? 'bg-[#1A1A1A] border-[#333] text-neutral-500 cursor-wait' 
            : 'bg-[#F2F0E9] border-[#F2F0E9] text-black active:scale-95 hover:bg-white'
        }`}
      >
        {isProcessing ? (
           <>
             <Loader2 size={12} className="animate-spin" />
             <span>Verifying</span>
           </>
        ) : (
          <>
            <span>{task.isFollowBack ? 'Back' : 'Follow'}</span>
            {!isDailyLimitReached && (
                <>
                    <div className="w-px h-3 bg-neutral-300 mx-1"></div>
                    <span>+{task.price}</span>
                </>
            )}
          </>
        )}
      </button>
    </div>
  );
};

const Earn: React.FC<EarnProps> = ({ 
  tasks, 
  onFollow, 
  processingId, 
  dailyFollowCount, 
  onOpenHistory 
}) => {
  const followBackTasks = tasks.filter(t => t.isFollowBack);
  const exploreTasks = tasks.filter(t => !t.isFollowBack);

  const dailyProgress = Math.min(dailyFollowCount, CONFIG.DAILY_FOLLOW_LIMIT);
  const dailyPercent = (dailyProgress / CONFIG.DAILY_FOLLOW_LIMIT) * 100;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex justify-between items-start px-1">
        <div>
          <h2 className="text-[#F2F0E9] font-bold text-xl mb-1">Follow Exchange</h2>
        </div>
        <button 
          onClick={onOpenHistory}
          className="bg-[#1A1A1A] p-2 rounded-full border border-[#333] hover:border-[#F2F0E9] transition-colors"
        >
          <History size={16} className="text-[#F2F0E9]" />
        </button>
      </div>

      {/* Progress */}
      <div className="px-1">
        <div className="flex justify-between items-end mb-2">
          <span className="text-[10px] text-neutral-400 uppercase">Daily Point Cap</span>
          <div className="text-xs font-bold text-[#F2F0E9]">{dailyProgress} / {CONFIG.DAILY_FOLLOW_LIMIT}</div>
        </div>
        <div className="w-full h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
          <div 
            className="bg-[#F2F0E9] h-full transition-all duration-500 ease-out" 
            style={{ width: `${dailyPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Follow Backs */}
      <div>
        <div className="flex items-center space-x-2 px-1 mb-3">
          <UserCheck size={16} className="text-[#F2F0E9]" />
          <span className="text-sm font-bold text-[#F2F0E9]">Follow Back</span>
          {followBackTasks.length > 0 && (
            <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full border border-red-500/50">
              Required
            </span>
          )}
        </div>
        {followBackTasks.length === 0 ? (
          <div className="text-center py-4 text-neutral-700 text-xs italic border border-dashed border-[#222] rounded-xl">
            You are all caught up!
          </div>
        ) : (
          followBackTasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              isProcessing={processingId === task.id}
              onFollow={onFollow}
              dailyFollowCount={dailyFollowCount}
            />
          ))
        )}
      </div>

      {/* Explore */}
      <div>
        <div className="flex items-center space-x-2 px-1 mb-3">
          <Globe size={16} className="text-neutral-500" />
          <span className="text-sm font-bold text-neutral-400">Explore Community</span>
        </div>
        {exploreTasks.length === 0 ? (
           <div className="text-center py-12 text-neutral-600">No new users found.</div>
        ) : (
           exploreTasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              isProcessing={processingId === task.id}
              onFollow={onFollow}
              dailyFollowCount={dailyFollowCount}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Earn;