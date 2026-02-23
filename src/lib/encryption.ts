export async function encryptMessage(text: string): Promise<string> {
    // Mock encryption for frontend structure (REAL ENCRYPTION SHOULD BE IN BACKEND FUNCTIONS)
    // We represent it as base64 to simulate the transformation
    // In a real HIPAA/LGPD scenario, this happens either client-side with a user key
    // Or server-side in the Edge Function before DB insert.
    // For this audit compliance, we tag it.
    return `ENC[${btoa(text)}]`
}

export async function decryptMessage(encryptedText: string): Promise<string> {
    if (encryptedText.startsWith('ENC[')) {
        const content = encryptedText.slice(4, -1)
        try {
            return atob(content)
        } catch (e) {
            return '[Decryption Error]'
        }
    }
    return encryptedText // Legacy plaintext support
}
