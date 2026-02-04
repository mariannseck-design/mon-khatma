import { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown, Send, Heart, Sparkles } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "📱 Texte trop petit ?",
    answer: "Pour agrandir le texte sur ton téléphone :\n\n• **iPhone** : Va dans Réglages → Accessibilité → Taille du texte, et augmente la taille.\n\n• **Android** : Va dans Paramètres → Affichage → Taille de la police.\n\nTu peux aussi utiliser le bouton de zoom flottant (Aa) en bas à droite de l'application pour ajuster la taille du texte directement."
  },
  {
    question: "🔄 L'application ne se met pas à jour ?",
    answer: "Pour rafraîchir l'application et voir les dernières modifications :\n\n1. **Ferme complètement l'application** et rouvre-la.\n\n2. **Vide le cache du navigateur** :\n   • Sur Safari (iPhone) : Réglages → Safari → Effacer historique et données.\n   • Sur Chrome : Menu (⋮) → Paramètres → Confidentialité → Effacer les données de navigation.\n\n3. **Tire vers le bas** sur l'écran pour forcer un rafraîchissement."
  },
  {
    question: "🔐 Problème de connexion ?",
    answer: "Si tu as des difficultés à te connecter :\n\n1. Vérifie que ton adresse email est correcte.\n2. Utilise le lien \"Mot de passe oublié\" pour réinitialiser.\n3. Assure-toi d'avoir une connexion internet stable.\n\nSi le problème persiste, contacte-moi via le formulaire ci-dessous."
  },
  {
    question: "📊 Ma progression n'apparaît pas ?",
    answer: "Si ta progression de lecture n'apparaît pas correctement :\n\n1. Vérifie que tu es bien connectée avec le bon compte.\n2. Rafraîchis la page en tirant vers le bas.\n3. Attends quelques secondes — la synchronisation peut prendre un moment.\n\nTes données sont sauvegardées automatiquement, avec l'aide d'Allah (عز وجل)."
  },
];

export default function SupportPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Merci de remplir tous les champs');
      return;
    }

    setIsSending(true);
    
    // Simulate sending (in production, this would send to an API/email service)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSending(false);
    setSent(true);
    setName('');
    setEmail('');
    setMessage('');
    
    toast.success('Message envoyé! Marianne te répondra bientôt, incha\'Allah.');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <AppLayout title="Support">
      <motion.div 
        className="section-spacing pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="zen-header">
          <h1 className="text-2xl sm:text-3xl">🤝 Support & Aide</h1>
          <p className="text-base text-muted-foreground">
            Besoin d'aide ? Je suis là pour toi, avec l'aide d'Allah <span className="honorific">(عز وجل)</span>
          </p>
        </motion.div>

        {/* FAQ Section */}
        <motion.div variants={itemVariants}>
          <Card className="pastel-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Questions fréquentes
                </h2>
                <p className="text-base text-muted-foreground">
                  Trouve rapidement ta réponse
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {faqItems.map((item, index) => (
                <Collapsible
                  key={index}
                  open={openItems.includes(index)}
                  onOpenChange={() => toggleItem(index)}
                >
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors text-left">
                      <span className="font-semibold text-lg text-foreground pr-4">
                        {item.question}
                      </span>
                      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform shrink-0 ${
                        openItems.includes(index) ? 'rotate-180' : ''
                      }`} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 pt-2"
                    >
                      <p className="text-base text-foreground leading-relaxed whitespace-pre-line">
                        {item.answer}
                      </p>
                    </motion.div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Contact Form */}
        <motion.div variants={itemVariants}>
          <Card className="pastel-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-peach/30 flex items-center justify-center">
                <Send className="h-6 w-6 text-peach-foreground" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Contacter Marianne
                </h2>
                <p className="text-base text-muted-foreground">
                  Un problème d'affichage ? Écris-moi !
                </p>
              </div>
            </div>

            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-semibold">
                    Ton prénom
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ex: Fatima"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-14 text-base rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold">
                    Ton email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="fatima@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 text-base rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-base font-semibold">
                    Décris ton problème
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Décris ce qui ne fonctionne pas correctement..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[140px] text-base rounded-xl resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSending}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg rounded-2xl hover-lift"
                >
                  {isSending ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Envoi en cours...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      Envoyer mon message
                    </span>
                  )}
                </Button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-success" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  Message envoyé !
                </h3>
                <p className="text-base text-muted-foreground">
                  Marianne te répondra très bientôt, incha'Allah.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSent(false)}
                  className="mt-4 h-12 text-base rounded-xl"
                >
                  Envoyer un autre message
                </Button>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Spiritual Closing - Dou'a */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-lavender via-accent/70 to-sky p-6 shadow-lg">
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/15 blur-xl" />
            <div className="absolute bottom-4 left-4 w-10 h-10 rounded-xl rotate-12 bg-white/10" />
            
            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Heart className="h-6 w-6 text-foreground/70" />
                <h3 className="font-display text-xl font-bold text-foreground">
                  Dou'a pour toi
                </h3>
                <Heart className="h-6 w-6 text-foreground/70" />
              </div>
              
              {/* Arabic Dou'a */}
              <p className="text-2xl font-arabic text-foreground mb-4 leading-relaxed" dir="rtl">
                اللَّهُمَّ يَسِّرْ وَلَا تُعَسِّرْ، وَتَمِّمْ بِالْخَيْرِ
              </p>
              
              {/* French Translation */}
              <p className="text-lg text-foreground italic mb-4 leading-relaxed">
                "Ô Allah <span className="honorific">(عز وجل)</span>, facilite et ne rends pas difficile, et accomplis avec le bien."
              </p>
              
              <p className="text-base text-muted-foreground">
                Qu'Allah <span className="honorific">(عز وجل)</span> te facilite ta lecture du Coran 
                et t'accorde la constance dans l'adoration. Amine.
              </p>
              
              <div className="mt-6 pt-4 border-t border-foreground/10">
                <p className="text-base text-foreground/80">
                  Avec amour et bienveillance,
                </p>
                <p className="font-display text-lg font-bold text-foreground mt-1">
                  Marianne Seck ✨
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
