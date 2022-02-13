'use babel';

const github = ({
    repo,
}) => ({
    hostsRepo: ({ host, response }) => {
        // If it's the known public domain (GitHub.com)
        if (host.toLowerCase() === 'github.com') {
            return true
        }

        // It's github if the header has this key
        if (response.headers['x-github-request-id']) {
            return true
        }

        // It's github if there is a cookie with this session key (_gh_sess or _octo)
        // TODO ?

        // Otherwise..
        return false
    },
    getSelectionLink: ({ commitHash, relativePath, start, end }) => `${repo}/blob/${commitHash}${relativePath}#L${start}-L${end}`,
    getLineLink: ({ commitHash, relativePath, start }) => `${repo}/blob/${commitHash}${relativePath}#L${start}`,
    getFileLink: ({ commitHash, relativePath }) => `${repo}/blob/${commitHash}${relativePath}`,
})

export default github