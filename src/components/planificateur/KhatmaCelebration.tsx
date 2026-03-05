import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KhatmaCelebrationProps {
  onResetKhatma: () => void;
}

const STEPS = [
  {
    title: 'Bénédiction des lettres',
    icon: '✨',
    content: `Ô Allah, accorde-nous l'amitié bénéfique (oulfatan) par chaque Alif ; l'abondance (barakat) par chaque bâ ; la récompense (çawàb) par chaque çâ ; la beauté (djamàl) par chaque djîm ; la sagesse (hikmat) par chaque hâ ; le bien (khayr) par chaque khâ ; la preuve (dalil) par chaque dal ; l'intelligence (zakâ'a) par chaque zâl ; la bénédiction (rahmat) par chaque râ ; la purification (zakàtan) par chaque zâ ; le bonheur (sa'àdatan) par chaque sîn ; le rétablissement (shifâ) par chaque shîne ; la vérité (sidq) par chaque swàd ; l'éclaircissement (zyâ'an) par chaque zwàd ; la fraîcheur (twàrawat) par chaque twà ; la prédominance (zafran) par chaque zwà ; le savoir ('ilm) par chaque 'ayn ; la satisfaction (ghéna) par chaque ghayn ; la réussite (falàh) par chaque fâ ; la proximité d'Allah (qourbat) par chaque qâf ; la générosité (karàmat) par chaque kâf ; la bonté (loutf) par chaque lâm ; le conseil (maw'iza) par chaque mîm ; la lumière (noûr) par chaque noûn ; la relation parentale (woulfat) par chaque wâw ; l'éducation (hydayat) par chaque hâ ; la certitude (yaqîne) par chaque yâ.`,
  },
  {
    title: 'Demande de pardon',
    icon: '🤲',
    content: `Ô Allah, donne-nous le bénéfice de ce très élevé Coran, élève-nous grâce à ses versets et à ses récitations sages, et accepte nos récitations, et sois indulgent sur cette lecture du Coran dans nos erreurs ou les oublis, ou les substitutions des mots, ou les inversions, ou les retards de prononciation, ou les manquants, ou les rajouts, ou les mauvaises compréhensions, ou les doutes, ou les hésitations, ou les imperfections, ou les mauvaises intonations, ou les précipitations, ou les paresses, ou les rapidités, ou les bégaiements, ou les erreurs d'arrêt, ou les liaisons, ou les expressions incorrectes, ou les « maddâ », ou les « tashdîd », ou les « hamzâ », ou les « djazam », ou les accords verbaux, ou les récitations sans passion, ou par peur à cause des signes de Ta bénédiction ou Ton courroux.`,
  },
  {
    title: 'Lumière et Protection',
    icon: '🌟',
    content: `Ô Allah, apporte la lumière dans nos cœurs par le Coran, et sauve-nous du feu de l'enfer par le Coran, et fais-nous entrer dans le paradis par le Coran.

Ô Allah, rends-nous digne d'être compagnon du Coran dans ce monde et un motif de bonheur dans la tombe, une lumière sur le pont du sirâte et un ami dans le paradis et une protection et un rideau contre l'enfer et une preuve vers tous les biens dans son ensemble.

Par conséquent, ô Allah, écris-nous comme accomplis et fais que nous accomplissions le devoir par la langue et par le cœur, accorde-nous l'amour du bien et le bonheur, et la bonne nouvelle de fermeté dans la croyance.`,
  },
  {
    title: 'Conclusion et Salutations',
    icon: '🕌',
    content: `Que la bénédiction d'Allah soit sur la meilleure des créatures Mohammad ﷺ, la preuve de générosité d'Allah et la lumière de Son trône, notre Maître Mohammad et sa pure descendance et ses compagnons choisis, ainsi que les nombreuses, nombreuses salutations.`,
  },
];

export function KhatmaCelebration({ onResetKhatma }: KhatmaCelebrationProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const isLastStep = currentStep === STEPS.length - 1;
  const step = STEPS[currentStep];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/80 via-orange-50/30 to-yellow-50/60" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber-100/30 blur-3xl" />
      </div>

      {/* Stepper indicators */}
      <div className="flex items-center gap-3 mb-8">
        {STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentStep(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === currentStep
                ? 'bg-amber-500 scale-125 shadow-lg shadow-amber-500/30'
                : i < currentStep
                ? 'bg-emerald-400'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="w-full max-w-lg"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="text-4xl block mb-3"
            >
              {step.icon}
            </motion.span>
            <h2 className="font-display text-2xl text-amber-900">
              {step.title}
            </h2>
            <p className="text-xs text-amber-700/60 mt-1">
              Étape {currentStep + 1} sur {STEPS.length}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-[0_8px_40px_-12px_rgba(180,120,40,0.15)] border border-amber-200/40">
            <p className="text-foreground leading-[1.9] text-[0.95rem] whitespace-pre-line">
              {step.content}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-8 w-full max-w-lg">
        {currentStep > 0 && (
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            className="rounded-xl border-amber-200 text-amber-800 hover:bg-amber-50"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Précédent
          </Button>
        )}

        <div className="flex-1" />

        {!isLastStep ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
          >
            Suivant
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full"
          >
            <Button
              onClick={onResetKhatma}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold text-base shadow-lg shadow-amber-500/25"
            >
              <Star className="h-5 w-5 mr-2 fill-white" />
              Qu'Allah exauce nos prières — Recommencer une Khatma
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
