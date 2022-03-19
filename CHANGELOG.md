# Change Log

## [Unreleased]

## [1.0.0]

- Load multiple svg files
- Display glyphs/icons in a dedicated page
- Search into all glyphs

## [1.1.0]

- Fix
  - [#4](https://github.com/pH0xe/SVG-Glyph-Viewer/issues/4) : Apply search when adding new file
  - [#5](https://github.com/pH0xe/SVG-Glyph-Viewer/issues/5) : Rework the style with css variables to ensure it is displayed correctly in the light theme
  - [#7](https://github.com/pH0xe/SVG-Glyph-Viewer/issues/7) : Extension don't crash when a file is not found. Display an error message to user
  - [#8](https://github.com/pH0xe/SVG-Glyph-Viewer/issues/8) : allow to load files which are not in the workspace by replacing custom function (shame on me) by node modules (path)
- Optimization
  - [#6](https://github.com/pH0xe/SVG-Glyph-Viewer/issues/6) : Reduce extension size and loading time by bundling and excluding files


## [1.1.1]

- Fix
  - switching from webpack to esbuild
  - Adding missing dependencies (codicons & webview-ui-toolkit)