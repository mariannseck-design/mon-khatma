import { motion } from 'framer-motion';
import { History, Check, BookOpen, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSurahByPage } from '@/lib/surahData';
import { toast } from 'sonner';

interface HistoryEntry {
  date: string;
  pages_read: number;
}

interface ReadingHistoryProps {
  entries: HistoryEntry[];
  targetPages?: number;
  firstName?: string;
  startDate?: string;
  isKhatmaComplete?: boolean;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split('T')[0];
}

async function generatePDF(
  entries: HistoryEntry[],
  targetPages: number,
  firstName: string,
  startDate?: string,
  isKhatmaComplete?: boolean,
  mode: 'download' | 'share' = 'download'
) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  // Sort entries chronologically
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  let cumulative = 0;
  const enriched = sorted.map(e => {
    cumulative += e.pages_read;
    const surah = getSurahByPage(Math.min(cumulative, 604));
    return { ...e, cumulativePage: Math.min(cumulative, 604), surahName: surah?.name || '' };
  });

  // Header
  doc.setFontSize(20);
  doc.setTextColor(4, 60, 45);
  doc.text('Ma Khatma', pageWidth / 2, 22, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text('Historique de lecture', pageWidth / 2, 30, { align: 'center' });

  // Info line
  let y = 42;
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);

  if (firstName) {
    doc.text(`Lectrice : ${firstName}`, 20, y);
    y += 6;
  }
  if (startDate) {
    doc.text(`Début : ${formatDateLong(startDate)}`, 20, y);
    y += 6;
  }
  if (isKhatmaComplete) {
    const lastDate = sorted.length > 0 ? sorted[sorted.length - 1].date : '';
    doc.text(`Khatma terminée le ${lastDate ? formatDateLong(lastDate) : '—'}`, 20, y);
    y += 6;
  }
  const totalPages = sorted.reduce((s, e) => s + e.pages_read, 0);
  doc.text(`Total : ${totalPages} pages lues en ${sorted.length} jour(s)`, 20, y);
  y += 10;

  // Table header
  const colX = [20, 55, 85, 140];
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(4, 60, 45);
  doc.rect(18, y - 4, pageWidth - 36, 8, 'F');
  doc.text('Date', colX[0], y + 1);
  doc.text('Pages', colX[1], y + 1);
  doc.text('Sourate', colX[2], y + 1);
  doc.text('Objectif', colX[3], y + 1);
  y += 10;

  // Table rows
  doc.setFontSize(10);
  enriched.forEach((entry, i) => {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }

    if (i % 2 === 0) {
      doc.setFillColor(235, 235, 235);
      doc.rect(18, y - 4, pageWidth - 36, 7, 'F');
    }

    doc.setTextColor(25, 25, 25);
    doc.text(formatDateLong(entry.date), colX[0], y);
    doc.text(`${entry.pages_read}`, colX[1], y);
    doc.text(entry.surahName, colX[2], y);

    const goalMet = targetPages > 0 && entry.pages_read >= targetPages;
    doc.setTextColor(goalMet ? 4 : 120, goalMet ? 60 : 120, goalMet ? 45 : 120);
    doc.text(goalMet ? '✓' : '—', colX[3], y);

    y += 7;
  });

  // Khatma celebration box
  if (isKhatmaComplete) {
    if (y > 245) {
      doc.addPage();
      y = 20;
    }
    y += 6;
    const boxH = 32;
    const boxX = 18;
    const boxW = pageWidth - 36;

    // Gold border
    doc.setDrawColor(180, 145, 30);
    doc.setLineWidth(1.2);
    doc.setFillColor(255, 250, 230);
    doc.roundedRect(boxX, y, boxW, boxH, 4, 4, 'FD');

    // Inner accent line
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.4);
    doc.roundedRect(boxX + 2, y + 2, boxW - 4, boxH - 4, 3, 3, 'S');

    // Title
    doc.setFontSize(13);
    doc.setTextColor(140, 110, 20);
    doc.text('Khatma terminee !', pageWidth / 2, y + 12, { align: 'center' });

    // Message
    doc.setFontSize(9);
    doc.setTextColor(100, 80, 20);
    const msg = firstName
      ? `Felicitations ${firstName} ! Qu'Allah accepte ta lecture et t'accorde Sa misericorde.`
      : `Felicitations ! Qu'Allah accepte ta lecture et t'accorde Sa misericorde.`;
    doc.text(msg, pageWidth / 2, y + 20, { align: 'center' });

    // Date
    const lastDate = sorted.length > 0 ? sorted[sorted.length - 1].date : '';
    if (lastDate) {
      doc.setFontSize(8);
      doc.setTextColor(150, 130, 50);
      doc.text(`Terminee le ${formatDateLong(lastDate)}`, pageWidth / 2, y + 27, { align: 'center' });
    }

    y += boxH + 6;
  }

  // Footer
  y = Math.max(y + 8, 270);
  if (y > 280) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text('Genere par Ma Khatma — makhatma.lovable.app', pageWidth / 2, 290, { align: 'center' });

  if (mode === 'share') {
    const pdfBlob = doc.output('blob');
    const file = new File([pdfBlob], 'ma-khatma-historique.pdf', { type: 'application/pdf' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ title: 'Ma Khatma — Historique', files: [file] });
        toast.success('PDF partagé ! 📤');
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          doc.save('ma-khatma-historique.pdf');
          toast.success('PDF téléchargé ! 📄');
        }
      }
    } else {
      doc.save('ma-khatma-historique.pdf');
      toast.success('PDF téléchargé ! 📄');
    }
  } else {
    doc.save('ma-khatma-historique.pdf');
    toast.success('PDF téléchargé ! 📄');
  }
}

export function ReadingHistory({ entries, targetPages = 0, firstName, startDate, isKhatmaComplete }: ReadingHistoryProps) {
  if (entries.length === 0) return null;

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.canShare;

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  let cumulative = 0;
  const withCumulative = sorted.map(e => {
    cumulative += e.pages_read;
    return { ...e, cumulativePage: Math.min(cumulative, 604) };
  });
  const display = [...withCumulative].reverse().slice(0, 15);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-5 border-none rounded-[2rem] bg-card shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4" style={{ color: 'var(--p-primary)' }} />
            <span className="font-semibold text-foreground text-sm">Historique</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs gap-1.5 rounded-xl"
              style={{ color: 'var(--p-primary)' }}
              onClick={() => generatePDF(entries, targetPages, firstName || '', startDate, isKhatmaComplete, 'download')}
            >
              <Download className="h-3.5 w-3.5" />
              PDF
            </Button>
            {canNativeShare && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs gap-1.5 rounded-xl"
                style={{ color: 'var(--p-primary)' }}
                onClick={() => generatePDF(entries, targetPages, firstName || '', startDate, isKhatmaComplete, 'share')}
              >
                <Share2 className="h-3.5 w-3.5" />
                Partager
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-0.5">
          {display.map((entry, i) => {
            const surah = getSurahByPage(entry.cumulativePage);
            const goalMet = targetPages > 0 && entry.pages_read >= targetPages;
            const today = isToday(entry.date);

            return (
              <div
                key={entry.date}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                  today ? '' : i % 2 === 0 ? 'bg-muted/40' : ''
                }`}
                style={today ? { background: 'rgba(6,95,70,0.06)' } : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="text-xs font-medium w-16 shrink-0"
                    style={{ color: today ? 'var(--p-primary)' : undefined }}
                  >
                    {today ? "Auj." : formatDate(entry.date)}
                  </span>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <BookOpen className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-sm text-foreground truncate">
                      {surah?.name || ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold text-foreground">
                    {entry.pages_read} p.
                  </span>
                  {goalMet && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(212,175,55,0.2)' }}
                    >
                      <Check className="h-3 w-3" style={{ color: 'var(--p-accent)' }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}
