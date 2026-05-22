import React, { useState } from 'react';
import { X, Eye, Loader2, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

// @ts-ignore
import wechatDefaultImage from '../assets/wechat.png';
// @ts-ignore
import alipayDefaultImage from '../assets/alipay.png';

// --- Inner Sub-component for QR Code with Laser Animation ---

interface QRCodeSVGProps {
  type: 'wechat' | 'alipay';
  isDarkMode?: boolean;
  layoutMode?: 'grid' | 'focused';
  wechatQrUrl?: string;
  alipayQrUrl?: string;
}

const QRCodeSVG = ({
  type,
  isDarkMode,
  layoutMode = 'grid',
  wechatQrUrl,
  alipayQrUrl,
}: QRCodeSVGProps) => {
  const [activeSrcIndex, setActiveSrcIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const brandColor = type === 'wechat' ? '#07C160' : '#1677FF';
  const label = type === 'wechat' ? '微信支付 / WeChat Pay' : '支付宝 / Alipay';

  // Fallback to locally bundled assets, then absolute/relative paths
  const sources = [
    type === 'wechat' ? (wechatQrUrl || wechatDefaultImage) : (alipayQrUrl || alipayDefaultImage),
    `/images/${type}.png`,
    `/images/${type}.jpg`,
    `/images/${type}.jpeg`,
    `images/${type}.png`,
    `images/${type}.jpg`,
  ].filter(Boolean) as string[];

  const currentSrc = sources[activeSrcIndex];

  const handleImageError = () => {
    if (activeSrcIndex < sources.length - 1) {
      setActiveSrcIndex((prev) => prev + 1);
    } else {
      setHasError(true);
    }
  };

  const isFocused = layoutMode === 'focused';
  const containerAspectStyle = isFocused
    ? type === 'wechat' ? '828/1124' : '843/1264'
    : '7/10';

  // Procedural QR matrix fallback generation
  const matrixSize = 25;
  const cells: boolean[][] = [];
  let seed = type === 'wechat' ? 82 : 117;
  const randomValue = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x) > 0.5;
  };

  for (let r = 0; r < matrixSize; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < matrixSize; c++) {
      if (r < 7 && c < 7) {
        row.push((r === 0 || r === 6 || c === 0 || c === 6) || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
      } else if (r < 7 && c >= matrixSize - 7) {
        const adjustedC = c - (matrixSize - 7);
        row.push((r === 0 || r === 6 || adjustedC === 0 || adjustedC === 6) || (r >= 2 && r <= 4 && adjustedC >= 2 && adjustedC <= 4));
      } else if (r >= matrixSize - 7 && c < 7) {
        const adjustedR = r - (matrixSize - 7);
        row.push((adjustedR === 0 || adjustedR === 6 || c === 0 || c === 6) || (adjustedR >= 2 && adjustedR <= 4 && c >= 2 && c <= 4));
      } else if (r >= matrixSize - 9 && r <= matrixSize - 5 && c >= matrixSize - 9 && c <= matrixSize - 5) {
        const adjustedR = r - (matrixSize - 9);
        const adjustedC = c - (matrixSize - 9);
        row.push((adjustedR === 0 || adjustedR === 4 || adjustedC === 0 || adjustedC === 4) || (adjustedR === 2 && adjustedC === 2));
      } else if (r === 6 || c === 6) {
        row.push((r === 6 && c % 2 === 0) || (c === 6 && r % 2 === 0));
      } else {
        row.push(randomValue());
      }
    }
    cells.push(row);
  }

  const cellSize = 8;
  const padding = 16;
  const qrSize = matrixSize * cellSize;
  const totalSize = qrSize + padding * 2;

  return (
    <>
      <div
        className={cn(
          "flex flex-col items-center p-3 sm:p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-gray-150 dark:border-zinc-700/50 shadow-md hover:shadow-lg transition-all duration-300 w-full group relative cursor-zoom-in",
          type === 'wechat'
            ? "hover:border-green-400 dark:hover:border-green-600 hover:shadow-[0_8px_25px_rgba(7,193,96,0.08)]"
            : "hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-[0_8px_25px_rgba(22,119,255,0.08)]"
        )}
        onClick={() => {
          if (!hasError && isLoaded) {
            setIsZoomed(true);
          }
        }}
      >
        <div
          className="relative w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950/40 rounded-xl overflow-hidden shadow-inner border border-gray-100/80 dark:border-zinc-900/40 p-2 sm:p-3 transition-all duration-300"
          style={{ aspectRatio: containerAspectStyle }}
        >
          {isLoaded && !hasError && (
            <motion.div
              animate={{
                top: ["0%", "100%", "0%"],
              }}
              transition={{
                duration: 4.0,
                ease: "easeInOut",
                repeat: Infinity,
              }}
              className={cn(
                "absolute left-0 right-0 h-0.5 pointer-events-none z-10 opacity-70",
                type === 'wechat'
                  ? "bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-[0_0_8px_#07C160]"
                  : "bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_8px_#1677FF]"
              )}
            />
          )}

          {isLoaded && !hasError && (
            <div className="absolute inset-2 sm:inset-3 pointer-events-none z-10">
              <div className={cn("absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 rounded-tl-[3px] transition-colors duration-300", type === 'wechat' ? "border-green-500/60" : "border-blue-500/60")} />
              <div className={cn("absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 rounded-tr-[3px] transition-colors duration-300", type === 'wechat' ? "border-green-500/60" : "border-blue-500/60")} />
              <div className={cn("absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 rounded-bl-[3px] transition-colors duration-300", type === 'wechat' ? "border-green-500/60" : "border-blue-500/60")} />
              <div className={cn("absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 rounded-br-[3px] transition-colors duration-300", type === 'wechat' ? "border-green-500/60" : "border-blue-500/60")} />
            </div>
          )}

          {!hasError ? (
            <>
              {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="animate-spin text-zinc-400" size={24} />
                </div>
              )}
              <img
                src={currentSrc}
                alt={label}
                onLoad={() => setIsLoaded(true)}
                onError={handleImageError}
                className={cn(
                  "max-h-full max-w-full rounded-lg object-contain transition-all duration-300 select-none",
                  isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                )}
                referrerPolicy="no-referrer"
              />
              {isLoaded && (
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
                  <Eye size={12} />
                </div>
              )}
            </>
          ) : (
            <div className="w-[180px] h-[180px] flex items-center justify-center bg-white p-2 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm animate-fade-in relative z-10">
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${totalSize} ${totalSize}`}
                className="w-full h-full"
              >
                <rect width={totalSize} height={totalSize} fill="#ffffff" rx={8} />
                <g transform={`translate(${padding}, ${padding})`}>
                  {cells.map((row, rIdx) =>
                    row.map((active, cIdx) => {
                      if (!active) return null;
                      const isFinder =
                        (rIdx < 7 && cIdx < 7) ||
                        (rIdx < 7 && cIdx >= matrixSize - 7) ||
                        (rIdx >= matrixSize - 7 && cIdx < 7);

                      const fill = isFinder ? brandColor : "#18181b";
                      return (
                        <rect
                          key={`${rIdx}-${cIdx}`}
                          x={cIdx * cellSize}
                          y={rIdx * cellSize}
                          width={cellSize - 0.5}
                          height={cellSize - 0.5}
                          fill={fill}
                          className="transition-colors duration-200"
                          rx={isFinder ? 1.5 : 1}
                        />
                      );
                    })
                  )}
                  <rect
                    x={(matrixSize / 2 - 1.5) * cellSize}
                    y={(matrixSize / 2 - 1.5) * cellSize}
                    width={cellSize * 3}
                    height={cellSize * 3}
                    fill="#ffffff"
                    rx={3}
                  />
                  <rect
                    x={(matrixSize / 2 - 1) * cellSize}
                    y={(matrixSize / 2 - 1) * cellSize}
                    width={cellSize * 2}
                    height={cellSize * 2}
                    fill={brandColor}
                    rx={1.5}
                  />
                  <circle
                    cx={(matrixSize / 2) * cellSize}
                    cy={(matrixSize / 2) * cellSize}
                    r={cellSize / 2.2}
                    fill="#ffffff"
                  />
                  <circle
                    cx={(matrixSize / 2) * cellSize}
                    cy={(matrixSize / 2) * cellSize}
                    r={cellSize / 4}
                    fill={brandColor}
                  />
                </g>
              </svg>
            </div>
          )}
        </div>
        <div className="mt-3.5 flex items-center gap-2 font-bold text-xs">
          <span className="w-2 h-2 rounded-full relative flex">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: brandColor }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: brandColor }} />
          </span>
          <span className="text-zinc-800 dark:text-zinc-200">{label}</span>
        </div>
      </div>

      {/* Lightbox Detail Zoom */}
      <AnimatePresence>
        {isZoomed && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsZoomed(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.35 }}
              className={cn(
                "relative w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center border outline-none z-10 transition-all duration-300",
                isDarkMode
                  ? "bg-zinc-900 border-zinc-800 text-zinc-100"
                  : "bg-white border-zinc-100 text-zinc-900"
              )}
            >
              <button
                onClick={() => setIsZoomed(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all z-20"
                title="Close"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col items-center text-center mb-5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">SCAN QR CODE</span>
                <h4 className="text-base font-bold tracking-tight">{label}</h4>
              </div>

              <div
                className="w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-2xl border border-gray-100 dark:border-zinc-850/80 overflow-hidden shadow-inner max-h-[60vh]"
                style={{ aspectRatio: type === 'wechat' ? '828/1124' : '843/1264' }}
              >
                <img
                  src={currentSrc}
                  alt={label}
                  className="max-h-full max-w-full rounded-xl object-contain shadow-md select-none"
                />
              </div>

              <div className="mt-5 text-center text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed px-4">
                请使用{type === 'wechat' ? '微信' : '支付宝'}的「扫一扫」扫描上方二维码
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};


// --- EXPORTABLE COMMONLY REUSABLE SPONSOR MODAL COMPONENT ---

export interface SponsorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
  wechatQrUrl?: string; // Optional custom WeChat QR Image
  alipayQrUrl?: string; // Optional custom Alipay QR Image
  projectName?: string; // Optional project title identifier
  authorName?: string;  // Optional author name to thank
}

export const SponsorModal = ({
  isOpen,
  onClose,
  isDarkMode = false,
  wechatQrUrl,
  alipayQrUrl,
  projectName = "Cardy",
  authorName = "作者",
}: SponsorModalProps) => {
  const [donateTab, setDonateTab] = useState<'all' | 'wechat' | 'alipay'>('all');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop with elegant blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            id="sponsor-modal-backdrop"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className={cn(
              "relative w-full max-w-lg rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col z-10 border overflow-hidden",
              isDarkMode
                ? "bg-zinc-900 border-zinc-800 text-zinc-100"
                : "bg-white border-zinc-100 text-zinc-900"
            )}
            id="sponsor-modal-box"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className={cn(
                "absolute top-5 right-5 p-2 rounded-full transition-all duration-200 z-10",
                isDarkMode
                  ? "hover:bg-zinc-850 text-zinc-400 hover:text-zinc-100"
                  : "hover:bg-gray-100 text-gray-400 hover:text-zinc-900"
              )}
              title="Close"
            >
              <X size={18} />
            </button>

            {/* Header Title with floating heart icon */}
            <div className="flex flex-col items-center text-center mt-2 mb-5">
              <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-500 mb-2.5 animate-pulse">
                <Heart size={24} className="fill-current text-pink-500" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-center">赞赏支持 / Support {projectName}</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">给{authorName}来一杯热咖啡吧，感谢您的每份温情！</p>
            </div>

            {/* Seamless Segmented Control / Tabs */}
            <div className={cn(
              "flex p-1 rounded-xl gap-1 mb-6 transition-colors duration-300 w-full text-xs font-semibold max-w-xs mx-auto border",
              isDarkMode ? "bg-zinc-950 border-zinc-800/80" : "bg-zinc-100/60 border-zinc-200/40"
            )}>
              {(['all', 'wechat', 'alipay'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDonateTab(tab)}
                  className={cn(
                    "flex-1 py-1.5 sm:py-2 rounded-lg transition-all duration-250 capitalize text-center",
                    donateTab === tab
                      ? (isDarkMode ? "bg-zinc-805 text-white shadow-sm border border-zinc-700/30" : "bg-white text-zinc-950 shadow-sm border border-zinc-200/10")
                      : (isDarkMode ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-800")
                  )}
                >
                  {tab === 'all' && "全部支持"}
                  {tab === 'wechat' && "微信支付"}
                  {tab === 'alipay' && "支付宝"}
                </button>
              ))}
            </div>

            {/* Dual / Focused Card Container */}
            <div className="overflow-visible min-h-[240px] flex items-center justify-center w-full mb-6">
              <AnimatePresence mode="wait">
                {donateTab === 'all' && (
                  <motion.div
                    key="all-grid"
                    initial={{ opacity: 0, scale: 0.98, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 5 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto"
                  >
                    <QRCodeSVG type="wechat" isDarkMode={isDarkMode} layoutMode="grid" wechatQrUrl={wechatQrUrl} alipayQrUrl={alipayQrUrl} />
                    <QRCodeSVG type="alipay" isDarkMode={isDarkMode} layoutMode="grid" wechatQrUrl={wechatQrUrl} alipayQrUrl={alipayQrUrl} />
                  </motion.div>
                )}

                {donateTab === 'wechat' && (
                  <motion.div
                    key="wechat-focus"
                    initial={{ opacity: 0, scale: 0.98, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 5 }}
                    transition={{ duration: 0.25 }}
                    className="w-full max-w-[210px] mx-auto"
                  >
                    <QRCodeSVG type="wechat" isDarkMode={isDarkMode} layoutMode="focused" wechatQrUrl={wechatQrUrl} alipayQrUrl={alipayQrUrl} />
                  </motion.div>
                )}

                {donateTab === 'alipay' && (
                  <motion.div
                    key="alipay-focus"
                    initial={{ opacity: 0, scale: 0.98, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 5 }}
                    transition={{ duration: 0.25 }}
                    className="w-full max-w-[200px] mx-auto"
                  >
                    <QRCodeSVG type="alipay" isDarkMode={isDarkMode} layoutMode="focused" wechatQrUrl={wechatQrUrl} alipayQrUrl={alipayQrUrl} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Thank you message container */}
            <div className={cn(
              "rounded-2xl p-4 text-center border text-[11px] sm:text-xs leading-relaxed transition-all",
              isDarkMode
                ? "bg-zinc-950/40 border-zinc-800/80 text-zinc-300"
                : "bg-pink-50/25 border-pink-100/50 text-gray-700"
            )}>
              <p className="font-semibold text-pink-500 dark:text-pink-400 mb-1">
                每一次慷慨相助，都让 {projectName} 变得更好！
              </p>
              <p className="opacity-90">
                您的支持是{authorName}持续迭代、维护和增加新功能的无限动力。祝您事事顺利，每日创作愉快！🌟🌿
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
