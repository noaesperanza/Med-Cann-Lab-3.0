import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { UserType, normalizeUserType } from '../lib/userTypes'

export const useUserView = () => {
    const { user } = useAuth()

    const getEffectiveUserType = (type: string | undefined): UserType => {
        return normalizeUserType(type)
    }

    const isAdminViewingAs = (role: UserType): boolean => {
        return user?.type === 'admin'
    }

    return {
        getEffectiveUserType,
        isAdminViewingAs
    }
}
