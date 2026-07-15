# Ash Ferris

Source for [ashjferris.github.io](https://ashjferris.github.io/), a personal site exploring applied AI, cognition, human expertise, writing, and interactive experiments.

The site is intentionally built as a small static project: plain HTML pages, shared CSS, and dependency-free JavaScript. It is published through GitHub Pages.

## Site structure

- `index.html` — homepage and interactive map of current interests
- `writing.html` — article index
- `workflow-not-work.html` — “The Workflow Is Not the Work,” reproduced from the canonical Medium article
- `metacognition.html` — essay on metacognition in AI
- `experiments.html` — interactive experiment index
- `calibrating-confidence.html` — study of appropriate reliance on AI advice
- `certain-words.html` — explainer comparing token probability with model-reported confidence
- `practice.html` — applied AI practice
- `about.html` and `contact.html` — background and contact information

Editable styles and scripts live in `css/` and `js/`. Generated assets in `dist/` are committed because GitHub Pages serves them directly.

## Local development

Start the local server:

```sh
npm run serve
```

Then visit [http://localhost:8080](http://localhost:8080). Changes to HTML appear after a refresh. Rebuild assets after changing files in `css/` or `js/`.

## Build

```sh
npm run build
```

The build script minifies CSS and copies JavaScript into `dist/`.

## Content notes

The interactive experiments currently run entirely in the browser and do not submit or store participant responses. The probability traces in “Certain Words, Uncertain Answers” are curated explanatory data and should be replaced with recorded model outputs before research use.
