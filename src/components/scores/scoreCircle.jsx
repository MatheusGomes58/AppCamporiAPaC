import { ResponsiveContainer, PieChart, Pie, Cell, Label } from 'recharts';

const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
    "#AA336A", "#33AA99", "#FF6666", "#6699FF"
];

export default function MeuGraficoCircular({ activityData, totalScore }) {
    return (
        <ResponsiveContainer width="100%" height={250}>
            <PieChart
                isAnimationActive={false}
                cursor="default"
                style={{ pointerEvents: 'none' }}
            >
                <Pie
                    data={activityData}
                    dataKey="pontuacao"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={70}
                    labelLine={false}
                    label
                    activeShape={null}
                >
                    {activityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    <Label
                        value={`${totalScore} Pts`}
                        position="center"
                        fontSize="24"
                        fontWeight="bold"
                        fill="#333"
                    />
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    );
}
