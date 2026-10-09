// 1월~6월 매출 예시 데이터 (단위: 원)
const SALES_DATA = [
  { month: "1월", sales: 42000000 },
  { month: "2월", sales: 38500000 },
  { month: "3월", sales: 51000000 },
  { month: "4월", sales: 47500000 },
  { month: "5월", sales: 60000000 },
  { month: "6월", sales: 55500000 },
];

function formatWon(value) {
  return value.toLocaleString("ko-KR") + "원";
}

function renderTable(data) {
  const tbody = document.querySelector("#salesTable tbody");
  let total = 0;
  let prevSales = null;

  data.forEach(({ month, sales }) => {
    total += sales;

    const row = document.createElement("tr");

    const monthCell = document.createElement("td");
    monthCell.textContent = month;

    const salesCell = document.createElement("td");
    salesCell.textContent = formatWon(sales);

    const changeCell = document.createElement("td");
    if (prevSales === null) {
      changeCell.textContent = "-";
    } else {
      const diffRate = ((sales - prevSales) / prevSales) * 100;
      const sign = diffRate >= 0 ? "+" : "";
      changeCell.textContent = `${sign}${diffRate.toFixed(1)}%`;
      changeCell.classList.add(diffRate >= 0 ? "up" : "down");
    }

    row.append(monthCell, salesCell, changeCell);
    tbody.appendChild(row);

    prevSales = sales;
  });

  document.getElementById("totalSales").textContent = formatWon(total);
}

// 외부 차트 라이브러리 없이 canvas API로 막대그래프를 직접 그린다.
// width/height는 CSS(논리) 픽셀 기준이며, 고해상도 대응은 호출 전 ctx.scale()로 처리한다.
function drawBarChart(canvas, data, width, height) {
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, width, height);

  const padding = { top: 30, right: 20, bottom: 40, left: 90 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxSales = Math.max(...data.map((d) => d.sales));
  const niceMax = Math.ceil(maxSales / 10000000) * 10000000;

  // 배경 격자선과 y축 라벨 (0 ~ niceMax, 5단계)
  const steps = 5;
  ctx.strokeStyle = "#e2e4e9";
  ctx.fillStyle = "#6b7280";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (let i = 0; i <= steps; i++) {
    const value = (niceMax / steps) * i;
    const y = padding.top + chartHeight - (chartHeight * i) / steps;

    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    const label = (value / 10000).toLocaleString("ko-KR") + "만원";
    ctx.fillText(label, padding.left - 10, y);
  }

  // 막대
  const barCount = data.length;
  const slotWidth = chartWidth / barCount;
  const barWidth = slotWidth * 0.55;

  ctx.textAlign = "center";

  data.forEach((d, i) => {
    const barHeight = (d.sales / niceMax) * chartHeight;
    const x = padding.left + slotWidth * i + (slotWidth - barWidth) / 2;
    const y = padding.top + chartHeight - barHeight;

    ctx.fillStyle = "#2a78d6";
    ctx.fillRect(x, y, barWidth, barHeight);

    // 막대 위 값 라벨
    ctx.fillStyle = "#1a1d29";
    ctx.font = "12px sans-serif";
    ctx.textBaseline = "bottom";
    ctx.fillText((d.sales / 10000).toLocaleString("ko-KR") + "만원", x + barWidth / 2, y - 6);

    // x축 월 라벨
    ctx.fillStyle = "#1a1d29";
    ctx.font = "13px sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText(d.month, x + barWidth / 2, padding.top + chartHeight + 10);
  });

  // x축, y축 선
  ctx.strokeStyle = "#c9cdd6";
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, padding.top + chartHeight);
  ctx.lineTo(width - padding.right, padding.top + chartHeight);
  ctx.stroke();
}

function init() {
  renderTable(SALES_DATA);

  const canvas = document.getElementById("salesChart");
  // 고해상도 화면에서도 선명하게 보이도록 devicePixelRatio를 반영한다.
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.width;
  const cssHeight = canvas.height;
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  canvas.style.width = cssWidth + "px";
  canvas.style.height = cssHeight + "px";
  canvas.getContext("2d").scale(dpr, dpr);

  drawBarChart(canvas, SALES_DATA, cssWidth, cssHeight);
}

document.addEventListener("DOMContentLoaded", init);
