import { ChartData } from "chart.js";
import { Pie } from "react-chartjs-2";

interface IProps {
  chartData: ChartData<"pie", (number | [number, number] | null)[], unknown>;
}

const PieChart = ({ chartData }: IProps) => {
  return (
    <div className="self-center w-1/2">
      <Pie
        data={chartData}
        options={{
          plugins: {
            title: {
              display: true,
              text: "Link impressions for the past 5 days",
            },
            legend: {
              display: false,
            },
          },
        }}
      />
    </div>
  );
};

export default PieChart;