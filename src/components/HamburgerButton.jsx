import React from 'react'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiMenu } = FiIcons

export default function HamburgerButton({ onToggle, className = "" }) {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors ${className}`}
    >
      <SafeIcon icon={FiMenu} className="w-5 h-5 text-gray-700" />
    </button>
  )
}