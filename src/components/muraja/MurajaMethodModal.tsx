import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

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
            style={{ background: 'var(--p-card-active)', color: 'var(--p-primary)' }}
          >
            <Info className="h-3 w-3" />
          </button>
        )}
      </DialogTrigger>
      <DialogContent
        className="max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border-0"
        style={{ background: '#FDFBF7', color: '#1C2421' }}
      >
        <DialogHeader>
          <DialogTitle
            className="text-lg font-bold tracking-wide"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--p-primary)' }}
          >
            💡 Le coin des curieux
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 h-9 rounded-xl" style={{ background: 'var(--p-card-active)' }}>
            <TabsTrigger
              value="rabt"
              className="rounded-lg text-xs font-bold data-[state=active]:shadow-sm"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              🔗 Ar-Rabt
            </TabsTrigger>
            <TabsTrigger
              value="sm2"
              className="rounded-lg text-xs font-bold data-[state=active]:shadow-sm"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              🧠 SM-2
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rabt" className="space-y-4 mt-4">
            <div className="space-y-3">
              <h3 className="text-sm font-bold" style={{ color: '#1C2421' }}>
                🔗 Ar-Rabt (La Liaison)
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: '#1C2421' }}>
                Le mot <span style={{ fontFamily: "'Amiri', serif", fontWeight: 'bold', fontSize: '1.1em' }}>الرَّبْط</span> signifie
                « le lien ». C'est une étape cruciale qui intervient juste après tes répétitions intensives.
              </p>
              <p className="text-xs leading-relaxed" style={{ color: '#1C2421' }}>
                Considère que la mémorisation est comme une empreinte dans le sable. Sans protection, le vent de l'oubli
                l'efface. <strong>Ar-Rabt</strong> consiste à réciter tes nouveaux acquis <strong>quotidiennement pendant
                30 jours consécutifs</strong>. C'est ce travail de liaison constante qui transforme une mémorisation fragile
                en un souvenir inébranlable, gravé dans ton cœur par la grâce d'{' '}
                <strong>Allah</strong>{' '}
                <span style={{ fontFamily: "'Amiri', serif", fontWeight: 'bold', fontSize: '1.1em' }}>(عز وجل)</span>.
              </p>
              <div
                className="rounded-xl p-3 text-xs leading-relaxed"
                style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: '#1C2421' }}
              >
                <strong>En résumé :</strong> 30 jours de récitation quotidienne = ancrage solide dans la mémoire longue.
                Aucun jour ne doit être manqué durant cette période.
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sm2" className="space-y-4 mt-4">
            <div className="space-y-3">
              <h3 className="text-sm font-bold" style={{ color: '#1C2421' }}>
                🧠 Le Tour : SM-2 (SuperMemo-2)
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: '#1C2421' }}>
                Une fois la période de liaison terminée, comment entretenir ce dépôt sacré sans s'épuiser ?
                C'est là qu'intervient l'algorithme <strong>SM-2 (SuperMemo-2)</strong>.
              </p>
              <p className="text-xs leading-relaxed" style={{ color: '#1C2421' }}>
                Le SM-2 est un système de « répétition espacée ». Plutôt que de tout réviser chaque jour,
                le système calcule le <strong>moment précis</strong> où ton cerveau s'apprête à oublier une information
                pour te la proposer à nouveau. C'est la méthode la plus efficace au monde pour préserver le savoir
                transmis par les Prophètes{' '}
                <span style={{ fontFamily: "'Amiri', serif", fontWeight: 'bold', fontSize: '1.1em' }}>(عليهم السلام)</span>{' '}
                sur le très long terme.
              </p>

              {/* Forgetting curve chart */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold" style={{ color: '#1C2421' }}>
                  📈 Briser la courbe de l'oubli
                </h4>
                <div className="w-full h-48 rounded-xl p-2" style={{ background: 'rgba(6,95,70,0.03)' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forgettingData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 9, fill: '#1C2421' }}
                        label={{ value: 'Jours', position: 'insideBottom', offset: -2, fontSize: 9, fill: '#1C2421' }}
                      />
                      <YAxis
                        tick={{ fontSize: 9, fill: '#1C2421' }}
                        label={{ value: 'Rétention %', angle: -90, position: 'insideLeft', offset: 25, fontSize: 9, fill: '#1C2421' }}
                      />
                      <Tooltip
                        contentStyle={{ fontSize: 10, background: '#FDFBF7', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 8 }}
                        formatter={(value: number, name: string) => [
                          `${value}%`,
                          name === 'withSM2' ? 'Avec SM-2' : 'Sans révision'
                        ]}
                        labelFormatter={(label) => `Jour ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="without"
                        stroke="#9B1C31"
                        fill="rgba(155,28,49,0.1)"
                        strokeWidth={1.5}
                        strokeDasharray="4 2"
                        name="without"
                      />
                      <Area
                        type="monotone"
                        dataKey="withSM2"
                        stroke="#065F46"
                        fill="rgba(6,95,70,0.15)"
                        strokeWidth={2}
                        name="withSM2"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-4 justify-center text-[9px]" style={{ color: '#1C2421' }}>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 rounded" style={{ background: '#065F46' }} /> Avec SM-2
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 rounded border-dashed" style={{ background: '#9B1C31' }} /> Sans révision
                  </span>
                </div>
              </div>

              <div
                className="rounded-xl p-3 text-xs leading-relaxed"
                style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: '#1C2421' }}
              >
                <strong>En résumé :</strong> Chaque révision programmée par le SM-2 vient briser la courbe de l'oubli,
                par la grâce d'<strong>Allah</strong>{' '}
                <span style={{ fontFamily: "'Amiri', serif", fontWeight: 'bold', fontSize: '1.1em' }}>(عز وجل)</span>,
                stabilisant ta mémoire sur le très long terme.
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
