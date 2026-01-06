import { describe, it, expect } from 'vitest'
import { sanitizeText, sanitizeEmail, sanitizeUrl } from '@/lib/security/sanitize'

describe('sanitizeText', () => {
    it('removes HTML tags but preserves content', () => {
        // sanitizeText strips tags but keeps text content (correct for XSS safety)
        expect(sanitizeText('<script>alert("xss")</script>Hello')).toBe('alert("xss")Hello')
        expect(sanitizeText('<b>Bold</b> text')).toBe('Bold text')
    })

    it('handles empty strings', () => {
        expect(sanitizeText('')).toBe('')
    })

    it('preserves normal text', () => {
        expect(sanitizeText('Hello World')).toBe('Hello World')
    })
})

describe('sanitizeEmail', () => {
    it('lowercases and trims email', () => {
        expect(sanitizeEmail('  TEST@EMAIL.COM  ')).toBe('test@email.com')
    })

    it('returns null for invalid emails', () => {
        expect(sanitizeEmail('not-an-email')).toBeNull()
        expect(sanitizeEmail('missing@dot')).toBeNull()
    })

    it('returns valid email', () => {
        expect(sanitizeEmail('valid@email.com')).toBe('valid@email.com')
    })
})

describe('sanitizeUrl', () => {
    it('allows http and https', () => {
        expect(sanitizeUrl('https://example.com')).toBe('https://example.com/')
        expect(sanitizeUrl('http://example.com')).toBe('http://example.com/')
    })

    it('rejects javascript: urls', () => {
        expect(sanitizeUrl('javascript:alert(1)')).toBeNull()
    })

    it('returns null for invalid urls', () => {
        expect(sanitizeUrl('not a url')).toBeNull()
    })
})
