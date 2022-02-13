'use babel';

import * as platforms from './platforms'
import https from 'https'
import http from 'http'

const cachedType = {}

export default {
    /**
     * Resolves the remote platform for this git repo, using predefined settings
     * if available, otherwise matching public known urls - in the case of
     * privately hosted services.
     */
    async resolve(attributes) {
        const { repo } = attributes
        const url = new URL(repo)
        // Use cached resolved type if it exists.
        // NOTE: Also...wild assumption, I know, but I'm assuming a given
        // domain, will be a particular type of repo platform. *jaw drops*,
        // which will save a lot of HEAD aches.
        if (cachedType[url.host]) {
            return cachedType[url.host]
        }

        // Check project-manager (project specific) settings if it exists

        // Loop through all platforms and try and resolve it slowly until there
        // is a match, falling back to 'default' as a last resort.

        // If matched, store/cache the value in project-manager settings if it
        // exists, otherwise remember it for the repo matched for the remainder
        // of the session.

        // HEAD requests the repo and see what information returns
        const requestTypes = {
            http,
            https
        }
        const promise = new Promise((resolve, reject) => {
            requestTypes[url.protocol.slice(0, -1)]
                .request({ method: 'HEAD', path: url.pathname, host: url.host }, (res) => {
                    resolve(res)
                })
                .on('error', (err) => {
                    reject(err)
                })
                .end()
        })
        try {
            const response = await promise
            const matchingType = Object.keys(platforms).find(type => {
                const p = new platforms[type](attributes)
                console.log(`[git-link]: Checking ${type}`)
                return p.hostsRepo({ repo, response, host: url.host })
            })
            console.log(`[git-link]: Resolved as ${matchingType}`)
            // Store in repo cache for the session to avoid doing another HEAD request
            cachedType[url.host] = matchingType
            return matchingType
        } catch (e) {
            console.error(e)
        }

        console.warn("[git-link]: Using default link resolver")
        return 'default'
    },
    async create(attributes) {
        const type = await this.resolve(attributes)
        const Platform = platforms[type]
        console.log({ platform: new Platform(attributes) })
        return new Platform(attributes)
    }
}