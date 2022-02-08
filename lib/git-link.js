'use babel';

import GitLinkView from './git-link-view';
import Path from 'path';
import { CompositeDisposable, BufferedProcess } from 'atom';

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
      'git-link:line': () => this.line()
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

  async line() {
      // Must have an active editor
      editor = atom.workspace.getActiveTextEditor()
      if (!editor) {
          return
      }

      let repo
      const { stdout: origin } = await this.git(['config', '--get', 'remote.origin.url'])
      repo = origin.trim()
          .replace(/^git@/, 'https://')
          .replace(/\.com:/, '.com/')
          .replace(/\.git$/, '')

      const { stdout: log } = await this.git(['log', '--pretty=oneline', '-1'])
      const commitHash = log.split(' ')[0]

      const { stdout: rootDirectory } = await this.git(['rev-parse', '--show-toplevel'])
      const gitDirectory = rootDirectory.trim()

      const cursor = editor.getCursors()[0];
      const line = cursor.getBufferRow() + 1;
      const filePath = this.forwardFilePath();

      const relativePath = filePath.replace(gitDirectory, '')
          .replace(gitDirectory, '')
          // Clean path as directory and files must have weird names
          .split(Path.sep)
          .map((fragment) => encodeURIComponent(fragment))
          .join(Path.sep)

      const link = repo + '/blob/' + commitHash + relativePath + '#L' + line
      atom.clipboard.write(link)
      atom.notifications.addInfo('Copied link for current line to clipboard', { detail: link })
  },

  filePath: function() {
    return atom.workspace.getActiveTextEditor().getBuffer().getPath();
  },
  fileDirectory: function() {
    return Path.dirname(this.filePath());
  },
  forwardFilePath: function() {
      return this.filePath().replace(/\\/g, '/');
  },

  /**
   * Promise based git call.
   *
   * @param []string args: passes along to the BufferedProcess call
   * @param string cwd: the current working directory for the git exec (defaults to current file's directory)
   */
  git(args, cwd) {
      if (typeof cwd === "undefined" || cwd === null) {
        cwd = this.fileDirectory();
      }
      var stdout = ''
      var errors = ''
      const myPromise = new Promise((resolve, reject) => {
          try {
              new BufferedProcess({
                command: 'git',
                args,
                options: { cwd },
                stdout(output) {
                    console.log(output)
                    stdout += output
                },
                stderr(errorOutput) {
                    if (typeof errorOutput !== "undefined" && errorOutput !== null) {
                        console.error(errorOutput);
                    }
                    errors += errorOutput
                },
                exit(code) {
                    console.log("`git " + (args.join(' ')) + "` exited with status: " + code);
                    resolve({ code, stdout, errors })
                }
              })
          } catch (e) {
              console.error(e);
              reject(e)
          }
      })
      return myPromise
  }

};
