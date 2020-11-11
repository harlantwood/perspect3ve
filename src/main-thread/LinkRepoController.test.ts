import LinkRepoController from './LinkRepoController'
import { PerspectivismDb } from './db'
import { v4 as uuidv4 } from 'uuid'
import faker from 'faker'
import type Link from '../acai/Links'
import type { LinkQuery } from '../acai/Links'
import { isExportDeclaration } from 'typescript'

function createLink(): Link {
    return {
        source: faker.internet.url(),
        target: faker.internet.url(),
        predicate: faker.internet.url(),
    } as Link
}

const db = new PerspectivismDb('.')
const agent = { did: 'did:local-test-agent' }
const languageController = {
    getLinksAdapter: () => null
}


describe('LinkRepoController', () => {  
    const linkRepoController = new LinkRepoController({db, languageController, agent})
    let perspective

    beforeAll(async () => {
        await new Promise((resolve) => setTimeout(resolve, 3000))
    })

    beforeEach(() => {
        perspective = { uuid: uuidv4() }
    })

    it('wraps links in expressions on addLink', () => {
        const link = createLink()
        const expression = linkRepoController.addLink(perspective, link)
        expect(expression.author).toEqual(agent)
        expect(expression.data).toEqual(link)
    })

    it('can add and get all links', async () => {
        let allLinks = []
        for(let i=0; i<5; i++) {
            const link = createLink()
            allLinks.push(link)
            linkRepoController.addLink(perspective, link)
        }
        
        const result = await linkRepoController.getLinks(perspective, {} as LinkQuery)

        expect(result.length).toEqual(5)
        for(let i=0; i<5; i++) {
            expect(result).toEqual(
                expect.arrayContaining(
                    [expect.objectContaining({data: allLinks[i]})]
                )
            )
        }
    })
})








