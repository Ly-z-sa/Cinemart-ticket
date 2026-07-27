const fs = require('fs');
const path = require('path');

/* ─────────────────────────────────────────────
   CSS
   Includes page layout, miniature card ticket styling, and full modal retro ticket styling.
───────────────────────────────────────────── */
const css = `
  /* ── PAGE ── */
  .tickets-container { max-width: 1080px; margin: 60px auto; padding: 0 24px; min-height: 70vh; }
  .tickets-header { margin-bottom: 40px; }
  .tickets-header h1 { font-family: 'Syne', sans-serif; font-size: 2.5rem; font-weight: 800; color: var(--white); margin-bottom: 8px; }
  .tickets-header p { color: var(--muted); font-size: 1rem; }
  .tickets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 24px; }

  /* ── TICKET CARD (list) ── */
  .tkt-card {
    border-radius: 20px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    box-shadow: 0 6px 20px rgba(0,0,0,0.4);
    position: relative;
    background: #fdfbf7;
    border: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .tkt-card:hover { 
    transform: translateY(-8px) scale(1.01); 
    box-shadow: 0 24px 56px rgba(229, 9, 20, 0.2), 0 8px 24px rgba(0,0,0,0.45); 
  }

  /* Miniature Ticket Notches */
  .tkt-card__notch-l, .tkt-card__notch-r {
    position: absolute;
    width: 16px;
    height: 16px;
    background: #000000;
    border-radius: 50%;
    z-index: 5;
    bottom: 47px;
  }
  .tkt-card__notch-l { left: -8px; }
  .tkt-card__notch-r { right: -8px; }

  /* Red Header Strip */
  .tkt-card__top {
    background:
      repeating-linear-gradient(-55deg, transparent, transparent 10px, rgba(0,0,0,0.06) 10px, rgba(0,0,0,0.06) 20px),
      linear-gradient(120deg, #6e0000 0%, #b52020 45%, #e50914 100%);
    padding: 14px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
    border-bottom: 2px dashed rgba(0, 0, 0, 0.15);
  }
  .tkt-card__top-brand {
    display: flex; align-items: center; gap: 8px;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.72rem;
    color: #fff; letter-spacing: 0.15em; text-transform: uppercase;
  }
  .tkt-card__top-brand::before {
    content: '';
    display: inline-block;
    width: 9px; height: 9px;
    border: 2px solid rgba(255,255,255,0.65);
    border-radius: 2px;
    flex-shrink: 0;
  }
  .tkt-card__top-id { font-family: monospace; font-size: 0.65rem; color: rgba(255,255,255,0.65); letter-spacing: 0.06em; }

  /* Cream Body */
  .tkt-card__body {
    background: #fdfbf7;
    padding: 20px 20px 16px;
    flex-grow: 1;
  }
  .tkt-card__movie {
    font-family: 'Syne', sans-serif;
    font-size: 1.15rem; font-weight: 800;
    color: #111; text-transform: uppercase;
    letter-spacing: 0.02em; line-height: 1.25;
    margin-bottom: 14px;
    border-left: 3px solid #e50914;
    padding-left: 10px;
  }
  .tkt-card__info {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px;
  }
  .tkt-card__info-item label {
    display: block; font-size: 0.58rem; text-transform: uppercase;
    letter-spacing: 0.1em; color: #8c857b; font-weight: 700; margin-bottom: 2px;
  }
  .tkt-card__info-item span { font-size: 0.85rem; font-weight: 800; color: #1a1a1a; }

  /* Footer */
  .tkt-card__foot {
    background: #faf6ee;
    padding: 12px 20px;
    display: flex; align-items: center; justify-content: space-between;
    border-top: 1.5px dashed #cfc8bc;
  }
  .tkt-card__date { font-size: 0.75rem; color: #8a8377; font-weight: 700; }
  .tkt-card__btn {
    background: linear-gradient(120deg, #c0392b, #e50914);
    border: none; border-radius: 7px;
    color: #fff; font-size: 0.75rem; font-weight: 700;
    padding: 7px 14px; cursor: pointer;
    transition: opacity 0.2s;
    pointer-events: none; /* card handles click */
  }

  /* Empty State */
  .no-tickets {
    grid-column: 1/-1; padding: 80px 40px; text-align: center;
    background: var(--card); border-radius: 20px;
    border: 1px dashed var(--border); color: var(--muted);
  }

  /* ── MODAL OVERLAY ── */
  .tkt-modal {
    display: none;
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.92);
    z-index: 3000;
    overflow-y: auto;
    padding: 60px 20px 40px;
    backdrop-filter: blur(16px);
  }
  .tkt-modal.open { display: block; }
  .tkt-modal__inner {
    max-width: 760px;
    margin: 0 auto;
    position: relative;
  }
  .tkt-modal__close {
    position: absolute; top: -45px; right: 0;
    width: 36px; height: 36px;
    border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,0.3);
    background: rgba(255,255,255,0.1);
    color: #fff; font-size: 1.1rem;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
    z-index: 10;
  }
  .tkt-modal__close:hover { background: rgba(255,255,255,0.25); border-color: #fff; }

  /* ── PREMIUM RETRO TICKET ── */
  .ticket-outer {
    display: flex;
    flex-direction: row;
    background: #fdfbf7;
    color: #1a1a1a;
    border-radius: 24px;
    position: relative;
    width: 100%;
    max-width: 760px;
    margin: 0 auto 24px;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.05);
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
  }

  /* Circular Corner Notches */
  .notch {
    position: absolute;
    width: 24px;
    height: 24px;
    background: #000000;
    border-radius: 50%;
    z-index: 10;
  }
  .notch-tl { top: -12px; left: -12px; }
  .notch-tr { top: -12px; right: -12px; }
  .notch-bl { bottom: -12px; left: -12px; }
  .notch-br { bottom: -12px; right: -12px; }

  .ticket-main {
    flex: 1.5;
    display: flex;
    flex-direction: column;
    background: #fdfbf7;
  }

  .ticket-main-header {
    background:
      repeating-linear-gradient(-55deg, transparent, transparent 12px, rgba(0,0,0,0.06) 12px, rgba(0,0,0,0.06) 24px),
      linear-gradient(135deg, #6e0000 0%, #a82020 40%, #e50914 100%);
    padding: 18px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #fff;
    border-bottom: 2px dashed rgba(0, 0, 0, 0.15);
    position: relative;
  }
  .ticket-main-header .brand {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 0.9rem;
    letter-spacing: 0.15em;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .brand-icon-svg {
    flex-shrink: 0;
    opacity: 0.95;
  }
  .ticket-main-header .serial {
    font-family: monospace;
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.75);
    letter-spacing: 0.08em;
    background: rgba(0,0,0,0.15);
    padding: 4px 8px;
    border-radius: 4px;
  }

  .ticket-main-body {
    padding: 28px;
    display: flex;
    flex-direction: column;
    position: relative;
    flex-grow: 1;
  }
  .ticket-watermark {
    position: absolute;
    right: 20px;
    bottom: 20px;
    width: 130px;
    height: 130px;
    opacity: 0.06;
    pointer-events: none;
    color: #c0392b;
  }

  .ticket-title-row {
    margin-bottom: 24px;
    z-index: 1;
  }
  .ticket-admit-badge {
    display: inline-block;
    font-size: 0.58rem;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #9a6f0a;
    border: 1.5px solid rgba(154, 111, 10, 0.35);
    background: rgba(154, 111, 10, 0.07);
    padding: 4px 12px;
    border-radius: 5px;
    margin-bottom: 12px;
  }
  .ticket-movie-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.75rem;
    font-weight: 800;
    line-height: 1.12;
    text-transform: uppercase;
    color: #0d0d0d;
    letter-spacing: -0.02em;
  }

  .ticket-info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18px 24px;
    margin-bottom: 20px;
    z-index: 1;
  }
  .ticket-info-item label {
    display: block;
    font-size: 0.65rem;
    text-transform: uppercase;
    color: #8c857b;
    font-weight: 700;
    margin-bottom: 4px;
    letter-spacing: 0.08em;
  }
  .ticket-info-item span {
    font-size: 0.95rem;
    font-weight: 800;
    color: #1a1a1a;
  }

  .ticket-snacks-section {
    border-top: 1px dashed rgba(0, 0, 0, 0.1);
    padding-top: 16px;
    margin-top: auto;
    z-index: 1;
  }
  .ticket-snacks-section label {
    display: block;
    font-size: 0.65rem;
    text-transform: uppercase;
    color: #8c857b;
    font-weight: 700;
    margin-bottom: 8px;
    letter-spacing: 0.08em;
  }
  .ticket-snacks-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .snack-tag {
    display: inline-block;
    background: rgba(229, 9, 20, 0.08);
    color: #c0392b;
    border: 1px solid rgba(229, 9, 20, 0.15);
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.72rem;
    font-weight: 700;
  }

  /* Perforation Separator */
  .ticket-perforation {
    width: 24px;
    background: #fdfbf7;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .perf-line {
    height: 100%;
    width: 0;
    border-left: 2px dashed #cfc8bc;
    margin: 0;
  }
  .perf-circle-top,
  .perf-circle-bottom {
    position: absolute;
    width: 24px;
    height: 24px;
    background: #000000;
    border-radius: 50%;
    z-index: 5;
  }
  .perf-circle-top { top: -12px; }
  .perf-circle-bottom { bottom: -12px; }

  /* Stub */
  .ticket-stub {
    width: 230px;
    background: #faf6ee;
    display: flex;
    flex-direction: column;
    border-left: 1px solid rgba(0, 0, 0, 0.05);
  }
  .ticket-stub-header {
    background: linear-gradient(135deg, #e50914 0%, #b20710 100%);
    padding: 18px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #fff;
    border-bottom: 2px dashed rgba(0, 0, 0, 0.1);
  }
  .ticket-stub-header .stub-title {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 0.8rem;
    letter-spacing: 0.08em;
  }
  .ticket-stub-header .price {
    font-family: 'Syne', sans-serif;
    font-weight: 850;
    font-size: 1rem;
  }
  .ticket-stub-body {
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    flex-grow: 1;
    gap: 16px;
    text-align: center;
  }
  .stub-movie-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.05rem;
    font-weight: 800;
    text-transform: uppercase;
    color: #222;
    line-height: 1.25;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .stub-qr-wrapper {
    padding: 10px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
  .stub-scan-label {
    font-size: 0.6rem;
    text-transform: uppercase;
    color: #8c857b;
    font-weight: 700;
    letter-spacing: 0.12em;
  }
  .stub-serial {
    font-family: monospace;
    font-size: 0.72rem;
    color: #8c857b;
    letter-spacing: 0.05em;
  }

  /* ── DOWNLOAD BTN ── */
  .btn-dl {
    display: block; width: 100%; padding: 16px;
    background: linear-gradient(120deg, #c0392b, #e50914);
    border: none; border-radius: 14px;
    color: #fff; font-family: 'Syne', sans-serif;
    font-size: 1rem; font-weight: 800;
    letter-spacing: 0.04em; cursor: pointer;
    transition: opacity 0.2s, transform 0.2s;
    margin-top: 16px;
  }
  .btn-dl:hover { opacity: 0.9; transform: translateY(-2px); }

  /* ── RESPONSIVE TICKET FOR MOBILE ── */
  @media (max-width: 768px) {
    .ticket-outer {
      flex-direction: column;
      max-width: 350px;
    }
    .ticket-stub {
      width: 100%;
      border-left: none;
      border-top: 1.5px dashed rgba(0, 0, 0, 0.08);
    }
    .ticket-perforation {
      width: 100%;
      height: 24px;
      flex-direction: row;
    }
    .perf-line {
      width: 100%;
      height: 0;
      border-left: none;
      border-top: 2px dashed #cfc8bc;
    }
    .perf-circle-top {
      left: -12px;
      top: 0;
    }
    .perf-circle-bottom {
      right: -12px;
      bottom: 0;
      top: 0;
    }
    .stub-movie-title {
      font-size: 1rem;
    }
  }

  @media (max-width: 480px) {
    .tickets-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }

  /* ── FRAMED TICKET DESIGN USING Ticket-Nokorpass.png ── */
  .ticket-outer-framed {
    position: relative;
    width: 100%;
    max-width: 760px;
    aspect-ratio: 2 / 1;
    margin: 0 auto 24px;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.75);
    border-radius: 20px;
    overflow: hidden;
    user-select: none;
    font-family: 'DM Sans', sans-serif;
    text-align: left;
    container-type: inline-size;
  }

  .ticket-frame-img {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    z-index: 1;
    pointer-events: none;
  }

  .ticket-overlay {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
  }

  .tkt-field-header-id {
    position: absolute;
    top: 10.5%; left: 49.1%;
    width: 13.5%; height: 6%;
    display: flex; align-items: center; justify-content: center;
    font-family: monospace;
    font-size: 1.35cqw;
    font-weight: 800;
    color: rgba(255,255,255,0.95);
    letter-spacing: 0.05em;
    text-align: center;
    white-space: nowrap;
    line-height: 1;
  }

  .tkt-field-header-price {
    position: absolute;
    top: 6.8%; left: 83.5%;
    width: 13.0%; height: 10.2%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif;
    font-size: 2.6cqw;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.02em;
    white-space: nowrap;
    line-height: 1;
  }

  .tkt-field-title {
    position: absolute;
    top: 35%; left: 5.0%;
    width: 58%; height: 18%;
    display: flex; align-items: center;
    font-family: 'Syne', sans-serif;
    font-size: 2.5cqw;
    font-weight: 900;
    line-height: 1.15;
    text-transform: uppercase;
    color: #0d0d0d;
    letter-spacing: -0.02em;
    white-space: normal;
    word-break: break-word;
    overflow: hidden;
  }

  .tkt-field-cinema {
    position: absolute;
    top: 57.5%; left: 5.0%;
    width: 28%; height: 10%;
    display: flex; align-items: center;
    font-size: 1.5cqw;
    font-weight: 800; color: #1a1a1a;
    white-space: normal; word-break: break-word; overflow: hidden;
    line-height: 1.1;
  }

  .tkt-field-hall {
    position: absolute;
    top: 57.5%; left: 34.7%;
    width: 18%; height: 10%;
    display: flex; align-items: center;
    font-size: 1.5cqw;
    font-weight: 800; color: #1a1a1a;
    white-space: normal; word-break: break-word; overflow: hidden;
    line-height: 1.1;
  }

  .tkt-field-seats {
    position: absolute;
    top: 57.5%; left: 54.8%;
    width: 12%; height: 10%;
    display: flex; align-items: center;
    font-size: 1.5cqw;
    font-weight: 800; color: #1a1a1a;
    white-space: normal; word-break: break-word; overflow: hidden;
    line-height: 1.1;
  }

  .tkt-field-datetime {
    position: absolute;
    top: 77.5%; left: 5.0%;
    width: 28%; height: 10%;
    display: flex; align-items: center;
    font-size: 1.45cqw;
    font-weight: 800; color: #1a1a1a;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    line-height: 1;
  }

  .tkt-field-format {
    position: absolute;
    top: 77.5%; left: 34.7%;
    width: 18%; height: 10%;
    display: flex; align-items: center;
    font-size: 1.65cqw;
    font-weight: 800; color: #1a1a1a;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    line-height: 1;
  }

  .tkt-field-qrcode {
    position: absolute;
    top: 41.0%; left: 72.8%;
    width: 20.1%; height: 38.0%;
    display: flex; align-items: center; justify-content: center;
    padding: 1%;
    box-sizing: border-box;
  }

  .tkt-field-qrcode [id^="qrcode"],
  .tkt-field-qrcode img,
  .tkt-field-qrcode canvas {
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    max-height: 100% !important;
    object-fit: contain !important;
  }

  .tkt-field-stub-id {
    position: absolute;
    top: 86.5%; left: 75.7%;
    width: 14.3%; height: 6.0%;
    display: flex; align-items: center; justify-content: center;
    font-family: monospace;
    font-size: 1.35cqw;
    font-weight: 800;
    color: #8c857b;
    letter-spacing: 0.05em;
    white-space: nowrap;
    line-height: 1;
  }

  /* Stub Movie Title (above QR code) */
  .tkt-field-stub-title {
    position: absolute;
    top: 27%;
    left: 70.5%;
    width: 26%;
    height: 12%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif;
    font-size: 1.4cqw;
    font-weight: 800;
    color: #1a1a1a;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: normal;
    word-break: break-word;
    overflow: hidden;
    line-height: 1.2;
  }

  /* ── SECRETS BLUR & EYE TOGGLE ── */
  .tkt-field-header-id.is-hidden,
  .tkt-field-stub-id.is-hidden,
  .tkt-field-qrcode.is-hidden [id^="qrcode"] {
    filter: blur(7px) brightness(0.95);
    user-select: none;
  }

  .tkt-field-qrcode {
    pointer-events: auto !important;
    cursor: pointer;
  }
  .qr-reveal-icon {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    z-index: 10;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }
  .tkt-field-qrcode.is-hidden .qr-reveal-icon {
    opacity: 1;
    pointer-events: auto;
  }

  /* ── DOWNLOAD WARNING MODAL STYLES ── */
  .tkt-warning-modal {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(12px);
    z-index: 4000;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .tkt-warning-modal.open {
    display: flex;
    animation: modalFadeIn 0.3s ease;
  }

  .tkt-warning-modal__inner {
    background: #141416;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 20px;
    max-width: 440px;
    width: 100%;
    padding: 32px 28px;
    text-align: center;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.9);
    font-family: 'DM Sans', sans-serif;
  }

  .warning-icon-badge {
    width: 60px;
    height: 60px;
    background: rgba(229, 9, 20, 0.15);
    border: 2px solid rgba(229, 9, 20, 0.4);
    color: #e50914;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    margin: 0 auto 16px;
  }

  .tkt-warning-modal__inner h3 {
    font-family: 'Syne', sans-serif;
    font-size: 1.35rem;
    font-weight: 800;
    color: #ffffff;
    margin-bottom: 10px;
  }

  .tkt-warning-modal__inner p {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.75);
    line-height: 1.5;
    margin-bottom: 18px;
  }

  .warning-alert-box {
    background: rgba(234, 179, 8, 0.1);
    border: 1px solid rgba(234, 179, 8, 0.3);
    border-radius: 12px;
    padding: 12px 14px;
    font-size: 0.8rem;
    color: #fef08a;
    line-height: 1.45;
    text-align: left;
    margin-bottom: 22px;
  }

  .warning-modal-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .btn-confirm-dl {
    background: linear-gradient(135deg, #e50914, #b20710);
    color: #fff;
    border: none;
    padding: 14px 20px;
    border-radius: 12px;
    font-family: 'Syne', sans-serif;
    font-size: 0.95rem;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-confirm-dl:hover { opacity: 0.9; transform: translateY(-1px); }

  .btn-cancel-dl {
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 12px 20px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-cancel-dl:hover { color: #fff; background: rgba(255, 255, 255, 0.08); }

  /* ── ANTI-PRINT CSS ── */
  @media print {
    body { display: none !important; }
  }
`;

/* ─────────────────────────────────────────────
   JS (client-side interactive script)
───────────────────────────────────────────── */
const js = `
  import { auth, db } from './js/firebase-config.js';
  import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
  import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

  const ticketsGrid = document.getElementById('ticketsGrid');
  const tktModal    = document.getElementById('tktModal');
  const allTickets  = [];

  /* ── LOAD ── */
  onAuthStateChanged(auth, async (user) => {
    if (user && user.emailVerified) await loadTickets(user.uid);
  });

  async function loadTickets(uid) {
    try {
      const q  = query(collection(db, "tickets"), where("uid", "==", uid));
      const qs = await getDocs(q);
      let docs = qs.docs.map(d => ({ id: d.id, ...d.data() }));

      const todayStr = new Date().toISOString().split('T')[0];
      docs = docs.filter(t => !t.numericDate || t.numericDate >= todayStr);
      docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

      allTickets.length = 0;
      allTickets.push(...docs);

      if (docs.length === 0) {
        ticketsGrid.innerHTML = \`
          <div class="no-tickets">
            <p>You haven't booked any tickets yet.</p>
            <div style="display:flex;gap:12px;justify-content:center;margin-top:20px;flex-wrap:wrap;">
              <a href="movies.html" class="btn-primary" style="text-decoration:none;">Browse Movies</a>
              <a href="events.html" class="btn-primary" style="background:rgba(255,255,255,0.06);border:1px solid var(--border);text-decoration:none;">Browse Events</a>
            </div>
          </div>\`;
        return;
      }

      ticketsGrid.innerHTML = docs.map(t => \`
        <div class="tkt-card" data-id="\${t.id}">
          <div class="tkt-card__notch-l"></div>
          <div class="tkt-card__notch-r"></div>
          <div class="tkt-card__top">
            <span class="tkt-card__top-brand">NOKORPASS TICKET</span>
          </div>
          <div class="tkt-card__body">
            <p class="tkt-card__movie">\${t.movieTitle}</p>
            <div class="tkt-card__info">
              <div class="tkt-card__info-item"><label>Cinema</label><span>\${t.cinema}</span></div>
              <div class="tkt-card__info-item"><label>Time</label><span>\${t.time}</span></div>
              <div class="tkt-card__info-item"><label>Hall</label><span>\${t.hall}</span></div>
              <div class="tkt-card__info-item"><label>Seats</label><span>\${t.seats}</span></div>
            </div>
          </div>
          <div class="tkt-card__foot">
            <span class="tkt-card__date">\${t.date}</span>
            <button class="tkt-card__btn" tabindex="-1">View Ticket →</button>
          </div>
        </div>\`).join('');

    } catch (err) { console.error("Error loading tickets:", err); }
  }

  /* ── EVENT DELEGATION ── */
  ticketsGrid.addEventListener('click', e => {
    const card = e.target.closest('.tkt-card');
    if (card) openModal(card.dataset.id);
  });

  /* ── OPEN MODAL ── */
  const snackNames = {
    'set-a':'Popcorn Set A','set-b':'Popcorn Set B','set-c':'Popcorn Set C',
    'set-d':'Hot Dog Combo','set-e':'Nacho Fiesta','set-f':'Double Refreshment','set-g':'Mega Bucket'
  };

  function openModal(docId) {
    const t = allTickets.find(x => x.id === docId);
    if (!t) return;

    document.getElementById('tMovie').textContent     = t.movieTitle;
    document.getElementById('tMovieStub').textContent = t.movieTitle;
    document.getElementById('tCinema').textContent    = t.cinema + ' (' + t.loc + ')';
    document.getElementById('tHall').textContent      = t.hall;
    document.getElementById('tFormat').textContent    = t.type || '2D';
    document.getElementById('tDateTime').textContent  = t.date + ' at ' + t.time;
    document.getElementById('tSeats').textContent     = t.seats;
    document.getElementById('tPrice').textContent     = '$' + (parseFloat(t.total) % 1 === 0 ? parseInt(t.total) : parseFloat(t.total));
    document.getElementById('tOrderId').textContent   = t.orderId;
    document.getElementById('tOrderIdBottom').textContent = t.orderId;

    document.getElementById('qrcode').innerHTML = '';
    new QRCode(document.getElementById('qrcode'), {
      text: t.orderId, width: 140, height: 140,
      colorDark: '#000000', colorLight: 'rgba(0,0,0,0)',
      correctLevel: QRCode.CorrectLevel.H
    });

    tktModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    window.__currentTicketId = t.orderId;

    // Auto-shrink title font if it overflows its container
    requestAnimationFrame(() => {
      const fields = [
        { id: 'tMovie',     max: 2.0 },
        { id: 'tCinema',    max: 1.5 },
        { id: 'tMovieStub', max: 1.4 }
      ];
      fields.forEach(({ id, max }) => {
        const el = document.getElementById(id);
        if (!el) return;
        let size = max;
        el.style.fontSize = size + 'cqw';
        while (el.scrollHeight > el.offsetHeight && size > 0.5) {
          size = Math.round((size - 0.1) * 10) / 10;
          el.style.fontSize = size + 'cqw';
        }
      });
    });
  }

  /* ── CLOSE ── */
  document.getElementById('tktCloseBtn').addEventListener('click', closeModal);
  tktModal.addEventListener('click', e => { if (e.target === tktModal) closeModal(); });

  function closeModal() {
    tktModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ── TOGGLE ALL PASS SECRETS VIA QR BOX ── */
  const qrBox = document.getElementById('tQrCodeBox');
  if (qrBox) {
    qrBox.addEventListener('click', () => {
      const secretFields = document.querySelectorAll('.secret-field');
      const isCurrentlyHidden = qrBox.classList.contains('is-hidden');
      
      secretFields.forEach(f => {
        f.classList.toggle('is-hidden', !isCurrentlyHidden);
      });
    });
  }

  /* ── DOWNLOAD WITH WARNING MODAL ── */
  const warningModal = document.getElementById('dlWarningModal');
  const confirmDlBtn = document.getElementById('confirmDownloadBtn');
  const cancelDlBtn  = document.getElementById('cancelDownloadBtn');

  document.getElementById('tktDownloadBtn').addEventListener('click', () => {
    if (warningModal) warningModal.classList.add('open');
  });

  if (cancelDlBtn) {
    cancelDlBtn.addEventListener('click', () => {
      if (warningModal) warningModal.classList.remove('open');
    });
  }

  if (confirmDlBtn) {
    confirmDlBtn.addEventListener('click', () => {
      if (warningModal) warningModal.classList.remove('open');
      const ticket = document.getElementById('ticketExport');
      const secretFields = document.querySelectorAll('.secret-field');
      const hiddenStates = [];

      secretFields.forEach((f, i) => {
        hiddenStates[i] = f.classList.contains('is-hidden');
        f.classList.remove('is-hidden');
      });

      document.fonts.ready.then(() => {
        html2canvas(ticket, { backgroundColor: null, scale: 3, useCORS: true, allowTaint: true }).then(canvas => {
          secretFields.forEach((f, i) => {
            if (hiddenStates[i]) f.classList.add('is-hidden');
          });

          const a = document.createElement('a');
          a.download = 'NokorPass-Ticket.png';
          a.href = canvas.toDataURL('image/png');
          a.click();
        }).catch(err => {
          console.error("Canvas export error:", err);
          secretFields.forEach((f, i) => {
            if (hiddenStates[i]) f.classList.add('is-hidden');
          });
        });
      });
    });
  }

  /* ── ANTI-SCREENSHOT & ANTI-PRINT ── */
  const ticketExportEl = document.getElementById('ticketExport');
  if (ticketExportEl) {
    ticketExportEl.addEventListener('contextmenu', e => e.preventDefault());
  }

  window.addEventListener('keydown', e => {
    if (e.key === 'PrintScreen' || ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S'))) {
      e.preventDefault();
      document.querySelectorAll('.secret-field').forEach(f => f.classList.add('is-hidden'));
      alert("Security Alert: Ticket secrets are blurred for privacy. Use the 'Download Ticket' button to securely save your pass.");
    }
  });

  window.addEventListener('blur', () => {
    document.querySelectorAll('.secret-field').forEach(f => f.classList.add('is-hidden'));
  });
`;

/* ─────────────────────────────────────────────
   HTML BODY
───────────────────────────────────────────── */
const body = `
  <div class="tickets-container">
    <div class="tickets-header">
      <h1>My Tickets</h1>
      <p>All your bookings in one place. Click a ticket to view or download it.</p>
    </div>
    <div class="tickets-grid" id="ticketsGrid">
      <div style="text-align:center;padding:60px;color:var(--muted);">Loading your tickets…</div>
    </div>
  </div>

  <!-- MODAL -->
  <div id="tktModal" class="tkt-modal">
    <div class="tkt-modal__inner">
      <button id="tktCloseBtn" class="tkt-modal__close" aria-label="Close">&#x2715;</button>

      <div id="ticketExport" class="ticket-outer-framed">
        <!-- Background frame image -->
        <img class="ticket-frame-img" src="assets/Ticket-Nokorpass.png" alt="" crossorigin="anonymous">

        <!-- Overlay fields positioned over the frame -->
        <div class="ticket-overlay">

          <!-- Ticket ID in header bar (dark red box) -->
          <div class="tkt-field-header-id secret-field is-hidden" id="tOrderId"></div>

          <!-- Price in stub header -->
          <div class="tkt-field-header-price" id="tPrice"></div>

          <!-- Movie Title -->
          <div class="tkt-field-title" id="tMovie"></div>

          <!-- Cinema / Venue -->
          <div class="tkt-field-cinema" id="tCinema"></div>

          <!-- Hall -->
          <div class="tkt-field-hall" id="tHall"></div>

          <!-- Seats -->
          <div class="tkt-field-seats" id="tSeats"></div>

          <!-- Date and Time -->
          <div class="tkt-field-datetime" id="tDateTime"></div>

          <!-- Format -->
          <div class="tkt-field-format" id="tFormat"></div>

          <!-- QR Code (over the pink placeholder square) -->
          <div class="tkt-field-qrcode secret-field is-hidden" id="tQrCodeBox">
            <div id="qrcode"></div>
            <div class="qr-reveal-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </div>
          </div>

          <!-- Stub movie title above QR -->
          <div class="tkt-field-stub-title" id="tMovieStub"></div>

          <!-- Stub bottom ticket ID -->
          <div class="tkt-field-stub-id secret-field is-hidden" id="tOrderIdBottom"></div>

        </div>
      </div>

      <button id="tktDownloadBtn" class="btn-dl" style="margin-top: 16px;">&#8595;&ensp;Download Ticket</button>
    </div>
  </div>

  <!-- Download Warning Modal -->
  <div id="dlWarningModal" class="tkt-warning-modal">
    <div class="tkt-warning-modal__inner">
      <div class="warning-icon-badge">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h3>Keep Your Pass Confidential</h3>
      <p>Your QR code and Ticket ID are your <strong>private entrance pass</strong> to the cinema. Do not post screenshots or share your pass publicly.</p>
      <div class="warning-alert-box">
        <strong>SECURITY NOTICE:</strong> NokorPass is not responsible for stolen access or unauthorized hall entries resulting from leaked or shared passes.
      </div>
      <div class="warning-modal-actions">
        <button id="confirmDownloadBtn" class="btn-confirm-dl">I Understand, Save Ticket</button>
        <button id="cancelDownloadBtn" class="btn-cancel-dl">Cancel</button>
      </div>
    </div>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
`;

/* ─────────────────────────────────────────────
   ASSEMBLE
───────────────────────────────────────────── */
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Tickets — NokorPass</title>
  <meta name="robots" content="noindex, nofollow" />
  <link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/global.css">
  <link rel="stylesheet" href="css/pages/tickets.css">
  <script type="module" src="js/auth-guard.js"></script>
  <script type="module" src="js/legals-init.js"></script>
</head>
<body>
  <script src="js/global-layout.js"></script>
  ${body}
  <script type="module">
    ${js}
  </script>

  <!--Start of Tawk.to Script-->
  <style>
    .custom-chat-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: var(--accent, #e8490f);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(232, 73, 15, 0.4);
      cursor: pointer;
      z-index: 9999;
      transition: transform 0.2s, background 0.2s, opacity 0.2s;
    }
    .custom-chat-btn:hover {
      transform: scale(1.06);
      background: #f05a24;
    }
    .custom-chat-btn svg {
      width: 22px;
      height: 22px;
      fill: currentColor;
    }
    .custom-chat-loading {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: custom-chat-spin 0.8s linear infinite;
    }
    @keyframes custom-chat-spin {
      to { transform: rotate(360deg); }
    }
  </style>

  <div id="custom-chat-button" class="custom-chat-btn" title="Chat with support">
    <svg viewBox="0 0 24 24">
      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
    </svg>
  </div>

  <script type="text/javascript">
    (function() {
      var currentUser = null;
      var tawkLoaded = false;
      var btn = document.getElementById('custom-chat-button');

      // Check auth state
      import('./js/firebase-config.js').then(function(mod) {
        import('https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js').then(function(authMod) {
          authMod.onAuthStateChanged(mod.auth, function(user) {
            currentUser = user;
          });
        });
      });

      function loadAndOpenTawk(user) {
        btn.style.opacity = '0.7';
        btn.innerHTML = '<div class="custom-chat-loading"></div>';

        window.Tawk_API = window.Tawk_API || {};

        if (tawkLoaded) {
          window.Tawk_API.setAttributes({
            name: user.displayName || user.email.split('@')[0],
            email: user.email
          }, function(err) { if (err) console.error('Tawk setAttributes:', err); });
          window.Tawk_API.showWidget();
          window.Tawk_API.maximize();
          btn.style.display = 'none';
          btn.style.opacity = '1';
          btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>';
          return;
        }

        window.Tawk_API.onLoad = function() {
          tawkLoaded = true;
          window.Tawk_API.setAttributes({
            name: user.displayName || user.email.split('@')[0],
            email: user.email
          }, function(err) { if (err) console.error('Tawk setAttributes:', err); });
          window.Tawk_API.maximize();
          btn.style.display = 'none';
          btn.style.opacity = '1';
          btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>';
        };

        window.Tawk_API.onChatMinimised = function() {
          window.Tawk_API.hideWidget();
          btn.style.display = 'flex';
        };

        // Inject script
        var s1 = document.createElement('script');
        var s0 = document.getElementsByTagName('script')[0];
        s1.async = true;
        s1.src = 'https://embed.tawk.to/6a5512282431b01d5400219e/1jte4trta';
        s1.charset = 'UTF-8';
        s1.setAttribute('crossorigin', '*');
        s0.parentNode.insertBefore(s1, s0);
      }

      btn.addEventListener('click', function() {
        if (!currentUser || !currentUser.emailVerified) {
          window.location.href = 'auth.html?redirect=' + encodeURIComponent(window.location.href);
        } else {
          loadAndOpenTawk(currentUser);
        }
      });
    })();
  </script>
  <!--End of Tawk.to Script-->
</body>
</html>`;

const root = path.resolve(__dirname, '../../');
const pagesDir = path.join(root, 'css', 'pages');

if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true });
}

fs.writeFileSync(path.join(root, 'tickets.html'), html, 'utf8');
fs.writeFileSync(path.join(pagesDir, 'tickets.css'), css, 'utf8');

console.log('tickets.html and css/pages/tickets.css built successfully!');
