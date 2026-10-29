const EMPTY_CHART_COLOR = "#e9edf4";

export function PieChart({ title, data, centerLabel }) {
  const chartData = data.map((item) => ({
    ...item,
    value:
      Number.isFinite(Number(item.value)) && Number(item.value) > 0
        ? Number(item.value)
        : 0,
  }));
  const visibleData = chartData.filter((item) => item.value > 0);
  const total = visibleData.reduce((sum, item) => sum + item.value, 0);
  let currentPercentage = 0;
  const gradient = total
    ? visibleData
        .map((item) => {
          const start = currentPercentage;
          currentPercentage += (item.value / total) * 100;
          return `${item.color} ${start}% ${currentPercentage}%`;
        })
        .join(", ")
    : `${EMPTY_CHART_COLOR} 0% 100%`;

  return (
    <section className="pie-chart-panel" aria-label={title}>
      <h3>{title}</h3>
      <div className="pie-chart-content">
        <div
          className="pie-chart-visual"
          role="img"
          aria-label={`${title}: ${
            visibleData
              .map((item) => `${item.label} ${item.value}`)
              .join(", ") || "no results"
          }`}
          style={{ background: `conic-gradient(${gradient})` }}
        >
          <div className="pie-chart-center">
            <b>{total}</b>
            <span>{centerLabel}</span>
          </div>
        </div>
        <ul className="pie-chart-legend">
          {chartData.map((item) => (
            <li key={item.label}>
              <span
                className="pie-chart-swatch"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <span>{item.label}</span>
              <b>
                {item.value}
                <small>
                  {total ? ` · ${Math.round((item.value / total) * 100)}%` : ""}
                </small>
              </b>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
