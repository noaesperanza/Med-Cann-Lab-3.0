import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Mail, Phone, MapPin } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white mobile-footer">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-lg font-bold">
              MedCannLab
              <span className="text-sm text-primary-400 ml-1">3.0</span>
            </span>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end gap-4 text-sm">
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

        <div className="border-t border-gray-800 mt-4 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-center md:text-left">
            <p className="text-gray-400 text-xs">
              © 2025 MedCannLab 3.0. Todos os direitos reservados.
            </p>
            <p className="text-gray-400 text-xs flex items-center justify-center">
              Feito com <Heart className="w-3 h-3 text-red-500 mx-1" /> para a medicina
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
