var svgWidth = 1000;
var svgHeight = 900;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

//setting chart width and height
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = 'healthcare';

// function used for updating x-scale var upon click on axis label
function xScale(stateData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.8,
      d3.max(stateData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

//scaling the Y scale based on chosen Y axis
function yScale(stateData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[chosenYAxis]) * 0.9,
    d3.max(stateData, d => d[chosenYAxis]) * 1.1
  ])
    .range([height, 0])

    return yLinearScale;
}


// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
    }

//now changing the Y axis scale to selected axis
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

//--------------------------------------------------------------

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  var xlabel;
  var ylabel;
 
//setting x labels
  if (chosenXAxis == "poverty") {
    xlabel = "In Poverty (%)";
  }
  else if (chosenXAxis == "age"){
    xlabel = "Age";
  }
  else {
    xlabel = "Household Income";
  }

  //setting y labels
  if (chosenYAxis == "healthcare") {
    ylabel = "Lacks Healthcare'";
  }
  else if(chosenYAxis == "smokes"){
    ylabel = "Smokes (%)";
  }
  else{
    ylabel = "Obese (%)";
  }

//-----------------------------------------------------------------

//tooltip
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]} <br>${ylabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

//function to update the text inside the circles
function updatecircletext(stateAbbr, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis){
  stateAbbr.transition()
  .duration(1000)
  .attr("x", d => xLinearScale(d[chosenXAxis]))
  .attr("y", d => yLinearScale(d[chosenYAxis]));

return stateAbbr;
}

// Import Data
d3.csv("D3_data_journalism/data/data.csv").then(function(stateData) {


        // Step 1: Parse Data/Cast as numbers
        // ==============================
        stateData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
            data.age = +data.age;
            data.smokes = +data.smokes;
            data.income = +data.income;
            data.obesity = +data.obesity;

        });

        console.log(stateData)

    // xLinearScale function above csv import
    var xLinearScale = xScale(stateData, chosenXAxis);

    // Create y scale function
    var yLinearScale = yScale(stateData, chosenYAxis);


    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

      // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

      // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    //--------------------------------------------------------------------------------

      // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(stateData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 20)
        // .attr("fill", "magenta")
        // .attr("opacity", "0.5")
        .classed('stateCircle', true)
      
    var stateAbbr = chartGroup.selectAll("text")
        .exit()
        .data(stateData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis] ) )
        .attr("y", d => yLinearScale(d[chosenYAxis] ) )
        .text(function(d) { return d.abbr })
        .attr("font-size", "12px")
        // .attr("fill", 'black')
        .classed("stateText", true);

    

  // Create group for x-axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 15)
        .attr("class", "axisText")
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 35)
        .attr("class", "axisText")
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age");

    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 55)
        .attr("class", "axisText")
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income");

        //y labels
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(0, ${height/2})`);

    var healthcareLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", -70)
        .attr("dy", "3.5em")
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .text("Lacks Healthcare");

    var smokesLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", -60)
        .attr("dy", "2.5em")
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)");

    var obeseLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", -50)
        .attr("dy", "1.5em")
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .text("Obese (%)");

    // updateToolTip function above csv import
    var circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
    var stateAbbr = updatecircletext(stateAbbr, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis)
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, stateAbbr);


    ///need to change labels on circles here

  // x axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(stateData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, stateAbbr);

        //update state abbr
        stateAbbr = updatecircletext(stateAbbr, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis)

            // changes classes to change bold text
            if (chosenXAxis == "poverty") {
            povertyLabel
                .classed("active", true)
                .classed("inactive", false);
            ageLabel
                .classed("active", false)
                .classed("inactive", true);
            incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if(chosenXAxis == 'age') {
            povertyLabel
                .classed("active", false)
                .classed("inactive", true);
            ageLabel
                .classed("active", true)
                .classed("inactive", false);
            incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else{
            povertyLabel
                .classed("active", false)
                .classed("inactive", true);
            ageLabel
                .classed("active", false)
                .classed("inactive", true);
            incomeLabel
                .classed("active", true)
                .classed("inactive", false);
            }
            }

  
          // y axis labels event listener
    ylabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

              // replaces chosenYAxis with value
              chosenYAxis = value;

              // functions here found above csv import
              // updates y scale for new data
              yLinearScale = yScale(stateData, chosenYAxis);

              // updates u axis with transition
              yAxis = renderYAxes(yLinearScale, yAxis);

              // updates circles with new y values
              circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

              // updates tooltips with new info
              circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, stateAbbr);

              //update state abbr
              stateAbbr = updatecircletext(stateAbbr, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis)

              // changes classes to change bold text
            // changes classes to change bold text
            if (chosenYAxis === "healthcare") {
              healthcareLabel
                  .classed("active", true)
                  .classed("inactive", false);
              smokesLabel
                  .classed("active", false)
                  .classed("inactive", true);
              obeseLabel
                  .classed("active", false)
                  .classed("inactive", true);
              }
              else if (chosenYAxis == 'smokes'){
              healthcareLabel
                  .classed("active", false)
                  .classed("inactive", true);
              smokesLabel
                  .classed("active", true)
                  .classed("inactive", false);
              obeseLabel
                  .classed("active", false)
                  .classed("inactive", true);
              }
              else {
              healthcareLabel
                  .classed("active", false)
                  .classed("inactive", true);
              smokesLabel
                  .classed("active", false)
                  .classed("inactive", true);
              obeseLabel
                  .classed("active", true)
                  .classed("inactive", false);
              }

    }
  })
}).catch(function(error) {
  console.log(error); 
})})