import React, { useState, useEffect } from 'react';

// 업무 영역 정의
const WORK_AREAS = {
  lecture: { name: '강의 준비', icon: '📚', color: 'blue' },
  research: { name: '연구개발', icon: '🔬', color: 'purple' },
  paper: { name: '학술논문', icon: '📝', color: 'green' },
  book: { name: '저서작성', icon: '📖', color: 'amber' },
  education: { name: '교육프로그램', icon: '🎓', color: 'pink' }
};

// 세션 시간 정의
const SESSIONS = {
  morning: { name: '아침 세션', time: '06:00-08:30', duration: 150, icon: '☀️' },
  midday: { name: '오전 세션', time: '09:30-13:00', duration: 210, icon: '🌤️' },
  afternoon: { name: '오후 세션', time: '14:00-18:00', duration: 240, icon: '🌆' }
};

// 요일별 수업 여부 체크
const getSessionAvailability = (date) => {
  const day = date.getDay();
  const month = date.getMonth() + 1;
  
  // 2월까지는 모든 세션 가능
  if (month <= 2) {
    return { morning: true, midday: true, afternoon: true };
  }
  
  // 3-6월: 목요일 오후(14-18), 금요일 오후(12-16) 수업
  if (month >= 3 && month <= 6) {
    if (day === 4) { // 목요일
      return { morning: true, midday: true, afternoon: false };
    }
    if (day === 5) { // 금요일
      return { morning: true, midday: false, afternoon: false };
    }
  }
  
  return { morning: true, midday: true, afternoon: true };
};

// 주말 체크
const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export default function ProfessorScheduler() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [isWorking, setIsWorking] = useState(false);
  const [tasks, setTasks] = useState({
    morning: [],
    midday: [],
    afternoon: []
  });
  const [weeklyStats, setWeeklyStats] = useState({
    completedSessions: 0,
    totalHours: 0,
    byArea: {}
  });

  const today = new Date();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const sessionAvailability = getSessionAvailability(today);
  const weekend = isWeekend(today);

  // 타이머 관리
  useEffect(() => {
    let interval;
    if (isWorking && selectedSession) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorking, selectedSession]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionProgress = (sessionKey) => {
    const sessionTasks = tasks[sessionKey] || [];
    if (sessionTasks.length === 0) return 0;
    const completed = sessionTasks.filter(t => t.completed).length;
    return Math.round((completed / sessionTasks.length) * 100);
  };

  // 홈 화면
  const HomeView = () => {
    const availableSessions = Object.entries(SESSIONS).filter(([key]) => {
      if (weekend && key === 'afternoon') return false;
      return sessionAvailability[key];
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        {/* 헤더 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {today.getMonth() + 1}월 {today.getDate()}일 ({dayNames[today.getDay()]})
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {weekend ? '주말 집중 작업' : '평일 업무'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-indigo-600">
                {weeklyStats.completedSessions}
              </div>
              <div className="text-xs text-gray-500">이번주 완료 세션</div>
            </div>
          </div>
        </div>

        {/* 세션 카드들 */}
        <div className="space-y-3">
          {availableSessions.map(([key, session]) => {
            const progress = getSessionProgress(key);
            const sessionTasks = tasks[key] || [];
            const hasClass = !sessionAvailability[key];

            return (
              <div
                key={key}
                className={`bg-white rounded-2xl shadow-lg p-6 ${
                  hasClass ? 'opacity-50' : 'cursor-pointer hover:shadow-xl transition-shadow'
                }`}
                onClick={() => !hasClass && setSelectedSession(key)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{session.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {session.name}
                      </h3>
                      <p className="text-sm text-gray-500">{session.time}</p>
                    </div>
                  </div>
                  {hasClass && (
                    <span className="bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full">
                      수업
                    </span>
                  )}
                </div>

                {/* 진행률 바 */}
                {sessionTasks.length > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">
                        {sessionTasks.filter(t => t.completed).length}/{sessionTasks.length} 완료
                      </span>
                      <span className="font-semibold text-indigo-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* 태스크 미리보기 */}
                {sessionTasks.length > 0 ? (
                  <div className="space-y-2">
                    {sessionTasks.slice(0, 3).map((task, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <span className={task.completed ? '✅' : '⬜'} />
                        <span className={task.completed ? 'line-through text-gray-400' : 'text-gray-700'}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                    {sessionTasks.length > 3 && (
                      <p className="text-xs text-gray-400 ml-6">
                        +{sessionTasks.length - 3}개 더...
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSession(key);
                      setCurrentView('addTask');
                    }}
                  >
                    + 할 일 추가하기
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* 하단 통계 */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-800 mb-4">이번주 활동</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {Math.round(weeklyStats.totalHours)}h
              </div>
              <div className="text-xs text-gray-500">총 작업 시간</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(weeklyStats.byArea).length}
              </div>
              <div className="text-xs text-gray-500">진행 중 프로젝트</div>
            </div>
          </div>
        </div>

        {/* 하단 네비게이션 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex justify-around max-w-lg mx-auto">
            <button className="flex flex-col items-center text-indigo-600">
              <span className="text-2xl">🏠</span>
              <span className="text-xs mt-1">홈</span>
            </button>
            <button
              className="flex flex-col items-center text-gray-400"
              onClick={() => setCurrentView('projects')}
            >
              <span className="text-2xl">📊</span>
              <span className="text-xs mt-1">프로젝트</span>
            </button>
            <button
              className="flex flex-col items-center text-gray-400"
              onClick={() => setCurrentView('stats')}
            >
              <span className="text-2xl">📈</span>
              <span className="text-xs mt-1">통계</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 세션 상세 화면
  const SessionView = () => {
    if (!selectedSession) return null;
    
    const session = SESSIONS[selectedSession];
    const sessionTasks = tasks[selectedSession] || [];
    const progress = getSessionProgress(selectedSession);

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => {
              setSelectedSession(null);
              setCurrentView('home');
              setIsWorking(false);
              setSessionTime(0);
            }}
            className="text-2xl"
          >
            ←
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {session.icon} {session.name}
            </h2>
            <p className="text-sm text-gray-500">{session.time}</p>
          </div>
        </div>

        {/* 타이머 */}
        {isWorking ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">
            <div className="text-6xl font-bold text-indigo-600 mb-4">
              {formatTime(sessionTime)}
            </div>
            <div className="text-sm text-gray-500 mb-6">
              목표: {session.duration}분
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsWorking(false)}
                className="flex-1 py-3 bg-amber-500 text-white rounded-lg font-semibold"
              >
                ⏸️ 일시정지
              </button>
              <button
                onClick={() => {
                  setIsWorking(false);
                  setSessionTime(0);
                  setWeeklyStats(prev => ({
                    ...prev,
                    completedSessions: prev.completedSessions + 1,
                    totalHours: prev.totalHours + (sessionTime / 3600)
                  }));
                }}
                className="flex-1 py-3 bg-green-500 text-white rounded-lg font-semibold"
              >
                ✅ 완료
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsWorking(true)}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl shadow-lg p-8 mb-6 text-center"
          >
            <div className="text-4xl mb-2">▶️</div>
            <div className="text-xl font-bold">세션 시작하기</div>
          </button>
        )}

        {/* 진행률 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold text-gray-800">오늘 진행률</span>
            <span className="text-2xl font-bold text-indigo-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 태스크 리스트 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">할 일 목록</h3>
            <button
              onClick={() => setCurrentView('addTask')}
              className="text-indigo-600 text-sm font-semibold"
            >
              + 추가
            </button>
          </div>
          
          {sessionTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📝</div>
              <p>할 일을 추가해보세요</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessionTasks.map((task, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
                  onClick={() => {
                    const newTasks = { ...tasks };
                    newTasks[selectedSession][idx].completed = !task.completed;
                    setTasks(newTasks);
                  }}
                >
                  <span className="text-2xl">{task.completed ? '✅' : '⬜'}</span>
                  <div className="flex-1">
                    <div className={`font-semibold ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-600">
                        {WORK_AREAS[task.area].icon} {WORK_AREAS[task.area].name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 태스크 추가 화면
  const AddTaskView = () => {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [selectedArea, setSelectedArea] = useState('lecture');

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setCurrentView(selectedSession ? 'session' : 'home')}
            className="text-2xl"
          >
            ←
          </button>
          <h2 className="text-xl font-bold text-gray-800">새 할 일 추가</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            업무 영역 선택
          </label>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {Object.entries(WORK_AREAS).map(([key, area]) => (
              <button
                key={key}
                onClick={() => setSelectedArea(key)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedArea === key
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="text-3xl mb-1">{area.icon}</div>
                <div className="text-sm font-semibold text-gray-800">{area.name}</div>
              </button>
            ))}
          </div>

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            할 일 내용
          </label>
          <textarea
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="예: 건축법규 3장 슬라이드 작성"
            className="w-full p-4 border-2 border-gray-200 rounded-lg resize-none focus:border-indigo-500 focus:outline-none"
            rows="3"
          />
        </div>

        <button
          onClick={() => {
            if (newTaskTitle.trim() && selectedSession) {
              const newTasks = { ...tasks };
              if (!newTasks[selectedSession]) {
                newTasks[selectedSession] = [];
              }
              newTasks[selectedSession].push({
                title: newTaskTitle,
                area: selectedArea,
                completed: false
              });
              setTasks(newTasks);
              setNewTaskTitle('');
              setCurrentView('session');
            }
          }}
          disabled={!newTaskTitle.trim()}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-bold disabled:opacity-50"
        >
          추가하기
        </button>
      </div>
    );
  };

  // 프로젝트 뷰
  const ProjectsView = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">📊 진행 중 프로젝트</h2>
          <button onClick={() => setCurrentView('home')} className="text-2xl">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {Object.entries(WORK_AREAS).map(([key, area]) => {
            const areaTasks = Object.values(tasks)
              .flat()
              .filter(t => t.area === key);
            const completed = areaTasks.filter(t => t.completed).length;
            const total = areaTasks.length;

            if (total === 0) return null;

            return (
              <div key={key} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{area.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{area.name}</h3>
                    <p className="text-sm text-gray-500">
                      {completed}/{total} 완료
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {total > 0 ? Math.round((completed / total) * 100) : 0}%
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-${area.color}-500 h-2 rounded-full transition-all`}
                    style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 통계 뷰
  const StatsView = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">📈 나의 통계</h2>
          <button onClick={() => setCurrentView('home')} className="text-2xl">
            ✕
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <h3 className="font-bold text-gray-800 mb-4">이번주 성과</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {weeklyStats.completedSessions}
              </div>
              <div className="text-sm text-gray-500">완료한 세션</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {Math.round(weeklyStats.totalHours)}h
              </div>
              <div className="text-sm text-gray-500">총 작업 시간</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-800 mb-4">영역별 집중도</h3>
          {Object.entries(WORK_AREAS).map(([key, area]) => {
            const hours = weeklyStats.byArea[key] || 0;
            return (
              <div key={key} className="mb-4 last:mb-0">
                <div className="flex justify-between text-sm mb-2">
                  <span>{area.icon} {area.name}</span>
                  <span className="font-semibold">{Math.round(hours)}h</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-${area.color}-500 h-2 rounded-full`}
                    style={{ width: `${(hours / (weeklyStats.totalHours || 1)) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 현재 뷰 렌더링
  if (currentView === 'session' && selectedSession) {
    return <SessionView />;
  }
  if (currentView === 'addTask') {
    return <AddTaskView />;
  }
  if (currentView === 'projects') {
    return <ProjectsView />;
  }
  if (currentView === 'stats') {
    return <StatsView />;
  }
  return <HomeView />;
}
