import { ResponsiveContainer, PieChart, Pie, Cell, Label, Tooltip } from 'recharts';

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
  "#AA336A", "#33AA99", "#FF6666", "#6699FF"
];

export default function MeuGraficoCircular({ paginatedDataGrouped }) {
  const dadosGrafico = paginatedDataGrouped.map(({ atividade, entries }) => ({
    name: atividade,
    pontuacao: entries.reduce((total, entry) => total + Number(entry.points), 0)
  }));

  const totalScore = dadosGrafico.reduce((total, item) => total + item.pontuacao, 0);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={dadosGrafico}
          dataKey="pontuacao"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={70}
          labelLine={false}
        >
          {dadosGrafico.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
          <Label
            value={`${totalScore} pts`}
            position="center"
            fontSize="24"
            fontWeight="bold"
            fill="#333"
          />
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
