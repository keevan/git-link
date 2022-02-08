'use babel';

import path from 'path';
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

      'git-link:copy-edit-link-to-line': () => this.linkLine(),
      'git-link:copy-edit-link-to-selection': () => this.linkSelection(),
      'git-link:copy-edit-link-to-file': () => this.linkFile(),

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
      // Must have an active editor
      editor = atom.workspace.getActiveTextEditor()
      if (!editor) {
          return
      }

      let repo
      const { stdout: origin } = await git(['config', '--get', 'remote.origin.url'])
      repo = origin.trim()
          .replace(/^git@/, 'https://')
          // Not always ending in .com, now it should support more URLs
          // TODO: Figure out urls with non-standard ports?
          .replace(/(:)([^\/])/gm, '/$2')
          .replace(/\.git$/, '')

      const { stdout: log } = await git(['log', '--pretty=oneline', '-1'])
      // Always use short hash format:
      // - link is shorter and,
      // - I like chaos (of hash collisions)
      const commitHash = log.split(' ')[0]
          // Short hash should be 7 characters
          .substring(0, 7)

      const { stdout: rootDirectory } = await git(['rev-parse', '--show-toplevel'])
      const gitDirectory = rootDirectory.trim()

      const filePath = forwardFilePath();

      const relativePath = filePath.replace(gitDirectory, '')
          .replace(gitDirectory, '')
          // Clean path as directory and files must have weird names
          .split(path.sep)
          .map((fragment) => encodeURIComponent(fragment))
          .join(path.sep)
          // Ensure markdown files are shown in plaintext
          .replace(/(\.(md|markdown))$/gm, '$1?plain=1')

      return repo + '/blob/' + commitHash + relativePath
  },

  async line() {
      const webUrl = await this.file()
      const cursor = editor.getCursors()[0];
      const line = cursor.getBufferRow() + 1;
      return `${webUrl}#L${line}`
  },

  async selection() {
      const webUrl = await this.file()
      const cursor = editor.getCursors()[0];
      const start = cursor.selection.getBufferRange().start.row + 1
      const end = cursor.selection.getBufferRange().end
      let endLine = end.row
      if (end.column !== 0) {
          endLine++
      }

      // Return the shorter version if the content is on the same line
      if (endLine === start) {
          return `${webUrl}#L${start}`
      }

      // Github.com requires ranges to be in this format
      if (webUrl.indexOf('github') !== -1) {
          // Gitlab requires this format.
          return `${webUrl}#L${start}-L${endLine}`
      }

      // Gitlab requires this format.
      return `${webUrl}#L${start}-${endLine}`

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
};
