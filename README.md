<h1 align="center">
    🔗 git-link
</h1>
<p align="center">Easily get the repository link to the current file, line or a selection</p>
<p align="center">
    <img alt="APM" src="https://img.shields.io/apm/v/git-link">
    <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/keevan/git-link/ci">
    <img alt="GitHub issues" src="https://img.shields.io/github/issues/keevan/git-link">
    <img alt="APM" src="https://img.shields.io/apm/dm/git-link">
    <img alt="GitHub" src="https://img.shields.io/github/license/keevan/git-link">
    <img alt="GitHub code size in bytes" src="https://img.shields.io/github/languages/code-size/keevan/git-link">
</p>

<p align="center">
    <img alt="Demo" src="https://user-images.githubusercontent.com/9924643/154916523-11bd9c0c-b68f-4df8-a022-237e90f69982.gif">
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

- Works for [GitHub.com](https://github.com) (public, tested)
- Works for [GitLab.com](https://gitlab.com) (public, tested)
- Works for [BitBucket.org](https://bitbucket.org) (public, tested)
- Works for [Azure DevOps](https://dev.azure.com) (public, tested)
- It might work for others (untested, PRs welcome)

Please [add an issue](https://github.com/keevan/git-link/issues) if you need support for a platform not mentioned above.

### Features

- Share and open what you've worked on, or a bug you've spotted
- Copy a link to a __line__, __selection__ or __file__ for the current commit
- Additional features added for _command-palette-plus_
- Built with convenience in mind ([#tips](#Tips))
- Handles non-typical file and folders okay - e.g. `[myfolder]/my#file.txt`
- References markdown files in plaintext (on supported platforms)

### Command list
No keymaps are currently set by default.

I recommended you configure your own keybindings and use what is comfortable for you. You can do this by going to `Settings > Keybindings` or open it from the Command Pallete using `Application: Open Your Keymap`.

Command List                         | Description
-------------------------------------|-------------
`git-link:copy-link-to-line`         | __Copy__ a link to the current _line_
`git-link:copy-link-to-selection`    | __Copy__ a link to the current _selection_
`git-link:copy-link-to-file`         | __Copy__ a link to the current _file_
`git-link:copy-link-to-repository`   | __Copy__ a link to the current _repository_
`git-link:open-line-in-browser`      | __Open__ the current _line_ in browser
`git-link:open-selection-in-browser` | __Open__ the current _selection_ in browser
`git-link:open-file-in-browser`      | __Open__ the current _file_ in browser
`git-link:open-repository-in-browser`| __Open__ the current _repository_ in browser
`git-link:edit-line-in-browser`      | __Edit__ current _line_ in browser
`git-link:edit-selection-in-browser` | __Edit__ current _selection_ in browser
`git-link:edit-file-in-browser`      | __Edit__ current _file_ in browser


### Tips

Personally, I got the _most value_ out of this by:
- keybinding the `git-link:copy-link-to-selection` command,
- leaning on the _default behaviour_ of opening the link on double copy
- Which means I'm able to copy a link of the current line, a selection or choose to open it in the browser __all with one keybind__.

Permalinks are possible only if changes are available remotely (changes have been pushed).

### Contributing
Please take a look at our [contributing guidelines](./.github/CONTRIBUTING.md) if you're interested in helping out!

##### Pending features
- Open a file locally based on a copied link.
- Add option to disable default behaviour for 'Opening links on double copy'.
- Custom tracker integration linking (e.g. copy / open link to relevant ticket this last change)
- Open blame view for file in browser
- Open history view for file in browser
- Open issues view for file in browser
- Open PR/MR view for file in browser
- Open/Copy compare view/link e.g. to current branch or a commit for file in browser
- Detect PR branch and have a link ready for that as well (quickly jump to current PR in atom/browser) e.g. when doing a review
- Open README in browser

### Support

If you like or found this project helpful, please leave a star and consider supporting it for further development.

<a href="https://liberapay.com/kevinpham/donate"><img alt="Donate using Liberapay" src="https://liberapay.com/assets/widgets/donate.svg" style="height: 40px; padding-right: 10px">
<a href="https://www.buymeacoffee.com/keevan" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 40px !important" ></a>
<a href="https://ko-fi.com/H2H3AFFHJ" target='_blank'><img height='36' style='border:0px;height:40px;' src='https://cdn.ko-fi.com/cdn/kofi1.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

### License

<img alt="GitHub" src="https://img.shields.io/github/license/keevan/git-link?label=License">
