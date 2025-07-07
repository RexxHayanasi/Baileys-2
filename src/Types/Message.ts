import { AxiosRequestConfig } from 'axios'
import type { Readable } from 'stream'
import type { URL } from 'url'
import { proto } from '../../WAProto'
import { MEDIA_HKDF_KEY_MAPPING } from '../Defaults'
import { BinaryNode } from '../WABinary'
import type { GroupMetadata } from './GroupMetadata'
import { CacheStore } from './Socket'

// export the WAMessage Prototypes
export { proto as WAProto }

export type WAMessage = proto.IWebMessageInfo & { key: WAMessageKey }
export type WAMessageContent = proto.IMessage
export type WAContactMessage = proto.Message.IContactMessage
export type WAContactsArrayMessage = proto.Message.IContactsArrayMessage
export type WAMessageKey = proto.IMessageKey & {
    senderLid?: string
    server_id?: string
    senderPn?: string
    participantLid?: string
    participantPn?: string
    isViewOnce?: boolean
}
export type WATextMessage = proto.Message.IExtendedTextMessage
export type WAContextInfo = proto.IContextInfo
export type WALocationMessage = proto.Message.ILocationMessage
export type WALiveLocationMessage = proto.Message.ILiveLocationMessage
export type WAGenericMediaMessage =
    | proto.Message.IVideoMessage
    | proto.Message.IImageMessage
    | proto.Message.IAudioMessage
    | proto.Message.IDocumentMessage
    | proto.Message.IStickerMessage
export const WAMessageStubType = proto.WebMessageInfo.StubType
export const WAMessageStatus = proto.WebMessageInfo.Status

export type WAMediaPayloadURL = { url: URL | string }
export type WAMediaPayloadStream = { stream: Readable }
export type WAMediaUpload = Buffer | WAMediaPayloadStream | WAMediaPayloadURL
export type MessageType = keyof proto.Message

export type DownloadableMessage = { mediaKey?: Uint8Array | null, directPath?: string | null, url?: string | null }
export type MessageReceiptType = 'read' | 'read-self' | 'hist_sync' | 'peer_msg' | 'sender' | 'inactive' | 'played' | undefined

export type MediaConnInfo = {
    auth: string
    ttl: number
    hosts: { hostname: string, maxContentLengthBytes: number }[]
    fetchDate: Date
}

export interface WAUrlInfo {
    'canonical-url': string
    'matched-text': string
    title: string
    description?: string
    jpegThumbnail?: Buffer
    highQualityThumbnail?: proto.Message.IImageMessage
    originalThumbnailUrl?: string
}

// === Tambahan untuk migrasi V3  ===
export type MediaType = keyof typeof MEDIA_HKDF_KEY_MAPPING
export type ILogger = import('../Utils/logger').ILogger
// ===========================

export interface Carousel {   
    image?: WAMediaUpload
    video?: WAMediaUpload
    product?: WASendableProduct
    title?: string
    caption?: string
    footer?: string
    buttons?: proto.Message.InteractiveMessage.NativeFlowMessage.NativeFlowButton[]
}

// Helper types
type Mentionable = {
    mentions?: string[]
}
type Contextable = {
    contextInfo?: proto.IContextInfo
}
type ViewOnce = {
    viewOnce?: boolean
}
type Editable = {
    edit?: WAMessageKey
}
type WithDimensions = {
    width?: number
    height?: number
}
type Listable = {    
    sections?: proto.Message.ListMessage.ISection[]
    title?: string
    buttonText?: string
}

type Buttonable = {
    buttons?: proto.Message.ButtonsMessage.IButton[]
}
type Templatable = {
    templateButtons?: proto.IHydratedTemplateButton[]
    footer?: string
}
type Interactiveable = {
    interactiveButtons?: proto.Message.InteractiveMessage.NativeFlowMessage.NativeFlowButton[]
    title?: string
    subtitle?: string
    media?: boolean
}
type Shopable = {
    shop?: proto.Message.InteractiveMessage.ShopMessage.Surface;
    id?: string;
    title?: string;
    subtitle?: string;
    media?: boolean;
}
type Collectionable = {
    collection?: { bizJid?: string, id?: string, version?: number };
    title?: string;
    subtitle?: string;
    media?: boolean;
}
type Cardsable = {
    cards?: Carousel[];
    title?: string;
    subtitle?: string;
}

export type PollMessageOptions = {
    name: string
    selectableCount?: number
    values: string[]
    messageSecret?: Uint8Array
    toAnnouncementGroup?: boolean
}
export type PollResultMessage = {
    name: string
    votes: proto.Message.PollResultSnapshotMessage.PollVote[]
    messageSecret?: Uint8Array
}

type SharePhoneNumber = {
    sharePhoneNumber: boolean
}
type RequestPhoneNumber = {
    requestPhoneNumber: boolean
}

export type WASendableProduct = Omit<proto.Message.ProductMessage.IProductSnapshot, 'productImage'> & {
    productImage: WAMediaUpload
}

// === Media Message Content ===
export type AnyMediaMessageContent = (
    ({
        image: WAMediaUpload
        caption?: string
        jpegThumbnail?: string
    } & Mentionable & Contextable &
        Buttonable & Templatable & Interactiveable & Shopable & Collectionable & Cardsable & WithDimensions)
    | ({
        video: WAMediaUpload
        caption?: string
        gifPlayback?: boolean
        jpegThumbnail?: string
        ptv?: boolean
    } & Mentionable & Contextable &
        Buttonable & Templatable & Interactiveable & Shopable & Collectionable & Cardsable & WithDimensions)
    | {
        audio: WAMediaUpload
        ptt?: boolean
        seconds?: number
    }
    | ({
        sticker: WAMediaUpload
        isAnimated?: boolean
    } & WithDimensions)
    | ({
        document: WAMediaUpload
        mimetype: string
        fileName?: string
        caption?: string
    } & Contextable &
        Buttonable & Templatable & Interactiveable & Shopable & Collectionable & Cardsable)
) & { mimetype?: string } & Editable

export type ButtonReplyInfo = {
    displayText: string
    id: string
    index: number
    text?: string
    nativeFlow?: proto.Message.InteractiveResponseMessage.NativeFlowResponseMessage
}

export type GroupInviteInfo = {
    inviteCode: string
    inviteExpiration: number
    text: string
    jid: string
    subject: string
    thumbnail?: Buffer
}

export type PinInChatInfo = {
    key: WAMessageKey;
    type?: number;
    time?: number;
}

export type KeepInChatInfo = {
    key: WAMessageKey;
    type?: number;
    time?: number;
}

export type CallCreationInfo = {
    time?: number;
    title?: string;
    type?: number;
}

export type PaymentInviteInfo = {
    type?: number;
    expiry?: number;
}

export type RequestPaymentInfo = {    
    expiry: number;
    amount: number;
    currency: string;
    from: string;
    note?: string;
    sticker?: WAMediaUpload;
    background: string;
    contextInfo?: proto.IContextInfo;
}

export type EventsInfo = {
    isCanceled?: boolean;
    name: string;
    description: string;
    joinLink?: string;
    startTime?: number;
    messageSecret?: Uint8Array
}

export type AdminInviteInfo = {
    inviteExpiration: number
    text: string
    jid: string
    subject: string
    thumbnail?: Buffer
}

export type OrderInfo = {
    id: number;
    thumbnail: string;
    itemCount: number;
    status: number;
    surface: number;
    title: string;
    text: string;
    seller: string;
    token: string;
    amount: number;
    currency: string;
}

export type AnyRegularMessageContent = (
    ({
        text: string
        linkPreview?: WAUrlInfo | null
    } & Mentionable & Contextable &
        Buttonable & Templatable & Interactiveable & Shopable & Collectionable & Cardsable & Listable & Editable)
    | AnyMediaMessageContent
    | ({
        poll: PollMessageOptions
    } & Mentionable & Contextable & Buttonable & Templatable & Editable)
    | {
        pollResult: PollResultMessage
    } & Mentionable & Contextable & Buttonable & Templatable & Editable
    | {
        contacts: {
            displayName?: string
            contacts: proto.Message.IContactMessage[]
        }
    }
    | {
        location: WALocationMessage
    }
    | {
        liveLocation: WALiveLocationMessage
    }
    | { react: proto.Message.IReactionMessage }
    | {
        buttonReply: ButtonReplyInfo
        type: 'template' | 'plain' | 'interactive'
    }
    | {
        groupInvite: GroupInviteInfo
    }    
    | {
        pin: WAMessageKey
        type: proto.PinInChat.Type
        time?: 86400 | 604800 | 2592000
    }
    | {
        keep: WAMessageKey
        type: number
        time?: 86400 | 604800 | 7776000
    }
    | {
        paymentInvite: PaymentInviteInfo
    }
    | {
        requestPayment: RequestPaymentInfo
    }
    | {
        event: EventsInfo
    }
    | {
        order: OrderInfo
    }
    | {
        call: CallCreationInfo
    } 
    | {
        inviteAdmin: AdminInviteInfo
    }
    | {
        listReply: Omit<proto.Message.IListResponseMessage, 'contextInfo'>
    }
    | ({
        product: WASendableProduct
        businessOwnerJid?: string
        body?: string
        footer?: string
    } & Mentionable & Contextable & Interactiveable & Shopable & Collectionable & Cardsable & WithDimensions) 
    | SharePhoneNumber | RequestPhoneNumber
) & ViewOnce

export type AnyMessageContent = AnyRegularMessageContent | {
    forward: WAMessage
    force?: boolean
} | {
    delete: WAMessageKey
} | {
    disappearingMessagesInChat: boolean | number
}

export type GroupMetadataParticipants = Pick<GroupMetadata, 'participants'>

type MinimalRelayOptions = {
    messageId?: string
    useCachedGroupMetadata?: boolean
}

export type MessageRelayOptions = MinimalRelayOptions & {
    participant?: { jid: string, count: number }
    additionalAttributes?: { [_: string]: string }    
    additionalNodes?: BinaryNode[];
    useUserDevicesCache?: boolean
    statusJidList?: string[]
}

export type MiscMessageGenerationOptions = MinimalRelayOptions & {
    timestamp?: Date
    quoted?: WAMessage
    additionalNodes?: BinaryNode[];
    ephemeralExpiration?: number | string
    mediaUploadTimeoutMs?: number
    statusJidList?: string[]
    backgroundColor?: string
    font?: number
    broadcast?: boolean
    delay?: number
}
export type MessageGenerationOptionsFromContent = MiscMessageGenerationOptions & {
    userJid: string
}

export type WAMediaUploadFunctionOpts = { fileEncSha256B64: string, mediaType: MediaType, newsletter?: boolean, timeoutMs?: number }
export type WAMediaUploadFunction = (readStream: Readable | Buffer, opts: WAMediaUploadFunctionOpts) => Promise<{ mediaUrl: string, directPath: string, handle?: string }>

export type MediaGenerationOptions = {
    logger?: ILogger
    mediaTypeOverride?: MediaType
    upload: WAMediaUploadFunction
    mediaCache?: CacheStore
    mediaUploadTimeoutMs?: number
    options?: AxiosRequestConfig
    quoted?: WAMessage
    backgroundColor?: string
    font?: number
    newsletter?: boolean
}
export type MessageContentGenerationOptions = MediaGenerationOptions & {
    getUrlInfo?: (text: string) => Promise<WAUrlInfo | undefined>
    getProfilePicUrl?: (jid: string, type: 'image' | 'preview') => Promise<string | undefined>
    jid?: string
}
export type MessageGenerationOptions = MessageContentGenerationOptions & MessageGenerationOptionsFromContent

export type MessageUpsertType = 'append' | 'notify'
export type MessageUserReceipt = proto.IUserReceipt
export type WAMessageUpdate = { update: Partial<WAMessage>, key: proto.IMessageKey }
export type WAMessageCursor = { before: WAMessageKey | undefined } | { after: WAMessageKey | undefined }
export type MessageUserReceiptUpdate = { key: proto.IMessageKey, receipt: MessageUserReceipt }
export type MediaDecryptionKeyInfo = {
    iv: Buffer
    cipherKey: Buffer
    macKey?: Buffer
}
export type MinimalMessage = Pick<proto.IWebMessageInfo, 'key' | 'messageTimestamp'>
