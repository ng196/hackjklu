import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export default function ChartWrapper({ title, labels, values }) {
  const data = {
    labels,
    datasets: [
      {
        label: "Spending",
        data: values,
        borderColor: "#10B981",
        backgroundColor: "rgba(16,185,129,0.2)",
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(148,163,184,0.2)" },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-lg font-bold text-slate-900 mb-4">{title}</h2>
      <Line data={data} options={options} />
    </section>
  );
}
