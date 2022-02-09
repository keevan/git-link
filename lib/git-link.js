'use babel';

import { forwardFilePath } from './path';
import git from './git';
import { CompositeDisposable } from 'atom';
import { shell } from 'electron';

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

      // TODO: Add these commands
      // 'git-link:copy-edit-link-to-line': () => this.linkLine(),
      // 'git-link:copy-edit-link-to-selection': () => this.linkSelection(),
      // 'git-link:copy-edit-link-to-file': () => this.linkFile(),

      'git-link:open-line-in-browser': () => this.openLine(),
      'git-link:open-selection-in-browser': () => this.openSelection(),
      'git-link:open-file-in-browser': () => this.openFile(),

      'git-link:edit-line-in-browser': () => this.editLine(),
      'git-link:edit-selection-in-browser': () => this.editSelection(),
      'git-link:edit-file-in-browser': () => this.editFile(),
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  // Core methods
  async file() {
      const { stdout: origin } = await git(['config', '--get', 'remote.origin.url'])
      const repo = this.getRepoFromOrigin(origin)

      const { stdout: log } = await git(['log', '--pretty=oneline', '-1'])
      const commitHash = this.getCommitHashFromLog(log)

      const { stdout: rootDirectory } = await git(['rev-parse', '--show-toplevel'])
      const gitDirectory = rootDirectory.trim()

      const filePath = forwardFilePath();
      const relativePath = this.getRelativePathFromForwardFilePath(filePath.replace(gitDirectory, ''))
      console.log({expect: relativePath, input: filePath.replace(gitDirectory, '')})

      return repo + '/blob/' + commitHash + relativePath
  },

  async line() {
      // Must have an active editor.
      const editor = atom.workspace.getActiveTextEditor()
      if (!editor) {
          return
      }
      const line = this.getCurrentLineNumber()
      return `${webUrl}#L${line}`
  },

  async selection() {
      // Must have an active editor.
      const editor = atom.workspace.getActiveTextEditor()
      if (!editor) {
          return
      }
      const webUrl = await this.file()
      const [start, end] = this.getCurrentSelection()

      // Return the shorter version if the end line is on the same line.
      if (end === start) {
          return `${webUrl}#L${start}`
      }

      // Github.com requires ranges to be in this format.
      if (webUrl.indexOf('github') !== -1) {
          // Gitlab requires this format.
          return `${webUrl}#L${start}-L${end}`
      }

      // Gitlab requires this format.
      return `${webUrl}#L${start}-${end}`

  },

  // Copy/link actions (e.g. copy to clipboard)
  // Open actions (e.g. open in browser)
  async linkFile() {
      const link = await this.file()
      if (this.openLinkOnDoubleCopy && this.openLinkIfMatchesClipboard(link)) {
          return
      }
      atom.clipboard.write(link)
      atom.notifications.addInfo('Copied link for current file to clipboard', { detail: link })
  },
  async linkLine() {
      const link = await this.line()
      if (this.openLinkOnDoubleCopy && this.openLinkIfMatchesClipboard(link)) {
          return
      }
      atom.clipboard.write(link)
      atom.notifications.addInfo('Copied link for current line to clipboard', { detail: link })
  },
  async linkSelection() {
      const link = await this.selection()
      if (this.openLinkOnDoubleCopy && this.openLinkIfMatchesClipboard(link)) {
          return
      }
      atom.clipboard.write(link)
      atom.notifications.addInfo('Copied link for current selection to clipboard', { detail: link })
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

  // Line helper methods
  getCurrentLineNumber() {
      // Must have an active editor.
      const editor = atom.workspace.getActiveTextEditor()
      if (!editor) {
          return
      }
      const cursor = editor.getCursors()[0];
      const line = cursor.getBufferRow() + 1;
      return line
  },
  getCurrentSelection() {
      // Must have an active editor.
      const editor = atom.workspace.getActiveTextEditor()
      if (!editor) {
          return
      }
      const cursor = editor.getCursors()[0];
      const startLine = cursor.selection.getBufferRange().start.row + 1
      const end = cursor.selection.getBufferRange().end
      let endLine = end.row
      if (end.column !== 0) {
          endLine++
      }
      if (endLine <= startLine) {
          endLine = startLine
      }
      return [startLine, endLine]
  },

  // Break each functionality down to more easily testable components
  getRepoFromOrigin(origin) {
      const repo =  origin.trim()
          .replace(/^git@/, 'https://')
          // Not always ending in .com, now it should support more URLs
          // TODO: Figure out urls with non-standard ports?
          .replace(/(:)([^\/])/gm, '/$2')
          .replace(/\.git$/, '')

      return repo
  },

  /**
   * Always use short hash format (shorter, more chaotic)
   */
  getCommitHashFromLog(log) {
      const commitHash = log.split(' ')[0]
          // Short hash should be 7 characters
          .substring(0, 7)

      return commitHash
  },

  getRelativePathFromForwardFilePath(filePath) {
      const cleanedPath = filePath
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

};
