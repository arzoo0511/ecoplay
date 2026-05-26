import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Award, X, CheckCircle, Trophy, Target, Zap } from 'lucide-react';
import { dbFunctions } from '../lib/supabase';
import { addPendingWrite } from '../lib/offline/offlineStore';
import { safeSupabase } from '../lib/supabaseClient';

type SDGGoal = {
    title: string;
    color: string;
    description: string;
    missions: string[];
    points: number;
};

type CompletionState = {
    [goalIndex: number]: {
        tasks: [boolean, boolean, boolean];
    };
};

const sdgGoals: SDGGoal[] = [
    {
        title: 'No Poverty',
        color: '#e5243b',
        description: 'End poverty in all its forms everywhere.',
        missions: [
            'Closet Cleanout: Find 10 items you haven\'t worn in 6 months and donate them to a local shelter',
            'Budget Buddy: Help a friend or family member create a simple monthly savings plan',
            'Street Smarts: Research 3 local organizations fighting poverty and share their work on social media'
        ],
        points: 50
    },
    {
        title: 'Zero Hunger',
        color: '#dda63a',
        description: 'End hunger, achieve food security and improved nutrition.',
        missions: [
            'Leftover Chef: Cook a complete meal using ONLY leftovers from your fridge — no new ingredients',
            'Seed Starter: Plant 3 herbs or vegetables in pots at home and document their growth for a week',
            'Food Rescue: Map 3 food banks or community fridges near you and volunteer at one'
        ],
        points: 60
    },
    {
        title: 'Good Health and Well-being',
        color: '#4c9f38',
        description: 'Ensure healthy lives and promote well-being for all at all ages.',
        missions: [
            'Step Quest: Hit 10,000 steps in one day and track your route on a map',
            'Mindful Minutes: Complete a 7-day streak of 10-minute meditation sessions',
            'Health Hero: Organize a mini wellness session for 3+ friends — stretching, breathing, or yoga'
        ],
        points: 40
    },
    {
        title: 'Quality Education',
        color: '#c5192d',
        description: 'Ensure inclusive and equitable quality education.',
        missions: [
            'Knowledge Swap: Teach someone a skill you know and learn one from them in return',
            'Book Bridge: Collect 5+ books and set up a free mini-library in your neighborhood',
            'Study Buddy: Tutor a younger student for 3 sessions and track their improvement'
        ],
        points: 55
    },
    {
        title: 'Gender Equality',
        color: '#ff3a21',
        description: 'Achieve gender equality and empower all women and girls.',
        missions: [
            'Spotlight Stories: Interview 3 women in your community about their career journeys and share their stories',
            'Equal Shelf: Audit your bookshelf — add 3 books by women or non-binary authors',
            'Bias Detector: Track gender stereotypes you notice in ads for one week and create a report'
        ],
        points: 50
    },
    {
        title: 'Clean Water and Sanitation',
        color: '#26bde2',
        description: 'Ensure availability and sustainable management of water.',
        missions: [
            'Leak Detective: Find and fix 3 water leaks in your home — document before and after',
            'Water Diary: Track your daily water usage for a week and reduce it by 20%',
            'Rain Harvester: Build a simple rainwater collection setup using household items'
        ],
        points: 70
    },
    {
        title: 'Affordable and Clean Energy',
        color: '#fcc30b',
        description: 'Ensure access to affordable, reliable, sustainable energy.',
        missions: [
            'Dark Hour: Go completely electricity-free for 3 hours on a weekend — journal the experience',
            'Energy Audit: Map every energy-consuming device at home and identify the top 5 power hogs',
            'Solar Scout: Research 3 renewable energy projects in your area and visit one if possible'
        ],
        points: 80
    },
    {
        title: 'Decent Work and Economic Growth',
        color: '#a21942',
        description: 'Promote sustained, inclusive and sustainable economic growth.',
        missions: [
            'Fair Finder: Identify 5 fair-trade products at your local store and switch to buying one regularly',
            'Side Hustle Map: Help someone brainstorm 3 realistic income ideas based on their skills',
            'Workspace Wellness: Propose one improvement for a workplace or study space you use daily'
        ],
        points: 45
    },
    {
        title: 'Industry, Innovation and Infrastructure',
        color: '#fd6925',
        description: 'Build resilient infrastructure, promote sustainable industrialization.',
        missions: [
            'Fix-It Friday: Repair something broken at home instead of throwing it away — document the process',
            'App Idea: Design a simple app wireframe that solves a problem in your community',
            'Bridge Builder: Find and photograph 3 pieces of infrastructure in your city and research their history'
        ],
        points: 65
    },
    {
        title: 'Reduced Inequalities',
        color: '#dd1367',
        description: 'Reduce inequality within and among countries.',
        missions: [
            'Perspective Walk: Spend a day navigating your city as if you had a mobility limitation — document barriers',
            'Language Bridge: Learn 10 phrases in a language spoken by a minority community near you',
            'Inclusion Audit: Review a website or app for accessibility issues and write up 3 improvements'
        ],
        points: 55
    },
    {
        title: 'Sustainable Cities and Communities',
        color: '#fd9d24',
        description: 'Make cities and human settlements inclusive, safe, resilient and sustainable.',
        missions: [
            'Transit Challenge: Use only public transport or cycling for an entire week',
            'Green Map: Map 5 green spaces in your neighborhood and rate their accessibility',
            'Noise Detective: Measure noise levels at 5 spots in your city and propose one solution'
        ],
        points: 75
    },
    {
        title: 'Responsible Consumption and Production',
        color: '#bf8b2e',
        description: 'Ensure sustainable consumption and production patterns.',
        missions: [
            'Zero Waste Day: Go an entire day producing zero non-recyclable waste',
            'Packaging Audit: Count the plastic packaging in your weekly groceries and find 5 alternatives',
            'Upcycle Artist: Transform 3 items headed for the trash into something useful or decorative'
        ],
        points: 70
    },
    {
        title: 'Climate Action',
        color: '#3f7e44',
        description: 'Take urgent action to combat climate change and its impacts.',
        missions: [
            'Carbon Tracker: Calculate your carbon footprint for a week using an online tool and set a reduction goal',
            'Tree Guardian: Plant 2 trees or adopt a tree through a local program',
            'Climate Conversation: Have a meaningful conversation about climate change with 3 people outside your circle'
        ],
        points: 100
    },
    {
        title: 'Life Below Water',
        color: '#0a97d9',
        description: 'Conserve and sustainably use the oceans, seas and marine resources.',
        missions: [
            'Beach Patrol: Collect 50 pieces of trash from a beach or riverbank in one session',
            'Seafood Detective: Research which seafood is sustainably sourced in your area and make a guide',
            'Ocean Story: Watch a marine documentary and write a 100-word reflection on what surprised you'
        ],
        points: 85
    },
    {
        title: 'Life on Land',
        color: '#56c02b',
        description: 'Protect, restore and promote sustainable use of terrestrial ecosystems.',
        missions: [
            'Nature Journal: Identify and sketch 10 different plant or animal species in your neighborhood',
            'Pollinator Paradise: Create a small pollinator-friendly garden with at least 3 native plant species',
            'Trail Guardian: Adopt a local trail or park area — do 3 cleanup visits in one month'
        ],
        points: 80
    },
    {
        title: 'Peace, Justice and Strong Institutions',
        color: '#00689d',
        description: 'Promote peaceful and inclusive societies for sustainable development.',
        missions: [
            'Rights Reporter: Research a human rights issue in your country and create a one-page infographic',
            'Conflict Resolver: Mediate or help resolve a disagreement between two people constructively',
            'Democracy in Action: Attend a local council meeting or public hearing and write about the experience'
        ],
        points: 60
    },
    {
        title: 'Partnerships for the Goals',
        color: '#19486a',
        description: 'Strengthen the means of implementation and revitalize the global partnership.',
        missions: [
            'Collab Quest: Partner with someone from a different background to complete one SDG challenge together',
            'Global Pen Pal: Connect with someone in another country and discuss sustainability practices in both cultures',
            'Impact Mapper: Create a visual map showing how 5 local organizations connect to different SDG goals'
        ],
        points: 90
    }
];

const wheelLabels: [string, string | null][] = [
    ['No Poverty', null],
    ['Zero Hunger', null],
    ['Good Health', '& Well-being'],
    ['Quality', 'Education'],
    ['Gender', 'Equality'],
    ['Clean Water', '& Sanitation'],
    ['Clean', 'Energy'],
    ['Decent Work', '& Growth'],
    ['Innovation &', 'Infrastructure'],
    ['Reduced', 'Inequalities'],
    ['Sustainable', 'Cities'],
    ['Responsible', 'Consumption'],
    ['Climate', 'Action'],
    ['Life Below', 'Water'],
    ['Life on', 'Land'],
    ['Peace &', 'Justice'],
    ['Partnerships', 'for Goals'],
];

function getWedgePath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const rad = (deg: number) => (deg - 90) * (Math.PI / 180);
    const x1 = cx + r * Math.cos(rad(startAngle));
    const y1 = cy + r * Math.sin(rad(startAngle));
    const x2 = cx + r * Math.cos(rad(endAngle));
    const y2 = cy + r * Math.sin(rad(endAngle));
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return [`M ${cx} ${cy}`, `L ${x1} ${y1}`, `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`, 'Z'].join(' ');
}

function getContrastColor(hex: string) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 140 ? '#222' : '#fff';
}

const Sparkles = () => (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 10 }, (_, i) => (
            <motion.div
                key={i}
                className="absolute left-1/2 top-1/2 rounded-full"
                style={{
                    width: i % 2 === 0 ? 6 : 4,
                    height: i % 2 === 0 ? 6 : 4,
                    backgroundColor: ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa'][i % 5],
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                    x: Math.cos((i * Math.PI * 2) / 10) * (50 + i * 8),
                    y: Math.sin((i * Math.PI * 2) / 10) * (50 + i * 8),
                    opacity: 0,
                    scale: 0,
                }}
                transition={{ duration: 1, ease: 'easeOut', delay: i * 0.04 }}
            />
        ))}
    </div>
);

const Bingo = () => {
    const { dispatch } = useGame();
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const [completionState, setCompletionState] = useState<CompletionState>({});
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchState = async () => {
            const result = await safeSupabase(async () => {
                const data = await dbFunctions.getBingoProgress();
                return {
                    data,
                    error: null,
                };
            });

            if (result.offline || result.error) {
                console.log('Unable to fetch bingo progress:', result.error ?? 'Network error');
                return;
            }

            setCompletionState((result.data || {}) as CompletionState);
        };
        fetchState();
    }, []);

    useEffect(() => {
        if (selectedIndex === null) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelectedIndex(null);
        };
        document.addEventListener('keydown', handleEscape);

        requestAnimationFrame(() => {
            const modal = modalRef.current;
            if (!modal) return;
            const first = modal.querySelector<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            first?.focus();
        });

        return () => document.removeEventListener('keydown', handleEscape);
    }, [selectedIndex]);

    const handleModalKeyDown = (e: React.KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        const modal = modalRef.current;
        if (!modal) return;

        const focusable = modal.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    };

    const getGoalProgress = (goalIndex: number) => {
        const state = completionState[goalIndex];
        if (!state) return 0;
        return state.tasks.filter(Boolean).length;
    };

    const getEarnedPoints = (goalIndex: number) => {
        const completed = getGoalProgress(goalIndex);
        if (completed === 0) return 0;
        const total = sdgGoals[goalIndex].points;
        if (completed === 3) return total;
        return Math.floor(total * completed / 3);
    };

   const toggleTask = async (goalIndex: number, taskIndex: number) => {
        const goalState = completionState[goalIndex];
        const wasChecked = goalState?.tasks[taskIndex] ?? false;
        const missionId = { goalIndex, taskIndex };
        const newChecked = true;

        if (wasChecked) return; // Mission already completed securely

        const total = sdgGoals[goalIndex].points;
        const taskPoints = taskIndex === 2
            ? total - Math.floor(total / 3) * 2
            : Math.floor(total / 3);
            
        // 1. Optimistic UI updates (Assume success)
        dispatch({ type: 'ADD_POINTS', payload: taskPoints });
        setCompletionState(prev => {
            const prevGoal = prev[goalIndex] || { tasks: [false, false, false] as [boolean, boolean, boolean] };
            const newTasks = [...prevGoal.tasks] as [boolean, boolean, boolean];
            newTasks[taskIndex] = true;
            return { ...prev, [goalIndex]: { tasks: newTasks } };
        });

        // Backend Sync
        const result = await safeSupabase(async () => {
            const data = await dbFunctions.toggleBingoMission(goalIndex, taskIndex);
            return {
                data,
                error: data === null ? { message: 'Unable to sync bingo mission' } : null,
            };
        });

        if (result.offline || result.error) {
            addPendingWrite('bingo', { missionId, newChecked, goalIndex, taskIndex });
            return;
        }

        if (result.data) {
            setCompletionState(result.data as CompletionState);
        }
    };

    const cx = 300, cy = 300, r = 300;
    const anglePerWedge = 360 / sdgGoals.length;

    const totalPoints = Object.keys(completionState).reduce(
        (sum, key) => sum + getEarnedPoints(Number(key)), 0
    );
    const completedCount = Object.keys(completionState).filter(
        key => getGoalProgress(Number(key)) === 3
    ).length;
    const totalTasksCompleted = Object.values(completionState).reduce(
        (sum, state) => sum + state.tasks.filter(Boolean).length, 0
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative min-h-screen px-4 py-6 sm:px-8 sm:py-8 lg:px-16"
        >
            <div
                className="pointer-events-none fixed inset-0 -z-10 opacity-40 dark:opacity-20"
                style={{
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(56,189,248,0.12), rgba(168,85,247,0.10))',
                    backgroundSize: '200% 200%',
                    animation: 'gradientShift 15s ease infinite',
                }}
            />

            <div className="mx-auto max-w-5xl">
                <div className="mb-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-3 text-2xl font-extrabold sm:text-3xl lg:text-5xl"
                    >
                        <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                            SDG Mission Board
                        </span>
                    </motion.h1>
                    <p className="mx-auto mb-8 max-w-2xl text-sm tracking-wide text-gray-500 dark:text-gray-400 sm:text-base">
                        Complete missions aligned with the UN&apos;s 17 Sustainable Development Goals. Click any goal to start your quest!
                    </p>

                    <div className="mx-auto mb-10 max-w-2xl rounded-2xl border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur-md sm:p-6">
                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
                            <div className="flex items-center gap-3">
                                <Trophy className="h-5 w-5 text-emerald-400" />
                                <div className="text-left">
                                    <div className="text-2xl font-extrabold text-emerald-400 sm:text-3xl">
                                        {completedCount}/17
                                    </div>
                                    <div className="text-xs text-gray-400 dark:text-gray-500">Goals Completed</div>
                                </div>
                            </div>
                            <div className="hidden h-8 w-px bg-white/20 sm:block" />
                            <div className="flex items-center gap-3">
                                <Target className="h-5 w-5 text-cyan-400" />
                                <div className="text-left">
                                    <div className="text-2xl font-extrabold text-cyan-400 sm:text-3xl">
                                        {totalTasksCompleted}/51
                                    </div>
                                    <div className="text-xs text-gray-400 dark:text-gray-500">Missions Done</div>
                                </div>
                            </div>
                            <div className="hidden h-8 w-px bg-white/20 sm:block" />
                            <div className="flex items-center gap-3">
                                <Zap className="h-5 w-5 text-yellow-400" />
                                <div className="text-left">
                                    <motion.div
                                        key={totalPoints}
                                        initial={{ scale: 1.3 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                        className="text-2xl font-extrabold text-yellow-400 sm:text-3xl"
                                    >
                                        {totalPoints.toLocaleString()}
                                    </motion.div>
                                    <div className="text-xs text-gray-400 dark:text-gray-500">Points Earned</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-10 flex justify-center">
                    <div className="relative w-[min(600px,90vw)] aspect-square">
                        <svg
                            viewBox="0 0 600 600"
                            className="sdg-wheel absolute inset-0 h-full w-full"
                            role="group"
                            aria-label="SDG Goals wheel. Use Tab to navigate between goals."
                        >
                            <defs>
                                <filter id="wheel-shadow" x="-10%" y="-10%" width="120%" height="120%">
                                    <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.2" />
                                </filter>
                                <radialGradient id="complete-glow">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.08" />
                                </radialGradient>
                            </defs>
                            <g filter="url(#wheel-shadow)">
                                {sdgGoals.map((goal, i) => {
                                    const startAngle = i * anglePerWedge;
                                    const endAngle = (i + 1) * anglePerWedge;
                                    const path = getWedgePath(cx, cy, r, startAngle, endAngle);
                                    const progress = getGoalProgress(i);
                                    const isComplete = progress === 3;
                                    const isFocused = focusedIndex === i;

                                    const labelAngle = (startAngle + endAngle) / 2;
                                    const labelRad = (labelAngle - 90) * (Math.PI / 180);
                                    const labelR = r * 0.78;
                                    const labelX = cx + labelR * Math.cos(labelRad);
                                    const labelY = cy + labelR * Math.sin(labelRad);

                                    const [line1, line2] = wheelLabels[i];
                                    const labelClass = line1.length > 12 || (line2 && line2.length > 12) ? 'wedge-label-sm' : 'wedge-label';

                                    return (
                                        <g
                                            key={goal.title}
                                            tabIndex={0}
                                            role="button"
                                            aria-label={`${goal.title} - ${isComplete ? 'Completed' : progress > 0 ? `${progress} of 3 missions done` : 'Not completed'} - ${goal.points} points`}
                                            className="sdg-wedge"
                                            style={{ cursor: 'pointer', outline: 'none' }}
                                            onClick={() => setSelectedIndex(i)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    setSelectedIndex(i);
                                                }
                                            }}
                                            onFocus={() => setFocusedIndex(i)}
                                            onBlur={() => setFocusedIndex(null)}
                                            opacity={isComplete ? 0.75 : 1}
                                        >
                                            <title>{goal.title}</title>
                                            <path
                                                d={path}
                                                fill={goal.color}
                                                stroke={isFocused ? '#ffd700' : '#fff'}
                                                strokeWidth={isFocused ? 4 : 2}
                                                className="wedge-path"
                                            />
                                            {progress > 0 && (
                                                <path
                                                    d={path}
                                                    fill={isComplete ? 'url(#complete-glow)' : '#00ff00'}
                                                    fillOpacity={isComplete ? 1 : 0.12 * progress}
                                                />
                                            )}
                                            {isComplete && (
                                                <text
                                                    x={cx + (r * 0.55) * Math.cos(labelRad)}
                                                    y={cy + (r * 0.55) * Math.sin(labelRad)}
                                                    textAnchor="middle"
                                                    dominantBaseline="central"
                                                    fontSize={20}
                                                    fontWeight={700}
                                                    fill="#fff"
                                                    style={{ pointerEvents: 'none' }}
                                                >
                                                    &#x2713;
                                                </text>
                                            )}
                                            {progress > 0 && !isComplete && (
                                                <text
                                                    x={cx + (r * 0.55) * Math.cos(labelRad)}
                                                    y={cy + (r * 0.55) * Math.sin(labelRad)}
                                                    textAnchor="middle"
                                                    dominantBaseline="central"
                                                    fontSize={10}
                                                    fontWeight={700}
                                                    fill="#fff"
                                                    style={{ pointerEvents: 'none' }}
                                                >
                                                    {progress}/3
                                                </text>
                                            )}
                                            <text
                                                x={labelX}
                                                y={line2 ? labelY - 7 : labelY}
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                className={labelClass}
                                                fontWeight={700}
                                                fill={getContrastColor(goal.color)}
                                                style={{ pointerEvents: 'none', userSelect: 'none' }}
                                            >
                                                {line1}
                                            </text>
                                            {line2 && (
                                                <text
                                                    x={labelX}
                                                    y={labelY + 7}
                                                    textAnchor="middle"
                                                    dominantBaseline="central"
                                                    className={labelClass}
                                                    fontWeight={700}
                                                    fill={getContrastColor(goal.color)}
                                                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                                                >
                                                    {line2}
                                                </text>
                                            )}
                                        </g>
                                    );
                                })}
                            </g>
                        </svg>

                        <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ pointerEvents: 'none' }}
                        >
                            <div
                                style={{
                                    width: '45%',
                                    height: '45%',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 'clamp(80px, 25vw, 180px)',
                                    animation: 'spin 20s linear infinite',
                                    filter: 'drop-shadow(0 0 24px rgba(16,185,129,0.3))',
                                }}
                            >
                                &#x1F30D;
                            </div>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {selectedIndex !== null && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6"
                            onClick={() => setSelectedIndex(null)}
                        >
                            <motion.div
                                ref={modalRef}
                                initial={{ scale: 0.85, opacity: 0, y: 30 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="bingo-modal-title"
                                onKeyDown={handleModalKeyDown}
                                className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-white/90 shadow-2xl backdrop-blur-xl dark:bg-gray-900/90 max-h-[90vh] sm:max-h-[85vh]"
                                onClick={e => e.stopPropagation()}
                            >
                                <div
                                    className="h-1"
                                    style={{ backgroundColor: sdgGoals[selectedIndex].color }}
                                />

                                <div className="overflow-y-auto p-6 sm:p-8" style={{ maxHeight: 'calc(90vh - 4px)' }}>
                                    <button
                                        onClick={() => setSelectedIndex(null)}
                                        className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                                        aria-label="Close dialog"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>

                                    {getGoalProgress(selectedIndex) === 3 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="relative mb-4 flex items-center rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                                        >
                                            <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0" />
                                            <span className="font-semibold">All missions completed!</span>
                                            <Sparkles />
                                        </motion.div>
                                    )}

                                    <div className="mb-4 flex items-start justify-between gap-3 pr-8">
                                        <h2
                                            id="bingo-modal-title"
                                            className="text-2xl font-bold sm:text-3xl"
                                            style={{ color: sdgGoals[selectedIndex].color }}
                                        >
                                            {sdgGoals[selectedIndex].title}
                                        </h2>
                                        <div className="flex flex-shrink-0 items-center rounded-full bg-yellow-100 px-3 py-1 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                                            <Award className="mr-1 h-4 w-4" />
                                            <span className="text-sm font-bold">
                                                {getEarnedPoints(selectedIndex)}/{sdgGoals[selectedIndex].points} pts
                                            </span>
                                        </div>
                                    </div>

                                    <p className="mb-5 text-gray-600 dark:text-gray-400">{sdgGoals[selectedIndex].description}</p>

                                    <div className="mb-5">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Mission Progress</span>
                                            <span
                                                className="text-sm font-bold"
                                                style={{ color: sdgGoals[selectedIndex].color }}
                                            >
                                                {getGoalProgress(selectedIndex)}/3 completed
                                            </span>
                                        </div>
                                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                            <motion.div
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: sdgGoals[selectedIndex].color }}
                                                initial={false}
                                                animate={{ width: `${(getGoalProgress(selectedIndex) / 3) * 100}%` }}
                                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                            />
                                        </div>
                                    </div>

                                    <h4 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">Missions:</h4>
                                    <div className="mb-6 space-y-3">
                                        {sdgGoals[selectedIndex].missions.map((mission, taskIdx) => {
                                            const isChecked = completionState[selectedIndex]?.tasks[taskIdx] ?? false;
                                            const colonIdx = mission.indexOf(':');
                                            const missionName = colonIdx > -1 ? mission.slice(0, colonIdx) : '';
                                            const missionDesc = colonIdx > -1 ? mission.slice(colonIdx + 1) : mission;

                                            return (
                                                <motion.label
                                                    key={taskIdx}
                                                    layout
                                                    className={`flex cursor-pointer items-start gap-3 rounded-xl border-l-4 p-3 transition-colors duration-300 ${
                                                        isChecked
                                                            ? 'border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'
                                                            : 'border border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800'
                                                    }`}
                                                    style={{ borderLeftColor: sdgGoals[selectedIndex].color }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleTask(selectedIndex, taskIdx)}
                                                        className="mt-1 h-5 w-5 flex-shrink-0 rounded border-gray-300 accent-green-600 focus:ring-green-500"
                                                    />
                                                    <span className={`text-sm leading-relaxed transition-colors duration-300 ${isChecked ? 'text-gray-400 line-through dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {missionName && (
                                                            <strong className={isChecked ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}>
                                                                {missionName}:
                                                            </strong>
                                                        )}
                                                        {missionDesc}
                                                    </span>
                                                </motion.label>
                                            );
                                        })}
                                    </div>

                                    {getGoalProgress(selectedIndex) === 3 && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="relative py-4 text-center"
                                        >
                                            <CheckCircle className="mx-auto mb-2 h-12 w-12 text-emerald-500" />
                                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                                                Goal Complete &mdash; {sdgGoals[selectedIndex].points} points earned!
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style>
                {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes gradientShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                .wedge-label { font-size: 11px; }
                .wedge-label-sm { font-size: 10px; }
                .sdg-wedge { transition: opacity 0.2s ease; }
                .sdg-wedge:hover .wedge-path { filter: brightness(1.15); }
                .wedge-path { transition: filter 0.2s ease, stroke-width 0.15s ease; }
                @media (max-width: 480px) {
                    .wedge-label { font-size: 9px; }
                    .wedge-label-sm { font-size: 8px; }
                }`}
            </style>
        </motion.div>
    );
};

export default Bingo;
