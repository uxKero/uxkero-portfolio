import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Componente: Comparación de Jerarquía Visual
interface HierarchyComparisonProps {
  language?: 'en' | 'es';
}

export const HierarchyComparison: React.FC<HierarchyComparisonProps> = ({ language = 'es' }) => {
  const [activeView, setActiveView] = useState<'bad' | 'good'>('bad');

  return (
    <div className="w-full space-y-4">
      {/* Botones fuera del contenedor - mejorados */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => setActiveView('bad')}
          className={`px-6 py-3 rounded-xl text-base font-semibold transition-all shadow-lg ${
            activeView === 'bad'
              ? 'bg-zinc-800 text-zinc-200 border-2 border-red-500/50 scale-105'
              : 'bg-zinc-800/50 text-zinc-500 border-2 border-zinc-700 hover:bg-zinc-800 hover:text-zinc-300'
          }`}
        >
          <span className="text-red-400 mr-2">❌</span> {language === 'es' ? 'Sin Jerarquía' : 'No Hierarchy'}
        </button>
        <button
          onClick={() => setActiveView('good')}
          className={`px-6 py-3 rounded-xl text-base font-semibold transition-all shadow-lg ${
            activeView === 'good'
              ? 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500 scale-105'
              : 'bg-zinc-800/50 text-zinc-500 border-2 border-zinc-700 hover:bg-zinc-800 hover:text-zinc-300'
          }`}
        >
          <span className="text-emerald-400 mr-2">✅</span> {language === 'es' ? 'Con Jerarquía' : 'With Hierarchy'}
        </button>
      </div>

      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-6 md:p-8 overflow-hidden"
      >
        {/* Imagen de ejemplo */}
        <div className="relative h-48 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl overflow-hidden mb-6">
          <img
            src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop"
            alt="Ejemplo de propiedad"
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        <div>
          {activeView === 'bad' ? (
            <div className="space-y-3">
              <div className="text-base text-zinc-300">{language === 'es' ? 'Casa Moderna en el Centro' : 'Modern House in Downtown'}</div>
              <div className="text-base text-zinc-300">{language === 'es' ? '$120 por noche' : '$120 per night'}</div>
              <div className="text-base text-zinc-300">{language === 'es' ? '3 habitaciones · 2 baños · WiFi' : '3 bedrooms · 2 bathrooms · WiFi'}</div>
              <div className="text-base text-zinc-300">{language === 'es' ? 'Ubicación céntrica, cerca de restaurantes y transporte público.' : 'Central location, near restaurants and public transport.'}</div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">{language === 'es' ? 'Casa Moderna en el Centro' : 'Modern House in Downtown'}</h3>
              <div className="text-3xl font-extrabold text-emerald-400">$120<span className="text-lg font-normal text-zinc-400">{language === 'es' ? '/noche' : '/night'}</span></div>
              <div className="text-sm text-zinc-400">{language === 'es' ? '3 habitaciones · 2 baños · WiFi' : '3 bedrooms · 2 bathrooms · WiFi'}</div>
              <p className="text-base text-zinc-300 leading-relaxed">{language === 'es' ? 'Ubicación céntrica, cerca de restaurantes y transporte público.' : 'Central location, near restaurants and public transport.'}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Componente: Paleta de Colores Funcional - MEJORADO
interface ColorPaletteProps {
  language?: 'en' | 'es';
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({ language = 'es' }) => {
  const [selectedCategory, setSelectedCategory] = useState<'fintech' | 'social' | 'ecommerce' | 'saas'>('fintech');

  const colorSystems = {
    fintech: {
      name: language === 'es' ? 'FinTech (Stripe, PayPal)' : 'FinTech (Stripe, PayPal)',
      colors: [
        { name: language === 'es' ? 'Primario' : 'Primary', hex: '#635BFF', usage: language === 'es' ? 'Acciones principales, CTAs' : 'Primary actions, CTAs', example: 'Stripe' },
        { name: language === 'es' ? 'Secundario' : 'Secondary', hex: '#0A2540', usage: language === 'es' ? 'Fondos, navegación' : 'Backgrounds, navigation', example: 'PayPal' },
        { name: language === 'es' ? 'Acento' : 'Accent', hex: '#00D924', usage: language === 'es' ? 'Confirmaciones, éxito' : 'Confirmations, success', example: 'Square' },
        { name: language === 'es' ? 'Error' : 'Error', hex: '#EF4444', usage: language === 'es' ? 'Errores, advertencias' : 'Errors, warnings', example: 'Universal' },
      ],
      trend: language === 'es' ? 'Azules profundos y verdes de confianza. Transmiten seguridad y profesionalismo.' : 'Deep blues and trust greens. Convey security and professionalism.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop'
    },
    social: {
      name: language === 'es' ? 'Redes Sociales (Instagram, Twitter)' : 'Social Media (Instagram, Twitter)',
      colors: [
        { name: language === 'es' ? 'Primario' : 'Primary', hex: '#E4405F', usage: language === 'es' ? 'Branding, acciones principales' : 'Branding, primary actions', example: 'Instagram' },
        { name: language === 'es' ? 'Secundario' : 'Secondary', hex: '#1DA1F2', usage: language === 'es' ? 'Links, interacciones' : 'Links, interactions', example: 'Twitter/X' },
        { name: language === 'es' ? 'Acento' : 'Accent', hex: '#FFD700', usage: language === 'es' ? 'Destacados, premium' : 'Highlights, premium', example: 'Snapchat' },
        { name: language === 'es' ? 'Error' : 'Error', hex: '#FF3B30', usage: language === 'es' ? 'Errores, eliminaciones' : 'Errors, deletions', example: 'Universal' },
      ],
      trend: language === 'es' ? 'Colores vibrantes y energéticos. Buscan engagement y emociones positivas.' : 'Vibrant and energetic colors. Seek engagement and positive emotions.',
      image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop'
    },
    ecommerce: {
      name: language === 'es' ? 'E-commerce (Amazon, Shopify)' : 'E-commerce (Amazon, Shopify)',
      colors: [
        { name: language === 'es' ? 'Primario' : 'Primary', hex: '#FF9900', usage: language === 'es' ? 'CTAs, botones de compra' : 'CTAs, purchase buttons', example: 'Amazon' },
        { name: language === 'es' ? 'Secundario' : 'Secondary', hex: '#96BF48', usage: language === 'es' ? 'Ofertas, descuentos' : 'Offers, discounts', example: 'Shopify' },
        { name: language === 'es' ? 'Acento' : 'Accent', hex: '#FF6B6B', usage: language === 'es' ? 'Urgencia, stock limitado' : 'Urgency, limited stock', example: 'Etsy' },
        { name: language === 'es' ? 'Error' : 'Error', hex: '#DC3545', usage: language === 'es' ? 'Errores de pago' : 'Payment errors', example: 'Universal' },
      ],
      trend: language === 'es' ? 'Naranjas y verdes que impulsan acción. Colores que generan urgencia y confianza.' : 'Oranges and greens that drive action. Colors that generate urgency and trust.',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop'
    },
    saas: {
      name: language === 'es' ? 'SaaS (Slack, Notion)' : 'SaaS (Slack, Notion)',
      colors: [
        { name: language === 'es' ? 'Primario' : 'Primary', hex: '#4A154B', usage: language === 'es' ? 'Branding, navegación' : 'Branding, navigation', example: 'Slack' },
        { name: language === 'es' ? 'Secundario' : 'Secondary', hex: '#2E7D32', usage: language === 'es' ? 'Estados activos' : 'Active states', example: 'Notion' },
        { name: language === 'es' ? 'Acento' : 'Accent', hex: '#1976D2', usage: language === 'es' ? 'Links, información' : 'Links, information', example: 'Atlassian' },
        { name: language === 'es' ? 'Error' : 'Error', hex: '#D32F2F', usage: language === 'es' ? 'Errores, advertencias' : 'Errors, warnings', example: 'Universal' },
      ],
      trend: language === 'es' ? 'Púrpuras y azules profesionales. Transmiten innovación y productividad.' : 'Professional purples and blues. Convey innovation and productivity.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop'
    }
  };

  const currentSystem = colorSystems[selectedCategory];

  return (
    <div className="w-full space-y-6">
      {/* Selector de categoría - fuera del contenedor */}
      <div className="flex flex-wrap gap-3 justify-center">
        {Object.entries(colorSystems).map(([key, system]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === key
                ? 'bg-[#635BFF] text-white border-2 border-[#5548FF] shadow-lg scale-105'
                : 'bg-zinc-800 text-zinc-400 border-2 border-zinc-700 hover:bg-zinc-700'
            }`}
          >
            {system.name.split(' (')[0]}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-6 md:p-8">
        <div className="mb-6">
          <h4 className="text-xl font-semibold text-white mb-2">{currentSystem.name}</h4>
          <p className="text-sm text-zinc-400 italic">{currentSystem.trend}</p>
        </div>

        {/* Imagen de ejemplo */}
        <div className="relative h-40 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl overflow-hidden mb-6">
          <img
            src={currentSystem.image}
            alt={currentSystem.name}
            className="w-full h-full object-cover opacity-60"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {currentSystem.colors.map((color) => (
            <div key={color.name} className="flex flex-col items-center">
              <div
                className="w-20 h-20 rounded-full border-2 border-zinc-800 mb-3 shadow-lg"
                style={{ backgroundColor: color.hex }}
              />
              <div className="text-center">
                <div className="text-sm font-medium text-white mb-1">{color.name}</div>
                <div className="text-xs text-zinc-400 font-mono mb-2">{color.hex}</div>
                <div className="text-xs text-zinc-500 mb-1">{color.usage}</div>
                <div className="text-xs text-emerald-400 font-medium">Ej: {color.example}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparación de Contraste */}
        <div className="pt-6 border-t border-zinc-800">
          <h5 className="text-sm font-semibold text-white mb-4">{language === 'es' ? 'Contraste de Botones' : 'Button Contrast'}</h5>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-xs text-red-400 font-medium">❌ {language === 'es' ? 'Mal Contraste (2.1:1)' : 'Poor Contrast (2.1:1)'}</div>
              <button className="w-full py-3 px-4 rounded-lg text-sm font-medium bg-zinc-700 text-zinc-500 border border-zinc-600">
                {language === 'es' ? 'Acción Principal' : 'Primary Action'}
              </button>
              <p className="text-xs text-zinc-500">{language === 'es' ? 'No cumple WCAG AA' : 'Does not meet WCAG AA'}</p>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-emerald-400 font-medium">✅ {language === 'es' ? 'Buen Contraste (7.2:1)' : 'Good Contrast (7.2:1)'}</div>
              <button className="w-full py-3 px-4 rounded-lg text-sm font-medium bg-[#635BFF] text-white border border-[#635BFF] hover:bg-[#5548FF] transition-colors">
                {language === 'es' ? 'Acción Principal' : 'Primary Action'}
              </button>
              <p className="text-xs text-zinc-500">{language === 'es' ? 'Cumple WCAG AAA' : 'Meets WCAG AAA'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente: Comparación de Espaciado (Gestalt)
interface SpacingComparisonProps {
  language?: 'en' | 'es';
}

export const SpacingComparison: React.FC<SpacingComparisonProps> = ({ language = 'es' }) => {
  const [activeView, setActiveView] = useState<'bad' | 'good'>('bad');

  return (
    <div className="w-full space-y-4">
      {/* Botones fuera del contenedor */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => setActiveView('bad')}
          className={`px-6 py-3 rounded-xl text-base font-semibold transition-all shadow-lg ${
            activeView === 'bad'
              ? 'bg-zinc-800 text-zinc-200 border-2 border-red-500/50 scale-105'
              : 'bg-zinc-800/50 text-zinc-500 border-2 border-zinc-700 hover:bg-zinc-800 hover:text-zinc-300'
          }`}
        >
          <span className="text-red-400 mr-2">❌</span> {language === 'es' ? 'Sin Agrupación' : 'No Grouping'}
        </button>
        <button
          onClick={() => setActiveView('good')}
          className={`px-6 py-3 rounded-xl text-base font-semibold transition-all shadow-lg ${
            activeView === 'good'
              ? 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500 scale-105'
              : 'bg-zinc-800/50 text-zinc-500 border-2 border-zinc-700 hover:bg-zinc-800 hover:text-zinc-300'
          }`}
        >
          <span className="text-emerald-400 mr-2">✅</span> {language === 'es' ? 'Con Agrupación' : 'With Grouping'}
        </button>
      </div>

      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-6 md:p-8"
      >
        {activeView === 'bad' ? (
          <div className="space-y-2">
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-xs text-red-400 font-medium">❌ {language === 'es' ? 'Todos los campos con el mismo espaciado = confusión' : 'All fields with same spacing = confusion'}</p>
            </div>
            <input
              type="text"
              placeholder={language === 'es' ? 'Nombre' : 'First Name'}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500"
            />
            <input
              type="text"
              placeholder={language === 'es' ? 'Apellido' : 'Last Name'}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500"
            />
            <input
              type="email"
              placeholder={language === 'es' ? 'Email' : 'Email'}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500"
            />
            <input
              type="tel"
              placeholder={language === 'es' ? 'Teléfono' : 'Phone'}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500"
            />
            <input
              type="text"
              placeholder={language === 'es' ? 'Dirección' : 'Address'}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500"
            />
            <input
              type="text"
              placeholder={language === 'es' ? 'Ciudad' : 'City'}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500"
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-xs text-emerald-400 font-medium">✅ {language === 'es' ? 'Campos agrupados = información clara y organizada' : 'Grouped fields = clear and organized information'}</p>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                {language === 'es' ? 'Información Personal' : 'Personal Information'}
              </h5>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder={language === 'es' ? 'Nombre' : 'First Name'}
                  className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500"
                />
                <input
                  type="text"
                  placeholder={language === 'es' ? 'Apellido' : 'Last Name'}
                  className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500"
                />
              </div>
              <input
                type="email"
                placeholder={language === 'es' ? 'Email' : 'Email'}
                className="w-full mt-3 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500"
              />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                {language === 'es' ? 'Contacto' : 'Contact'}
              </h5>
              <input
                type="tel"
                placeholder={language === 'es' ? 'Teléfono' : 'Phone'}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500"
              />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                {language === 'es' ? 'Dirección' : 'Address'}
              </h5>
              <input
                type="text"
                placeholder={language === 'es' ? 'Calle y número' : 'Street and number'}
                className="w-full mb-3 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder={language === 'es' ? 'Ciudad' : 'City'}
                  className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500"
                />
                <input
                  type="text"
                  placeholder={language === 'es' ? 'Código Postal' : 'Postal Code'}
                  className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500"
                />
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// Componente: Consistencia de Botones
interface ConsistencyGridProps {
  language?: 'en' | 'es';
}

export const ConsistencyGrid: React.FC<ConsistencyGridProps> = ({ language = 'es' }) => {
  const [activeView, setActiveView] = useState<'consistent' | 'chaos'>('consistent');

  const consistentButtons = [
    { label: language === 'es' ? 'Guardar' : 'Save', style: 'bg-[#635BFF] text-white' },
    { label: language === 'es' ? 'Cancelar' : 'Cancel', style: 'bg-zinc-800 text-zinc-300' },
    { label: language === 'es' ? 'Eliminar' : 'Delete', style: 'bg-red-600 text-white' },
    { label: language === 'es' ? 'Editar' : 'Edit', style: 'bg-[#635BFF] text-white' },
  ];

  const chaosButtons = [
    { label: language === 'es' ? 'Guardar' : 'Save', style: 'bg-green-500 text-white rounded-full' },
    { label: language === 'es' ? 'Cancelar' : 'Cancel', style: 'bg-zinc-700 text-yellow-400 border-2 border-yellow-400' },
    { label: language === 'es' ? 'Eliminar' : 'Delete', style: 'bg-red-600/80 text-white rounded-none' },
    { label: language === 'es' ? 'Editar' : 'Edit', style: 'bg-blue-400 text-black rounded-lg border-4 border-blue-600' },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Botones fuera del contenedor */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => setActiveView('consistent')}
          className={`px-6 py-3 rounded-xl text-base font-semibold transition-all shadow-lg ${
            activeView === 'consistent'
              ? 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500 scale-105'
              : 'bg-zinc-800/50 text-zinc-500 border-2 border-zinc-700 hover:bg-zinc-800 hover:text-zinc-300'
          }`}
        >
          <span className="text-emerald-400 mr-2">✅</span> {language === 'es' ? 'Consistencia' : 'Consistency'}
        </button>
        <button
          onClick={() => setActiveView('chaos')}
          className={`px-6 py-3 rounded-xl text-base font-semibold transition-all shadow-lg ${
            activeView === 'chaos'
              ? 'bg-zinc-800 text-zinc-200 border-2 border-red-500/50 scale-105'
              : 'bg-zinc-800/50 text-zinc-500 border-2 border-zinc-700 hover:bg-zinc-800 hover:text-zinc-300'
          }`}
        >
          <span className="text-red-400 mr-2">❌</span> {language === 'es' ? 'Caos' : 'Chaos'}
        </button>
      </div>

      <motion.div
        key={activeView}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-6 md:p-8"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(activeView === 'consistent' ? consistentButtons : chaosButtons).map((btn, idx) => (
            <button
              key={idx}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${btn.style}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// Componente: Contraste de Color (Accesibilidad) - MEJORADO
interface TouchSizeComparisonProps {
  language?: 'en' | 'es';
}

export const TouchSizeComparison: React.FC<TouchSizeComparisonProps> = ({ language = 'es' }) => {
  const [selectedExample, setSelectedExample] = useState<'contrast' | 'touch'>('contrast');

  return (
    <div className="w-full space-y-6">
      {/* Selector de ejemplo */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => setSelectedExample('contrast')}
          className={`px-6 py-3 rounded-xl text-base font-semibold transition-all shadow-lg ${
            selectedExample === 'contrast'
              ? 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500 scale-105'
              : 'bg-zinc-800/50 text-zinc-500 border-2 border-zinc-700 hover:bg-zinc-800 hover:text-zinc-300'
          }`}
        >
          {language === 'es' ? 'Contraste de Color' : 'Color Contrast'}
        </button>
        <button
          onClick={() => setSelectedExample('touch')}
          className={`px-6 py-3 rounded-xl text-base font-semibold transition-all shadow-lg ${
            selectedExample === 'touch'
              ? 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500 scale-105'
              : 'bg-zinc-800/50 text-zinc-500 border-2 border-zinc-700 hover:bg-zinc-800 hover:text-zinc-300'
          }`}
        >
          {language === 'es' ? 'Tamaños Táctiles' : 'Touch Sizes'}
        </button>
      </div>

      {selectedExample === 'contrast' ? (
        <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-6 md:p-8 space-y-6">
          <div>
            <h4 className="text-xl font-semibold text-white mb-2">{language === 'es' ? 'Contraste de Color: Legibilidad para Todos' : 'Color Contrast: Readability for Everyone'}</h4>
            <p className="text-sm text-zinc-400 mb-6">{language === 'es' ? 'El contraste adecuado no es solo estético, es una necesidad de accesibilidad que afecta a millones de usuarios.' : 'Adequate contrast isn\'t just aesthetic, it\'s an accessibility need that affects millions of users.'}</p>
          </div>

          {/* Ejemplo visual de contraste */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mal contraste */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-sm text-red-400 font-semibold mb-3">❌ {language === 'es' ? 'Contraste Insuficiente (2.1:1)' : 'Insufficient Contrast (2.1:1)'}</div>
                <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl p-8 min-h-[200px] flex flex-col items-center justify-center">
                  <p className="text-gray-500 text-lg font-medium mb-4">{language === 'es' ? 'Texto difícil de leer' : 'Hard to read text'}</p>
                  <p className="text-gray-400 text-sm">{language === 'es' ? 'No cumple WCAG AA' : 'Does not meet WCAG AA'}</p>
                  <p className="text-gray-500 text-xs mt-2">{language === 'es' ? 'Usuarios con baja visión no pueden leer esto' : 'Users with low vision cannot read this'}</p>
                </div>
              </div>
            </div>

            {/* Buen contraste */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-sm text-emerald-400 font-semibold mb-3">✅ {language === 'es' ? 'Contraste Adecuado (7.2:1)' : 'Adequate Contrast (7.2:1)'}</div>
                <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl p-8 min-h-[200px] flex flex-col items-center justify-center">
                  <p className="text-gray-900 text-lg font-bold mb-4">{language === 'es' ? 'Texto claro y legible' : 'Clear and readable text'}</p>
                  <p className="text-gray-800 text-sm font-medium">{language === 'es' ? 'Cumple WCAG AAA' : 'Meets WCAG AAA'}</p>
                  <p className="text-gray-700 text-xs mt-2">{language === 'es' ? 'Accesible para todos los usuarios' : 'Accessible for all users'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ejemplos reales */}
          <div className="pt-6 border-t border-zinc-800">
            <h5 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-emerald-400" />
              {language === 'es' ? 'Casos de Éxito' : 'Success Cases'}
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-zinc-800/50 rounded-lg">
                <div className="text-xs font-semibold text-emerald-400 mb-2">BBC</div>
                <p className="text-xs text-zinc-400">{language === 'es' ? 'Ratio 7:1 en todo el sitio, referencia mundial en accesibilidad' : '7:1 ratio across the site, world reference in accessibility'}</p>
              </div>
              <div className="p-4 bg-zinc-800/50 rounded-lg">
                <div className="text-xs font-semibold text-emerald-400 mb-2">GitHub</div>
                <p className="text-xs text-zinc-400">{language === 'es' ? 'Contraste 4.5:1 mínimo, modo oscuro accesible' : '4.5:1 minimum contrast, accessible dark mode'}</p>
              </div>
              <div className="p-4 bg-zinc-800/50 rounded-lg">
                <div className="text-xs font-semibold text-emerald-400 mb-2">Microsoft</div>
                <p className="text-xs text-zinc-400">{language === 'es' ? 'Estándares WCAG AAA en todos sus productos' : 'WCAG AAA standards in all their products'}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-300">
              <strong className="text-blue-400">{language === 'es' ? 'WCAG Estándares:' : 'WCAG Standards:'}</strong> {language === 'es' ? 'Ratio mínimo 4.5:1 para texto normal (AA), 7:1 para AAA. Usa' : 'Minimum 4.5:1 ratio for normal text (AA), 7:1 for AAA. Use'} <a href="https://webaim.org/resources/contrastchecker/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-200">WebAIM Contrast Checker</a> {language === 'es' ? 'para verificar.' : 'to verify.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-6 md:p-8 space-y-6">
          <div>
            <h4 className="text-xl font-semibold text-white mb-2">{language === 'es' ? 'Tamaño de Áreas Táctiles' : 'Touch Target Size'}</h4>
            <p className="text-sm text-zinc-400 mb-6">{language === 'es' ? 'El tamaño mínimo recomendado asegura que todos puedan interactuar cómodamente con tu interfaz.' : 'The recommended minimum size ensures everyone can interact comfortably with your interface.'}</p>
          </div>

          {/* Simulación de interfaz móvil */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interfaz con botones pequeños */}
            <div className="space-y-3">
              <div className="text-center mb-4">
                <div className="text-sm text-red-400 font-semibold">❌ {language === 'es' ? 'Botones Pequeños (32px)' : 'Small Buttons (32px)'}</div>
                <div className="text-xs text-zinc-500 mt-1">{language === 'es' ? 'Tasa de error: 15-20%' : 'Error rate: 15-20%'}</div>
              </div>
              <div className="bg-zinc-950 rounded-2xl p-6 border border-zinc-800">
                <div className="space-y-3">
                  <button className="w-full py-2 px-3 bg-zinc-800 text-zinc-300 rounded-lg text-sm">
                    {language === 'es' ? 'Guardar Cambios' : 'Save Changes'}
                  </button>
                  <button className="w-full py-2 px-3 bg-zinc-800 text-zinc-300 rounded-lg text-sm">
                    {language === 'es' ? 'Cancelar' : 'Cancel'}
                  </button>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 px-2 bg-zinc-800 text-zinc-300 rounded-lg text-xs">
                      {language === 'es' ? 'Editar' : 'Edit'}
                    </button>
                    <button className="flex-1 py-2 px-2 bg-zinc-800 text-zinc-300 rounded-lg text-xs">
                      {language === 'es' ? 'Eliminar' : 'Delete'}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-red-400 mt-4 text-center">{language === 'es' ? 'Difícil de tocar con precisión' : 'Hard to tap accurately'}</p>
              </div>
            </div>

            {/* Interfaz con botones adecuados */}
            <div className="space-y-3">
              <div className="text-center mb-4">
                <div className="text-sm text-emerald-400 font-semibold">✅ {language === 'es' ? 'Botones Adecuados (48px)' : 'Adequate Buttons (48px)'}</div>
                <div className="text-xs text-zinc-500 mt-1">{language === 'es' ? 'Tasa de error: <5%' : 'Error rate: <5%'}</div>
              </div>
              <div className="bg-zinc-950 rounded-2xl p-6 border border-zinc-800">
                <div className="space-y-4">
                  <button className="w-full py-4 px-4 bg-[#635BFF] text-white rounded-lg text-base font-medium">
                    {language === 'es' ? 'Guardar Cambios' : 'Save Changes'}
                  </button>
                  <button className="w-full py-4 px-4 bg-zinc-800 text-zinc-300 rounded-lg text-base font-medium">
                    {language === 'es' ? 'Cancelar' : 'Cancel'}
                  </button>
                  <div className="flex gap-3">
                    <button className="flex-1 py-4 px-4 bg-zinc-800 text-zinc-300 rounded-lg text-sm font-medium">
                      {language === 'es' ? 'Editar' : 'Edit'}
                    </button>
                    <button className="flex-1 py-4 px-4 bg-red-600 text-white rounded-lg text-sm font-medium">
                      {language === 'es' ? 'Eliminar' : 'Delete'}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-emerald-400 mt-4 text-center">{language === 'es' ? 'Fácil de tocar, cómodo para todos' : 'Easy to tap, comfortable for everyone'}</p>
              </div>
            </div>
          </div>

          {/* Estándares */}
          <div className="pt-6 border-t border-zinc-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-800/50 rounded-lg">
                <div className="text-sm font-semibold text-white mb-2">Apple iOS</div>
                <p className="text-xs text-zinc-400">{language === 'es' ? 'Mínimo 44x44px recomendado' : 'Minimum 44x44px recommended'}</p>
              </div>
              <div className="p-4 bg-zinc-800/50 rounded-lg">
                <div className="text-sm font-semibold text-white mb-2">Google Material</div>
                <p className="text-xs text-zinc-400">{language === 'es' ? 'Mínimo 48x48px recomendado' : 'Minimum 48x48px recommended'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente: Estados de Botón (Feedback)
interface ButtonStatesProps {
  language?: 'en' | 'es';
}

export const ButtonStates: React.FC<ButtonStatesProps> = ({ language = 'es' }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);

  const states = [
    { id: 'default', label: language === 'es' ? 'Default' : 'Default', description: language === 'es' ? 'Estado de reposo' : 'Resting state' },
    { id: 'hover', label: language === 'es' ? 'Hover' : 'Hover', description: language === 'es' ? 'Indica interactividad' : 'Indicates interactivity' },
    { id: 'active', label: language === 'es' ? 'Active' : 'Active', description: language === 'es' ? 'Feedback táctil' : 'Tactile feedback' },
    { id: 'focus', label: language === 'es' ? 'Focus' : 'Focus', description: language === 'es' ? 'Navegación por teclado' : 'Keyboard navigation' },
    { id: 'disabled', label: language === 'es' ? 'Disabled' : 'Disabled', description: language === 'es' ? 'No interactivo' : 'Not interactive' },
  ];

  return (
    <div className="w-full bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-6 md:p-8">
      <h4 className="text-lg font-semibold text-white mb-6">{language === 'es' ? 'Estados de Componentes' : 'Component States'}</h4>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {states.map((state) => (
          <div key={state.id} className="text-center">
            <div className="mb-2">
              {state.id === 'disabled' ? (
                <button
                  disabled
                  className="w-full px-4 py-3 bg-zinc-800 text-zinc-500 rounded-lg text-sm font-medium cursor-not-allowed opacity-50"
                >
                  {language === 'es' ? 'Acción' : 'Action'}
                </button>
              ) : state.id === 'focus' ? (
                <button
                  className="w-full px-4 py-3 bg-[#635BFF] text-white rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#635BFF] focus:ring-offset-2 focus:ring-offset-zinc-900"
                  onFocus={() => setHovered(state.id)}
                  onBlur={() => setHovered(null)}
                >
                  {language === 'es' ? 'Acción' : 'Action'}
                </button>
              ) : (
                <button
                  onMouseEnter={() => setHovered(state.id)}
                  onMouseLeave={() => setHovered(null)}
                  onMouseDown={() => setActive(state.id)}
                  onMouseUp={() => setActive(null)}
                  className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    state.id === 'hover' && hovered === state.id
                      ? 'bg-[#5548FF] text-white transform -translate-y-0.5 shadow-lg'
                      : state.id === 'active' && active === state.id
                      ? 'bg-[#4A3FE8] text-white transform translate-y-0'
                      : 'bg-[#635BFF] text-white'
                  }`}
                >
                  {language === 'es' ? 'Acción' : 'Action'}
                </button>
              )}
            </div>
            <div className="text-xs font-medium text-white mb-1">{state.label}</div>
            <div className="text-xs text-zinc-500">{state.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
