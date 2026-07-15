(function () {
  "use strict";

  var root = document.querySelector("[data-token-experiment]");
  if (!root) return;

  var traces = [
    {
      short: "Capital city",
      question: "What is the capital of Australia?",
      tokens: [
        ["The", 98, [["The", 98], ["Australia's", 1], ["Canberra", 1]]],
        [" capital", 97, [["capital", 97], ["official", 2], ["largest", 1]]],
        [" of", 99, [["of", 99], ["city", 1], ["in", 0]]],
        [" Australia", 99, [["Australia", 99], ["the country", 1], ["Australia is", 0]]],
        [" is", 99, [["is", 99], ["remains", 1], ["—", 0]]],
        [" Canberra", 94, [["Canberra", 94], ["Sydney", 5], ["Melbourne", 1]]],
        [".", 99, [[".", 99], [",", 1], [" because", 0]]]
      ],
      reported: 98,
      correct: true,
      note: "Both signals are high, and external knowledge supports the answer. Agreement is reassuring—but correctness still comes from verification, not confidence alone."
    },
    {
      short: "Familiar misconception",
      question: "Which city is the capital of Turkey?",
      tokens: [
        ["The", 99, [["The", 99], ["Turkey's", 1], ["Istanbul", 0]]],
        [" capital", 98, [["capital", 98], ["largest city", 1], ["historic capital", 1]]],
        [" of", 99, [["of", 99], ["city in", 1], ["is", 0]]],
        [" Turkey", 99, [["Turkey", 99], ["Türkiye", 1], ["the country", 0]]],
        [" is", 99, [["is", 99], ["remains", 1], ["—", 0]]],
        [" Istanbul", 86, [["Istanbul", 86], ["Ankara", 13], ["İzmir", 1]]],
        [".", 99, [[".", 99], [",", 1], [" today", 0]]]
      ],
      reported: 92,
      correct: false,
      note: "The answer is fluent and confidently reported, but wrong: Ankara is the capital. A familiar association can be probable without being true."
    },
    {
      short: "Unusual wording",
      question: "A fair coin is tossed twice. What is the probability of exactly one head?",
      tokens: [
        ["Exactly", 62, [["Exactly", 62], ["The probability", 27], ["There are", 11]]],
        [" one", 93, [["one", 93], ["a single", 5], ["1", 2]]],
        [" head", 97, [["head", 97], ["heads", 2], ["success", 1]]],
        [" occurs", 71, [["occurs", 71], ["appears", 18], ["is observed", 11]]],
        [" in", 88, [["in", 88], ["for", 8], ["with", 4]]],
        [" two", 79, [["two", 79], ["2", 16], ["the two", 5]]],
        [" of", 91, [["of", 91], ["out of", 7], ["among", 2]]],
        [" four", 95, [["four", 95], ["4", 4], ["the possible", 1]]],
        [" equally", 84, [["equally", 84], ["possible", 12], ["equiprobable", 4]]],
        [" likely", 89, [["likely", 89], ["probable", 8], ["weighted", 3]]],
        [" outcomes", 96, [["outcomes", 96], ["results", 3], ["cases", 1]]],
        [", so", 73, [[", so", 73], [". Therefore", 19], ["; hence", 8]]],
        [" the answer", 82, [["the answer", 82], ["its probability", 13], ["this gives", 5]]],
        [" is", 97, [["is", 97], ["equals", 2], ["becomes", 1]]],
        [" 1/2", 91, [["1/2", 91], ["50%", 8], ["0.5", 1]]],
        [".", 99, [[".", 99], [",", 1], [" exactly", 0]]]
      ],
      reported: 96,
      correct: true,
      note: "Several phrasing choices were locally uncertain, yet the reasoning and conclusion are correct. Lower token probabilities can reflect wording rather than epistemic doubt."
    },
    {
      short: "Missing information",
      question: "A patient’s test result is positive. What is the probability they have the condition?",
      tokens: [
        ["A", 72, [["A", 72], ["The", 21], ["Without", 7]]],
        [" positive", 88, [["positive", 88], ["single positive", 8], ["test", 4]]],
        [" result", 96, [["result", 96], ["test", 3], ["screen", 1]]],
        [" means", 64, [["means", 64], ["suggests", 25], ["does not by itself establish", 11]]],
        [" the", 91, [["the", 91], ["a", 6], ["this", 3]]],
        [" patient", 97, [["patient", 97], ["person", 2], ["individual", 1]]],
        [" probably", 69, [["probably", 69], ["may", 19], ["could", 12]]],
        [" has", 93, [["has", 93], ["carries", 4], ["developed", 3]]],
        [" the", 98, [["the", 98], ["that", 1], ["a", 1]]],
        [" condition", 95, [["condition", 95], ["disease", 4], ["illness", 1]]],
        [".", 98, [[".", 98], [",", 1], [";", 1]]]
      ],
      reported: 78,
      correct: false,
      note: "The prevalence, sensitivity, and specificity are missing. Neither fluent language nor a confidence score can recover evidence that was never supplied."
    },
    {
      short: "Supported restraint",
      question: "A record has no entry for the March inspection. Did the inspection occur?",
      tokens: [
        ["The", 91, [["The", 91], ["A", 6], ["It", 3]]],
        [" missing", 81, [["missing", 81], ["absence of an", 13], ["incomplete", 6]]],
        [" entry", 95, [["entry", 95], ["record", 4], ["log", 1]]],
        [" does", 93, [["does", 93], ["alone does", 5], ["cannot", 2]]],
        [" not", 99, [["not", 99], ["little", 1], ["nothing", 0]]],
        [" establish", 76, [["establish", 76], ["prove", 18], ["show", 6]]],
        [" whether", 89, [["whether", 89], ["that", 8], ["if", 3]]],
        [" the", 98, [["the", 98], ["an", 1], ["this", 1]]],
        [" inspection", 97, [["inspection", 97], ["check", 2], ["event", 1]]],
        [" occurred", 94, [["occurred", 94], ["happened", 5], ["took place", 1]]],
        [".", 99, [[".", 99], [";", 1], [",", 0]]]
      ],
      reported: 72,
      correct: true,
      note: "The model gives a restrained answer because the evidence is incomplete. Moderate reported confidence can be appropriate even when the wording itself is highly probable."
    }
  ];

  var current = 0;
  var selectedToken = 0;
  var stream = root.querySelector("[data-token-stream]");
  var detail = root.querySelector("[data-token-detail]");

  function meanProbability(trace) {
    return Math.round(trace.tokens.reduce(function (sum, token) { return sum + token[1]; }, 0) / trace.tokens.length);
  }

  function renderTokenDetail(token) {
    detail.innerHTML = '<div class="token-detail-head"><span>Selected token</span><strong>“' + token[0].trim() + '” · ' + token[1] + '%</strong></div><div class="token-alternatives">' + token[2].map(function (alternative) { return '<div class="token-alternative" style="--alt-p:' + alternative[1] + '%"><strong>' + alternative[0] + '</strong><br>' + alternative[1] + '%</div>'; }).join("") + '</div>';
  }

  function renderMap() {
    var map = root.querySelector("[data-confidence-map]");
    map.querySelectorAll(".map-point").forEach(function (point) { point.remove(); });
    traces.forEach(function (trace, index) {
      var mean = meanProbability(trace);
      var point = document.createElement("button");
      point.type = "button";
      point.className = "map-point" + (trace.correct ? "" : " is-wrong");
      point.style.setProperty("--x", ((mean - 50) * 2) + "%");
      point.style.setProperty("--y", ((trace.reported - 50) * 2) + "%");
      point.setAttribute("aria-label", trace.short + ": " + mean + "% mean token probability, " + trace.reported + "% reported confidence, " + (trace.correct ? "correct" : "incorrect"));
      point.setAttribute("aria-current", index === current ? "true" : "false");
      point.innerHTML = "<span>" + trace.short + "</span>";
      point.addEventListener("click", function () { current = index; selectedToken = 0; render(); root.querySelector("[data-trace-question]").scrollIntoView({ behavior: "smooth", block: "center" }); });
      map.appendChild(point);
    });
  }

  function render() {
    var trace = traces[current];
    var mean = meanProbability(trace);
    root.querySelector("[data-trace-index]").textContent = "Trace " + String(current + 1).padStart(2, "0") + " / " + String(traces.length).padStart(2, "0");
    root.querySelector("[data-trace-question]").textContent = trace.question;
    stream.innerHTML = "";
    trace.tokens.forEach(function (token, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "token";
      button.textContent = token[0];
      button.style.setProperty("--token-p", token[1] / 100);
      button.setAttribute("aria-label", token[0].trim() + ", " + token[1] + "% probability");
      button.setAttribute("aria-pressed", index === selectedToken ? "true" : "false");
      button.addEventListener("click", function () { selectedToken = index; render(); });
      stream.appendChild(button);
    });
    renderTokenDetail(trace.tokens[selectedToken]);
    root.querySelector("[data-token-mean]").textContent = mean + "%";
    root.querySelector("[data-token-meter]").style.setProperty("--meter", mean + "%");
    root.querySelector("[data-reported-confidence]").textContent = trace.reported + "%";
    root.querySelector("[data-confidence-meter]").style.setProperty("--meter", trace.reported + "%");
    root.querySelector("[data-trace-outcome]").textContent = trace.correct ? "Correct" : "Incorrect";
    root.querySelector("[data-trace-note]").textContent = trace.note;
    renderMap();
  }

  root.querySelector("[data-trace-previous]").addEventListener("click", function () { current = (current - 1 + traces.length) % traces.length; selectedToken = 0; render(); });
  root.querySelector("[data-trace-next]").addEventListener("click", function () { current = (current + 1) % traces.length; selectedToken = 0; render(); });
  render();
})();
