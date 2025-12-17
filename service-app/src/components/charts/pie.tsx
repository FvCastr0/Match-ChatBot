import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../ui/card";
import { ChartConfig } from "../ui/chart";

const chartConfig = {
  value: { label: "Atendimentos" }
} satisfies ChartConfig;

const chartData = [
  { name: "Automático", value: 275, fill: "red" },
  { name: "Humano", value: 200, fill: "salmon" }
];

export default function PieChartVariable() {
  return (
    <Card className="h-full ">
      <CardHeader>
        <CardTitle>Taxa de autoatendimento/Chats iniciados</CardTitle>
        <CardDescription>
          Comparativo entre atendimento humano e automático
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-80"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie data={chartData} dataKey="value" nameKey="name" />
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="text-sm text-muted-foreground">
        Quanto maior o autoatendimento, menor a necessidade de intervenção
        humana.
      </CardFooter>
    </Card>
  );
}
