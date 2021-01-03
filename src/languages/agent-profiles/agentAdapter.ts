import type Address from '../../acai/Address'
import type Agent from '../../acai/Agent'
import type Expression from '../../acai/Expression'
import type { AgentAdapter as Interface } from '../../acai/Language'
import type LanguageContext from '../../acai/LanguageContext'
import type HolochainLanguageDelegate from '../../main-thread/Holochain'
import { DNA_NICK } from './dna'

export const PERSPECTIVISM_PROFILE = "PERSPECTIVISM_PROFILE"

export default class AgentAdapter implements Interface {
    #holochain: HolochainLanguageDelegate
    #context: LanguageContext

    constructor(context: LanguageContext) {
        this.#holochain = context.Holochain as HolochainLanguageDelegate
        this.#context = context
    }

    async setProfile(agent: Agent) {
        const existingProfile = await this.getProfile(this.#context.agent.did)

        const expr = this.#context.agent.createSignedExpression(agent)
        const profile = { PERSPECTIVISM_PROFILE: expr}
        if(!existingProfile) {
            const params = {
                did: agent.did,
                signed_agent: "TODO",
                profile
            }
            await this.#holochain.call(DNA_NICK, "did-profiles", "create_profile", params)
        }
        else if (!existingProfile[PERSPECTIVISM_PROFILE] || JSON.stringify(existingProfile[PERSPECTIVISM_PROFILE].data) !== JSON.stringify(agent)) {
            const params = {
                did: agent.did,
                profile
            }
            await this.#holochain.call(DNA_NICK, "did-profiles", "update_profile", params)
        } else {
            // no difference between new profile and already stored data
        }
    }

    async getProfile(did: string): Promise<Agent|void> {
        const result = await this.#holochain.call(DNA_NICK, "did-profiles", "get_profile", did)
        if(result) {
            const agentExpression = result[PERSPECTIVISM_PROFILE]
            const expr = agentExpression as Expression
            const agent = expr.data as Agent
            return agent
        } else {
            return null
        }
    }
}