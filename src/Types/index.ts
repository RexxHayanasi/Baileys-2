export * from './Auth'
export * from './GroupMetadata'
export * from './Chat'
export * from './Contact'
export * from './State'
export * from './Message'
export * from './Newsletter'
export * from './Socket'
export * from './Events'
export * from './Product'
export * from './Call'
export * from './Signal'

// 🔧 Export eksplisit tambahan untuk menghindari error build
export * from './Message'
export type { ILogger } from '../Utils/logger'
export type { NewsletterUpdate } from './Newsletter'

// Import untuk gabungan konfigurasi user-facing
import { AuthenticationState } from './Auth'
import { SocketConfig } from './Socket'

export type UserFacingSocketConfig = Partial<SocketConfig> & { auth: AuthenticationState }

// Tipe untuk informasi browser
export type BrowsersMap = {
	ubuntu(browser: string): [string, string, string]
	macOS(browser: string): [string, string, string]
	baileys(browser: string): [string, string, string]
	windows(browser: string): [string, string, string]
	iOS?(browser: string): [string, string, string] // opsional
	linux?(browser: string): [string, string, string] // opsional
	appropriate(browser: string): [string, string, string]
}

// Alasan disconnect
export enum DisconnectReason {
	connectionClosed = 428,
	connectionLost = 408,
	connectionReplaced = 440,
	timedOut = 408,
	loggedOut = 401,
	badSession = 500,
	restartRequired = 515,
	multideviceMismatch = 411,
	forbidden = 403,
	unavailableService = 503
}

// Respons saat inisialisasi WA
export type WAInitResponse = {
	ref: string
	ttl: number
	status: 200
}

// Konfigurasi jam kerja bisnis
export type WABusinessHoursConfig = {
	day_of_week: string
	mode: string
	open_time?: number
	close_time?: number
}

// Profil bisnis WhatsApp
export type WABusinessProfile = {
	description: string
	email: string | undefined
	business_hours: {
		timezone?: string
		config?: WABusinessHoursConfig[]
		business_config?: WABusinessHoursConfig[]
	}
	website: string[]
	category?: string
	wid?: string
	address?: string
}

// Tipe untuk CurveKeyPair
export type CurveKeyPair = {
	private: Uint8Array
	public: Uint8Array
}
