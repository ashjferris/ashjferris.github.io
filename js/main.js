(function () {
  "use strict";

  var field = document.querySelector("[data-knowledge-field]");
  if (!field) return;

  var svg = field.querySelector("svg");
  var detail = field.querySelector(".field-detail");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var labels = {
    ai: "Building systems that can reason, act, and adapt.",
    cognition: "How minds attend, remember, learn, and decide.",
    metacognition: "What it means to know what you know.",
    agents: "Turning complex human workflows into reliable software.",
    research: "Reading closely, testing claims, and finding useful questions.",
    art: "Painting and drawing as other ways of seeing.",
    design: "Making complex ideas feel clear, calm, and considered."
  };
  var nodes = Array.prototype.map.call(svg.querySelectorAll("[data-node]"), function (el, index) {
    return { el: el, id: el.dataset.node, x: +el.dataset.x, y: +el.dataset.y, dx: 0, dy: 0, phase: index * 1.7 };
  });
  var pointer = { x: -1000, y: -1000, active: false };

  function positionLines() {
    svg.querySelectorAll("line[data-from]").forEach(function (line) {
      var a = nodes.find(function (node) { return node.id === line.dataset.from; });
      var b = nodes.find(function (node) { return node.id === line.dataset.to; });
      line.setAttribute("x1", a.x + a.dx);
      line.setAttribute("y1", a.y + a.dy);
      line.setAttribute("x2", b.x + b.dx);
      line.setAttribute("y2", b.y + b.dy);
    });
  }

  function draw(time) {
    nodes.forEach(function (node) {
      var driftX = reducedMotion ? 0 : Math.sin(time / 2900 + node.phase) * 3;
      var driftY = reducedMotion ? 0 : Math.cos(time / 3400 + node.phase) * 3;
      var pushX = 0;
      var pushY = 0;
      if (pointer.active && !reducedMotion) {
        var nx = node.x + driftX;
        var ny = node.y + driftY;
        var vx = nx - pointer.x;
        var vy = ny - pointer.y;
        var distance = Math.max(1, Math.sqrt(vx * vx + vy * vy));
        if (distance < 125) {
          var force = (125 - distance) / 13;
          pushX = (vx / distance) * force;
          pushY = (vy / distance) * force;
        }
      }
      node.dx = driftX + pushX;
      node.dy = driftY + pushY;
      node.el.setAttribute("transform", "translate(" + (node.x + node.dx) + " " + (node.y + node.dy) + ")");
    });
    positionLines();
    if (!reducedMotion) requestAnimationFrame(draw);
  }

  svg.addEventListener("pointermove", function (event) {
    var point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    var local = point.matrixTransform(svg.getScreenCTM().inverse());
    pointer.x = local.x;
    pointer.y = local.y;
    pointer.active = true;
  });
  svg.addEventListener("pointerleave", function () { pointer.active = false; });

  nodes.forEach(function (node) {
    function activate() {
      nodes.forEach(function (other) { other.el.classList.toggle("is-active", other === node); });
      svg.querySelectorAll("line[data-from]").forEach(function (line) {
        line.classList.toggle("is-active", line.dataset.from === node.id || line.dataset.to === node.id);
      });
      detail.textContent = labels[node.id];
    }
    node.el.addEventListener("pointerenter", activate);
    node.el.querySelector("a").addEventListener("focus", activate);
  });

  positionLines();
  if (reducedMotion) draw(0); else requestAnimationFrame(draw);
})();
