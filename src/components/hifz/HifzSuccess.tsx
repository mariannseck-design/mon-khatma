import { motion } from 'framer-motion';
import { Star, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HifzSuccess() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6 py-8"
    >
      {/* Animated rays */}
      <div className="relative w-32 h-32 mx-auto">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-1 h-12 origin-bottom"
            style={{
              background: 'linear-gradient(to top, transparent, #d4af37)',
              transform: `translate(-50%, -100%) rotate(${i * 45}deg)`,
              borderRadius: '2px',
            }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: [0, 1, 0.5], scaleY: [0, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
        <div
          className="absolute inset-4 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(212,175,55,0.2)', border: '2px solid rgba(212,175,55,0.5)' }}
        >
          <Star className="h-10 w-10" style={{ color: '#d4af37' }} fill="#d4af37" />
        </div>
      </div>

      <h1
        className="text-2xl font-bold tracking-[0.15em] uppercase"
        style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#d4af37' }}
      >
        Hifz Validé !
      </h1>

      <p className="text-white/80 text-sm leading-relaxed px-4">
        Félicitations ! Tu as terminé tes répétitions avec succès.
        Que cette portion du Noble Coran reste gravée dans ton cœur,
        tout comme le message porté par les prophètes (aleyhi salam).
      </p>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/accueil')}
        className="mx-auto px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold"
        style={{
          background: 'linear-gradient(135deg, #d4af37, #b8962e)',
          color: '#1a2e1a',
        }}
      >
        <ArrowLeft className="h-5 w-5" />
        Retour à l'accueil
      </motion.button>
    </motion.div>
  );
}
