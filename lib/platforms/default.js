// Generic fallback for everything else, based on GitLab's format, without any special GitHub support.
export default function ({ repo }) {
    return {
        getRepo: () => repo,
        getRepoDisplay: () => 'Current Repository', // e.g. for this package, it would be "keevan/git-link"
        hostsRepo: () => false,
        getSelectionLink: ({ commitHash, relativePath, start, end }) => `${repo}/blob/${commitHash}${relativePath}#L${start}-${end}`,
        getLineLink: ({ commitHash, relativePath, start }) => `${repo}/blob/${commitHash}${relativePath}#L${start}`,
        getFileLink: ({ commitHash, relativePath }) => `${repo}/blob/${commitHash}${relativePath}`,
    }
}
