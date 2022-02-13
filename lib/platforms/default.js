'use babel';

// Generic fallback for everything else, based on GitLab's format, without any special GitHub support.
const genericDefault = ({
    repo,
}) => ({
    hostsRepo: () => false,
    getSelectionLink: ({ commitHash, relativePath, start, end }) => `${repo}/blob/${commitHash}${relativePath}#L${start}-${end}`,
    getLineLink: ({ commitHash, relativePath, start }) => `${repo}/blob/${commitHash}${relativePath}#L${start}`,
    getFileLink: ({ commitHash, relativePath }) => `${repo}/blob/${commitHash}${relativePath}`,
})

export default genericDefault