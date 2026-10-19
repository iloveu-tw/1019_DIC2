/**
 * 50 Startups Interactive Linear Regression Application
 * Inspired by interactive-ml.com with D3.js real-time manipulation & error calculation
 */

// ==============================================================================
// 50 Startups Real Dataset (Kaggle)
// ==============================================================================
const RAW_STARTUPS_DATA = [
  {"rd": 165349.2, "admin": 136897.8, "marketing": 471784.1, "state": "New York", "profit": 192261.83},
  {"rd": 162597.7, "admin": 151377.59, "marketing": 443898.53, "state": "California", "profit": 191792.06},
  {"rd": 153441.51, "admin": 101145.55, "marketing": 407934.54, "state": "Florida", "profit": 191050.39},
  {"rd": 144372.41, "admin": 118671.85, "marketing": 383199.62, "state": "New York", "profit": 182901.99},
  {"rd": 142107.34, "admin": 91391.77, "marketing": 366168.42, "state": "California", "profit": 166187.94},
  {"rd": 131876.9, "admin": 99814.71, "marketing": 362861.36, "state": "New York", "profit": 156991.12},
  {"rd": 134615.46, "admin": 147198.87, "marketing": 127716.82, "state": "California", "profit": 156122.51},
  {"rd": 130298.13, "admin": 145530.06, "marketing": 323876.68, "state": "New York", "profit": 155752.6},
  {"rd": 120542.52, "admin": 148718.95, "marketing": 311613.29, "state": "New York", "profit": 152211.77},
  {"rd": 123334.88, "admin": 108679.17, "marketing": 304981.62, "state": "California", "profit": 149759.96},
  {"rd": 101913.08, "admin": 110594.11, "marketing": 229160.95, "state": "California", "profit": 146121.95},
  {"rd": 100671.96, "admin": 91790.61, "marketing": 249744.55, "state": "Florida", "profit": 144259.4},
  {"rd": 93863.75, "admin": 127320.38, "marketing": 249839.44, "state": "California", "profit": 141585.52},
  {"rd": 91992.39, "admin": 135495.07, "marketing": 252664.93, "state": "California", "profit": 134307.35},
  {"rd": 119943.24, "admin": 156547.42, "marketing": 256512.92, "state": "Florida", "profit": 132602.65},
  {"rd": 114523.61, "admin": 122616.84, "marketing": 261776.23, "state": "New York", "profit": 129917.04},
  {"rd": 78013.11, "admin": 121597.55, "marketing": 264346.06, "state": "California", "profit": 126992.93},
  {"rd": 94657.16, "admin": 145077.58, "marketing": 282574.31, "state": "New York", "profit": 125370.37},
  {"rd": 91749.16, "admin": 114175.79, "marketing": 294919.57, "state": "New York", "profit": 124266.9},
  {"rd": 86419.7, "admin": 153514.11, "marketing": 0.0, "state": "Florida", "profit": 122776.86},
  {"rd": 76253.86, "admin": 113867.3, "marketing": 298664.47, "state": "California", "profit": 118474.03},
  {"rd": 78389.47, "admin": 153773.43, "marketing": 299737.29, "state": "New York", "profit": 111313.02},
  {"rd": 73994.56, "admin": 122782.75, "marketing": 303319.26, "state": "California", "profit": 110352.25},
  {"rd": 67532.53, "admin": 105751.03, "marketing": 304768.73, "state": "California", "profit": 108733.99},
  {"rd": 77044.01, "admin": 99281.34, "marketing": 140574.81, "state": "New York", "profit": 108552.04},
  {"rd": 64664.71, "admin": 139553.16, "marketing": 137962.62, "state": "California", "profit": 107404.34},
  {"rd": 75328.87, "admin": 144135.98, "marketing": 134050.07, "state": "New York", "profit": 105733.54},
  {"rd": 72107.6, "admin": 127864.55, "marketing": 353183.81, "state": "New York", "profit": 105008.31},
  {"rd": 66051.52, "admin": 182645.56, "marketing": 118148.2, "state": "Florida", "profit": 103282.38},
  {"rd": 65605.48, "admin": 153032.06, "marketing": 107138.38, "state": "New York", "profit": 101004.64},
  {"rd": 61994.48, "admin": 115641.28, "marketing": 91131.24, "state": "New York", "profit": 99937.59},
  {"rd": 61136.38, "admin": 152701.92, "marketing": 88218.23, "state": "New York", "profit": 97483.56},
  {"rd": 63408.86, "admin": 129219.61, "marketing": 46085.25, "state": "California", "profit": 97427.84},
  {"rd": 55493.95, "admin": 103057.49, "marketing": 214634.81, "state": "New York", "profit": 96778.92},
  {"rd": 46426.07, "admin": 157693.92, "marketing": 210797.67, "state": "Florida", "profit": 96712.8},
  {"rd": 46014.02, "admin": 85047.44, "marketing": 205517.64, "state": "New York", "profit": 96479.51},
  {"rd": 28663.76, "admin": 127056.21, "marketing": 201126.82, "state": "New York", "profit": 90708.19},
  {"rd": 44069.95, "admin": 51283.14, "marketing": 197029.42, "state": "California", "profit": 89949.14},
  {"rd": 20229.59, "admin": 65947.93, "marketing": 185265.1, "state": "New York", "profit": 81229.06},
  {"rd": 38558.51, "admin": 82982.09, "marketing": 174999.3, "state": "California", "profit": 81005.76},
  {"rd": 28754.33, "admin": 118546.05, "marketing": 172795.67, "state": "Florida", "profit": 78239.91},
  {"rd": 27892.92, "admin": 84710.77, "marketing": 164470.71, "state": "California", "profit": 77798.83},
  {"rd": 23640.93, "admin": 96189.63, "marketing": 148001.11, "state": "California", "profit": 71498.49},
  {"rd": 15505.73, "admin": 127382.3, "marketing": 35534.17, "state": "New York", "profit": 69758.98},
  {"rd": 22177.74, "admin": 154806.14, "marketing": 28334.72, "state": "California", "profit": 65200.33},
  {"rd": 1000.23, "admin": 124153.04, "marketing": 1903.93, "state": "New York", "profit": 64926.08},
  {"rd": 1315.46, "admin": 115816.21, "marketing": 297114.46, "state": "Florida", "profit": 49490.75},
  {"rd": 0.0, "admin": 135426.92, "marketing": 0.0, "state": "California", "profit": 42559.73},
  {"rd": 542.05, "admin": 51743.15, "marketing": 0.0, "state": "New York", "profit": 35673.41},
  {"rd": 0.0, "admin": 116983.8, "marketing": 45173.06, "state": "California", "profit": 14681.4}
];

// ==============================================================================
// State Variables & Global Configurations
// ==============================================================================
let currentDatasetKey = "rd";
let activeData = [];
let slope = 0.85;
let intercept = 49000;
let optimalSlope = 0.85;
let optimalIntercept = 49000;
let showResiduals = true;
let isDragging = false;

// Slider Bounds
let sliderConfig = {
  slopeMin: -1,
  slopeMax: 2,
  slopeStep: 0.005,
  interceptMin: -20000,
  interceptMax: 100000,
  interceptStep: 200
};

// SVG & Layout Elements
const margin = { top: 30, right: 35, bottom: 65, left: 85 };
let width, height;
let svg, g, xScale, yScale, xAxis, yAxis, xGrid, yGrid, gX, gY;
let xLabelText, yLabelText;
const tooltip = document.getElementById("tooltip");

// ==============================================================================
// Initialization
// ==============================================================================
window.addEventListener("DOMContentLoaded", () => {
  initChart();
  switchDataset("rd");
  calculatePrediction();

  // Listen to window resize
  window.addEventListener("resize", handleResize);

  // Parameter Slider Event Listeners
  const slopeSlider = document.getElementById("slope-slider");
  const interceptSlider = document.getElementById("intercept-slider");

  slopeSlider.addEventListener("input", (e) => {
    slope = parseFloat(e.target.value);
    updateChart(false);
  });

  interceptSlider.addEventListener("input", (e) => {
    intercept = parseFloat(e.target.value);
    updateChart(false);
  });
});

// ==============================================================================
// D3 Chart Setup
// ==============================================================================
function initChart() {
  const container = document.querySelector(".chart-svg-wrapper");
  width = container.clientWidth - margin.left - margin.right;
  height = 520 - margin.top - margin.bottom;

  svg = d3.select("#chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  // Clear previous if any
  svg.selectAll("*").remove();

  g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  xScale = d3.scaleLinear().range([0, width]);
  yScale = d3.scaleLinear().range([height, 0]);

  // Grids
  xGrid = g.append("g").attr("class", "grid").attr("transform", `translate(0,${height})`);
  yGrid = g.append("g").attr("class", "grid");

  // Axes
  xAxis = d3.axisBottom(xScale).ticks(7).tickFormat(d => formatAxisNumber(d));
  yAxis = d3.axisLeft(yScale).ticks(7).tickFormat(d => formatAxisNumber(d));

  gX = g.append("g").attr("class", "axis").attr("transform", `translate(0,${height})`);
  gY = g.append("g").attr("class", "axis");

  // Axis Labels
  xLabelText = g.append("text")
    .attr("class", "axis-label")
    .attr("transform", `translate(${width / 2}, ${height + 50})`)
    .style("text-anchor", "middle")
    .text("X 支出金額 ($USD)");

  yLabelText = g.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 22)
    .attr("x", -(height / 2))
    .style("text-anchor", "middle")
    .text("利潤 Profit ($USD)");

  // Container Groups for Lines & Points (Order matters for z-index)
  g.append("g").attr("class", "residuals-group");
  g.append("g").attr("class", "line-group");
  g.append("g").attr("class", "points-group");

  // Allow clicking on chart background to add points in simulated mode
  svg.on("click", function(event) {
    if (currentDatasetKey === "simulated") {
      const coords = d3.pointer(event, g.node());
      if (coords[0] >= 0 && coords[0] <= width && coords[1] >= 0 && coords[1] <= height) {
        const newX = xScale.invert(coords[0]);
        const newY = yScale.invert(coords[1]);
        activeData.push({ x: newX, y: newY, label: `Custom Point #${activeData.length + 1}` });
        calculateOptimalParameters();
        updateChart(true);
      }
    }
  });
}

function handleResize() {
  const container = document.querySelector(".chart-svg-wrapper");
  if (!container) return;
  width = container.clientWidth - margin.left - margin.right;
  height = 520 - margin.top - margin.bottom;

  svg.attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom);

  xScale.range([0, width]);
  yScale.range([height, 0]);

  gX.attr("transform", `translate(0,${height})`);
  xGrid.attr("transform", `translate(0,${height})`);
  xLabelText.attr("transform", `translate(${width / 2}, ${height + 50})`);
  yLabelText.attr("x", -(height / 2));

  updateChart(true);
}

// ==============================================================================
// Dataset Management
// ==============================================================================
function switchDataset(key) {
  currentDatasetKey = key;

  // Update tabs active state
  document.querySelectorAll(".dataset-btn").forEach(btn => btn.classList.remove("active"));
  const activeBtn = document.getElementById(`btn-ds-${key}`);
  if (activeBtn) activeBtn.classList.add("active");

  const titleEl = document.getElementById("chart-main-title");
  const subEl = document.getElementById("chart-sub-title");

  if (key === "rd") {
    activeData = RAW_STARTUPS_DATA.map(d => ({
      x: d.rd,
      y: d.profit,
      state: d.state,
      label: `State: ${d.state}`
    }));
    titleEl.textContent = "R&D Spend vs Profit 迴歸擬合畫布";
    subEl.textContent = "50 家新創公司實測資料 | 研發投入與獲利具備高達 0.97 的極高相關性！";
    xLabelText.text("研發支出 R&D Spend ($USD)");
    yLabelText.text("獲利 Profit ($USD)");
    setupSlidersForDataset(-0.2, 1.8, 0.005, -30000, 110000, 500);
  } else if (key === "marketing") {
    activeData = RAW_STARTUPS_DATA.map(d => ({
      x: d.marketing,
      y: d.profit,
      state: d.state,
      label: `State: ${d.state}`
    }));
    titleEl.textContent = "Marketing Spend vs Profit 迴歸擬合畫布";
    subEl.textContent = "50 家新創公司實測資料 | 行銷支出對利潤亦有顯著正向影響 (相關係數 0.75)";
    xLabelText.text("行銷支出 Marketing Spend ($USD)");
    yLabelText.text("獲利 Profit ($USD)");
    setupSlidersForDataset(-0.2, 0.8, 0.005, -20000, 120000, 500);
  } else if (key === "admin") {
    activeData = RAW_STARTUPS_DATA.map(d => ({
      x: d.admin,
      y: d.profit,
      state: d.state,
      label: `State: ${d.state}`
    }));
    titleEl.textContent = "Administration vs Profit 迴歸擬合畫布";
    subEl.textContent = "50 家新創公司實測資料 | 行政支出與利潤相關性低 (0.20)，迴歸擬合分散";
    xLabelText.text("行政支出 Administration Spend ($USD)");
    yLabelText.text("獲利 Profit ($USD)");
    setupSlidersForDataset(-0.5, 1.0, 0.005, 0, 150000, 500);
  } else if (key === "simulated") {
    generateSimulatedData();
    titleEl.textContent = "模擬教學數據 (Simulated Learning Canvas)";
    subEl.textContent = "手動互動練習模式 | 支援直接點選畫布新增資料點、拖曳直線挑戰極限 R²！";
    xLabelText.text("特徵值 Feature X");
    yLabelText.text("目標值 Target Y");
    setupSlidersForDataset(-5, 5, 0.05, -15, 25, 0.2);
  }

  // Calculate OLS optimal line for this dataset
  calculateOptimalParameters();

  // Set initial line to be slightly off optimal for educational exploration
  if (key === "simulated") {
    slope = optimalSlope * 0.7;
    intercept = optimalIntercept + 2;
  } else {
    slope = optimalSlope * 0.85;
    intercept = optimalIntercept * 1.1;
  }

  updateChart(true);
}

function generateSimulatedData() {
  activeData = [];
  const trueSlope = 1.8;
  const trueIntercept = 3.5;
  for (let i = 0; i < 20; i++) {
    const x = Math.round((Math.random() * 12 + 1) * 10) / 10;
    const noise = (Math.random() - 0.5) * 5.5;
    const y = Math.round((trueSlope * x + trueIntercept + noise) * 10) / 10;
    activeData.push({ x, y, label: `Point #${i + 1}` });
  }
}

function generateRandomPoints() {
  if (currentDatasetKey === "simulated") {
    generateSimulatedData();
    calculateOptimalParameters();
    slope = optimalSlope * (Math.random() * 0.6 + 0.6);
    intercept = optimalIntercept + (Math.random() - 0.5) * 4;
    updateChart(true);
  } else {
    // Add bootstrap perturbation to 50 Startups
    activeData = activeData.map(d => ({
      ...d,
      y: Math.max(5000, d.y + (Math.random() - 0.5) * 12000)
    }));
    calculateOptimalParameters();
    updateChart(true);
  }
}

// ==============================================================================
// Slider Bounds Calibration
// ==============================================================================
function setupSlidersForDataset(sMin, sMax, sStep, iMin, iMax, iStep) {
  sliderConfig = {
    slopeMin: sMin,
    slopeMax: sMax,
    slopeStep: sStep,
    interceptMin: iMin,
    interceptMax: iMax,
    interceptStep: iStep
  };

  const sSlider = document.getElementById("slope-slider");
  const iSlider = document.getElementById("intercept-slider");

  sSlider.min = sMin;
  sSlider.max = sMax;
  sSlider.step = sStep;

  iSlider.min = iMin;
  iSlider.max = iMax;
  iSlider.step = iStep;
}

// ==============================================================================
// OLS Analytical Solution (Ordinary Least Squares)
// ==============================================================================
function calculateOptimalParameters() {
  const n = activeData.length;
  if (n < 2) return;

  const sumX = d3.sum(activeData, d => d.x);
  const sumY = d3.sum(activeData, d => d.y);
  const sumXY = d3.sum(activeData, d => d.x * d.y);
  const sumXX = d3.sum(activeData, d => d.x * d.x);

  optimalSlope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  optimalIntercept = (sumY - optimalSlope * sumX) / n;
}

function applyOptimalLine() {
  // Smoothly animate to optimal slope & intercept
  const startSlope = slope;
  const startIntercept = intercept;

  d3.transition()
    .duration(650)
    .ease(d3.easeCubicOut)
    .tween("optimal-line", () => {
      const iSlope = d3.interpolateNumber(startSlope, optimalSlope);
      const iIntercept = d3.interpolateNumber(startIntercept, optimalIntercept);
      return (t) => {
        slope = iSlope(t);
        intercept = iIntercept(t);
        updateChart(false);
      };
    });
}

function resetLine() {
  if (currentDatasetKey === "simulated") {
    slope = 1.0;
    intercept = 0;
  } else {
    // Horizontal average line
    slope = 0;
    intercept = d3.mean(activeData, d => d.y) || 100000;
  }
  updateChart(true);
}

function toggleResiduals(checked) {
  showResiduals = checked;
  d3.select(".residuals-group")
    .transition()
    .duration(200)
    .style("opacity", showResiduals ? 1 : 0);
}

// ==============================================================================
// Chart Rendering & Update
// ==============================================================================
function updateChart(recomputeDomain = false) {
  if (!activeData || activeData.length === 0) return;

  // Domain scaling
  if (recomputeDomain) {
    const xExtent = d3.extent(activeData, d => d.x);
    const yExtent = d3.extent(activeData, d => d.y);

    const xPad = (xExtent[1] - xExtent[0]) * 0.08 || 1;
    const yPad = (yExtent[1] - yExtent[0]) * 0.12 || 1;

    xScale.domain([Math.max(0, xExtent[0] - xPad), xExtent[1] + xPad]);
    yScale.domain([Math.max(0, yExtent[0] - yPad), yExtent[1] + yPad]);

    // Update axes with transitions
    gX.transition().duration(350).call(xAxis);
    gY.transition().duration(350).call(yAxis);

    // Update grid lines
    xGrid.transition().duration(350)
      .call(d3.axisBottom(xScale).ticks(7).tickSize(-height).tickFormat(""));
    yGrid.transition().duration(350)
      .call(d3.axisLeft(yScale).ticks(7).tickSize(-width).tickFormat(""));
  }

  // Render Data Points
  const pointsGroup = g.select(".points-group");
  const circles = pointsGroup.selectAll(".data-point").data(activeData);

  circles.enter()
    .append("circle")
    .attr("class", "data-point")
    .attr("r", currentDatasetKey === "simulated" ? 7 : 6)
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .on("mouseover", handlePointMouseOver)
    .on("mousemove", handlePointMouseMove)
    .on("mouseout", handlePointMouseOut)
    .merge(circles)
    .transition().duration(isDragging ? 0 : 300)
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y));

  circles.exit().remove();

  // Render Regression Line
  const lineGroup = g.select(".line-group");
  const xDomain = xScale.domain();
  const lineData = [
    { x: xDomain[0], y: slope * xDomain[0] + intercept },
    { x: xDomain[1], y: slope * xDomain[1] + intercept }
  ];

  const lineGenerator = d3.line()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y));

  // Hit area for easier drag
  let hitArea = lineGroup.select(".regression-line-hitarea");
  if (hitArea.empty()) {
    hitArea = lineGroup.append("path")
      .attr("class", "regression-line-hitarea")
      .call(createDragBehavior());
  }
  hitArea.attr("d", lineGenerator(lineData));

  // Visual red line
  let regLine = lineGroup.select(".regression-line");
  if (regLine.empty()) {
    regLine = lineGroup.append("path")
      .attr("class", "regression-line")
      .call(createDragBehavior());
  }

  regLine
    .transition().duration(isDragging ? 0 : 250)
    .attr("d", lineGenerator(lineData));

  // Render Residual Error Lines
  const resGroup = g.select(".residuals-group");
  const errorLines = resGroup.selectAll(".error-line").data(activeData);

  errorLines.enter()
    .append("line")
    .attr("class", "error-line")
    .merge(errorLines)
    .transition().duration(isDragging ? 0 : 200)
    .attr("x1", d => xScale(d.x))
    .attr("y1", d => yScale(d.y))
    .attr("x2", d => xScale(d.x))
    .attr("y2", d => yScale(slope * d.x + intercept));

  errorLines.exit().remove();

  // Update UI Displays (Sliders, Equation & Metrics)
  updateMetricsAndUI();
}

// ==============================================================================
// Drag Line Behavior (Rotating & Translating)
// ==============================================================================
function createDragBehavior() {
  let dragStartCoords = null;
  let initialSlope = 0;
  let initialIntercept = 0;

  return d3.drag()
    .on("start", function(event) {
      isDragging = true;
      const pointer = d3.pointer(event, g.node());
      dragStartCoords = {
        dataX: xScale.invert(pointer[0]),
        dataY: yScale.invert(pointer[1]),
        pixelY: pointer[1]
      };
      initialSlope = slope;
      initialIntercept = intercept;
    })
    .on("drag", function(event) {
      if (!dragStartCoords) return;
      const pointer = d3.pointer(event, g.node());
      const currentDataX = xScale.invert(pointer[0]);
      const currentDataY = yScale.invert(pointer[1]);

      const xDomain = xScale.domain();
      const xMid = (xDomain[0] + xDomain[1]) / 2;

      // If dragged near center, translate (shift intercept)
      // If dragged near sides, rotate (shift slope)
      const distFromCenter = (dragStartCoords.dataX - xMid) / ((xDomain[1] - xDomain[0]) / 2);

      if (Math.abs(distFromCenter) < 0.25) {
        // Vertical Translation
        const deltaY = currentDataY - dragStartCoords.dataY;
        intercept = initialIntercept + deltaY;
      } else {
        // Pivot Rotation around the other side
        const pivotX = distFromCenter > 0 ? xDomain[0] : xDomain[1];
        const pivotY = initialSlope * pivotX + initialIntercept;
        slope = (currentDataY - pivotY) / (currentDataX - pivotX);
        intercept = pivotY - slope * pivotX;
      }

      // Clamp to slider bounds
      slope = Math.max(sliderConfig.slopeMin, Math.min(sliderConfig.slopeMax, slope));
      intercept = Math.max(sliderConfig.interceptMin, Math.min(sliderConfig.interceptMax, intercept));

      updateChart(false);
    })
    .on("end", function() {
      isDragging = false;
      dragStartCoords = null;
      updateChart(false);
    });
}

// ==============================================================================
// Live Metrics & UI Updating
// ==============================================================================
function updateMetricsAndUI() {
  // Update Sliders (without triggering event listeners)
  if (!isDragging) {
    document.getElementById("slope-slider").value = slope;
    document.getElementById("intercept-slider").value = intercept;
  }

  // Update Parameter Labels
  document.getElementById("slope-val").textContent = slope >= 100 || slope <= -100 ? slope.toFixed(1) : slope.toFixed(3);
  document.getElementById("intercept-val").textContent = formatNumberWithCommas(intercept);

  // Update Equation
  const sign = intercept >= 0 ? "+" : "-";
  const absIntercept = Math.abs(intercept);
  document.getElementById("equation-display").textContent = 
    `y = ${slope.toFixed(3)}x ${sign} ${formatNumberWithCommas(absIntercept)}`;

  // Calculate Errors: MSE, RMSE, MAE, R²
  const errors = activeData.map(d => {
    const predicted = slope * d.x + intercept;
    return d.y - predicted;
  });

  const mse = d3.mean(errors, e => e * e) || 0;
  const rmse = Math.sqrt(mse);
  const mae = d3.mean(errors, e => Math.abs(e)) || 0;

  const yMean = d3.mean(activeData, d => d.y) || 0;
  const ssTotal = d3.sum(activeData, d => Math.pow(d.y - yMean, 2)) || 1;
  const ssResidual = d3.sum(errors, e => e * e) || 0;
  let r2 = 1 - (ssResidual / ssTotal);

  // Display Metrics
  document.getElementById("metric-mse").textContent = formatCompactNumber(mse);
  document.getElementById("metric-rmse").textContent = formatCompactNumber(rmse);
  document.getElementById("metric-mae").textContent = formatCompactNumber(mae);
  
  const r2Element = document.getElementById("metric-r2");
  r2Element.textContent = r2.toFixed(4);

  // Highlight Box R2 based on fit
  const boxR2 = document.getElementById("box-r2");
  if (r2 > 0.9) {
    boxR2.style.borderColor = "#10b981";
    boxR2.style.background = "#ecfdf5";
  } else if (r2 > 0.7) {
    boxR2.style.borderColor = "#6366f1";
    boxR2.style.background = "#eef2ff";
  } else {
    boxR2.style.borderColor = "#cbd5e1";
    boxR2.style.background = "#f8fafc";
  }
}

// ==============================================================================
// Tooltip Handlers
// ==============================================================================
function handlePointMouseOver(event, d) {
  const predicted = slope * d.x + intercept;
  const residual = d.y - predicted;

  tooltip.style.opacity = 1;
  tooltip.innerHTML = `
    <div style="font-weight:700; margin-bottom:4px; color:#a5b4fc;">${d.label || '觀測點'}</div>
    <div><strong>X:</strong> ${formatNumberWithCommas(d.x)}</div>
    <div><strong>實際 Y:</strong> ${formatNumberWithCommas(d.y)}</div>
    <div><strong>預測 Ŷ:</strong> ${formatNumberWithCommas(predicted)}</div>
    <div style="color:${Math.abs(residual) < 5000 ? '#34d399' : '#f87171'};"><strong>殘差:</strong> ${formatNumberWithCommas(residual)}</div>
  `;
}

function handlePointMouseMove(event) {
  const containerRect = document.querySelector(".chart-svg-wrapper").getBoundingClientRect();
  tooltip.style.left = `${event.clientX - containerRect.left + 16}px`;
  tooltip.style.top = `${event.clientY - containerRect.top - 12}px`;
}

function handlePointMouseOut() {
  tooltip.style.opacity = 0;
}

// ==============================================================================
// Multiple Linear Regression Live Predictor
// ==============================================================================
function calculatePrediction() {
  const rd = parseFloat(document.getElementById("pred-rd").value) || 0;
  const marketing = parseFloat(document.getElementById("pred-marketing").value) || 0;
  const state = document.getElementById("pred-state").value;

  // Exact OLS multi-regression model parameters trained on 50 Startups:
  // Profit = 46975.86 + 0.7966 * RD + 0.0299 * Marketing + StateEffect
  const baseIntercept = 46975.86;
  const coefRD = 0.796584;
  const coefMarketing = 0.029908;

  let stateEffect = 0;
  if (state === "Florida") stateEffect = 180.5;
  if (state === "New York") stateEffect = -250.0;

  const predictedProfit = baseIntercept + (coefRD * rd) + (coefMarketing * marketing) + stateEffect;

  const resultAmountEl = document.getElementById("pred-result-amount");
  resultAmountEl.textContent = `$${Math.round(predictedProfit).toLocaleString("en-US")}`;
}

// ==============================================================================
// Utility Formatters
// ==============================================================================
function formatAxisNumber(val) {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
  return val.toFixed(0);
}

function formatNumberWithCommas(num) {
  if (isNaN(num)) return "0";
  return Math.round(num).toLocaleString("en-US");
}

function formatCompactNumber(num) {
  if (isNaN(num)) return "0";
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `${Math.round(num).toLocaleString("en-US")}`;
  return num.toFixed(2);
}
