'use babel';

const azure = ({
    repo,
}) => {
    const regex = /ssh.dev.azure.com\/v3\/([^\/]+)\/([^\/]+)/gm;
    const subst = `dev.azure.com/$1/$2/_git`;
    this.repo = repo.replace(regex, subst);

    return {
        getRepo: () => this.repo,
        hostsRepo: ({ host }) => {
            // If has a fragment of the known public domain (azure.com)
            if (host.toLowerCase().indexOf('dev.azure.com') !== -1) {
                return true
            }

            // Otherwise..
            return false
        },

        getSelectionLink: ({ commitHash, relativePath, start, end, startColumn = 1, endColumn = 2 }) => {
            if (endColumn === 1) {
                end++
            }
          return `${this.repo}?path=${relativePath}&version=GC${commitHash}&line=${start}&lineEnd=${end}&lineStartColumn=${startColumn}&lineEndColumn=${endColumn}`
        },
        getLineLink: ({ commitHash, relativePath, start, startColumn = 1, endColumn = 2 }) => `${this.repo}?path=${relativePath}&version=GC${commitHash}&line=${start}&lineEnd=${start}&lineStartColumn=${startColumn}&lineEndColumn=${endColumn}`,
        getFileLink: ({ commitHash, relativePath }) => `${this.repo}?path=${relativePath}&version=GC${commitHash}`,
    }
}

export default azure