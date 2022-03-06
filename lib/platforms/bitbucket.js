import { toShortHash } from '../git'
import tmpl from 'reverse-string-template'

export default function ({ repo }) {
    return {
        getRepoDisplay: () => {
            const template = 'https://{%endpoint%}/{%username%}/{{repository}}'
            const { username, repository } = tmpl(repo, template)
            return `${username}/${repository}`
        },
        hostsRepo: ({ host, response }) => {
            // If it's the known public domain (BitBucket.org)
            if (host.toLowerCase() === 'bitbucket.org') {
                return true
            }

            // If the header has the x-view-name
            if (response.headers['x-view-name']?.includes('bitbucket')) {
                return true
            }

            // Otherwise..
            return false
        },
        getSelectionLink: ({ commitHash, relativePath, start, end, blame = false }) => {
            let mode = 'src'
            if (blame) {
                mode = 'annotate'
            }
            return `${repo}/${mode}/${toShortHash(commitHash)}${relativePath}#-${start}:${end}`
        },
        getLineLink: ({ commitHash, relativePath, start, blame = false }) => {
            let mode = 'src'
            if (blame) {
                mode = 'annotate'
            }
            return `${repo}/${mode}/${toShortHash(commitHash)}${relativePath}#-${start}`
        },
        getFileLink: ({ commitHash, relativePath, blame = false, history = false }) => {
            let mode = 'src'
            if (blame) {
                mode = 'annotate'
            } else if (history) {
                mode = 'commits'
            }
            return `${repo}/${mode}/${toShortHash(commitHash)}${relativePath}`
        },
    }
}