<h1 align="center">
    :link: git-link
</h1>
<p align="center">Easily get a web link to the current file, line or a selection</p>
<p align="center">
    <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/keevan/git-link/ci">
    <img alt="GitHub issues" src="https://img.shields.io/github/issues/keevan/git-link">
    <img alt="APM" src="https://img.shields.io/apm/dm/git-link">
    <img alt="GitHub" src="https://img.shields.io/github/license/keevan/git-link">
    <img alt="GitHub repo size" src="https://img.shields.io/github/repo-size/keevan/git-link">
</p>

<p align="center">
    <img alt="Demo" src="https://user-images.githubusercontent.com/9924643/153560901-2a21d301-db5d-44fa-b9c8-c09022a4b4bb.gif">
</p>

### Requirements

You must have git installed.

### Quick Start

#### CLI:
```
apm install git-link
```
Or search for the `git-link` package via `Settings > Packages`. Read more on [Atom Packages](https://flight-manual.atom.io/using-atom/sections/atom-packages/).

### Supported platforms

- Works for GitHub.com (public, tested).
- Works for GitLab.com (public, tested).
- It might work for others (untested).

### Features

- Share and open what you've worked on, or a bug you've spotted.
- Copy a link to a __line__, __selection__ or __file__ for the current commit
- Built with convenience in mind ([#tips](#Tips))
- Handles non-typical file and folders okay - e.g. `[myfolder]/my#file.txt`
- References markdown files in plaintext.

### Command list
No keymaps are currently set by default.

I recommended you configure your own keybindings and use what is comfortable for you. You can do this by going to `Settings > Keybindings` or open it from the Command Pallete using `Application: Open Your Keymap`.

Command List                         | Description
-------------------------------------|-------------
`git-link:copy-link-to-line`         | Copies a link to the current line
`git-link:copy-link-to-selection`    | Copies a link to the current selection
`git-link:copy-link-to-file`         | Copies a link to the current file
`git-link:open-line-in-browser`      | Opens the link to the current line in browser
`git-link:open-selection-in-browser` | Opens the link to the current selection in browser
`git-link:open-file-in-browser`      | Opens the link to the current file in browser
`git-link:edit-line-in-browser`      | Opens __edit__ link to the current line in browser
`git-link:edit-selection-in-browser` | Opens __edit__ link to the current selection in browser
`git-link:edit-file-in-browser`      | Opens __edit__ link to the current file in browser


### Tips

Personally, I got the _most value_ out of this by:
- keybinding the `git-link:copy-link-to-selection` command,
- leaning on the _default behaviour_ of opening the link on double copy
- Which means I'm able to copy a link of the current line, a selection or choose to open it in the browser __all with one keybind__.

Permalinks are possible only if changes are available remotely (changes have been pushed).

### Contributing
Please take a look at our [contributing guidelines](./.github/CONTRIBUTING.md) if you're interested in helping out!

##### Pending features
- Add context menu items, when the file needn't be open (e.g. tree view).
- Open a file locally based on a copied link.
- Add tests to ensure there are no regressions with new changes.
- Add option to disable default behaviour for 'Opening links on double copy'.
- Custom tracker integration linking (e.g. copy / open link to relevant ticket this last change)

### Support

If you like this project or found it helpful, please consider supporting it for further development.

<a href="https://liberapay.com/kevinpham/donate"><img alt="Donate using Liberapay" src="https://liberapay.com/assets/widgets/donate.svg" style="height: 40px; padding-right: 10px">
<a href="https://www.buymeacoffee.com/keevan" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 40px !important" ></a>
<a href="https://ko-fi.com/H2H3AFFHJ" target='_blank'><img height='36' style='border:0px;height:40px;' src='https://cdn.ko-fi.com/cdn/kofi1.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

### License

<img alt="GitHub" src="https://img.shields.io/github/license/keevan/git-link?label=License">
