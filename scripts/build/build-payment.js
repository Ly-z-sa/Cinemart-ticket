const fs = require('fs');
const path = require('path');

const css = `
    .payment-container { max-width: 900px; margin: 0 auto; padding: 40px 20px; min-height: 70vh; }
    .payment-title { font-family: 'Syne', sans-serif; font-size: 2.2rem; font-weight: 800; text-align: center; margin-bottom: 40px; color: var(--white); }
    
    /* Payment Methods */
    .payment-methods { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; margin-bottom: 40px; }
    .method-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 32px; text-align: center; cursor: pointer; transition: all 0.3s ease; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
    .method-card:hover { border-color: var(--accent); background: rgba(232, 73, 15, 0.05); transform: translateY(-5px); }
    .method-card i { font-size: 2.5rem; color: var(--muted); }
    .method-card:hover i { color: var(--accent); }
    .method-name { font-weight: 700; color: var(--white); font-size: 1.1rem; }
    .method-logo { height: 40px; width: auto; filter: grayscale(1) invert(1); opacity: 0.7; transition: all 0.3s; }
    .method-card:hover .method-logo { filter: none; opacity: 1; }

    /* Processing UI */
    .processing-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 2000; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(8px); }
    .spinner { width: 60px; height: 60px; border: 4px solid rgba(255,255,255,0.1); border-top-color: var(--accent); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 24px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .processing-text { font-family: 'Syne', sans-serif; font-size: 1.5rem; font-weight: 700; color: var(--white); }

    /* Success view */
    .success-view { display: none; text-align: center; animation: fadeInUp 0.6s ease forwards; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

    .download-section { display: flex; flex-direction: column; gap: 12px; align-items: center; max-width: 420px; margin: 30px auto 0; }
    .btn-download { width: 100%; background: linear-gradient(135deg, #e50914, #b20710); color: #fff; border: none; padding: 16px 32px; border-radius: 14px; font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 800; cursor: pointer; transition: opacity 0.2s, transform 0.2s; letter-spacing: 0.04em; }
    .btn-download:hover { opacity: 0.9; transform: translateY(-2px); }
    .btn-home { width: 100%; background: rgba(255,255,255,0.08); color: #fff; border: 1px solid var(--border); padding: 14px 32px; border-radius: 14px; font-weight: 600; text-decoration: none; display: inline-block; transition: all 0.2s; text-align: center; box-sizing: border-box; }
    .btn-home:hover { background: rgba(255,255,255,0.15); }

    /* ── FRAMED TICKET DESIGN USING Ticket-Nokorpass.png ── */
    .ticket-outer-framed {
      position: relative;
      width: 100%;
      max-width: 760px;
      aspect-ratio: 2 / 1;
      margin: 0 auto;
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
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
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

    /* 1. Header Ticket ID */
    .tkt-field-header-id {
      position: absolute;
      top: 10.5%;
      left: 49.1%;
      width: 13.5%;
      height: 6%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: monospace;
      font-size: 1.35cqw;
      font-weight: 800;
      color: rgba(255, 255, 255, 0.95);
      letter-spacing: 0.05em;
      text-align: center;
      white-space: nowrap;
      line-height: 1;
    }

    /* 2. Header Stub Price */
    .tkt-field-header-price {
      position: absolute;
      top: 6.8%;
      left: 83.5%;
      width: 13.0%;
      height: 10.2%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Syne', sans-serif;
      font-size: 2.6cqw;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.02em;
      white-space: nowrap;
      line-height: 1;
    }

    /* 3. Movie Title */
    .tkt-field-title {
      position: absolute;
      top: 35%;
      left: 5.0%;
      width: 58%;
      height: 18%;
      display: flex;
      align-items: center;
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

    /* 4. Cinema / Venue */
    .tkt-field-cinema {
      position: absolute;
      top: 57.5%;
      left: 5.0%;
      width: 28%;
      height: 10%;
      display: flex;
      align-items: center;
      font-size: 1.5cqw;
      font-weight: 800;
      color: #1a1a1a;
      white-space: normal;
      word-break: break-word;
      overflow: hidden;
      line-height: 1.1;
    }

    /* 5. Hall */
    .tkt-field-hall {
      position: absolute;
      top: 57.5%;
      left: 34.7%;
      width: 18%;
      height: 10%;
      display: flex;
      align-items: center;
      font-size: 1.5cqw;
      font-weight: 800;
      color: #1a1a1a;
      white-space: normal;
      word-break: break-word;
      overflow: hidden;
      line-height: 1.1;
    }

    /* 6. Seats */
    .tkt-field-seats {
      position: absolute;
      top: 57.5%;
      left: 54.8%;
      width: 12%;
      height: 10%;
      display: flex;
      align-items: center;
      font-size: 1.5cqw;
      font-weight: 800;
      color: #1a1a1a;
      white-space: normal;
      word-break: break-word;
      overflow: hidden;
      line-height: 1.1;
    }

    /* 7. Date and Time */
    .tkt-field-datetime {
      position: absolute;
      top: 77.5%;
      left: 5.0%;
      width: 28%;
      height: 10%;
      display: flex;
      align-items: center;
      font-size: 1.45cqw;
      font-weight: 800;
      color: #1a1a1a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1;
    }

    /* 8. Format */
    .tkt-field-format {
      position: absolute;
      top: 77.5%;
      left: 34.7%;
      width: 18%;
      height: 10%;
      display: flex;
      align-items: center;
      font-size: 1.65cqw;
      font-weight: 800;
      color: #1a1a1a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1;
    }

    /* 9. QR Code */
    .tkt-field-qrcode {
      position: absolute;
      top: 41.0%;
      left: 72.8%;
      width: 20.1%;
      height: 38.0%;
      display: flex;
      align-items: center;
      justify-content: center;
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

    /* 10. Bottom Stub Ticket ID */
    .tkt-field-stub-id {
      position: absolute;
      top: 86.5%;
      left: 75.7%;
      width: 14.3%;
      height: 6.0%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: monospace;
      font-size: 1.35cqw;
      font-weight: 800;
      color: #8c857b;
      letter-spacing: 0.05em;
      white-space: nowrap;
      line-height: 1;
    }

    /* 11. Stub Movie Title (above QR code) */
    .tkt-field-stub-title {
      position: absolute;
      top: 27%;
      left: 70.5%;
      width: 26%;
      height: 12%;
      display: flex;
      align-items: center;
      justify-content: center;
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

    /* ── SCROLLABLE TICKETS STACK ── */
    .tickets-stack {
      display: flex;
      flex-direction: column;
      gap: 32px;
      align-items: center;
      width: 100%;
      padding: 16px 0;
      box-sizing: border-box;
    }

    /* ── RESPONSIVE TICKET FOR MOBILE ── */
    @media (max-width: 768px) {
      .download-section {
        flex-direction: column;
        align-items: stretch;
      }
      .btn-download, .btn-home {
        width: 100%;
        justify-content: center;
        text-align: center;
      }
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
      z-index: 3000;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .tkt-warning-modal.open {
      display: flex;
      animation: modalFadeIn 0.3s ease;
    }
    @keyframes modalFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

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

const js = `
    import { auth, db } from './js/firebase-config.js';
    import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

    const qparams = new URLSearchParams(window.location.search);
    
    const movieTitle = qparams.get('movie_title') || "NokorPass Movie";
    const cinema = qparams.get('cinema') || "SuperShow Cinema";
    const loc = qparams.get('location') || "TK";
    const hall = qparams.get('hall') || "Hall 1";
    const type = qparams.get('type') || "2D";
    const time = qparams.get('time') || "07:00 PM";
    const rawDate = qparams.get('date') || '';
    const date = (rawDate && !rawDate.startsWith('Today')) ? rawDate : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const seats = qparams.get('seats') || "E1, E2";
    const total = qparams.get('final_total') || qparams.get('ticket_total') || "0.00";
    const snacksRaw = qparams.get('snacks') || "";
    const snackList = snacksRaw ? snacksRaw.split(',') : [];

    // Generate one orderId per seat (movies) or per qty (events)
    const rawQty = parseInt(qparams.get('qty') || '0');
    const rawSeats = seats.split(',').map(s => s.trim()).filter(Boolean);
    // If a qty param is set and there's only one seat label, repeat it for each ticket
    const seatList = (rawQty > 1 && rawSeats.length === 1)
      ? Array(rawQty).fill(rawSeats[0])
      : rawSeats;
    const orderIds = seatList.map(() => "TKT-" + Math.random().toString(36).substr(2, 9).toUpperCase());
    const orderId = orderIds[0]; // show the first ticket in the UI

    const snackNames = {
      'set-a': 'Popcorn Set A', 'set-b': 'Popcorn Set B', 'set-c': 'Popcorn Set C',
      'set-d': 'Hot Dog Combo', 'set-e': 'Nacho Fiesta', 'set-f': 'Double Refreshment', 'set-g': 'Mega Bucket'
    };

    window.startPayment = (method) => {
      document.getElementById('processingOverlay').style.display = 'flex';
      const pText = document.querySelector('.processing-text');
      pText.textContent = "Connecting to " + method + "...";
      
      setTimeout(() => {
        pText.textContent = "Verifying Payment...";
        setTimeout(() => {
          showSuccess();
        }, 1500);
      }, 1000);
    }

    // Guard against duplicate ticket writes (double-click / rapid payment)
    let hasSubmitted = false;

    async function showSuccess() {
      if (hasSubmitted) return;
      hasSubmitted = true;
      document.getElementById('processingOverlay').style.display = 'none';
      document.getElementById('paymentSelection').style.display = 'none';
      document.getElementById('successView').style.display = 'block';
      
      const subEl = document.getElementById('ticketCountSub');
      if (subEl) {
        subEl.textContent = seatList.length > 1
          ? seatList.length + " Tickets Issued (" + seatList.join(', ') + ")"
          : "1 Ticket Issued (" + (seatList[0] || seats) + ")";
      }

      const dlBtnText = document.getElementById('downloadBtnText');
      if (dlBtnText) {
        dlBtnText.innerHTML = seatList.length > 1
          ? "&#8595;&nbsp; Download All Tickets (" + seatList.length + ")"
          : "&#8595;&nbsp; Download Ticket";
      }

      // Per-ticket price calculation
      const perTicketPriceNum = seatList.length > 0 ? (parseFloat(total) / seatList.length) : parseFloat(total);
      const perTicketPriceStr = (perTicketPriceNum % 1 === 0 ? parseInt(perTicketPriceNum) : perTicketPriceNum.toFixed(2));

      // Build individual ticket cards stacked vertically
      const stack = document.getElementById('ticketsStack');
      if (stack) {
        stack.innerHTML = '';
        seatList.forEach((seatItem, idx) => {
          const tId = orderIds[idx];
          const ticketCard = document.createElement('div');
          ticketCard.className = 'ticket-outer-framed';
          ticketCard.id = 'ticketExport_' + idx;
          ticketCard.innerHTML =
            '<img class="ticket-frame-img" src="assets/Ticket-Nokorpass.png" alt="" crossorigin="anonymous">' +
            '<div class="ticket-overlay">' +
              '<div class="tkt-field-header-id secret-field is-hidden">' + tId + '</div>' +
              '<div class="tkt-field-header-price">$' + perTicketPriceStr + '</div>' +
              '<div class="tkt-field-title t-movie-field">' + movieTitle + '</div>' +
              '<div class="tkt-field-cinema t-cinema-field">' + cinema + ' (' + loc + ')</div>' +
              '<div class="tkt-field-hall">' + hall + '</div>' +
              '<div class="tkt-field-seats">' + seatItem + '</div>' +
              '<div class="tkt-field-datetime">' + date + ' at ' + time + '</div>' +
              '<div class="tkt-field-format">' + type + '</div>' +
              '<div class="tkt-field-qrcode secret-field is-hidden">' +
                '<div id="qrcode_' + idx + '"></div>' +
                '<div class="qr-reveal-icon">' +
                  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));">' +
                    '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>' +
                    '<line x1="1" y1="1" x2="23" y2="23"></line>' +
                  '</svg>' +
                '</div>' +
              '</div>' +
              '<div class="tkt-field-stub-title t-stub-title-field">' + movieTitle + '</div>' +
              '<div class="tkt-field-stub-id secret-field is-hidden">' + tId + '</div>' +
            '</div>';
          stack.appendChild(ticketCard);

          // Generate local QR code for each specific ticket
          new QRCode(document.getElementById("qrcode_" + idx), {
            text: tId, width: 140, height: 140,
            colorDark: "#000000", colorLight: "rgba(0,0,0,0)", correctLevel: QRCode.CorrectLevel.H
          });
        });
      }

      window.currentOrderId = orderId;

      // Auto-shrink title font if it overflows its container across all rendered cards
      requestAnimationFrame(() => {
        document.querySelectorAll('.ticket-outer-framed').forEach(ticketCard => {
          const fields = [
            { el: ticketCard.querySelector('.t-movie-field'),      max: 2.0 },
            { el: ticketCard.querySelector('.t-cinema-field'),     max: 1.5 },
            { el: ticketCard.querySelector('.t-stub-title-field'), max: 1.4 }
          ];
          fields.forEach(({ el, max }) => {
            if (!el) return;
            let size = max;
            el.style.fontSize = size + 'cqw';
            while (el.scrollHeight > el.offsetHeight && size > 0.5) {
              size = Math.round((size - 0.1) * 10) / 10;
              el.style.fontSize = size + 'cqw';
            }
          });
        });
      });

      const qDate = qparams.get('date') || "";
      let numericDate = qDate;
      const parts = numericDate.split('-');
      if (parts.length !== 3 || parts[0].length !== 4 || isNaN(Number(parts[0])) || isNaN(Number(parts[1])) || isNaN(Number(parts[2]))) {
        numericDate = new Date().toISOString().split('T')[0];
      }

      // 🔥 SAVE TO FIRESTORE — one doc per seat 🔥
      try {
        const user = auth.currentUser;
        if (user) {
          // Each seat gets its own ticket document and unique orderId
          const ticketPrice = seatList.length > 0
            ? (parseFloat(total) / seatList.length).toFixed(2)
            : total;
          await Promise.all(seatList.map((seat, i) =>
            addDoc(collection(db, "tickets"), {
              uid: user.uid,
              orderId: orderIds[i],
              movieTitle, cinema, loc, hall, type, time, date, numericDate,
              seats: seat,
              total: ticketPrice,
              snackList: i === 0 ? snackList : [], // snacks assigned to first ticket only
              createdAt: serverTimestamp()
            })
          ));
          console.log(seatList.length + " ticket(s) saved to Firestore!");

          // Send confirmation email via EmailJS
          try {
            if (window.emailjs) {
              const ticketQtyVal = seatList.length;
              const formattedSnacks = snackList.map(s => {
                const [id, qty] = s.split(':');
                return qty + "x " + (snackNames[id] || id);
              }).join(', ');

              const emailParams = {
                to_email: user.email,
                to_name: user.displayName || user.email.split('@')[0],
                item_title: movieTitle + (formattedSnacks ? (" + Snacks (" + formattedSnacks + ")") : ''),
                showtime: date + " at " + time,
                seats: seats,
                ticket_qty: ticketQtyVal,
                total_price: "$" + parseFloat(total).toFixed(2)
              };

              // Note: Replace "YOUR_EMAILJS_PUBLIC_KEY" with your actual EmailJS Public Key from Account Settings
              window.emailjs.send("service_0fsrfum", "template_srznnbz", emailParams, "OLu_mkA_zcxH_P9VK")
                .then(function() {
                  console.log("Confirmation email sent!");
                }, function(err) {
                  console.error("EmailJS send failed:", err);
                });
            }
          } catch (emailErr) {
            console.error("Error triggering EmailJS:", emailErr);
          }
        }
      } catch (e) {
        console.error("Error saving ticket: ", e);
      }
    }

    // Header total injection logic for module
    const headerTotal = new URLSearchParams(window.location.search).get('final_total')
      || new URLSearchParams(window.location.search).get('ticket_total') || '0.00';
    const bookingType = new URLSearchParams(window.location.search).get('booking_type') || 'Movie';
    if(document.getElementById('headerTotal')) document.getElementById('headerTotal').textContent = headerTotal;
    if(document.getElementById('checkoutTypeLabel')) document.getElementById('checkoutTypeLabel').textContent = bookingType;

    // Attach listeners
    document.querySelectorAll('.method-card').forEach(card => {
      card.addEventListener('click', () => startPayment(card.getAttribute('data-name')));
    });

    // Toggle secrets per ticket when clicking its QR box
    const stackEl = document.getElementById('ticketsStack');
    if (stackEl) {
      stackEl.addEventListener('click', (e) => {
        const qrBox = e.target.closest('.tkt-field-qrcode');
        if (qrBox) {
          const ticketCard = qrBox.closest('.ticket-outer-framed');
          if (ticketCard) {
            const secretFields = ticketCard.querySelectorAll('.secret-field');
            const isCurrentlyHidden = qrBox.classList.contains('is-hidden');
            secretFields.forEach(f => {
              f.classList.toggle('is-hidden', !isCurrentlyHidden);
            });
          }
        }
      });
    }

    // Download Warning Modal Flow
    const warningModal = document.getElementById('dlWarningModal');
    const confirmDlBtn = document.getElementById('confirmDownloadBtn');
    const cancelDlBtn = document.getElementById('cancelDownloadBtn');

    window.downloadTicket = () => {
      if (warningModal) warningModal.classList.add('open');
    };

    if (cancelDlBtn) {
      cancelDlBtn.addEventListener('click', () => {
        if (warningModal) warningModal.classList.remove('open');
      });
    }

    if (confirmDlBtn) {
      confirmDlBtn.addEventListener('click', () => {
        if (warningModal) warningModal.classList.remove('open');
        const tickets = document.querySelectorAll('.ticket-outer-framed');
        if (!tickets || tickets.length === 0) return;

        document.fonts.ready.then(async () => {
          for (let i = 0; i < tickets.length; i++) {
            const t = tickets[i];
            const secretFields = t.querySelectorAll('.secret-field');
            const hiddenStates = [];

            secretFields.forEach((f, idx) => {
              hiddenStates[idx] = f.classList.contains('is-hidden');
              f.classList.remove('is-hidden');
            });

            try {
              const canvas = await html2canvas(t, { backgroundColor: null, scale: 3, useCORS: true, allowTaint: true });
              secretFields.forEach((f, idx) => {
                if (hiddenStates[idx]) f.classList.add('is-hidden');
              });

              const link = document.createElement('a');
              link.download = tickets.length > 1 ? ("NokorPass-Ticket-" + (i + 1) + ".png") : "NokorPass-Ticket.png";
              link.href = canvas.toDataURL('image/png');
              link.click();
              // Small delay between downloads if multiple
              if (tickets.length > 1) {
                await new Promise(res => setTimeout(res, 400));
              }
            } catch (err) {
              console.error("Canvas export error:", err);
              secretFields.forEach((f, idx) => {
                if (hiddenStates[idx]) f.classList.add('is-hidden');
              });
            }
          }
        });
      });
    }

    // Anti-screenshot & Anti-print protections
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

const body = `
  <div class="payment-container">
    
    <div id="paymentSelection">
      <div class="payment-title">Checkout for <span id="checkoutTypeLabel">Movie</span></div>
      
      <div class="payment-methods">
        <div class="method-card" data-name="ABA Bank">
          <img src="assets/aba.png" class="method-logo" style="filter:none; opacity:1; border-radius: 8px;">
          <span class="method-name">ABA Pay</span>
        </div>
        <div class="method-card" data-name="KHQR">
          <img src="assets/KHQR_Logo.png" class="method-logo" style="filter:none; opacity:1;">
          <span class="method-name">Bakong KHQR</span>
        </div>
        <div class="method-card" data-name="ACLEDA Pay">
          <img src="assets/acleda.jpg" class="method-logo" style="filter:none; opacity:1; border-radius: 8px;">
          <span class="method-name">ACLEDA Pay</span>
        </div>
        <div class="method-card" data-name="Visa/Mastercard">
          <div style="display:flex; gap:10px; align-items: center;">
            <img src="assets/visa.png" style="height:20px; border-radius: 4px;">
            <img src="assets/mastercard_logo.webp" style="height:32px; border-radius: 4px;">
          </div>
          <span class="method-name" style="margin-top: 10px;">Credit / Debit Card</span>
        </div>
      </div>
      
      <div style="text-align:center; color: var(--muted);">
        Total Amount Due: <strong style="color:var(--white); font-size: 1.5rem;">\${total_placeholder}</strong>
      </div>
    </div>

    <div id="successView" class="success-view">
      <h2 style="font-family: 'Syne', sans-serif; font-size: 2rem; color: #4ade80; margin-bottom: 4px;">Payment Successful!</h2>
      <p id="ticketCountSub" style="color: var(--muted); margin-bottom: 20px; font-size: 1rem;"></p>
      
      <div id="ticketsStack" class="tickets-stack"></div>

      <div class="download-section" style="margin-top: 24px;">
        <button onclick="downloadTicket()" class="btn-download" id="downloadBtnText">&#8595;&nbsp; Download Ticket</button>
        <a href="index.html" class="btn-home">Return Home</a>
      </div>
    </div>

  </div>

  <div id="processingOverlay" class="processing-overlay">
    <div class="spinner"></div>
    <div class="processing-text">Processing Payment...</div>
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

  <!-- Libraries -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
`;

const finalBody = body.replace('${total_placeholder}', '<span id="headerTotal">0.00</span>');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure Payment — NokorPass</title>
    <meta name="robots" content="noindex, nofollow" />
    <link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/global.css" />
    <link rel="stylesheet" href="css/pages/payment.css" />
    <script type="module" src="js/auth-guard.js"></script>
    <script type="module" src="js/legals-init.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
    </head>
<body>
    <script src="js/global-layout.js"></script>
    ${finalBody}

    <script type="module">${js}</script>
</body>
</html>`;

const root = path.resolve(__dirname, '../../');
const pagesDir = path.join(root, 'css', 'pages');

if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true });
}

fs.writeFileSync(path.join(root, 'payment.html'), html, 'utf8');
fs.writeFileSync(path.join(pagesDir, 'payment.css'), css, 'utf8');

console.log('payment.html and css/pages/payment.css built successfully!');
