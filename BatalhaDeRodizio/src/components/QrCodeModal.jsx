import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, QrCode } from 'lucide-react';

export default function QrCodeModal({ isOpen, onClose, roomCode }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !roomCode) return null;

  const joinUrl = `${window.location.origin}/?code=${roomCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 transition-all text-center">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
          <QrCode className="h-6 w-6" />
        </div>

        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
          Entrar na Mesa
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-5">
          Aponte a câmera do celular para o código abaixo para abrir o placar ao vivo.
        </p>

        <div className="mx-auto mb-5 inline-block rounded-2xl border-4 border-white bg-white p-3 shadow-md dark:border-zinc-800">
          <QRCodeSVG
            value={joinUrl}
            size={180}
            bgColor="#ffffff"
            fgColor="#18181b"
            level="M"
          />
        </div>

        <div className="mb-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/50">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-0.5">
            Código da Sala
          </span>
          <span className="font-mono text-2xl font-black tracking-widest text-orange-600 dark:text-orange-400">
            {roomCode}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition-all shadow-sm"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span>Link Copiado para a Área de Transferência!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copiar Link de Acesso</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

