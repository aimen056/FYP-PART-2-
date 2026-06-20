const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const yLabels = ["1", "2", "3", "4", "5"];

const data = [];

for (let x = 0; x < daysOfWeek.length; x++) {
  for (let y = 0; y < yLabels.length; y++) {
    data.push({
      x: daysOfWeek[x], // Days of the week
      y: yLabels[y],     // Numbers 1-5
      value: Math.floor(Math.random() * 40), // Random value
    });
  }
}

export default data;