export type HifzTheme = 'teal' | 'nur' | 'parchemin';

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`;

export function getContainerStyle(theme: HifzTheme): React.CSSProperties {
  switch (theme) {
    case 'nur':
      return {
        background: 'radial-gradient(ellipse at center, #FCFBF9 0%, rgba(22,155,76,0.05) 100%)',
        border: '2px solid rgba(22,155,76,0.15)',
        boxShadow: '0 8px 32px -8px rgba(0,0,0,0.05)',
      };
    case 'parchemin':
      return {
        background: '#F9F6EE',
        backgroundImage: NOISE_SVG,
        border: '2px solid rgba(180,160,120,0.2)',
        boxShadow: '0 8px 32px -8px rgba(0,0,0,0.05)',
      };
    default:
      return {
        background: 'linear-gradient(135deg, #0d7377 0%, #14919b 50%, #0d7377 100%)',
        border: '2px solid rgba(212,175,55,0.4)',
        boxShadow: '0 8px 32px -8px rgba(13,115,119,0.4)',
      };
  }
}

export function isLightTheme(theme: HifzTheme): boolean {
  return theme === 'nur' || theme === 'parchemin';
}

/** Colors for UI elements depending on theme */
export function getThemeColors(theme: HifzTheme) {
  const light = isLightTheme(theme);
  return {
    text: light ? '#1a1a1a' : '#e8e0d0',
    textSecondary: light ? '#3a3a3a' : 'rgba(255,255,255,0.8)',
    textMuted: light ? '#6b6b6b' : 'rgba(255,255,255,0.4)',
    textFaint: light ? '#999' : 'rgba(255,255,255,0.3)',
    cardBg: light ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.06)',
    cardBorder: light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)',
    innerBg: light ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)',
    innerBorder: light ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.15)',
    quranBlockBg: light ? 'rgba(255,255,255,0.7)' : 'linear-gradient(135deg, #0d7377, #14919b, #0d7377)',
    quranBlockBorder: light ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(212,175,55,0.3)',
    quranInnerBg: light ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.08)',
    quranInnerBorder: light ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.15)',
    gold: '#d4af37',
    goldBg: light ? 'rgba(212,175,55,0.1)' : 'rgba(212,175,55,0.2)',
    goldBorder: light ? 'rgba(212,175,55,0.2)' : 'rgba(212,175,55,0.3)',
    progressTrack: light ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)',
    stepLabelColor: '#d4af37',
    selectBg: light ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.08)',
    selectBorder: light ? 'rgba(0,0,0,0.1)' : 'rgba(212,175,55,0.2)',
    selectColor: light ? '#1a1a1a' : 'white',
    selectOptionBg: light ? '#f5f5f5' : '#0d4f4f',
  };
}
