# SMuFL Glyphs Info

[![npm](https://img.shields.io/npm/v/smufl-glyphs-info.svg?style=for-the-badge)](https://www.npmjs.com/package/smufl-glyphs-info)
[![GitHub issues](https://img.shields.io/github/issues/delucis/smufl-glyphs-info.svg?style=for-the-badge&logo=github)](https://github.com/delucis/smufl-glyphs-info/issues)


This package provides support files for use with the [Glyphs](https://glyphsapp.com/) font editing software that make it easier to develop fonts to the [SMuFL](https://www.smufl.org/) (Standard Music Font Layout) [specification](https://w3c.github.io/smufl/gitbook/).

It also includes a command line interface to help speed up installation of these support files.


## Installation

To install the support files using the command line interface run the following in your terminal:
```sh
npx smufl-glyphs-info
```

<details>
<summary>Click for more details if you’re not familiar with Node or NPM</summary>

> Node.js allows you to run software written in JavaScript on your computer. The Node website includes [several options for installing Node][ec50e337] if you don’t already have it installed.
>
> If you are already using Homebrew on your Mac, it might be easiest to install Node using Homebrew:
>
> ```sh
> brew install node
> ```
>
> Installing Node also installs the Node Package Manager, which is more commonly known as “NPM” and provides the `npx` command for executing third-party packages. Here’s how the command above breaks down:
>
> 1. `npx` tells your terminal to execute a package without installing it globally.
>
> 2. `smufl-glyphs-info` tells `npx` the name of the package you want to execute.

  [ec50e337]: https://nodejs.org/en/download/package-manager/#macos "Installing Node.js via package manager"

</details>

Follow the on-screen prompts to complete the installation. If you have existing `GlyphData-smufl.xml` or `Groups-smufl.plist` files, you will be asked if you want to overwrite them.

More information on how to use the `smufl-glyphs` command can be found by running:

```sh
npx smufl-glyphs-info --help
```


## Details

The Glyphs font editing software allows for the [expansion of its standard glyph database][0848a1b2] and [custom categorisation in its left sidebar][ab9bad53] by providing custom `GlyphData-smufl.xml` and `Groups-smufl.plist` files.

  [0848a1b2]: https://glyphsapp.com/tutorials/roll-your-own-glyph-data "Roll Your Own Glyph Data - Tutorial on glyphsapp.com"
  [ab9bad53]: https://glyphsapp.com/tutorials/custom-sidebar-entries-in-font-view "Custom Sidebar Entries in Font View - Tutorial on glyphsapp.com"

This package provides:

1. [`GlyphData-smufl.xml`](dist/GlyphData-smufl.xml), which describes all of the glyphs defined in the SMuFL specification’s [`glyphnames.json`][dcbb20f3] so that Glyphs can understand these nonstandard codepoints.

2. [`Groups-smufl.plist`](dist/Groups-smufl.plist), which defines a custom `SMuFL` category in Glyphs’ left sidebar with sub-categories for each unicode range specified in the SMuFL specification’s [`ranges.json`][442459d7].

  [dcbb20f3]: https://w3c.github.io/smufl/gitbook/specification/glyphnames.html "Information about glyphnames.json from the SMuFL specification"
  [442459d7]: https://w3c.github.io/smufl/gitbook/specification/ranges.html "Information about ranges.json from the SMuFL specification"

If you would like to access these files directly, you will find them in [the `dist` directory](dist).

<p align=center>
<img alt="Screenshot of the left sidebar in Glyphs with SMuFL support files installed" src="https://github.com/delucis/smufl-glyphs-info/blob/main/.github/sidebar-screenshot.png?raw=true" width="513" height="382" /><br><br>
An example of the Glyphs left sidebar with the files installed
</p>

### Manually copying the support files

Running the `smufl-glyphs` command in your terminal will copy these support files to Glyphs’ `Application Support` directory for you, but this can also be done manually if you prefer to avoid Node, the Terminal, and other scary things.

You can find Glyphs’ `Application Support` directory at: `/Users/YOUR-USER-NAME/Library/Application Support/Glyphs 3`.

One quick way to find this is to open Glyphs and select **Script** > **Open Scripts Folder**.

If it doesn’t exist, you should create an `Info` directory alongside the `Scripts` directory to put `GlyphData-smufl.xml` and `Groups-smufl.plist` in.

You should end up with a directory structure like this:

    ~/Library
    └── Application Support
        └── Glyphs 3
            ├── Info
            │   ├── GlyphData-smufl.xml
            │   └── Groups-smufl.plist
            ├── Scripts
            └── ...


## Contributing

This package was written by someone with fairly little experience working with Glyphs, and only cursory familiarity with the SMuFL specification. If you think something ought to be done differently, that’s fantastic! Both new issues and pull requests are very welcome.

Please check out [the contribution guide](CONTRIBUTING.md) for more details, and read [the code of conduct](CODE_OF_CONDUCT.md) to learn about being gentle and kind to one another. Gentleness and kindness are good things.


## License

This software is free to use, modify, and redistribute under a [GNU General Public License](LICENSE).

## Useful Links

- Rainer Erich Scheichelbauer, [_Glyphs Tutorial: Roll Your Own Glyph Data_](https://glyphsapp.com/tutorials/roll-your-own-glyph-data)
- Rainer Erich Scheichelbauer, [_Glyphs Tutorial: Custom Sidebar Entries in Font View_](https://glyphsapp.com/tutorials/custom-sidebar-entries-in-font-view)
- Edirom/Peter Stadler, [_SMuFL-Browser_](http://edirom.de/smufl-browser/index.html)
- W3C, [‘Metadata for SMuFL glyphs and ranges,’](https://w3c.github.io/smufl/gitbook/specification/smufl-metadata.html) in: [_Standard Music Font Layout (SMuFL)_](https://w3c.github.io/smufl/gitbook/index.html)
