"use client";

import React, { useState, useEffect, useCallback } from 'react';

interface Color {
  hex: string;
  rgb: string;
  name: string;
  hsl: string;
}

export default function ColorPaletteGenerator() {
  const [palette, setPalette] = useState<Color[]>([]);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedPalettes, setSavedPalettes] = useState<Color[][]>([]);

  // 色名データベース
  const colorNames = [
    'Coral', 'Turquoise', 'Lavender', 'Golden', 'Emerald',
    'Rose', 'Azure', 'Peach', 'Mint', 'Crimson',
    'Indigo', 'Amber', 'Violet', 'Lime', 'Magenta',
    'Navy', 'Orange', 'Purple', 'Teal', 'Salmon',
    'Ruby', 'Sapphire', 'Jade', 'Pearl', 'Onyx',
    'Silver', 'Bronze', 'Copper', 'Platinum', 'Diamond'
  ];

  // RGB to HSL変換
  const rgbToHsl = (r: number, g: number, b: number): string => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  // 色名を生成
  const getColorName = useCallback((r: number, g: number, b: number): string => {
    // 色の特徴に基づいて名前を決定
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const isWarm = r > g && r > b;
    const isCool = b > r && b > g;
    
    let namePool = [...colorNames];
    
    if (brightness < 85) {
      namePool = ['Onyx', 'Navy', 'Indigo', 'Crimson', 'Ruby'];
    } else if (brightness > 200) {
      namePool = ['Pearl', 'Silver', 'Azure', 'Mint', 'Lavender'];
    } else if (isWarm) {
      namePool = ['Coral', 'Golden', 'Amber', 'Peach', 'Rose'];
    } else if (isCool) {
      namePool = ['Turquoise', 'Azure', 'Sapphire', 'Teal', 'Emerald'];
    }
    
    return namePool[Math.floor(Math.random() * namePool.length)];
  }, [colorNames]);

  // ランダムな色を生成
  const generateRandomColor = useCallback((): Color => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
    const rgb = `rgb(${r}, ${g}, ${b})`;
    const hsl = rgbToHsl(r, g, b);
    const name = getColorName(r, g, b);

    return { hex, rgb, hsl, name };
  }, [getColorName]);

  // ハーモニアスなパレット生成
  const generateHarmoniousPalette = useCallback((): Color[] => {
    const baseColor = generateRandomColor();
    const palette = [baseColor];
    
    // ベース色のRGB値を取得
    const baseRgb = baseColor.hex.match(/\w\w/g)!.map(hex => parseInt(hex, 16));
    
    // 4つの調和した色を生成
    for (let i = 1; i < 5; i++) {
      const hueShift = (i * 60) % 360; // 色相を60度ずつシフト
      const variation = Math.random() * 0.3 + 0.7; // 明度の変化
      
      const r = Math.min(255, Math.max(0, Math.floor(baseRgb[0] * variation + Math.sin(hueShift) * 50)));
      const g = Math.min(255, Math.max(0, Math.floor(baseRgb[1] * variation + Math.sin(hueShift + 120) * 50)));
      const b = Math.min(255, Math.max(0, Math.floor(baseRgb[2] * variation + Math.sin(hueShift + 240) * 50)));
      
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
      const rgb = `rgb(${r}, ${g}, ${b})`;
      const hsl = rgbToHsl(r, g, b);
      const name = getColorName(r, g, b);
      
      palette.push({ hex, rgb, hsl, name });
    }
    
    return palette;
  }, [generateRandomColor, getColorName]);

  // パレット生成
  const generatePalette = useCallback(async () => {
    setIsGenerating(true);
    
    // アニメーション用の遅延
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newPalette = generateHarmoniousPalette();
    setPalette(newPalette);
    setIsGenerating(false);
  }, [generateHarmoniousPalette]);

  // クリップボードにコピー
  const copyToClipboard = async (colorValue: string, format: 'hex' | 'rgb' | 'hsl' = 'hex') => {
    try {
      await navigator.clipboard.writeText(colorValue);
      setCopiedColor(colorValue);
      
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      // フォールバック: 手動選択
      const textArea = document.createElement('textarea');
      textArea.value = colorValue;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedColor(colorValue);
      setTimeout(() => setCopiedColor(null), 2000);
    }
  };

  // パレット保存
  const savePalette = () => {
    if (palette.length > 0) {
      const newSavedPalettes = [...savedPalettes, palette];
      setSavedPalettes(newSavedPalettes);
      localStorage.setItem('savedPalettes', JSON.stringify(newSavedPalettes));
    }
  };

  // 保存されたパレットの読み込み
  useEffect(() => {
    try {
      const saved = localStorage.getItem('savedPalettes');
      if (saved) {
        setSavedPalettes(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load saved palettes:', err);
    }
  }, []);

  // 初回ロード時にパレット生成
  useEffect(() => {
    generatePalette();
  }, [generatePalette]);

  // 文字色を動的に決定（コントラスト比考慮）
  const getTextColor = (hexColor: string): string => {
    const rgb = hexColor.match(/\w\w/g)!.map(hex => parseInt(hex, 16));
    const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🎨 Color Palette Generator
          </h1>
          <p className="text-gray-600 text-xl mb-6">
            美しいハーモニアスなカラーパレットをワンクリックで生成
          </p>
          
          {/* コントロールボタン */}
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={generatePalette}
              disabled={isGenerating}
              className={`
                px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg
                ${isGenerating 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-105 active:scale-95'
                }
              `}
            >
              {isGenerating ? '🔄 生成中...' : '✨ 新しいパレットを生成'}
            </button>
            
            <button
              onClick={savePalette}
              disabled={palette.length === 0}
              className="px-6 py-3 rounded-xl font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              💾 パレットを保存
            </button>
          </div>
        </header>

        {/* メインパレット表示 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">現在のパレット</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {palette.map((color, index) => (
              <div
                key={`${color.hex}-${index}`}
                className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl group"
              >
                {/* 色表示部分 */}
                <div 
                  className="h-48 w-full relative cursor-pointer"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => copyToClipboard(color.hex)}
                >
                  {/* コピー通知 */}
                  {copiedColor === color.hex && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
                      <div className="text-white font-bold text-lg animate-pulse">
                        📋 コピーしました！
                      </div>
                    </div>
                  )}
                  
                  {/* ホバー時の情報表示 */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-30">
                    <span className="text-white font-bold text-lg">クリックでコピー</span>
                  </div>
                </div>
                
                {/* 色情報 */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-800 mb-3 text-lg">{color.name}</h3>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => copyToClipboard(color.hex)}
                      className="w-full text-left p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <span className="text-xs text-gray-500 block">HEX</span>
                      <span className="font-mono text-sm text-gray-800">{color.hex}</span>
                    </button>
                    
                    <button
                      onClick={() => copyToClipboard(color.rgb)}
                      className="w-full text-left p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <span className="text-xs text-gray-500 block">RGB</span>
                      <span className="font-mono text-sm text-gray-800">{color.rgb}</span>
                    </button>
                    
                    <button
                      onClick={() => copyToClipboard(color.hsl)}
                      className="w-full text-left p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <span className="text-xs text-gray-500 block">HSL</span>
                      <span className="font-mono text-sm text-gray-800">{color.hsl}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 保存されたパレット */}
        {savedPalettes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">保存されたパレット</h2>
            
            <div className="space-y-4">
              {savedPalettes.slice(-3).reverse().map((savedPalette, paletteIndex) => (
                <div key={paletteIndex} className="bg-white rounded-xl p-4 shadow-lg">
                  <div className="flex gap-2 mb-2">
                    {savedPalette.map((color, colorIndex) => (
                      <div
                        key={colorIndex}
                        className="flex-1 h-16 rounded-lg cursor-pointer transition-transform hover:scale-105"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => copyToClipboard(color.hex)}
                        title={`${color.name} - ${color.hex}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setPalette(savedPalette)}
                    className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    このパレットを使用
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* フッター */}
        <footer className="text-center text-gray-600 space-y-2">
          <p className="mb-4">
            💡 カラーカードや色コードをクリックしてコピーできます
          </p>
          <p className="text-sm">
            🎯 ハーモニアスな色彩理論に基づいたパレット生成
          </p>
          <p className="text-xs">
            Created with Next.js 15 + TypeScript + Tailwind CSS
          </p>
        </footer>
      </div>
    </div>
  );
}