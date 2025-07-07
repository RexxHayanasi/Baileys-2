import { proto } from '../../WAProto'

export type NewsletterReactionMode = 'ALL' | 'BASIC' | 'NONE'
export type NewsletterState = 'ACTIVE' | 'GEOSUSPENDED' | 'SUSPENDED'
export type NewsletterVerification = 'VERIFIED' | 'UNVERIFIED'
export type NewsletterMute = 'ON' | 'OFF' | 'UNDEFINED'
export type NewsletterViewRole = 'ADMIN' | 'GUEST' | 'OWNER' | 'SUBSCRIBER'

export type NewsletterViewerMetadata = {
    mute: NewsletterMute | 'ON' | 'OFF'
    view_role: NewsletterViewRole
}

export interface NewsletterMetadata {
    id: string
    owner?: string
    name: string
    description?: string
    invite?: string
    creation_time?: number
    subscribers?: number
    picture?: {
        url?: string
        directPath?: string
        mediaKey?: string
        id?: string
    } | string | null
    preview?: string | null
    verification?: NewsletterVerification
    reaction_codes?: NewsletterReactionMode | {
        code: string
        count: number
    }[]
    mute_state?: NewsletterMute
    viewer_metadata?: NewsletterViewerMetadata
    thread_metadata?: {
        creation_time?: number
        name?: string
        description?: string
    }
    nameTime?: number
    descriptionTime?: number
    handle?: string | null
}

export type SubscriberAction = 'promote' | 'demote'

export type ReactionModeUpdate = {
    reaction_codes: {
        blocked_codes: null
        enabled_ts_sec: null
        value: NewsletterReactionMode
    }
}

export type NewsletterSettingsUpdate = ReactionModeUpdate

export type NewsletterReaction = { count: number, code: string }

export type NewsletterFetchedUpdate = {
    server_id: string
    views?: number
    reactions: NewsletterReaction[]
    message?: proto.IWebMessageInfo
}

export enum MexOperations {
    PROMOTE = 'NotificationNewsletterAdminPromote',
    DEMOTE = 'NotificationNewsletterAdminDemote',
    UPDATE = 'NotificationNewsletterUpdate'
}

export enum XWAPaths {
    xwa2_newsletter_create = 'xwa2_newsletter_create',
    xwa2_newsletter_subscribers = 'xwa2_newsletter_subscribers',
    xwa2_newsletter_view = 'xwa2_newsletter_view',
    xwa2_newsletter_metadata = 'xwa2_newsletter',
    xwa2_newsletter_admin_count = 'xwa2_newsletter_admin',
    xwa2_newsletter_mute_v2 = 'xwa2_newsletter_mute_v2',
    xwa2_newsletter_unmute_v2 = 'xwa2_newsletter_unmute_v2',
    xwa2_newsletter_follow = 'xwa2_newsletter_follow',
    xwa2_newsletter_unfollow = 'xwa2_newsletter_unfollow',
    xwa2_newsletter_change_owner = 'xwa2_newsletter_change_owner',
    xwa2_newsletter_demote = 'xwa2_newsletter_demote',
    xwa2_newsletter_delete_v2 = 'xwa2_newsletter_delete_v2'
}

export enum QueryIds {
    CREATE = '8823471724422422',
    UPDATE_METADATA = '24250201037901610',
    METADATA = '6563316087068696',
    SUBSCRIBERS = '9783111038412085',
    FOLLOW = '7871414976211147',
    UNFOLLOW = '7238632346214362',
    MUTE = '29766401636284406',
    UNMUTE = '9864994326891137',
    ADMIN_COUNT = '7130823597031706',
    CHANGE_OWNER = '7341777602580933',
    DEMOTE = '6551828931592903',
    DELETE = '30062808666639665'
}

export type NewsletterUpdate = {
    name?: string
    description?: string
    picture?: string
}

export interface NewsletterCreateResponse {
    id: string
    state: { type: string }
    thread_metadata: {
        creation_time: string
        description: { id: string; text: string; update_time: string }
        handle: string | null
        invite: string
        name: { id: string; text: string; update_time: string }
        picture: { direct_path: string; id: string; type: string }
        preview: { direct_path: string; id: string; type: string }
        subscribers_count: string
        verification: NewsletterVerification
    }
    viewer_metadata: {
        mute: 'ON' | 'OFF'
        role: NewsletterViewRole
    }
}
