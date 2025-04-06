const svg = d3.select("svg"),
      width = +svg.attr("width"),
      height = +svg.attr("height");

// Define genre-to-color (pink shades)
const genreColor = d3.scaleOrdinal()
  .domain([...new Set(data.map(d => d.Genre))])
  .range([
    "#ffc0cb", "#ffb6c1", "#ff69b4", "#ff1493", "#db7093",
    "#c71585", "#e75480", "#f4c2c2", "#faafbe", "#f88379"
  ]);


// Define a scale for circle sizes based on rank
const radiusScale = d3.scaleSqrt()
                      .domain([1, 1000])
                      .range([10, 3]);

// Define a simulation for positioning the circles
const simulation = d3.forceSimulation()
                     .force("x", d3.forceX(width / 2).strength(0.05))
                     .force("y", d3.forceY(height / 2).strength(0.05))
                     .force("collide", d3.forceCollide(d => radiusScale(d.Rank) + 1));

// Load the data
d3.csv("topsongs2024.csv").then(data => {
  // Convert rank to a number
  data.forEach(d => d.Rank = +d.Rank);

  // Create circles
  const circles = svg.selectAll("circle")
  .data(data)
  .enter()
  .append("circle")
  .attr("r", d => radiusScale(d.Rank)) 
  .attr("fill", d => genreColor(d.Genre))
  .attr("stroke", "#fff")
  .attr("stroke-width", 1)
  .attr("opacity", 0.85)
  .on("mouseover", function (event, d) {
    d3.select(this)
      .transition()
      .duration(150)
      .attr("r", radiusScale(d.Rank) * 1.5); // Pop out
  
    tooltip.transition().duration(200).style("opacity", 0.95);
    tooltip.html(`<strong>#${d.Rank}: ${d.Title}</strong><br>${d.Artist}<br><em>${d.Genre}</em>`)
      .style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 28) + "px");
  })
  .on("mouseout", function (event, d) {
    d3.select(this)
      .transition()
      .duration(150)
      .attr("r", radiusScale(d.Rank)); // Reset radius
  
    tooltip.transition().duration(300).style("opacity", 0);
  });
  


  // Add a tooltip
  const tooltip = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

  // Apply the simulation to the circles
  simulation.nodes(data)
            .on("tick", () => {
              circles.attr("cx", d => d.x)
                     .attr("cy", d => d.y);
            });
});

// Create a set of all unique genres
const genres = Array.from(new Set(data.map(d => d.Genre)));

// Append a legend
const legend = d3.select("body").append("div")
  .attr("class", "legend")
  .style("margin-top", "20px")
  .style("display", "flex")
  .style("flex-wrap", "wrap")
  .style("gap", "10px");

let activeGenre = null;

genres.forEach(genre => {
  legend.append("div")
    .style("display", "flex")
    .style("align-items", "center")
    .style("cursor", "pointer")
    .on("mouseover", () => {
      circles.transition()
        .duration(200)
        .style("opacity", d => d.Genre === genre ? 1 : 0.1);
    })
    .on("mouseout", () => {
      circles.transition()
        .duration(200)
        .style("opacity", d => !activeGenre || d.Genre === activeGenre ? 1 : 0.8);
      
    })
    .on("click", () => {
      activeGenre = activeGenre === genre ? null : genre;
      circles.transition()
        .duration(200)
        .style("opacity", d => !activeGenre || d.Genre === activeGenre ? 1 : 0.1);
    })
    .html(`
      <div style="width:12px;height:12px;background:${genreColor(genre)};margin-right:5px;"></div>
      <span>${genre}</span>
    `);
});
