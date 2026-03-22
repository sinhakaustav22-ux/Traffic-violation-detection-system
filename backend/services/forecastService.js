export const getSevenDayForecast = (dailyCounts) => {
  if (!dailyCounts || dailyCounts.length === 0) return [];
  
  // dailyCounts should be sorted by date ascending
  const counts = dailyCounts.map(d => parseInt(d.count, 10));
  
  let last7Sum = 0;
  const windowSize = Math.min(7, counts.length);
  for (let i = counts.length - windowSize; i < counts.length; i++) {
    last7Sum += counts[i];
  }
  let movingAverage = last7Sum / windowSize;
  
  const forecast = [];
  const lastDate = new Date(dailyCounts[dailyCounts.length - 1].date);
  
  for (let i = 1; i <= 7; i++) {
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + i);
    
    // Add slight random variation to moving average for realism
    const variation = (Math.random() * 0.2) - 0.1; // -10% to +10%
    const predicted = Math.max(0, Math.round(movingAverage * (1 + variation)));
    
    forecast.push({
      date: nextDate.toISOString().split('T')[0],
      predicted_count: predicted,
      lower_bound: Math.max(0, Math.round(predicted * 0.8)),
      upper_bound: Math.round(predicted * 1.2)
    });
    
    // Update moving average slightly
    movingAverage = (movingAverage * 6 + predicted) / 7;
  }
  
  return forecast;
};
