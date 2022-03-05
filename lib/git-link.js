import { filePath, forwardFilePath, fileDirectory } from './path';
import git from './git';
import { CompositeDisposable } from 'atom';
import { shell } from 'electron';
import platform from './platform';
import fs from 'fs';

export default {
  subscriptions: null,
  // Convenience helper
  openLinkOnDoubleCopy: true,

  activate() {

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'git-link:copy-link-to-line': () => this.linkLine(),
      'git-link:copy-link-to-selection': () => this.linkSelection(),
      'git-link:copy-link-to-file': () => this.linkFile(),
      'git-link:copy-link-to-repository': () => this.linkRepository(),

      // TODO: Add these commands
      // 'git-link:copy-edit-link-to-line': () => this.linkLine(),
      // 'git-link:copy-edit-link-to-selection': () => this.linkSelection(),
      // 'git-link:copy-edit-link-to-file': () => this.linkFile(),

      'git-link:open-line-in-browser': () => this.openLine(),
      'git-link:open-selection-in-browser': () => this.openSelection(),
      'git-link:open-file-in-browser': () => this.openFile(),
      'git-link:open-link-to-repository': () => this.openRepository(),

      'git-link:edit-line-in-browser': () => this.editLine(),
      'git-link:edit-selection-in-browser': () => this.editSelection(),
      'git-link:edit-file-in-browser': () => this.editFile(),
      'git-link:open-context-menu-selection-in-browser': (data) => this.openContextMenuSelectionInBrowser(data),
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  async getPlatform(file = null) {
      // if (this.platform) {
      //     return this.platform
      // }
      const cwd = file ? fileDirectory(file) : null

      const { stdout: origin } = await git(['config', '--get', 'remote.origin.url'], cwd)
      const repo = this.getRepoFromOrigin(origin)

      const p = await platform.create({ repo })
      this.platform = p
      return p
  },

  async getCommitHash() {
      const { stdout: log } = await git(['log', '--pretty=oneline', '-1'])
      const commitHash = this.getCommitHashFromLog(log)
      return commitHash
  },

  async getRelativePath(path) {
      let filePath = forwardFilePath(path);
      const { stdout: rootDirectory } = await git(['rev-parse', '--show-toplevel'])
      const gitDirectory = rootDirectory.trim()
      // If the file path does not contain the gitDirectory, then symlinking
      // may be involved. If so, resolve the real path.
      // Might be more levels of symlinking but perhaps 1 level of checks is
      // sufficient for now.
      if (filePath.indexOf(gitDirectory) === -1) {
          filePath = fs.realpathSync(filePath)
      }

      const relativePath = this.cleanPath(filePath.replace(gitDirectory, ''))
      return relativePath
  },

  // Core methods
  async file() {
      const p = await this.getPlatform()
      const relativePath = await this.getRelativePath(filePath())
      const commitHash = await this.getCommitHash()
      return p.getFileLink({ commitHash, relativePath })
  },

  async line() {
      // Must have an active editor.
      const editor = atom.workspace.getActiveTextEditor()
      if (!editor) {
          return false
      }

      const p = await this.getPlatform()
      const relativePath = await this.getRelativePath(filePath())
      const commitHash = await this.getCommitHash()

      const [start, , startColumn, endColumn] = this.getCurrentSelection()

      // [Special foo - to make it visually clearer which part of text was highlighted if any]
      // If:
      // - the selection is a valid 'word boundary' (otherwise it won't work OR highlight invalid bits)
      // - the selection is unique in the file,
      // - and the service is not one which supports column highlighting,
      // then: use chromium's highlight text fragment :~:text=[prefix-,]textStart[,textEnd][,-suffix]
      // Select text in line (based on mental heuristic - might be a hit or miss)
      // TODO

      return p.getLineLink({ relativePath, commitHash, start, startColumn, endColumn })
  },

  async selection() {
      // Must have an active editor.
      const editor = atom.workspace.getActiveTextEditor()
      if (!editor) {
          return false
      }

      const p = await this.getPlatform()
      const relativePath = await this.getRelativePath(filePath())
      const commitHash = await this.getCommitHash()
      const currentSelection = this.getCurrentSelection()
      if (!currentSelection) {
          return false
      }
      const [start, end, startColumn, endColumn] = currentSelection

      // Return the shorter version if the end line is on the same line.
      if (end === start) {
          return p.getLineLink({ relativePath, commitHash, start, startColumn, endColumn })
      }

      return p.getSelectionLink({ relativePath, commitHash, start, end, startColumn, endColumn })
  },

  /**
   * Returns the most relevant git repository.
   *
   * This will return the git repository URL of a subdirectory / submodule of
   * the project if it is currently focused, otherwise it will return the
   * project's git repository if there is one found at the root level.
   */
  async repository() {
      const p = await this.getPlatform()
      return p.getRepo()
  },

  // Copy/link actions (e.g. copy to clipboard)
  // Open actions (e.g. open in browser)
  async linkFile() {
      const link = await this.file()
      if (!link) {
          return false
      }

      if (this.openLinkOnDoubleCopy && this.openLinkIfMatchesClipboard(link)) {
          return
      }
      atom.clipboard.write(link)
      atom.notifications.addInfo('Copied link for current file to clipboard', { detail: link })
  },
  async linkLine() {
      const link = await this.line()
      if (!link) {
          return false
      }

      if (this.openLinkOnDoubleCopy && this.openLinkIfMatchesClipboard(link)) {
          return
      }
      atom.clipboard.write(link)
      atom.notifications.addInfo('Copied link for current line to clipboard', { detail: link })
  },
  async linkSelection() {
      const link = await this.selection()
      if (!link) {
          return false
      }

      if (this.openLinkOnDoubleCopy && this.openLinkIfMatchesClipboard(link)) {
          return
      }
      atom.clipboard.write(link)
      atom.notifications.addInfo('Copied link for current selection to clipboard', { detail: link })
  },

  async linkRepository() {
      const link = await this.repository()
      this.handleCopy(link, 'Copied link for current repository to clipboard')
  },

  handleCopy(link, message = '') {
      if (!link) {
          return false
      }

      if (this.openLinkOnDoubleCopy && this.openLinkIfMatchesClipboard(link)) {
          return
      }
      atom.clipboard.write(link)
      atom.notifications.addInfo(message, { detail: link })
  },

  openLinkIfMatchesClipboard(link) {
      if (link === atom.clipboard.read()) {
          // Check clipboard for link value. If it's the same it's a double (or
          // more) copy and Atom should open the link.
          shell.openExternal(link);
          atom.notifications.addInfo('Already copied. Opening in browser..')
          return true
      }
      return false
  },

  // Open actions (e.g. without copying)
  async openFile() {
      const link = await this.file()
      shell.openExternal(link);
  },
  async openLine() {
      const link = await this.line()
      shell.openExternal(link);
  },
  async openSelection() {
      const link = await this.selection()
      shell.openExternal(link);
  },
  async openRepository() {
      const link = await this.repository()
      shell.openExternal(link);
  },

  // Edit actions (e.g. opening the editor for the resource - might not always work, you may need to be on a branch)
  // Note: For now, only support github and use the github.dev domain instead, everything else can stay the same.
  async editFile() {
      const link = await this.file()
      shell.openExternal(link.replace('github.com', 'github.dev'));
  },
  async editLine() {
      const link = await this.line()
      shell.openExternal(link.replace('github.com', 'github.dev'));
  },
  async editSelection() {
      const link = await this.selection()
      shell.openExternal(link.replace('github.com', 'github.dev'));
  },

  /**
   * Returns the current selection.
   *
   * This is in 'human' understandable numbers, and matches the line numbers you
   * should see from the default Atom experience. If the selection is out of
   * scope, then the return value is false instead.
   *
   * @returns {[int, int, int, int] | false}
   */
  getCurrentSelection() {
      // Must have an active editor.
      const editor = atom.workspace.getActiveTextEditor()
      if (!editor) {
          return false
      }
      const cursor = editor.getCursors()[0];
      const start = cursor.selection.getBufferRange().start
      const startLine = start.row + 1
      const end = cursor.selection.getBufferRange().end
      let endLine = end.row
      if (end.column !== 0) {
          endLine++
      }
      if (endLine <= startLine) {
          endLine = startLine
      }
      const startColumn = start.column + 1 // Start from 1, not zero
      const endColumn = end.column + 1 // Start from 1, not zero
      return [startLine, endLine, startColumn, endColumn]
  },

  // Break each functionality down to more easily testable components
  getRepoFromOrigin(origin) {
      const repo =  origin.trim()
          .replace(/^git@/, 'https://')
          // Not always ending in .com, now it should support more URLs
          // TODO: Figure out urls with non-standard ports?
          .replace(/(:)([^\/])/gm, '/$2')
          .replace(/\.git$/, '')
          // Remove the leading username from the repo link
          .replace(/(\/\/)(.*@)/gm, '$1')

      return repo
  },

  /**
   * NOTE: Generally try and use the short hash format where possible. There are
   * places where it cannot be used (e.g. issue creation referencing).
   */
  getCommitHashFromLog(log) {
      const commitHash = log.split(' ')[0]
      return commitHash
  },

  cleanPath(filePath) {
      const cleanedPath = filePath
          // Normalise the path separators
          .replace(/\\/gm, '/')
          // Clean path as directory and files might have weird names
          .split('/')
          .map((fragment) => encodeURIComponent(fragment))
          .join('/')
          // Ensure markdown files are shown in plaintext by appending the
          // `plain=1` param to the resulting URL
          .replace(/(\.(md|markdown))$/gm, '$1?plain=1')

      return cleanedPath
  },

  async openContextMenuSelectionInBrowser(element) {
      const p = await this.getPlatform()
      // TODO: Refactor/cleanup as this is just ugly :(
      const path = element.target.dataset.path
          ? element.target.dataset.path // File
          : (
              (element.target.firstElementChild // Folder
              && element.target.firstElementChild.dataset.path)
              ? element.target.firstElementChild.dataset.path
              : (element.target.parentElement.dataset.path
                  ?? element.target.parentElement.parentElement.dataset.path) // Tab
          )

      // If no path was detected, it's probably not a valid file anyways - do nothing
      if (!path) {
          return false
      }

      const relativePath = await this.getRelativePath(path)
      const commitHash = await this.getCommitHash()
      const link = p.getFileLink({ commitHash, relativePath })
      shell.openExternal(link);
  },

  async consumePallete(service) {
      // Added ensure the current 'scope' is defined. For example, if a
      // selection is made, the scope can be 'selection', if the main git
      // repository, is at the project path, the scope can be 'project'. If the
      // closest git repository is not the same path as the project, it might be
      // a submodule, so check for that and return that scope.
      // Ideally, it should check and return at most one scope, but multiple
      // scopes should be possible. (e.g. different packges) It would be better
      // to arrive at a consensus when same scope different names occur (e.g. project vs repo)
      service.addScopeCallback(async () => {

          const currentSelection = this.getCurrentSelection()
          if (currentSelection) {
              const [start, end, startColumn, endColumn] = currentSelection
              // In this case, it actually does need to be a selection of sorts
              if (start !== end || startColumn !== endColumn) {
                  service.addScope('selection')
                  return
              }
          }

          // service.addScope('git')
          // service.addScope('submodule')
          // service.addScope('project')
      })

      service.addSuggestionCallback(async ({ scopes }) => {
          console.log('[git-link] Getting suggestions..');
          const p = await this.getPlatform()

          // If a selection is made, then add selection related options (e.g. open on the VCS)
          if (scopes.includes('selection')) {
              service.addSuggestion({
                  title: `Open selection on ${p.type}`,
                  icon: 'browser',
                  callback: async () => this.openSelection()
              })
              return; // If a selection is made, assume other options aren't relevant for a cleaner experience
          }

          // Link to repo
          service.addSuggestion({
              title: p.getRepoDisplay(),
              icon: 'repo',
              callback: async () => shell.openExternal(p.getRepo())
          })

          // Link to issues (if a relevant page exists)
          if (p?.getIssuesLink) {
              service.addSuggestion({
                  title: 'Issues',
                  icon: 'issue-opened',
                  callback: async () => shell.openExternal(p.getIssuesLink())
              })
          }

          // Link to Pull (Merge) Requests - only gitlab seems to use the term
          // Merge so going with pull request throughout this codebase.
          service.addSuggestion({
              title: 'Pull Requests',
              icon: 'git-pull-request',
              callback: async () => shell.openExternal(p.getPullRequestsLink())
          })

          // Scope - In a git repo (based on current file backwards)
          const test = [
              // {group: 'Browser', title: 'Discussions', icon: 'comment-discussion'},
              // {group: 'Browser', title: 'Actions', icon: 'playback-play'},
              // {group: 'Browser', title: 'Projects', icon: 'tasklist'},
              // {group: 'Browser', title: 'Settings', icon: 'gear'},
          ]

          test.forEach(t => {
              // Add various commands for now to test service
              service.addSuggestion(t)
          })


      })

  }
};
