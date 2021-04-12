var svgWidth = 900;
var svgHeight = 800;

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
    .domain([d3.min(stateData, d => d[chosenXAxis]*0.9),
    d3.max(stateData, d => d[chosenYAxis]*1.1)
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
    var leftAxis = d3.axisLeft(newYScale, yAxis);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function renderCirclesnames(circlesState, newXScale, chosenXAxis, newYScale, chosenYAxis) {
//     circlesState.transition()
//       .duration(1000)
//       .attr("x", d => newXScale(d[chosenXAxis]))
//       .attr("y", d => newYScale(d[chosenYAxis])+5);

//   return circlesState;
// }


//--------------------------------------------------------------

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  var xlabel;
  var ylabel;
 
//setting x labels
  if (chosenXAxis === "poverty") {
    xlabel = "In Poverty (%)";
  }
  else {
    xlabel = "Age";
  }

  //setting y labels
  if (chosenYAxis === "healthcare") {
    ylabel = "Lacks Healthcare'";
  }
  else {
    ylabel = "Smokes (%)";
  }

//-----------------------------------------------------------------

//tooltip
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([0,0])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]} <br>${ylabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Import Data
d3.csv("./data/data.csv").then(function(stateData) {


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
        // Create a circle text group for the state text abbreviations
        var circleTextGroup=chartGroup.selectAll(".stateText").data(stateData);

        circleTextGroup.enter()
            .append("text")
            .classed("stateText", true)
            .merge(circleTextGroup)
            .attr("x", d=>xLinearScale(d[chosenXAxis]))
            .attr("y", d=>yLinearScale(d[chosenYAxis])+5)
            .html(d => d.abbr);
        
        circleTextGroup.exit().remove();

    // Set up a function that will update the circle text group when new axes are selected
    function updateCircleTextGroup(data) {
        circleTextGroup = chartGroup.selectAll(".stateText").data(stateData);

        circleTextGroup.enter()
            .append("text")
            .classed("stateText", true)
            .merge(circleTextGroup)
            .html(d => d.abbr);

        circleTextGroup.exit().remove();

        return circleTextGroup
    }

    //--------------------------------------------------------------------------------

      // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(stateData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .attr("fill", "magenta")
        .attr("opacity", "0.5")

    // var circleLabels = chartGroup.selectAll(null).data(stateData).enter().append("text");
    // circleLabels
    //     .attr("x", function(d) {
    //         return d => xLinearScale(d[chosenXAxis]);
    //         })
    //     .attr("y", function(d) {
    //         return d => yLinearScale(d[chosenXAxis]);
    //         })
    //     .text(function(d) {
    //         return d.abbr;
    //         })
    //     .attr("font-family", "sans-serif")
    //     .attr("font-size", "10px")
    //     .attr()
    //     .attr("fill", "black");

  // Create group for two x-axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

 // Create group for two y-axis labels
// var ylabelsGroup = chartGroup.append("g")
//     .attr("transform", "rotate(-90)");

    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age");

    // var incomeLabel = xlabelsGroup.append("text")
    //     .attr("x", 0)
    //     .attr("y", 60)
    //     .attr("value", "income") // value to grab for event listener
    //     .classed("inactive", true)
    //     .text("Household Income");

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

    // var obeseLabel = ylabelsGroup.append("text")
    //     .attr("transform", "rotate(-90)")
    //     .attr("y", 0 - margin.left)
    //     .attr("x", -50)
    //     .attr("dy", "1.5em")
    //     .attr("value", "obesity") // value to grab for event listener
    //     .classed("inactive", true)
    //     .text("Obese (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


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
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //update circle with text inside
        circleTextGroup = renderCircleText(updateCircleTextGroup(stateData), xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
        povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        ageLabel
            .classed("active", false)
            .classed("inactive", true);
        // incomeLabel
        //     .classed("active", false)
        //     .classed("inactive", true);
        }
        else {
        povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        ageLabel
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
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          //update circle with text inside
          circleTextGroup = renderCircleText(updateCircleTextGroup(stateData), xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          // changes classes to change bold text
        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
          smokesLabel
              .classed("active", false)
              .classed("inactive", true);
          // incomeLabel
          //     .classed("active", false)
          //     .classed("inactive", true);
          }
          else {
          healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
          smokesLabel
              .classed("active", true)
              .classed("inactive", false);
          }

    }
  })
}).catch(function(error) {
  console.log(error); 
})})