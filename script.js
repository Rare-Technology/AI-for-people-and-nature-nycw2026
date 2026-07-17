/* =========================================================================
   THE SESSION — horizontal scroll-snap carousel
   Native scroll-snap; the arrows step one card. Modeled on the
   changeagent.earth USE CASES interaction.
   ========================================================================= */
(function carousel(){
  var scroller = document.querySelector(".cases-viewport");
  var track    = document.getElementById("cases-track");
  var prev     = document.getElementById("cases-prev");
  var next     = document.getElementById("cases-next");
  if(!scroller || !track || !prev || !next) return;

  var cards  = Array.prototype.slice.call(track.querySelectorAll(".case-card"));
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Distance between two card starts (card width + gap); falls back to one card.
  function step(){
    if(cards.length > 1){
      return cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
    }
    return cards[0] ? cards[0].getBoundingClientRect().width : scroller.clientWidth;
  }

  function update(){
    prev.disabled = scroller.scrollLeft <= 1;
    next.disabled = scroller.scrollLeft >= (scroller.scrollWidth - scroller.clientWidth - 1);
  }

  function go(dir){
    scroller.scrollBy({ left: dir * step(), behavior: reduce.matches ? "auto" : "smooth" });
  }

  prev.addEventListener("click", function(){ go(-1); });
  next.addEventListener("click", function(){ go(1); });
  scroller.addEventListener("scroll", update, { passive:true });
  window.addEventListener("resize", update);

  update();
})();

/* =========================================================================
   CARD FLIP
   On load: front face (summary + illustration + "+").
   On click: the card flips in 3D to the back face (full text + "×").
   ========================================================================= */
(function cardFlip(){
  var track = document.getElementById("cases-track");
  if(!track) return;
  var cards = Array.prototype.slice.call(track.querySelectorAll(".case-card"));

  /* --- equalise card height to the tallest face across all cards, so no
         card grows/shrinks the row when flipped and both faces always fit --- */
  function equalise(){
    track.style.removeProperty("--case-h");   // fall back to CSS default while measuring
    track.classList.add("measuring");
    var max = 0;
    cards.forEach(function(card){
      card.querySelectorAll(".case-face").forEach(function(face){
        if(face.offsetHeight > max) max = face.offsetHeight;
      });
    });
    track.classList.remove("measuring");
    if(max > 0) track.style.setProperty("--case-h", Math.ceil(max) + "px");
  }

  var rt;
  function scheduleEqualise(){ clearTimeout(rt); rt = setTimeout(equalise, 120); }

  equalise();
  window.addEventListener("resize", scheduleEqualise);
  window.addEventListener("load", equalise);            // re-measure once images/fonts settle
  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(equalise); }
  // any image that swaps to its placeholder can change height slightly
  track.querySelectorAll(".case-img").forEach(function(img){
    img.addEventListener("load", scheduleEqualise);
    img.addEventListener("error", scheduleEqualise);
  });

  /* --- flip on click (a toggle lives on each face, so it flips with the card) --- */
  cards.forEach(function(card){
    var toggles = card.querySelectorAll(".case-toggle");
    var front   = card.querySelector(".case-face--front");
    var back    = card.querySelector(".case-face--back");
    if(!toggles.length || !front || !back) return;

    function setOpen(open){
      card.classList.toggle("is-open", open);
      front.setAttribute("aria-hidden", open ? "true" : "false");
      back.setAttribute("aria-hidden", open ? "false" : "true");
      toggles.forEach(function(b){ b.setAttribute("aria-expanded", open ? "true" : "false"); });
    }

    toggles.forEach(function(b){
      b.addEventListener("click", function(){
        setOpen(!card.classList.contains("is-open"));
      });
    });
  });
})();
