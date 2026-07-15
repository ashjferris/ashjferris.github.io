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

(function () {
  "use strict";

  var root = document.querySelector("[data-confidence-experiment]");
  if (!root) return;

  var trials = [
    { condition: "answer", topic: "Reading evidence", question: "Which conclusion is best supported by this study?", context: "A team gave one group of seedlings fertiliser and another group water. After four weeks, the fertilised seedlings were taller on average. The groups were kept in separate rooms, and the fertilised group also received more daylight.", options: ["The fertiliser caused the additional growth", "The study cannot isolate the effect of fertiliser", "Daylight caused all of the additional growth"], correct: 1, ai: 0, confidence: 91, evidence: "The fertilised seedlings were taller after four weeks.", investigation: "Because fertiliser and room conditions changed together, their effects cannot be separated." },
    { condition: "confidence", topic: "Interpreting risk", question: "Which option has the lower expected loss?", context: "Option A has a 10% chance of losing $100 and otherwise loses nothing. Option B always loses $12.", options: ["Option A", "Option B", "They have the same expected loss"], correct: 0, ai: 0, confidence: 62, evidence: "Option A's expected loss is $10; Option B's is $12.", investigation: "Expected loss is probability multiplied by loss: 0.10 × $100 = $10." },
    { condition: "evidence", topic: "Applying a policy", question: "Should this application be automatically approved?", context: "Policy: applications may be automatically approved only when identity is verified, income evidence is present, and no submitted documents contradict one another.\n\nCase: Identity is verified. A payslip is present. The declared annual income differs from the annualised payslip figure by 18%.", options: ["Yes, approve automatically", "No, send for review", "There is not enough information to decide"], correct: 1, ai: 1, confidence: 74, evidence: "The policy requires that submitted documents do not contradict one another; the income figures differ materially.", investigation: "The policy gives no tolerance for discrepancies, so the inconsistency prevents automatic approval." },
    { condition: "both", topic: "Base rates", question: "Which statement is most accurate?", context: "A screening test is 90% sensitive and 90% specific. The condition occurs in 1% of the population. A randomly selected person tests positive.", options: ["They probably have the condition", "They probably do not have the condition", "The two outcomes are equally likely"], correct: 1, ai: 0, confidence: 90, evidence: "The test correctly identifies 90% of people who have the condition.", investigation: "In 1,000 people, about 9 true positives and 99 false positives would be expected." },
    { condition: "answer", topic: "Finding an exception", question: "Which traveller may enter without additional approval?", context: "Rule: visitors need approval if they stay more than 30 days or carry commercial equipment. Researchers carrying only personal equipment are exempt from the duration rule.\n\nSam is a researcher staying 45 days with a personal laptop. Lee is staying 12 days with commercial camera equipment.", options: ["Sam only", "Lee only", "Both travellers"], correct: 0, ai: 0, confidence: 78, evidence: "Sam meets the researcher exemption; Lee carries commercial equipment.", investigation: "The exemption applies only to the duration rule, not to commercial equipment." },
    { condition: "confidence", topic: "Reading a chart", question: "Which team improved most relative to its own starting score?", context: "Team North moved from 40 to 52 points. Team South moved from 80 to 96 points. Team East moved from 25 to 35 points.", options: ["North", "South", "East"], correct: 2, ai: 1, confidence: 88, evidence: "North improved 30%, South 20%, and East 40%.", investigation: "Relative improvement divides the change by the starting score, not just the absolute increase." },
    { condition: "evidence", topic: "Distinguishing absence", question: "What can the reviewer safely conclude?", context: "A maintenance log contains no entry showing that the pressure valve was inspected in March. Inspections are normally recorded, but staff sometimes complete them before entering the record later.", options: ["The inspection definitely did not happen", "The inspection definitely happened", "The record does not establish whether it happened"], correct: 2, ai: 0, confidence: 81, evidence: "The March log contains no inspection entry, although inspections are normally recorded.", investigation: "A missing record is evidence of uncertainty, not definitive evidence that the event did not occur." },
    { condition: "both", topic: "Comparing claims", question: "Which headline is justified by the results?", context: "In a voluntary survey, people who reported using a planning app also reported completing more weekly tasks. The study did not measure their productivity before they began using the app.", options: ["Planning apps increase productivity", "App use is associated with reported task completion", "Productive people do not need planning apps"], correct: 1, ai: 1, confidence: 67, evidence: "The survey found an association, but did not establish participants' prior productivity or randomly assign app use.", investigation: "Without a baseline or random assignment, the direction and cause of the relationship remain unknown." },
    { condition: "evidence", topic: "Choosing a strategy", question: "What is the best next action?", context: "A support agent sees a rare error message after a routine account change. The standard guide has no entry for it. Repeating the change could affect billing, and the customer has not yet been charged.", options: ["Repeat the change immediately", "Tell the customer the issue is resolved", "Pause and escalate with the error details"], correct: 2, ai: 2, confidence: 86, evidence: "The error is undocumented, the consequences could affect billing, and there is still time to investigate before harm occurs.", investigation: "Escalation preserves evidence and avoids turning uncertainty into a customer-impacting action." },
    { condition: "both", topic: "Sampling", question: "What is the largest limitation of this estimate?", context: "A museum estimates visitor satisfaction by emailing a survey to annual members. Eighty-four percent of respondents report being satisfied. Most museum visitors are not members.", options: ["The percentage is too high to be credible", "The sample may not represent all visitors", "Email surveys cannot measure satisfaction"], correct: 1, ai: 0, confidence: 93, evidence: "The survey received a large number of responses and 84% of respondents selected satisfied.", investigation: "A large sample can still be systematically unrepresentative when it is drawn only from members." }
  ];

  var intro = root.querySelector("[data-experiment-intro]");
  var stage = root.querySelector("[data-experiment-stage]");
  var results = root.querySelector("[data-experiment-results]");
  var content = root.querySelector("[data-trial-content]");
  var phaseLabel = root.querySelector("[data-trial-phase]");
  var countLabel = root.querySelector("[data-trial-count]");
  var progressBar = root.querySelector("[data-progress-bar]");
  var order = [];
  var responses = [];
  var current = 0;
  var phase = "initial";
  var currentResponse = null;

  function shuffle(items) {
    return items.map(function (item) { return { item: item, rank: Math.random() }; }).sort(function (a, b) { return a.rank - b.rank; }).map(function (entry) { return entry.item; });
  }

  function optionMarkup(options, name, selected) {
    return options.map(function (option, index) {
      return '<label class="answer-option"><input type="radio" name="' + name + '" value="' + index + '"' + (selected === index ? " checked" : "") + '><span>' + option + '</span></label>';
    }).join("");
  }

  function confidenceMarkup(value, label) {
    return '<div class="confidence-control"><label class="confidence-label" for="confidence-range"><span>' + label + '</span><span class="confidence-value" data-confidence-value>' + value + '%</span></label><input id="confidence-range" type="range" min="50" max="100" step="1" value="' + value + '" data-confidence-range><div class="confidence-scale"><span>Unsure</span><span>Certain</span></div></div>';
  }

  function bindConfidence() {
    var range = content.querySelector("[data-confidence-range]");
    var value = content.querySelector("[data-confidence-value]");
    if (!range || !value) return;
    range.addEventListener("input", function () { value.textContent = range.value + "%"; });
  }

  function updateHeader() {
    countLabel.textContent = "Question " + (current + 1) + " of " + order.length;
    progressBar.style.width = ((current + (phase === "final" ? .72 : phase === "advice" ? .38 : 0)) / order.length * 100) + "%";
    phaseLabel.textContent = phase === "initial" ? "01 — Your judgment" : phase === "advice" ? "02 — The system's judgment" : "03 — Your final position";
  }

  function renderInitial() {
    phase = "initial";
    updateHeader();
    var trial = order[current];
    content.innerHTML = '<div class="trial-panel"><p class="trial-kicker">' + trial.topic + '</p><div class="trial-main"><h2>' + trial.question + '</h2><p class="trial-context">' + trial.context + '</p><fieldset class="answer-options"><legend class="skip-link">Choose an answer</legend>' + optionMarkup(trial.options, "initial-answer", -1) + '</fieldset>' + confidenceMarkup(70, "How confident are you in your answer?") + '</div><aside class="trial-aside"><p>Answer before seeing the system’s judgment. Confidence begins at 70%; adjust it to reflect what you actually believe.</p></aside></div><div class="trial-footer"><button class="experiment-button" type="button" data-submit-initial disabled>See the AI answer</button></div>';
    bindConfidence();
    var submit = content.querySelector("[data-submit-initial]");
    content.querySelectorAll('input[name="initial-answer"]').forEach(function (input) { input.addEventListener("change", function () { submit.disabled = false; }); });
    submit.addEventListener("click", function () {
      var chosen = content.querySelector('input[name="initial-answer"]:checked');
      currentResponse = { initial: +chosen.value, initialConfidence: +content.querySelector("[data-confidence-range]").value, decision: null, final: null, finalConfidence: null };
      renderAdvice();
    });
  }

  function aiCard(trial) {
    var showConfidence = trial.condition === "confidence" || trial.condition === "both";
    var showEvidence = trial.condition === "evidence" || trial.condition === "both";
    return '<div class="ai-card"><div class="ai-card-head"><span>AI response</span><span>' + (trial.condition === "answer" ? "Answer only" : trial.condition === "confidence" ? "With confidence" : trial.condition === "evidence" ? "With evidence" : "Confidence + evidence") + '</span></div><p class="ai-answer">' + trial.options[trial.ai] + '</p>' + (showConfidence ? '<div class="ai-confidence"><span class="confidence-ring" style="--confidence:' + trial.confidence + '" aria-hidden="true"></span><div><strong>' + trial.confidence + '% confident</strong><br><span>System-reported confidence</span></div></div>' : '') + (showEvidence ? '<div class="ai-evidence"><span>Evidence offered</span><p>' + trial.evidence + '</p></div>' : '') + '</div>';
  }

  function renderAdvice() {
    phase = "advice";
    updateHeader();
    var trial = order[current];
    content.innerHTML = '<div class="trial-panel"><p class="trial-kicker">Compare the judgments</p><div class="trial-main"><h2>The system chose a position.</h2>' + aiCard(trial) + '<div class="decision-options" aria-label="Choose how to respond"><button type="button" data-decision="accept">Accept the AI answer</button><button type="button" data-decision="keep">Keep my answer</button></div></div><aside class="trial-aside"><p>Your original answer was:</p><p><strong>' + trial.options[currentResponse.initial] + '</strong><br>' + currentResponse.initialConfidence + '% confident</p></aside></div>';
    content.querySelectorAll("[data-decision]").forEach(function (button) {
      button.addEventListener("click", function () {
        currentResponse.decision = button.dataset.decision;
        currentResponse.final = button.dataset.decision === "accept" ? trial.ai : currentResponse.initial;
        renderFinal();
      });
    });
  }

  function renderFinal() {
    phase = "final";
    updateHeader();
    var trial = order[current];
    content.innerHTML = '<div class="trial-panel"><p class="trial-kicker">Commit to a position</p><div class="trial-main"><h2>How certain are you now?</h2><p class="trial-context">Your final answer: <strong>' + trial.options[currentResponse.final] + '</strong></p>' + confidenceMarkup(currentResponse.initialConfidence, "How confident are you in your final answer?") + '</div><aside class="trial-aside"><p>You may become more or less confident. The important question is whether the evidence warrants the change.</p></aside></div><div class="trial-footer"><button class="experiment-button" type="button" data-submit-final>' + (current === order.length - 1 ? "See my results" : "Next question") + '</button></div>';
    bindConfidence();
    var submit = content.querySelector("[data-submit-final]");
    submit.addEventListener("click", function () {
      currentResponse.finalConfidence = +content.querySelector("[data-confidence-range]").value;
      currentResponse.trial = trial;
      responses.push(currentResponse);
      current += 1;
      currentResponse = null;
      if (current >= order.length) renderResults(); else renderInitial();
    });
  }

  function renderResults() {
    stage.hidden = true;
    results.hidden = false;
    progressBar.style.width = "100%";
    var baseline = responses.filter(function (r) { return r.initial === r.trial.correct; }).length;
    var finalCorrect = responses.filter(function (r) { return r.final === r.trial.correct; }).length;
    var helpful = responses.filter(function (r) { return r.initial !== r.trial.correct && r.trial.ai === r.trial.correct && r.final === r.trial.correct; }).length;
    var harmful = responses.filter(function (r) { return r.initial === r.trial.correct && r.trial.ai !== r.trial.correct && r.final !== r.trial.correct; }).length;
    var accepted = responses.filter(function (r) { return r.decision === "accept"; }).length;
    var calibration = Math.round(responses.reduce(function (sum, r) { var correct = r.final === r.trial.correct ? 100 : 50; return sum + Math.max(0, 100 - Math.abs(r.finalConfidence - correct) * 2); }, 0) / responses.length);
    var delta = finalCorrect - baseline;
    root.querySelector("[data-results-lede]").textContent = delta > 0 ? "The AI improved your net accuracy by " + delta + " answer" + (delta === 1 ? "" : "s") + ". The more revealing result is how selectively you relied on it." : delta < 0 ? "After seeing the AI, your net accuracy fell by " + Math.abs(delta) + " answer" + (delta === -1 ? "" : "s") + ". Confidence was persuasive even when it was not deserved." : "The AI did not change your net accuracy. It may still have changed which errors you made—and how certain you felt about them.";
    root.querySelector("[data-results-summary]").innerHTML = '<div class="result-stat"><span>Accuracy before AI</span><strong>' + baseline + '/10</strong><span>Your independent judgments</span></div><div class="result-stat"><span>Accuracy after AI</span><strong>' + finalCorrect + '/10</strong><span>' + (delta >= 0 ? "+" : "") + delta + ' net change</span></div><div class="result-stat"><span>AI answers accepted</span><strong>' + accepted + '</strong><span>Out of 10 opportunities</span></div><div class="result-stat"><span>Calibration</span><strong>' + calibration + '</strong><span>How closely confidence tracked correctness</span></div>';
    root.querySelector("[data-results-detail]").innerHTML = '<h2>Appropriate reliance</h2><p>You accepted <strong>' + helpful + '</strong> helpful correction' + (helpful === 1 ? "" : "s") + ' and followed <strong>' + harmful + '</strong> harmful suggestion' + (harmful === 1 ? "" : "s") + '. Appropriate reliance is not the same as trusting or distrusting a system. It means changing your position when the evidence earns that change.</p><h2>The larger question</h2><p><em>Were you responding to what the system knew—or to how confidently it spoke?</em></p>';
    results.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }

  function start() {
    order = shuffle(trials.slice());
    responses = [];
    current = 0;
    currentResponse = null;
    intro.hidden = true;
    results.hidden = true;
    stage.hidden = false;
    renderInitial();
    stage.scrollIntoView({ behavior: "auto", block: "start" });
  }

  root.querySelector("[data-start-experiment]").addEventListener("click", start);
  root.querySelector("[data-restart-experiment]").addEventListener("click", start);
})();
