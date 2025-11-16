
type SDGGoal = {
	title: string;
	color: string;
	description: string;
	exampleTasks: string[];
};
const sdgGoals: SDGGoal[] = [
	{
		title: 'No Poverty',
		color: '#e5243b',
		description: 'End poverty in all its forms everywhere.',
		exampleTasks: ['Donate unused items', 'Support local shelters', 'Volunteer for poverty relief']
	},
	{
		title: 'Zero Hunger',
		color: '#dda63a',
		description: 'End hunger, achieve food security and improved nutrition.',
		exampleTasks: ['Reduce food waste', 'Support food banks', 'Grow your own food']
	},
	{
		title: 'Good Health and Well-being',
		color: '#4c9f38',
		description: 'Ensure healthy lives and promote well-being for all at all ages.',
		exampleTasks: ['Exercise regularly', 'Promote mental health', 'Participate in health drives']
	},
	{
		title: 'Quality Education',
		color: '#c5192d',
		description: 'Ensure inclusive and equitable quality education.',
		exampleTasks: ['Tutor someone', 'Donate books', 'Support education charities']
	},
	{
		title: 'Gender Equality',
		color: '#ff3a21',
		description: 'Achieve gender equality and empower all women and girls.',
		exampleTasks: ['Support women-led businesses', 'Promote equality', 'Educate about gender bias']
	},
	{
		title: 'Clean Water and Sanitation',
		color: '#26bde2',
		description: 'Ensure availability and sustainable management of water.',
		exampleTasks: ['Conserve water', 'Participate in cleanups', 'Educate about water conservation']
	},
	{
		title: 'Affordable and Clean Energy',
		color: '#fcc30b',
		description: 'Ensure access to affordable, reliable, sustainable energy.',
		exampleTasks: ['Switch to LED bulbs', 'Support renewables', 'Reduce energy use']
	},
	{
		title: 'Decent Work and Economic Growth',
		color: '#a21942',
		description: 'Promote sustained, inclusive and sustainable economic growth.',
		exampleTasks: ['Support fair trade', 'Promote workplace safety', 'Encourage innovation']
	},
	{
		title: 'Industry, Innovation and Infrastructure',
		color: '#fd6925',
		description: 'Build resilient infrastructure, promote sustainable industrialization.',
		exampleTasks: ['Support local businesses', 'Promote STEM', 'Advocate for green tech']
	},
	{
		title: 'Reduced Inequalities',
		color: '#dd1367',
		description: 'Reduce inequality within and among countries.',
		exampleTasks: ['Promote inclusivity', 'Support marginalized groups', 'Educate about inequality']
	},
	{
		title: 'Sustainable Cities and Communities',
		color: '#fd9d24',
		description: 'Make cities and human settlements inclusive, safe, resilient and sustainable.',
		exampleTasks: ['Use public transport', 'Support green spaces', 'Reduce waste']
	},
	{
		title: 'Responsible Consumption and Production',
		color: '#bf8b2e',
		description: 'Ensure sustainable consumption and production patterns.',
		exampleTasks: ['Recycle', 'Buy local', 'Reduce single-use plastics']
	},
	{
		title: 'Climate Action',
		color: '#3f7e44',
		description: 'Take urgent action to combat climate change and its impacts.',
		exampleTasks: ['Plant trees', 'Reduce carbon footprint', 'Advocate for climate policy']
	},
	{
		title: 'Life Below Water',
		color: '#0a97d9',
		description: 'Conserve and sustainably use the oceans, seas and marine resources.',
		exampleTasks: ['Participate in beach cleanups', 'Reduce plastic use', 'Support marine conservation']
	},
	{
		title: 'Life on Land',
		color: '#56c02b',
		description: 'Protect, restore and promote sustainable use of terrestrial ecosystems.',
		exampleTasks: ['Support reforestation', 'Protect wildlife', 'Reduce paper use']
	},
	{
		title: 'Peace, Justice and Strong Institutions',
		color: '#00689d',
		description: 'Promote peaceful and inclusive societies for sustainable development.',
		exampleTasks: ['Promote justice', 'Support anti-corruption', 'Educate about rights']
	},
	{
		title: 'Partnerships for the Goals',
		color: '#19486a',
		description: 'Strengthen the means of implementation and revitalize the global partnership.',
		exampleTasks: ['Collaborate for change', 'Support global causes', 'Share knowledge']
	}
];

import { AlignCenter, AlignJustify } from 'lucide-react';
import { useState } from 'react';

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
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const cx = 300, cy = 300, r = 300; // bigger wheel
	const wedgeCount = sdgGoals.length;
	const anglePerWedge = 360 / wedgeCount;
	return (
		<div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
			<h1 style={{ fontSize: 30, fontWeight: 700, color: '#c1d9ebff', marginBottom: 24, textAlign: 'center' }}>United Nations Sustainable Development Goals Bingo</h1>
			<div style={{ position: 'relative', width: 600, height: 600, marginBottom: 32 }}>
				<svg width={600} height={600} style={{ position: 'absolute', left: 0, top: 0 }}>
					{/* SDG wedges and labels */}
					{sdgGoals.map((goal, i) => {
						const startAngle = i * anglePerWedge;
						const endAngle = (i + 1) * anglePerWedge;
						const path = getWedgePath(cx, cy, r, startAngle, endAngle);

						const labelAngle = (startAngle + endAngle) / 2;
						const labelRad = (labelAngle - 90) * (Math.PI / 180);
						// If label is on the left side (angle between 100 and 260), push it much further out and reduce font size
						let labelR = r * 0.82;
						let fontSize = 13;
						if (labelAngle > 100 && labelAngle < 260) {
							labelR = r * 0.82;
							AlignJustify
							AlignCenter
							fontSize = 13;
						}
						const labelX = cx + labelR * Math.cos(labelRad);
						const labelY = cy + labelR * Math.sin(labelRad);

						// Split long titles into two lines
						const words = goal.title.split(' ');
						const line1 = words.slice(0, Math.ceil(words.length / 5)).join(' ');
						const line2 = words.slice(Math.ceil(words.length / 3)).join(' ');

						return (
							<g key={goal.title} style={{ cursor: 'pointer' }} onClick={() => setSelectedIndex(i)}>
								<path d={path} fill={goal.color} stroke="#fff" strokeWidth={2} />
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
					style={{
						position: 'absolute',
						left: 150,
						top: 150,
						width: 300,
						height: 300,
						borderRadius: '50%',
						background: '#acacac05',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						color: 'white',
						fontWeight: 700,
						fontSize: 300,
						zIndex: 2,
						pointerEvents: 'none',
						animation: 'spin 20s linear infinite',
					}}
				>
					🌍
				</div>
			</div>

			{/* Modal stays unchanged */}
			{selectedIndex !== null && (
				<div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setSelectedIndex(null)}>
					<div style={{ background: 'white', borderRadius: 16, padding: 32, minWidth: 320, maxWidth: 400, boxShadow: '0 4px 24px #0003', position: 'relative' }} onClick={e => e.stopPropagation()}>
						<button style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#122f44ff' }} onClick={() => setSelectedIndex(null)}>&times;</button>
						<h2 style={{ color: sdgGoals[selectedIndex].color, fontWeight: 700, fontSize: 24, marginBottom: 8 }}>{sdgGoals[selectedIndex].title}</h2>
						<p style={{ color: '#252222ff', marginBottom: 16 }}>{sdgGoals[selectedIndex].description}</p>
						<h4 style={{ color: '#336996ff', fontWeight: 600, marginBottom: 8 }}>Example Tasks:</h4>
						<ul style={{ marginBottom: 16 }}>{sdgGoals[selectedIndex].exampleTasks.map((task, idx) => <li key={idx} style={{ color: '#444', marginBottom: 4 }}>{task}</li>)}</ul>
						<form>
							<label style={{ display: 'block', marginBottom: 8 }}>Upload Photo:<input type="file" accept="image/*" style={{ display: 'block', marginTop: 4 }} /></label>
							<label style={{ display: 'block', marginBottom: 8 }}>What did you do? How did it help the environment?<textarea required style={{ width: '100%', minHeight: 60, marginTop: 4, borderRadius: 6, border: '1px solid #ccc', padding: 6 }} /></label>
							<button type="submit" style={{ background: sdgGoals[selectedIndex].color, color: 'white', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 16 }}>Submit Task</button>
						</form>
					</div>
				</div>
			)}

			{/* CSS for rotating Earth */}
			<style>
				{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
			</style>
		</div>
	);
};

export default Bingo;
