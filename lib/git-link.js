'use babel';

import GitLinkView from './git-link-view';
import path from 'path';
import { forwardFilePath } from './path';
import git from './git';
import { CompositeDisposable } from 'atom';

export default {
  gitLinkView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.gitLinkView = new GitLinkView(state.gitLinkViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.gitLinkView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'git-link:line': () => this.linkLine(),
      'git-link:open-line': () => this.openLine(),
      'git-link:selection': () => this.linkSelection(),
      'git-link:open-selection': () => this.openSelection(),
      'git-link:file': () => this.linkFile(),
      'git-link:open-file': () => this.openFile(),
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.gitLinkView.destroy();
  },

  serialize() {
    return {
      gitLinkViewState: this.gitLinkView.serialize()
    };
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

  async selection() {
      const webUrl = await this.file()
      const cursor = editor.getCursors()[0];
      const start = cursor.selection.getBufferRange().start.row + 1
      const end = cursor.selection.getBufferRange().end
      let endLine = end.row
      if (end.column !== 0) {
          endLine++
      }
      return `${webUrl}#L${start}-${endLine}`
  },

  async line() {
      const webUrl = await this.file()
      const cursor = editor.getCursors()[0];
      const line = cursor.getBufferRow() + 1;
      return `${webUrl}#L${line}`
  },

  // Copy/link actions (e.g. copy to clipboard)
  // Open actions (e.g. open in browser)
  async linkFile() {
      const link = await this.file()
      atom.clipboard.write(link)
      atom.notifications.addInfo('Copied link for current file to clipboard', { detail: link })
  },
  async linkLine() {
      const link = await this.line()
      atom.clipboard.write(link)
      atom.notifications.addInfo('Copied link for current line to clipboard', { detail: link })
  },
  async linkSelection() {
      const link = await this.selection()
      atom.clipboard.write(link)
      atom.notifications.addInfo('Copied link for current selection to clipboard', { detail: link })
  },
};
