
# SVG Glyph Viewer

Extension for Visual Studio Code allowing the visualisation of glyphs/icons of an svg file.

## Features

- Upload as many SVG files as you want
- Viewing glyphs/icons
- Search by name in glyphs/icons
- Customise glyphs/icons colours

## Quick Start

- To open the viewer window :
  - open the command palette (Windows: Ctrl + Shift + P, macOS: Command + Shift + P) and select the command `Glyph Viewer: Open icon previewer`
  - or use button in the Title Bar :
        <img src="https://raw.githubusercontent.com/pH0xe/SVG-Glyph-Viewer/main/res/readme/open.gif">
- Add a file using "add file" button
- Enjoy ! 

## Extension Settings

- `glyphviewer.backgroundColor`: Hexadecimal code of a colour for the - background of each icon. Can set the opacity by extending the hexadecimal.
- `glyphviewer.forgroundColor`: Hexadecimal code of a colour for the background of each icon. Can set the opacity by extending the hexadecimal.

## Release Notes

### 1.0.0

Initial release

### 1.1.0

- Fix
  - [#4](https://github.com/pH0xe/SVG-Glyph-Viewer/issues/4) : Apply search when adding new file
  - [#5](https://github.com/pH0xe/SVG-Glyph-Viewer/issues/5) : Rework the style with css variables to ensure it is displayed correctly in the light theme
  - [#7](https://github.com/pH0xe/SVG-Glyph-Viewer/issues/7) : Extension don't crash when a file is not found. Display an error message to user
  - [#8](https://github.com/pH0xe/SVG-Glyph-Viewer/issues/8) : allow to load files which are not in the workspace by replacing custom function (shame on me) by node modules (path)
- Optimization
  - [#6](https://github.com/pH0xe/SVG-Glyph-Viewer/issues/6) : Reduce extension size and loading time by bundling and excluding files
