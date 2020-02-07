function processGrid(rowCount, columnCount, width, height, boxSize) {
  project.clear();
  const graph = new GraphMatrix(rowCount, columnCount, Box);
  graph.process();
  states.Context.ActiveGrid = new Grid(width, height, graph, boxSize);
  states.Context.ActiveGrid.paintGrid();

  states.Context.ActiveGrid.onStartEndSet = function() {
    if (
      states.Context.ActiveGrid.startNode != null &&
      states.Context.ActiveGrid.endNode != null
    ) {
      states.actionPanel.removeClass("d-none");
    } else {
      states.actionPanel.addClass("d-none");
    }
  };

  states.Context.ActiveGrid.onRunnerStop = function() {
    states.startStopBtn.text("Visualize").prop("disabled", false);
    states.resetGraphBtn.prop("disabled", false);
    states.clearGraphBtn.prop("disabled", false);
    states.runnerDuration.text(
      `${states.Context.ActiveGrid.runner.duration} ms`
    );
    states.nextStepBtn.hide();
  };
  states.algoNameDisplay.text(states.Context.ActiveGrid.runner.name);
}

function resetGrid() {
  states.Context.ActiveGrid.resetTraversal();
  const sn = states.Context.ActiveGrid.startNode;
  const en = states.Context.ActiveGrid.endNode;
  sn ? sn.resetText() : null;
  en ? en.resetText() : null;
}

function init() {
  let boxSize = states.DEFAULT_BOX_SIZE;
  let [rowCount, columnCount] = getRowColumnCount(boxSize);

  states.rowCountInput.val(rowCount);
  states.columnCountInput.val(columnCount);
  states.boxSizeInput.val(boxSize);
  states.resetGraphBtn.prop("disabled", true);
  states.nextStepBtn.hide();
  states.admissibleValue.val(states.Context.AdmissibleValue);
  states.admissibleValueDisplay.text(states.Context.AdmissibleValue);

  states.rowCountInput.change(function(event) {
    rowCount = parseInt($(this).val()) || Math.trunc(states.height / t);
    processGrid(rowCount, columnCount, states.width, states.height, boxSize);
  });
  states.columnCountInput.change(function(event) {
    columnCount = parseInt($(this).val()) || Math.trunc(states.width / t);
    processGrid(rowCount, columnCount, states.width, states.height, boxSize);
  });
  states.boxSizeInput.change(function(event) {
    boxSize = parseInt($(this).val());
    [rowCount, columnCount] = getRowColumnCount(boxSize);
    processGrid(rowCount, columnCount, states.width, states.height, boxSize);
  });
  states.toolModeInput.change(function(event) {
    states.Context.ActiveGrid.actionMode = states.TOOL_MODE[this.value];
  });
  states.clearGraphBtn.click(function(event) {
    states.Context.ActiveGrid.clearGrid();
    states.startStopBtn.text("Visualize").prop("disabled", false);
    states.resetGraphBtn.prop("disabled", true);
  });
  states.resetGraphBtn.click(function(event) {
    resetGrid();
  });
  states.startStopBtn.click(function(event) {
    if (states.Context.ActiveGrid.runner.speed == states.RunnerSpeeds.Step) {
      states.nextStepBtn.show();
    } else {
      states.nextStepBtn.hide();
    }
    states.Context.ActiveGrid.visualize();
    states.startStopBtn.text("Running..").prop("disabled", true);
    states.runnerDuration.text("...");
    states.resetGraphBtn.prop("disabled", true);
    states.clearGraphBtn.prop("disabled", true);
  });
  states.algoSelection.click(function(event) {
    if (
      !states.Context.ActiveGrid.runner.running ||
      states.Context.ActiveGrid.runner.speed == null
    ) {
      const algo = event.target.dataset["algo"];
      const extraData = event.target.dataset;
      if (
        states.Context.ActiveGrid.runner &&
        !states.Context.ActiveGrid.runner.finish
      ) {
        states.Context.ActiveGrid.runner.stop();
      }
      states.Context.ActiveGrid.setRunner(algo, extraData);
      resetGrid();
      if (
        states.Context.ActiveGrid.startNode &&
        states.Context.ActiveGrid.endNode
      ) {
        states.actionPanel.removeClass("invisible");
      }
      states.algoNameDisplay.text(states.Context.ActiveGrid.runner.name);
    }
  });

  states.speedSelection.click(function(event) {
    const grid = states.Context.ActiveGrid;
    const speed = event.target.dataset["speed"];
    grid.setRunnerSpeed(states.RunnerSpeeds[speed]);
    states.speedNameDisplay.text(speed);

    if (speed != "Step") {
      states.nextStepBtn.hide();
      grid.runner.nextStep();
    } else if (grid.runner.running) {
      states.nextStepBtn.show();
    }
  });

  states.nextStepBtn.click(function(event) {
    states.Context.ActiveGrid.runner.nextStep();
  });

  states.admissibleValue.change(function(event) {
    if (this.value < 1 || this.value > 100) {
      $(this).val(1);
    }
    states.Context.AdmissibleValue = this.value;
    states.admissibleValueDisplay.text(this.value);
  });

  processGrid(rowCount, columnCount, states.width, states.height, boxSize);
}

paper.install(window);
$(document).ready(function(_) {
  paper.setup("graph-canvas");
  init();
});

$(function() {
  $('[data-toggle="popover"]').popover();
  $('[data-toggle="tooltip"]').tooltip();
});

$(".dropdown-menu a.dropdown-toggle").on("click", function(e) {
  if (
    !$(this)
      .next()
      .hasClass("show")
  ) {
    $(this)
      .parents(".dropdown-menu")
      .first()
      .find(".show")
      .removeClass("show");
  }
  var $subMenu = $(this).next(".dropdown-menu");
  $subMenu.toggleClass("show");

  $(this)
    .parents("li.nav-item.dropdown.show")
    .on("hidden.bs.dropdown", function(e) {
      $(".dropdown-submenu .show").removeClass("show");
    });

  return false;
});
