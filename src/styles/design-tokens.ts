/**
 * Design Tokens - シフト管理システム
 * デザインの一貫性を保つための定数定義
 */

export const designTokens = {
  // カラーパレット
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // メインブルー
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7', // メインパープル
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    },
    gradient: {
      primary: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      primaryHover: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
      subtle: 'linear-gradient(135deg, #eff6ff 0%, #faf5ff 100%)',
    },
    shift: {
      day: '#fbbf24',      // 日勤 - 黄色
      evening: '#f97316',  // 準夜勤 - オレンジ
      night: '#8b5cf6',    // 夜勤 - 紫
      deepNight: '#6366f1', // 深夜勤 - インディゴ
    },
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    }
  },

  // スペーシング（8pxグリッド）
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
  },

  // タイポグラフィ
  typography: {
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    }
  },

  // ボーダー
  border: {
    radius: {
      sm: '0.375rem',  // 6px
      md: '0.5rem',    // 8px
      lg: '0.75rem',   // 12px
      xl: '1rem',      // 16px
      full: '9999px',
    },
    width: {
      thin: '1px',
      medium: '2px',
      thick: '4px',
    }
  },

  // シャドウ
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    glow: '0 0 20px rgba(59, 130, 246, 0.3)',
  },

  // トランジション
  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // アニメーション
  animation: {
    fadeIn: 'fadeIn 200ms ease-in',
    slideUp: 'slideUp 300ms ease-out',
    scaleUp: 'scaleUp 200ms ease-out',
  },

  // Z-index階層
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  }
} as const

// ユーティリティ関数
export const getGradientClass = (variant: 'primary' | 'subtle' = 'primary') => {
  return variant === 'primary'
    ? 'bg-gradient-to-r from-blue-600 to-purple-600'
    : 'bg-gradient-to-r from-blue-50 to-purple-50'
}

export const getShiftColor = (shiftType: string) => {
  const colorMap: Record<string, string> = {
    '日勤': designTokens.colors.shift.day,
    '準夜勤': designTokens.colors.shift.evening,
    '夜勤': designTokens.colors.shift.night,
    '深夜勤': designTokens.colors.shift.deepNight,
  }
  return colorMap[shiftType] || designTokens.colors.primary[500]
}
