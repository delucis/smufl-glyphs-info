# SMuFL Glyphs Info

[![npm](https://img.shields.io/npm/v/smufl-glyphs-info.svg?style=for-the-badge)](https://www.npmjs.com/package/smufl-glyphs-info)
[![GitHub issues](https://img.shields.io/github/issues/delucis/smufl-glyphs-info.svg?style=for-the-badge&logo=github)](https://github.com/delucis/smufl-glyphs-info/issues)


This package provides support files for use with the [Glyphs](https://glyphsapp.com/) font editing software that make it easier to develop fonts to the [SMuFL](https://www.smufl.org/) (Standard Music Font Layout) [specification](https://w3c.github.io/smufl/gitbook/).

It also includes a command line interface to help speed up installation of these support files.


## Installation

To use the command line interface you will need to install this package using the Node Package Manager (NPM):

```sh
npm install -g smufl-glyphs-info
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
> Installing Node also installs the Node Package Manager, which is more commonly known as “NPM”. Here’s how the NPM installation command above breaks down:
>
> 1. `npm` tells your terminal to start running the Node Package Manager.
>
> 2. `install` tells NPM that you want to install a package.
>
> 3. `-g` tells NPM that you want to install the package **g**lobally, rather than only for a local project.
>
> 4. `smufl-glyphs-info` tells NPM the name of the package you want to install.

  [ec50e337]: https://nodejs.org/en/download/package-manager/#macos "Installing Node.js via package manager"

</details>


## Usage

To install the support files using the command line interface run the following in your terminal:

```sh
smufl-glyphs
```

Follow the on-screen prompts to complete the installation. If you have existing `GlyphData.xml` or `Groups.plist` files, you will be asked if you want to overwrite them.

More information on how to use the `smufl-glyphs` command can be found by running:

```sh
smufl-glyphs --help
```


## Details

The Glyphs font editing software allows for the [expansion of its standard glyph database][0848a1b2] and [custom categorisation in its left sidebar][ab9bad53] by providing custom `GlyphData.xml` and `Groups.plist` files.

  [0848a1b2]: https://glyphsapp.com/tutorials/roll-your-own-glyph-data "Roll Your Own Glyph Data - Tutorial on glyphsapp.com"
  [ab9bad53]: https://glyphsapp.com/tutorials/custom-sidebar-entries-in-font-view "Custom Sidebar Entries in Font View - Tutorial on glyphsapp.com"

This package provides:

1. [`GlyphData.xml`](dist/GlyphData.xml), which describes all of the glyphs defined in the SMuFL specification’s [`glyphnames.json`][dcbb20f3] so that Glyphs can understand these nonstandard codepoints.

2. [`Groups.plist`](dist/Groups.plist), which defines a custom `SMuFL` category in Glyphs’ left sidebar with sub-categories for each unicode range specified in the SMuFL specification’s [`ranges.json`][442459d7].

  [dcbb20f3]: https://w3c.github.io/smufl/gitbook/specification/glyphnames.html "Information about glyphnames.json from the SMuFL specification"
  [442459d7]: https://w3c.github.io/smufl/gitbook/specification/ranges.html "Information about ranges.json from the SMuFL specification"

If you would like to access these files directly, you will find them in [the `dist` directory](dist).

<p align=center>
<img alt="Screenshot of the left sidebar in Glyphs with SMuFL support files installed" src="https://github.com/delucis/smufl-glyphs-info/raw/master/.github/sidebar-screenshot.png" /><br><br>
An example of the Glyphs left sidebar with the files installed
</p>

### Manually copying the support files

Running the `smufl-glyphs` command in your terminal will copy these support files to Glyphs’ `Application Support` directory for you, but this can also be done manually if you prefer to avoid Node, the Terminal, and other scary things.

You can find Glyphs’ `Application Support` directory at: `/Users/YOUR-USER-NAME/Library/Application Support/Glyphs`.

One quick way to find this is to open Glyphs and select **Script** > **Open Scripts Folder**.

If it doesn’t exist, you should create an `Info` directory alongside the `Scripts` directory to put `GlyphData.xml` and `Groups.plist` in.

You should end up with a directory structure like this:

    ~/Library
    └── Application Support
        └── Glyphs
            ├── Info
            │   ├── GlyphData.xml
            │   └── Groups.plist
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
