'use babel';

import { toShortHash } from '../git'

const bitbucket = ({
    repo,
}) => ({
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
    getSelectionLink: ({ commitHash, relativePath, start, end }) => `${repo}/src/${toShortHash(commitHash)}${relativePath}#lines-${start}:${end}`,
    getLineLink: ({ commitHash, relativePath, start }) => `${repo}/src/${toShortHash(commitHash)}${relativePath}#lines-${start}`,
    getFileLink: ({ commitHash, relativePath }) => `${repo}/src/${toShortHash(commitHash)}${relativePath}`,

})

export default bitbucket