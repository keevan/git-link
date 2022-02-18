'use babel';

import { BufferedProcess } from 'atom';
import { fileDirectory, filePath } from './path';

/**
* Promise based git call.
*
* @param []string args: passes along to the BufferedProcess call
* @param string cwd: the current working directory for the git exec (defaults to current file's directory)
*/
const git = (args, cwd) => {
  if (typeof cwd === "undefined" || cwd === null) {
    cwd = fileDirectory(filePath());
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
                stdout += output
            },
            stderr(errorOutput) {
                if (typeof errorOutput !== "undefined" && errorOutput !== null) {
                    console.error(errorOutput);
                }
                errors += errorOutput
            },
            exit(code) {
                console.group("`git " + (args.join(' ')) + "`" + `, exit code: ${code}`);
                console.log(stdout) // Show all output at once after the caller command
                console.groupEnd()
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

export default git
