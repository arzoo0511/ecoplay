import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Award, Upload, X, CheckCircle } from 'lucide-react';

type SDGGoal = {
    title: string;
    color: string;
    description: string;
    exampleTasks: string[];
    points: number;
    completed?: boolean;
};

const sdgGoals: SDGGoal[] = [
    {
        title: 'No Poverty',
        color: '#e5243b',
        description: 'End poverty in all its forms everywhere.',
        exampleTasks: ['Donate unused items', 'Support local shelters', 'Volunteer for poverty relief'],
        points: 50
    },
    {
        title: 'Zero Hunger',
        color: '#dda63a',
        description: 'End hunger, achieve food security and improved nutrition.',
        exampleTasks: ['Reduce food waste', 'Support food banks', 'Grow your own food'],
        points: 60
    },
    {
        title: 'Good Health and Well-being',
        color: '#4c9f38',
        description: 'Ensure healthy lives and promote well-being for all at all ages.',
        exampleTasks: ['Exercise regularly', 'Promote mental health', 'Participate in health drives'],
        points: 40
    },
    {
        title: 'Quality Education',
        color: '#c5192d',
        description: 'Ensure inclusive and equitable quality education.',
        exampleTasks: ['Tutor someone', 'Donate books', 'Support education charities'],
        points: 55
    },
    {
        title: 'Gender Equality',
        color: '#ff3a21',
        description: 'Achieve gender equality and empower all women and girls.',
        exampleTasks: ['Support women-led businesses', 'Promote equality', 'Educate about gender bias'],
        points: 50
    },
    {
        title: 'Clean Water and Sanitation',
        color: '#26bde2',
        description: 'Ensure availability and sustainable management of water.',
        exampleTasks: ['Conserve water', 'Participate in cleanups', 'Educate about water conservation'],
        points: 70
    },
    {
        title: 'Affordable and Clean Energy',
        color: '#fcc30b',
        description: 'Ensure access to affordable, reliable, sustainable energy.',
        exampleTasks: ['Switch to LED bulbs', 'Support renewables', 'Reduce energy use'],
        points: 80
    },
    {
        title: 'Decent Work and Economic Growth',
        color: '#a21942',
        description: 'Promote sustained, inclusive and sustainable economic growth.',
        exampleTasks: ['Support fair trade', 'Promote workplace safety', 'Encourage innovation'],
        points: 45
    },
    {
        title: 'Industry, Innovation and Infrastructure',
        color: '#fd6925',
        description: 'Build resilient infrastructure, promote sustainable industrialization.',
        exampleTasks: ['Support local businesses', 'Promote STEM', 'Advocate for green tech'],
        points: 65
    },
    {
        title: 'Reduced Inequalities',
        color: '#dd1367',
        description: 'Reduce inequality within and among countries.',
        exampleTasks: ['Promote inclusivity', 'Support marginalized groups', 'Educate about inequality'],
        points: 55
    },
    {
        title: 'Sustainable Cities and Communities',
        color: '#fd9d24',
        description: 'Make cities and human settlements inclusive, safe, resilient and sustainable.',
        exampleTasks: ['Use public transport', 'Support green spaces', 'Reduce waste'],
        points: 75
    },
    {
        title: 'Responsible Consumption and Production',
        color: '#bf8b2e',
        description: 'Ensure sustainable consumption and production patterns.',
        exampleTasks: ['Recycle', 'Buy local', 'Reduce single-use plastics'],
        points: 70
    },
    {
        title: 'Climate Action',
        color: '#3f7e44',
        description: 'Take urgent action to combat climate change and its impacts.',
        exampleTasks: ['Plant trees', 'Reduce carbon footprint', 'Advocate for climate policy'],
        points: 100
    },
    {
        title: 'Life Below Water',
        color: '#0a97d9',
        description: 'Conserve and sustainably use the oceans, seas and marine resources.',
        exampleTasks: ['Participate in beach cleanups', 'Reduce plastic use', 'Support marine conservation'],
        points: 85
    },
    {
        title: 'Life on Land',
        color: '#56c02b',
        description: 'Protect, restore and promote sustainable use of terrestrial ecosystems.',
        exampleTasks: ['Support reforestation', 'Protect wildlife', 'Reduce paper use'],
        points: 80
    },
    {
        title: 'Peace, Justice and Strong Institutions',
        color: '#00689d',
        description: 'Promote peaceful and inclusive societies for sustainable development.',
        exampleTasks: ['Promote justice', 'Support anti-corruption', 'Educate about rights'],
        points: 60
    },
    {
        title: 'Partnerships for the Goals',
        color: '#19486a',
        description: 'Strengthen the means of implementation and revitalize the global partnership.',
        exampleTasks: ['Collaborate for change', 'Support global causes', 'Share knowledge'],
        points: 90
    }
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

const Bingo = () => {
    const { dispatch } = useGame();
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [completedGoals, setCompletedGoals] = useState<Set<number>>(new Set());
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const cx = 300, cy = 300, r = 300;
    const wedgeCount = sdgGoals.length;
    const anglePerWedge = 360 / wedgeCount;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedIndex === null) return;
        
        setSubmitting(true);

        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const goal = sdgGoals[selectedIndex];
        
        // Award points
        dispatch({ type: 'ADD_POINTS', payload: goal.points });
        
        // Mark as completed
        setCompletedGoals(prev => new Set(prev).add(selectedIndex));
        
        // Reset form
        setPhotoFile(null);
        setDescription('');
        setSubmitting(false);
        setSelectedIndex(null);
    };

    const totalPoints = Array.from(completedGoals).reduce((sum, idx) => sum + sdgGoals[idx].points, 0);
    const completedCount = completedGoals.size;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen p-4 sm:p-6 lg:p-8"
        >
            <div className="text-center mb-8">
                <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
                    🌍 UN Sustainable Development Goals Bingo
                </h1>
                <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-6">
                    Complete tasks aligned with the UN's 17 Sustainable Development Goals. Click any goal to get started!
                </p>

                {/* Progress Stats */}
                <div className="flex justify-center gap-6 mb-8">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl px-6 py-3 border border-white/20">
                        <div className="text-2xl font-bold text-green-400">{completedCount}/17</div>
                        <div className="text-sm text-blue-100">Goals Completed</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl px-6 py-3 border border-white/20">
                        <div className="text-2xl font-bold text-yellow-400">{totalPoints.toLocaleString()}</div>
                        <div className="text-sm text-blue-100">Total Points Earned</div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mb-8">
                <div className="relative" style={{ width: 600, height: 600 }}>
                    <svg width={600} height={600} className="absolute left-0 top-0">
                        {sdgGoals.map((goal, i) => {
                            const startAngle = i * anglePerWedge;
                            const endAngle = (i + 1) * anglePerWedge;
                            const path = getWedgePath(cx, cy, r, startAngle, endAngle);
                            const isCompleted = completedGoals.has(i);

                            const labelAngle = (startAngle + endAngle) / 2;
                            const labelRad = (labelAngle - 90) * (Math.PI / 180);
                            let labelR = r * 0.82;
                            let fontSize = 13;
                            if (labelAngle > 100 && labelAngle < 260) {
                                labelR = r * 0.82;
                                fontSize = 13;
                            }
                            const labelX = cx + labelR * Math.cos(labelRad);
                            const labelY = cy + labelR * Math.sin(labelRad);

                            const words = goal.title.split(' ');
                            const line1 = words.slice(0, Math.ceil(words.length / 5)).join(' ');
                            const line2 = words.slice(Math.ceil(words.length / 3)).join(' ');

                            return (
                                <g 
                                    key={goal.title} 
                                    style={{ cursor: 'pointer' }} 
                                    onClick={() => setSelectedIndex(i)}
                                    opacity={isCompleted ? 0.6 : 1}
                                >
                                    <path d={path} fill={goal.color} stroke="#fff" strokeWidth={2} />
                                    {isCompleted && (
                                        <>
                                            <path d={path} fill="#00ff00" fillOpacity={0.3} />
                                            <text
                                                x={cx + (labelR - 60) * Math.cos(labelRad)}
                                                y={cy + (labelR - 60) * Math.sin(labelRad)}
                                                textAnchor="middle"
                                                fontSize={32}
                                                style={{ pointerEvents: 'none' }}
                                            >
                                                ✓
                                            </text>
                                        </>
                                    )}
                                    <text
                                        x={labelX}
                                        y={labelY - 9}
                                        textAnchor="middle"
                                        alignmentBaseline="middle"
                                        fontSize={fontSize}
                                        fontWeight={700}
                                        fill={getContrastColor(goal.color)}
                                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                                    >
                                        {line1}
                                    </text>
                                    {line2.length > 0 && (
                                        <text
                                            x={labelX}
                                            y={labelY + 10}
                                            textAnchor="middle"
                                            alignmentBaseline="middle"
                                            fontSize={fontSize}
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
                    </svg>

                    {/* Rotating Earth */}
                    <div
                        className="absolute"
                        style={{
                            left: 150,
                            top: 150,
                            width: 300,
                            height: 300,
                            borderRadius: '50%',
                            background: '#acacac05',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 300,
                            zIndex: 2,
                            pointerEvents: 'none',
                            animation: 'spin 20s linear infinite',
                        }}
                    >
                        🌍
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {selectedIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={() => setSelectedIndex(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedIndex(null)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            {completedGoals.has(selectedIndex) && (
                                <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg flex items-center text-green-700">
                                    <CheckCircle className="h-5 w-5 mr-2" />
                                    <span className="font-semibold">Goal Completed!</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-4">
                                <h2 
                                    className="text-3xl font-bold" 
                                    style={{ color: sdgGoals[selectedIndex].color }}
                                >
                                    {sdgGoals[selectedIndex].title}
                                </h2>
                                <div className="flex items-center bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                                    <Award className="h-4 w-4 mr-1" />
                                    <span className="font-bold">{sdgGoals[selectedIndex].points} pts</span>
                                </div>
                            </div>

                            <p className="text-gray-700 mb-6">{sdgGoals[selectedIndex].description}</p>

                            <h4 className="text-lg font-semibold text-gray-800 mb-3">Example Tasks:</h4>
                            <ul className="mb-6 space-y-2">
                                {sdgGoals[selectedIndex].exampleTasks.map((task, idx) => (
                                    <li key={idx} className="text-gray-600 flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>{task}</span>
                                    </li>
                                ))}
                            </ul>

                            {!completedGoals.has(selectedIndex) ? (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Upload Photo (Optional):
                                        </label>
                                        <div className="flex items-center justify-center w-full">
                                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                                    <p className="text-sm text-gray-500">
                                                        {photoFile ? photoFile.name : 'Click to upload'}
                                                    </p>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            What did you do? How did it help the environment? *
                                        </label>
                                        <textarea
                                            required
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full min-h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Describe your action..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ backgroundColor: sdgGoals[selectedIndex].color }}
                                    >
                                        {submitting ? 'Submitting...' : `Submit Task & Earn ${sdgGoals[selectedIndex].points} Points`}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center py-8">
                                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                    <p className="text-lg font-semibold text-gray-700 mb-2">
                                        You've already completed this goal!
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Earned {sdgGoals[selectedIndex].points} points
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>
                {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
            </style>
        </motion.div>
    );
};

export default Bingo;
