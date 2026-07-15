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
    art: "Creative expression as a way of making sense of complexity.",
    design: "Making complex ideas feel clear, calm, and considered.",
    creativity: "Where curiosity, imagination, and intelligent systems meet.",
    evaluations: "Testing behaviour, reliability, cost, and real-world usefulness.",
    "machine-learning": "Learning patterns from data to build systems that adapt.",
    trust: "Designing systems people can understand, rely on, and question."
  };
  var nodes = Array.prototype.map.call(svg.querySelectorAll("[data-node]"), function (el, index) {
    return { el: el, id: el.dataset.node, x: +el.dataset.x, y: +el.dataset.y, dx: 0, dy: 0, vx: 0, vy: 0, phase: index * 1.7, depth: .75 + (index % 4) * .12 };
  });
  var meshNodes = Array.prototype.map.call(svg.querySelectorAll(".mesh-nodes circle"), function (el, index) {
    return { el: el, x: +el.getAttribute("cx"), y: +el.getAttribute("cy"), dx: 0, dy: 0, vx: 0, vy: 0, phase: index * 1.13, depth: .45 + (index % 5) * .1 };
  });
  var allNodes = nodes.concat(meshNodes);
  var nodeByPosition = {};
  allNodes.forEach(function (node) { nodeByPosition[node.x + "," + node.y] = node; });
  var meshLines = Array.prototype.map.call(svg.querySelectorAll(".mesh-lines line"), function (line) {
    return {
      el: line,
      a: nodeByPosition[line.getAttribute("x1") + "," + line.getAttribute("y1")],
      b: nodeByPosition[line.getAttribute("x2") + "," + line.getAttribute("y2")]
    };
  });
  var pointer = { x: -1000, y: -1000, active: false };
  var drag = null;

  function localPoint(event) {
    var point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  }

  function endDrag(event) {
    if (!drag) return;
    var node = drag.node;
    node.el.classList.remove("is-dragging");
    if (event && node.el.hasPointerCapture(event.pointerId)) node.el.releasePointerCapture(event.pointerId);
    drag = null;
  }

  function positionLines() {
    svg.querySelectorAll("line[data-from]").forEach(function (line) {
      var a = nodes.find(function (node) { return node.id === line.dataset.from; });
      var b = nodes.find(function (node) { return node.id === line.dataset.to; });
      line.setAttribute("x1", a.x + a.dx);
      line.setAttribute("y1", a.y + a.dy);
      line.setAttribute("x2", b.x + b.dx);
      line.setAttribute("y2", b.y + b.dy);
    });
    meshLines.forEach(function (line) {
      if (!line.a || !line.b) return;
      line.el.setAttribute("x1", line.a.x + line.a.dx);
      line.el.setAttribute("y1", line.a.y + line.a.dy);
      line.el.setAttribute("x2", line.b.x + line.b.dx);
      line.el.setAttribute("y2", line.b.y + line.b.dy);
    });
  }

  function draw(time) {
    allNodes.forEach(function (node) {
      if (drag && drag.node === node) {
        node.dx = 0;
        node.dy = 0;
        node.vx = 0;
        node.vy = 0;
        node.el.setAttribute("transform", "translate(" + node.x + " " + node.y + ")");
        return;
      }
      var driftX = reducedMotion ? 0 : Math.sin(time / 2600 + node.phase) * 3.5 * node.depth;
      var driftY = reducedMotion ? 0 : Math.cos(time / 3100 + node.phase) * 3.5 * node.depth;
      var pushX = 0;
      var pushY = 0;
      var fieldX = 0;
      var fieldY = 0;
      if (pointer.active && !reducedMotion) {
        var deltaX = node.x - pointer.x;
        var deltaY = node.y - pointer.y;
        var distance = Math.max(1, Math.sqrt(deltaX * deltaX + deltaY * deltaY));
        var influence = Math.exp(-(distance * distance) / (2 * 235 * 235));
        var force = influence * 30 * node.depth;
        pushX = -(deltaX / distance) * force;
        pushY = -(deltaY / distance) * force;
        fieldX = ((pointer.x - 360) / 360) * 8 * node.depth;
        fieldY = ((pointer.y - 325) / 325) * 6 * node.depth;
      }
      var targetX = driftX + pushX + fieldX;
      var targetY = driftY + pushY + fieldY;
      node.vx = (node.vx + (targetX - node.dx) * .07) * .62;
      node.vy = (node.vy + (targetY - node.dy) * .07) * .62;
      node.dx += node.vx;
      node.dy += node.vy;
      if (node.id) {
        node.el.setAttribute("transform", "translate(" + (node.x + node.dx) + " " + (node.y + node.dy) + ")");
      } else {
        node.el.setAttribute("transform", "translate(" + node.dx + " " + node.dy + ")");
      }
    });
    positionLines();
    if (!reducedMotion) requestAnimationFrame(draw);
  }

  svg.addEventListener("pointermove", function (event) {
    var local = localPoint(event);
    if (drag) {
      drag.node.x = Math.max(48, Math.min(672, local.x + drag.offsetX));
      drag.node.y = Math.max(48, Math.min(602, local.y + drag.offsetY));
      drag.node.dx = 0;
      drag.node.dy = 0;
      drag.node.vx = 0;
      drag.node.vy = 0;
      pointer.x = local.x;
      pointer.y = local.y;
      pointer.active = true;
      return;
    }
    pointer.x = local.x;
    pointer.y = local.y;
    pointer.active = true;
  });
  svg.addEventListener("pointerleave", function () { if (!drag) pointer.active = false; });
  svg.addEventListener("pointerup", endDrag);
  svg.addEventListener("pointercancel", endDrag);

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
    node.el.addEventListener("pointerdown", function (event) {
      var local = localPoint(event);
      drag = { node: node, pointerId: event.pointerId, offsetX: node.x - local.x, offsetY: node.y - local.y };
      pointer.x = local.x;
      pointer.y = local.y;
      pointer.active = true;
      node.el.classList.add("is-dragging");
      node.el.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    node.el.addEventListener("pointerup", endDrag);
    node.el.addEventListener("pointercancel", endDrag);
  });

  positionLines();
  if (reducedMotion) draw(0); else requestAnimationFrame(draw);
})();
