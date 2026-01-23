// Neo-brutalist Mobile Theme Configuration

export const neoBrutalistTheme = {
  colors: {
    // Primary Colors
    yellow: '#F7F052',        // Vibrant Electric Yellow
    green: '#A4FF5D',         // Neon Lime Green
    black: '#000000',         // Deep Black
    white: '#FFFFFF',         // Bright White

    // Status Colors
    success: '#A4FF5D',       // Green for positive/completed
    warning: '#F7F052',       // Yellow for pending/attention
    error: '#FF5D5D',         // Red for errors

    // Grays
    gray900: '#0A0A0A',
    gray800: '#1A1A1A',
    gray700: '#2A2A2A',
    gray600: '#3A3A3A',
    gray100: '#F5F5F5',
    gray200: '#E5E5E5',
  },

  borderRadius: {
    small: '16px',
    medium: '24px',
    large: '32px',
    full: '9999px',
  },

  borders: {
    thick: '4px',
    medium: '3px',
    thin: '2px',
  },

  shadows: {
    brutal: '8px 8px 0px 0px rgba(0, 0, 0, 1)',
    brutalSmall: '4px 4px 0px 0px rgba(0, 0, 0, 1)',
    brutalYellow: '8px 8px 0px 0px #F7F052',
    brutalGreen: '8px 8px 0px 0px #A4FF5D',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  typography: {
    fontFamily: {
      primary: "'Inter', 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '32px',
      '4xl': '40px',
      '5xl': '48px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900,
    },
  },
};

export type NeoBrutalistTheme = typeof neoBrutalistTheme;
