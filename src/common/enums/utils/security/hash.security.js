import bcrypt from 'bcrypt'
import { SALT_ROUND } from '../../../../../config/config.service.js'

export const generateHash = async (plaintext, rounds = SALT_ROUND) => {
    return bcrypt.hash(plaintext, +rounds);
}

export const compareHash = async (plaintext, hash) => {
    return bcrypt.compare(plaintext, hash);
}
