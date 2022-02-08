<h1 align="center">
    git-link
</h1>
<p align="center">Easily get links to files, lines and ranges versioned in git.</p>

### Requirements

You must have git installed.

### Features

- Tested on GitHub.
- Tested on GitLab.
- Might work for more?!


- Hopefully the least distracting UI for what this package does.

Combinations (link)
Copy link to...
file
line
range (range of lines)

in
current branch
current commit

note permalink possible only if changes are pushed.

package should do HEAD request to ensure destination exists and is found. fallsback or errors if cannot compute.

most common usecases are:
link to file (current commit) - i want to show it.
link to file (latest) - e.g. i want to check it out.
link to file/line/range (same examples as above)

Buy me a coffee!