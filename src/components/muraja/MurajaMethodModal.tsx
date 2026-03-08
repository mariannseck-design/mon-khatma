import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lamp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const forgettingData = [
  { day: 0, withSM2: 100, without: 100 },
  { day: 1, withSM2: 85, without: 70 },
  { day: 2, withSM2: 75, without: 50 },
  { day: 3, withSM2: 100, without: 38 },
  { day: 5, withSM2: 90, without: 28 },
  { day: 7, withSM2: 82, without: 22 },
  { day: 10, withSM2: 100, without: 18 },
  { day: 14, withSM2: 92, without: 15 },
  { day: 21, withSM2: 88, without: 12 },
  { day: 30, withSM2: 100, without: 10 },
  { day: 45, withSM2: 95, without: 8 },
  { day: 60, withSM2: 93, without: 6 },
];

interface MurajaMethodModalProps {
  defaultTab?: 'rabt' | 'sm2';
  trigger?: React.ReactNode;
}

export default function MurajaMethodModal({ defaultTab = 'rabt', trigger }: MurajaMethodModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <button
            className="inline-flex items-center justify-center w-5 h-5 rounded-full transition-colors"
            style={{ background: 'transparent', color: '#D4AF37' }}
          >
            <Lamp className="h-4 w-4" />
          </button>
        )}
      </DialogTrigger>
      <DialogContent
        className="max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border-0"
        style={{ background: '#065F46', color: '#FFFFFF' }}
      >
        <DialogHeader>
          <DialogTitle
            className="text-lg font-bold tracking-wide"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#D4AF37' }}
          >
            📖 Notre Méthode
          </DialogTitle>
        </DialogHeader>

        <p className="text-xs leading-relaxed mt-1" style={{ color: 'rgba(255,255,255,0.85)' }}>
          À minuit, ton programme est mis à jour. Prépare ton cœur pour ta prochaine récitation afin d'ancrer durablement la Parole Sacrée, par la grâce d'Allah <span style={{ fontFamily: "'Amiri', serif" }}>(عز وجل)</span>.
        </p>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 h-9 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <TabsTrigger
              value="rabt"
              className="rounded-lg text-xs font-bold data-[state=active]:shadow-sm data-[state=active]:bg-white/20 text-white/70 data-[state=active]:text-white"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              🔗 Ar-Rabt
            </TabsTrigger>
            <TabsTrigger
              value="sm2"
              className="rounded-lg text-xs font-bold data-[state=active]:shadow-sm data-[state=active]:bg-white/20 text-white/70 data-[state=active]:text-white"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              🧠 Révision
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rabt" className="space-y-4 mt-4">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">
                🔗 Ar-Rabt (La Liaison)
              </h3>
              <p className="text-xs leading-relaxed text-white/90">
                Le mot <span style={{ fontFamily: "'Amiri', serif", fontWeight: 'bold', fontSize: '1.1em' }}>الرَّبْط</span> signifie
                « le lien ». C'est une étape cruciale qui intervient juste après tes répétitions intensives.
              </p>
              <p className="text-xs leading-relaxed text-white/90">
                Considère que la mémorisation est comme une empreinte dans le sable. Sans protection, le vent de l'oubli
                l'efface. <strong className="text-white">Ar-Rabt</strong> consiste à réciter tes nouveaux acquis <strong className="text-white">quotidiennement pendant
                30 jours consécutifs</strong>. C'est ce travail de liaison constante qui transforme une mémorisation fragile
                en un souvenir inébranlable, gravé dans ton cœur par la grâce d'{' '}
                <strong className="text-white">Allah</strong>{' '}
                <span style={{ fontFamily: "'Amiri', serif", fontWeight: 'bold', fontSize: '1.1em' }}>(عز وجل)</span>.
              </p>
              <div
                className="rounded-xl p-3 text-xs leading-relaxed"
                style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: '#FFFFFF' }}
              >
                <strong style={{ color: '#D4AF37' }}>En résumé :</strong> 30 jours de récitation quotidienne = ancrage solide dans la mémoire longue.
                Aucun jour ne doit être manqué durant cette période.
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sm2" className="space-y-4 mt-4">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">
                🧠 Muraja'a (Consolidation) : Révision intelligente
              </h3>
              <p className="text-xs leading-relaxed text-white/90">
                Une fois la période de liaison terminée, comment entretenir ce dépôt sacré sans s'épuiser ?
                C'est là qu'intervient le système de <strong className="text-white">répétition espacée</strong>.
              </p>
              <p className="text-xs leading-relaxed text-white/90">
                Plutôt que de tout réviser chaque jour,
                le système calcule le <strong className="text-white">moment précis</strong> où ton cerveau s'apprête à oublier une information
                pour te la proposer à nouveau. C'est une méthode <strong className="text-white">internationalement reconnue</strong> et
                scientifiquement prouvée pour ancrer durablement les connaissances dans la mémoire à long terme.
              </p>

              {/* Forgetting curve chart */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white">
                  📈 Briser la courbe de l'oubli
                </h4>
                <div className="w-full h-48 rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forgettingData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 9, fill: '#FFFFFF' }}
                        label={{ value: 'Jours', position: 'insideBottom', offset: -2, fontSize: 9, fill: '#FFFFFF' }}
                      />
                      <YAxis
                        tick={{ fontSize: 9, fill: '#FFFFFF' }}
                        label={{ value: 'Rétention %', angle: -90, position: 'insideLeft', offset: 25, fontSize: 9, fill: '#FFFFFF' }}
                      />
                      <Tooltip
                        contentStyle={{ fontSize: 10, background: '#065F46', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 8, color: '#FFFFFF' }}
                        formatter={(value: number, name: string) => [
                          `${value}%`,
                          name === 'withSM2' ? 'Avec révision' : 'Sans révision'
                        ]}
                        labelFormatter={(label) => `Jour ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="without"
                        stroke="#FF6B6B"
                        fill="rgba(255,107,107,0.15)"
                        strokeWidth={1.5}
                        strokeDasharray="4 2"
                        name="without"
                      />
                      <Area
                        type="monotone"
                        dataKey="withSM2"
                        stroke="#D4AF37"
                        fill="rgba(212,175,55,0.2)"
                        strokeWidth={2}
                        name="withSM2"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-4 justify-center text-[9px] text-white/80">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 rounded" style={{ background: '#D4AF37' }} /> Avec révision
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 rounded border-dashed" style={{ background: '#FF6B6B' }} /> Sans révision
                  </span>
                </div>
              </div>

              <div
                className="rounded-xl p-3 text-xs leading-relaxed"
                style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: '#FFFFFF' }}
              >
                <strong style={{ color: '#D4AF37' }}>En résumé :</strong> Chaque révision programmée vient briser la courbe de l'oubli,
                stabilisant ta mémoire durablement sur le très long terme.
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
