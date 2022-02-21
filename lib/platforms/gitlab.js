'use babel';

import { toShortHash } from '../git'

const gitlab = ({
    repo,
}) => ({
    hostsRepo: ({ host, response }) => {
        // If it's the known public domain (GitLab.com)
        if (host.toLowerCase() === 'gitlab.com') {
            return true
        }

        // It's github if the header has this key
        if (response.headers['x-gitlab-feature-category']) {
            return true
        }

        // It's gitlab if there is a cookie with this session key (_gitlab_session)
        if (response.headers['set-cookie']
            && response.headers['set-cookie'].find(cookie => cookie.indexOf('_gitlab_session') !== -1)
        ) {
            return true
        }

        // Otherwise..
        return false
    },
    getSelectionLink: ({ commitHash, relativePath, start, end }) => `${repo}/blob/${toShortHash(commitHash)}${relativePath}#L${start}-${end}`,
    getLineLink: ({ commitHash, relativePath, start }) => `${repo}/blob/${toShortHash(commitHash)}${relativePath}#L${start}`,
    getFileLink: ({ commitHash, relativePath }) => `${repo}/blob/${toShortHash(commitHash)}${relativePath}`,
})

export default gitlab