'use babel';

import { forwardFilePath } from './path';
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

  async getPlatform() {
      // if (this.platform) {
      //     return this.platform
      // }

      const { stdout: origin } = await git(['config', '--get', 'remote.origin.url'])
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

  async getRelativePath() {
      let filePath = forwardFilePath();
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
      const relativePath = await this.getRelativePath()
      const commitHash = await this.getCommitHash()
      return p.getFileLink({ commitHash, relativePath })
  },

  async line() {
      // Must have an active editor.
      const editor = atom.workspace.getActiveTextEditor()
      if (!editor) {
          return
      }
      const p = await this.getPlatform()
      const relativePath = await this.getRelativePath()
      const commitHash = await this.getCommitHash()

      const [start, startColumn, endColumn] = this.getCurrentSelection()

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
          return
      }

      const p = await this.getPlatform()
      const relativePath = await this.getRelativePath()
      const commitHash = await this.getCommitHash()
      const [start, end, startColumn, endColumn] = this.getCurrentSelection()

      // Return the shorter version if the end line is on the same line.
      if (end === start) {
          return p.getLineLink({ relativePath, commitHash, start, startColumn, endColumn })
      }

      return p.getSelectionLink({ relativePath, commitHash, start, end, startColumn, endColumn })
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

  getShortCommitHash(commitHash) {
      return commitHash
          // Short hash should be 7 characters
          .substring(0, 7) // TODO add back in a better spot
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

};
