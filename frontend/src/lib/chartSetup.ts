import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

/**
 * Chart.js v4 requires explicit component registration (tree-shaking
 * friendly). Imported once, before any chart renders, from each page that
 * uses react-chartjs-2.
 */
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler)
