'use babel';

const bitbucket = ({
    repo,
}) => {

    // Remove the leading username from the repo link
    if (repo.indexOf('@') !== -1) {
        const regex = /(\/\/)(.*@)/gm;
        const subst = `$1`;
        this.repo = repo.replace(regex, subst);
    }

    return {
        getRepo: () => this.repo,
        hostsRepo: ({ host, response }) => {
            // If it's the known public domain (BitBucket.org)
            if (host.toLowerCase() === 'bitbucket.org') {
                return true
            }

            // If the header has the x-view-name
            if (response.headers['x-view-name'].indexOf('bitbucket') !== -1) {
                return true
            }

            // Otherwise..
            return false
        },
        getSelectionLink: ({ commitHash, relativePath, start, end }) => `${repo}/src/${commitHash}${relativePath}#lines-${start}:${end}`,
        getLineLink: ({ commitHash, relativePath, start }) => `${repo}/src/${commitHash}${relativePath}#lines-${start}`,
        getFileLink: ({ commitHash, relativePath }) => `${repo}/src/${commitHash}${relativePath}`,
    }
}

export default bitbucket