import { MockTest, ChartData, WritingContent } from '../types';

// Mock tests are JSON files dropped into src/data/mockTests/ — either the
// hand-authored ones in the repo or output from scripts/generate-mock-tests.mjs.
// They're code-split by Vite and only fetched when the Mock Tests section opens.
const testModules = import.meta.glob('../data/mockTests/*.json');

let cache: MockTest[] | null = null;

export async function loadMockTests(): Promise<MockTest[]> {
  if (cache) return cache;
  const tests = await Promise.all(
    Object.values(testModules).map(async (load) => {
      const mod = (await load()) as { default: MockTest };
      return mod.default;
    })
  );
  cache = tests.sort((a, b) => a.id.localeCompare(b.id));
  return cache;
}

/** Builds the Task 1 chart image URL from the test's chart data (QuickChart). */
export function buildWritingContent(writing: MockTest['writing']): WritingContent {
  return {
    task1: {
      prompt: writing.task1.prompt,
      chartData: writing.task1.chartData,
      imageUrl: chartUrl(writing.task1.chartData),
    },
    task2: writing.task2,
  };
}

const PALETTE = ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

function chartUrl(chart: ChartData): string {
  const config = {
    type: chart.type,
    data: {
      labels: chart.labels,
      datasets: chart.datasets.map((dataset, index) => ({
        ...dataset,
        backgroundColor: chart.type === 'pie' ? PALETTE : PALETTE[index % PALETTE.length],
        borderColor: chart.type === 'line' ? PALETTE[index % PALETTE.length] : undefined,
        fill: chart.type === 'line' ? false : undefined,
      })),
    },
    options: {
      plugins: {
        title: { display: true, text: chart.title, font: { size: 14 } },
        legend: { display: chart.datasets.length > 1, position: 'bottom' },
      },
      scales: chart.type !== 'pie' ? { y: { beginAtZero: true } } : undefined,
    },
  };
  return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(config))}&width=700&height=450&backgroundColor=white`;
}
