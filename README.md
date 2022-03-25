# @brightspace-ui/custom-early-progress-report

[![NPM version](https://img.shields.io/npm/v/@brightspace-ui/custom-early-progress-report.svg)](https://www.npmjs.org/package/@brightspace-ui/custom-early-progress-report)

Early Progress Report custom tool.

## Installation

Install from NPM:

```shell
npm install @brightspace-ui/custom-early-progress-report
```

## Usage

```html
<script type="module">
    import '@brightspace-ui/custom-early-progress-report/custom-early-progress-report.js';
</script>
<d2l-custom-early-progress-report>My element</d2l-custom-early-progress-report>
```

**Properties:**

| Property | Type | Description |
|--|--|--|
| | | |

**Accessibility:**

To make your usage of `d2l-custom-early-progress-report` accessible, use the following properties when applicable:

| Attribute | Description |
|--|--|
| | |

## Developing, Testing and Contributing

After cloning the repo, run `npm install` to install dependencies.

### Linting

```shell
# eslint and lit-analyzer
npm run lint

# eslint only
npm run lint:eslint
```

### Testing

```shell
# lint & run headless unit tests
npm test

# unit tests only
npm run test:headless

# debug or run a subset of local unit tests
# then navigate to `http://localhost:9876/debug.html`
npm run test:headless:watch
```

### Visual Diff Testing

This repo uses the [@brightspace-ui/visual-diff utility](https://github.com/BrightspaceUI/visual-diff/) to compare current snapshots against a set of golden snapshots stored in source control.

The golden snapshots in source control must be updated by Github Actions.  If your PR's code changes result in visual differences, a draft PR with the new goldens will be automatically opened for you against your branch.

If you'd like to run the tests locally to help troubleshoot or develop new tests, you can use these commands:

```shell
# install dependencies locally
npm install esm mocha puppeteer @brightspace-ui/visual-diff --no-save
# run visual-diff tests
npx mocha './test/**/*.visual-diff.js' -t 10000 --require esm
# subset of visual-diff tests:
npx mocha './test/**/*.visual-diff.js' -t 10000 --require esm -g some-pattern
# update visual-diff goldens
npx mocha './test/**/*.visual-diff.js' -t 10000 --require esm --golden
```

### Running the demos

To start an [es-dev-server](https://open-wc.org/developing/es-dev-server.html) that hosts the demo page and tests:

```shell
npm start
```

## Versioning & Releasing

The [incremental-release GitHub Action](https://github.com/BrightspaceUI/actions/tree/main/incremental-release) is called from the `release.yml` GitHub Action workflow to handle version changes and releasing.

### Triggering a Release

Releases occur based on the most recent commit message:
* Commits which contain `[increment patch]` will trigger a `patch` release. Example: `validate input before using [increment patch]`
* Commits which contain `[increment minor]` will trigger a `minor` release. Example: `add toggle() method [increment minor]`
* Commits which contain `[increment major]` will trigger a `major` release. Example: `breaking all the things [increment major]`

**Note:** When merging a pull request, this will be the merge commit message.

### Default Increment

Normally, if the most recent commit does not contain `[increment major|minor|patch]`, no release will occur. However, by setting the `DEFAULT_INCREMENT` option you can control which type of release will occur. This repo has the `DEFAULT_INCREMENT` set to be a `patch` release.

In this example, a minor release will occur if no increment value is found in the most recent commit:

```yml
uses: BrightspaceUI/actions/incremental-release@main
with:
  DEFAULT_INCREMENT: minor
```

### Skipping Releases

When a default increment is specified, sometimes you want to bypass it and skip a release. To do this, include `[skip version]` in the commit message.
