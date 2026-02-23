import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Mail, Phone, MapPin } from 'lucide-react'
import { backgroundGradient } from '../constants/designSystem'

interface FooterProps {
  marginLeft?: string
  width?: string
}

const Footer: React.FC<FooterProps> = ({ marginLeft, width }) => {
  return (
    <footer
      className="text-white overflow-x-hidden transition-all duration-300"
      style={{ marginLeft, width, background: backgroundGradient }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-6 w-full max-w-full overflow-x-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-2 md:mb-0">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs md:text-sm">M</span>
            </div>
            <span className="text-sm md:text-lg font-bold">
              MedCannLab
              <span className="text-xs md:text-sm text-primary-400 ml-1">3.0</span>
            </span>
          </div>

          <div className="hidden md:flex space-x-6 text-sm">
            <Link to="/courses" className="text-gray-300 hover:text-white transition-colors duration-200">
              Cursos
            </Link>
            <Link to="/clinical-assessment" className="text-gray-300 hover:text-white transition-colors duration-200">
              Avaliação
            </Link>
            <Link to="/library" className="text-gray-300 hover:text-white transition-colors duration-200">
              Biblioteca
            </Link>
            <Link to="/admin" className="text-gray-300 hover:text-white transition-colors duration-200">
              Admin
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-2 md:mt-4 pt-2 md:pt-4">
          <div className="flex flex-row justify-center md:justify-between items-center gap-2">
            <p className="text-gray-400 text-[10px] md:text-xs">
              © 2025 MedCannLab 3.0
            </p>
            <p className="text-gray-400 text-[10px] md:text-xs flex items-center">
              <Heart className="w-2.5 h-2.5 md:w-3 md:h-3 text-red-500 mx-0.5 md:mx-1" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
