import type {
	NewsletterCreateResponse,
	WAMediaUpload,
	NewsletterFetchedUpdate,
	NewsletterReaction,
	NewsletterReactionMode,
	NewsletterViewRole
} from '../Types'
import {
	NewsletterMetadata,
	NewsletterUpdate,
	QueryIds,
	XWAPaths
} from '../Types'
import { generateProfilePicture } from '../Utils/messages-media'
import {
	getBinaryNodeChild,
	getAllBinaryNodeChildren,
	getBinaryNodeChildren
} from '../WABinary'
import { GroupsSocket } from './groups'
import { executeWMexQuery as genericExecuteWMexQuery } from './mex'
import { decryptMessageNode, generateMessageID } from '../Utils'

const parseNewsletterCreateResponse = (response: NewsletterCreateResponse): NewsletterMetadata => {
	const { id, thread_metadata: thread, viewer_metadata: viewer } = response
	return {
		id: id,
		owner: undefined,
		name: thread.name.text,
		creation_time: parseInt(thread.creation_time, 10),
		description: thread.description.text,
		invite: thread.invite,
		subscribers: parseInt(thread.subscribers_count, 10),
		verification: thread.verification,
		picture: {
			id: thread.picture.id,
			directPath: thread.picture.direct_path
		},
		mute_state: viewer.mute
	}
}

const parseNewsletterMetadata = (result: unknown): NewsletterMetadata | null => {
	if (typeof result !== 'object' || result === null) return null
	if ('id' in result && typeof result.id === 'string') return result as NewsletterMetadata
	if ('result' in result && typeof result.result === 'object' && result.result !== null && 'id' in result.result)
		return result.result as NewsletterMetadata
	return null
}

export const makeNewsletterSocket = (sock: GroupsSocket) => {
	const { query, generateMessageTag, authState, signalRepository, logger } = sock
	const encoder = new TextEncoder()

	const executeWMexQuery = <T>(variables: Record<string, unknown>, queryId: string, dataPath: string): Promise<T> => {
		return genericExecuteWMexQuery<T>(variables, queryId, dataPath, query, generateMessageTag)
	}

	const newsletterUpdate = async (jid: string, updates: NewsletterUpdate) => {
		const variables = {
			newsletter_id: jid,
			updates: {
				...updates,
				settings: null
			}
		}
		return executeWMexQuery(variables, QueryIds.UPDATE_METADATA, 'xwa2_newsletter_update')
	}

	const parseFetchedUpdates = async(node: any, type: 'messages' | 'updates') => {
		let child
		if (type === 'messages') {
			child = getBinaryNodeChild(node, 'messages')
		} else {
			const parent = getBinaryNodeChild(node, 'message_updates')
			child = getBinaryNodeChild(parent, 'messages')
		}
		return await Promise.all(getAllBinaryNodeChildren(child).map(async messageNode => {
			messageNode.attrs.from = child?.attrs.jid as string
			const views = parseInt(getBinaryNodeChild(messageNode, 'views_count')?.attrs?.count || '0')
			const reactionNode = getBinaryNodeChild(messageNode, 'reactions')
			const reactions = getBinaryNodeChildren(reactionNode, 'reaction')
				.map(({ attrs }) => ({ count: +attrs.count, code: attrs.code } as NewsletterReaction))
			const data: NewsletterFetchedUpdate = {
				server_id: messageNode.attrs.server_id,
				views,
				reactions
			}
			if (type === 'messages') {
				const { fullMessage: message, decrypt } = await decryptMessageNode(
					messageNode,
					authState.creds.me!.id,
					authState.creds.me!.lid || '',
					signalRepository,
					logger
				)
				await decrypt()
				data.message = message
			}
			return data
		}))
	}

	return {
		...sock,
		newsletterCreate: async (name: string, description?: string): Promise<NewsletterMetadata> => {
			const variables = { input: { name, description: description ?? null } }
			const rawResponse = await executeWMexQuery<NewsletterCreateResponse>(variables, QueryIds.CREATE, XWAPaths.xwa2_newsletter_create)
			return parseNewsletterCreateResponse(rawResponse)
		},
		newsletterUpdate,
		newsletterSubscribers: async (jid: string) => executeWMexQuery<{ subscribers: number }>({ newsletter_id: jid }, QueryIds.SUBSCRIBERS, XWAPaths.xwa2_newsletter_subscribers),
		newsletterMetadata: async (type: 'invite' | 'jid', key: string) => {
			const variables = {
				fetch_creation_time: true,
				fetch_full_image: true,
				fetch_viewer_metadata: true,
				input: { key, type: type.toUpperCase() }
			}
			const result = await executeWMexQuery<unknown>(variables, QueryIds.METADATA, XWAPaths.xwa2_newsletter_metadata)
			return parseNewsletterMetadata(result)
		},
		newsletterFollow: (jid: string) => executeWMexQuery({ newsletter_id: jid }, QueryIds.FOLLOW, XWAPaths.xwa2_newsletter_follow),
		newsletterUnfollow: (jid: string) => executeWMexQuery({ newsletter_id: jid }, QueryIds.UNFOLLOW, XWAPaths.xwa2_newsletter_unfollow),
		newsletterMute: (jid: string) => executeWMexQuery({ newsletter_id: jid }, QueryIds.MUTE, XWAPaths.xwa2_newsletter_mute_v2),
		newsletterUnmute: (jid: string) => executeWMexQuery({ newsletter_id: jid }, QueryIds.UNMUTE, XWAPaths.xwa2_newsletter_unmute_v2),
		newsletterUpdateName: async (jid: string, name: string) => newsletterUpdate(jid, { name }),
		newsletterUpdateDescription: async (jid: string, description: string) => newsletterUpdate(jid, { description }),
		newsletterUpdatePicture: async (jid: string, content: WAMediaUpload) => {
			const { img } = await generateProfilePicture(content)
			return newsletterUpdate(jid, { picture: img.toString('base64') })
		},
		newsletterRemovePicture: async (jid: string) => newsletterUpdate(jid, { picture: '' }),
		newsletterReactMessage: async (jid: string, serverId: string, reaction?: string) => {
			await query({
				tag: 'message',
				attrs: {
					to: jid,
					...(reaction ? {} : { edit: '7' }),
					type: 'reaction',
					server_id: serverId,
					id: generateMessageTag()
				},
				content: [ { tag: 'reaction', attrs: reaction ? { code: reaction } : {} } ]
			})
		},
		newsletterFetchMessages: async (jid: string, count: number, since: number, after: number) => {
			const attrs: Record<string, string> = { count: count.toString() }
			if (since) attrs.since = since.toString()
			if (after) attrs.after = after.toString()
			const result = await query({
				tag: 'iq',
				attrs: { id: generateMessageTag(), type: 'get', xmlns: 'newsletter', to: jid },
				content: [ { tag: 'message_updates', attrs } ]
			})
			return parseFetchedUpdates(result, 'updates')
		},
		subscribeNewsletterUpdates: async (jid: string) => {
			const result = await query({
				tag: 'iq',
				attrs: { id: generateMessageTag(), type: 'set', xmlns: 'newsletter', to: jid },
				content: [ { tag: 'live_updates', attrs: {}, content: [] } ]
			})
			const liveUpdatesNode = getBinaryNodeChild(result, 'live_updates')
			const duration = liveUpdatesNode?.attrs?.duration
			return duration ? { duration } : null
		},
		newsletterAdminCount: async (jid: string) => {
			const response = await executeWMexQuery<{ admin_count: number }>(
				{ newsletter_id: jid },
				QueryIds.ADMIN_COUNT,
				XWAPaths.xwa2_newsletter_admin_count
			)
			return response.admin_count
		},
		newsletterChangeOwner: (jid: string, user: string) => executeWMexQuery(
			{ newsletter_id: jid, user_id: user },
			QueryIds.CHANGE_OWNER,
			XWAPaths.xwa2_newsletter_change_owner
		),
		newsletterDemote: (jid: string, user: string) => executeWMexQuery(
			{ newsletter_id: jid, user_id: user },
			QueryIds.DEMOTE,
			XWAPaths.xwa2_newsletter_demote
		),
		newsletterDelete: (jid: string) => executeWMexQuery(
			{ newsletter_id: jid },
			QueryIds.DELETE,
			XWAPaths.xwa2_newsletter_delete_v2
		)
	}
}

export type NewsletterSocket = ReturnType<typeof makeNewsletterSocket>
