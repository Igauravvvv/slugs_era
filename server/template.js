module.exports = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to Slugs Era</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background-color: #0a0a0a;
    font-family: 'Space Mono', monospace;
    color: #f0ece4;
  }

  .email-wrapper {
    max-width: 620px;
    margin: 0 auto;
    background-color: #0d0d0d;
    border: 1px solid #1f1f1f;
  }

  /* ── HEADER ── */
  .header {
    background-color: #0a0a0a;
    padding: 48px 40px 32px;
    text-align: center;
    border-bottom: 2px solid #cc1111;
    position: relative;
    overflow: hidden;
  }
  .header::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(204,17,17,0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  .logo-img {
    width: 220px;
    height: auto;
    display: block;
    margin: 0 auto 20px;
    mix-blend-mode: screen;
    filter: drop-shadow(0 0 24px rgba(204,17,17,0.5));
    background: transparent;
  }

  .tagline {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 13px;
    letter-spacing: 6px;
    color: #cc1111;
    text-transform: uppercase;
    margin-top: 4px;
  }

  /* ── HERO BAND ── */
  .hero-band {
    background: #cc1111;
    padding: 18px 40px;
    text-align: center;
  }
  .hero-band p {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 4px;
    color: #0a0a0a;
  }

  /* ── BODY ── */
  .body {
    padding: 48px 40px;
  }

  .greeting {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 42px;
    letter-spacing: 3px;
    line-height: 1.05;
    color: #f0ece4;
    margin-bottom: 28px;
  }
  .greeting span {
    color: #cc1111;
  }

  .intro {
    font-size: 13px;
    line-height: 1.85;
    color: #b0aa9f;
    margin-bottom: 36px;
  }

  /* ── DIVIDER ── */
  .divider {
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 36px 0;
  }
  .divider-line { flex: 1; height: 1px; background: #1f1f1f; }
  .divider-dot { width: 6px; height: 6px; background: #cc1111; border-radius: 50%; }

  /* ── MANIFESTO BLOCK ── */
  .manifesto {
    background: #111;
    border-left: 3px solid #cc1111;
    padding: 28px 28px;
    margin-bottom: 36px;
  }
  .manifesto-label {
    font-size: 10px;
    letter-spacing: 5px;
    color: #cc1111;
    text-transform: uppercase;
    margin-bottom: 14px;
  }
  .manifesto p {
    font-size: 13px;
    line-height: 1.9;
    color: #9a9590;
  }
  .manifesto p + p { margin-top: 14px; }

  /* ── WHAT TO EXPECT ── */
  .expect-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 3px;
    color: #f0ece4;
    margin-bottom: 20px;
  }
  .expect-list {
    list-style: none;
    margin-bottom: 36px;
  }
  .expect-list li {
    font-size: 12px;
    line-height: 1.7;
    color: #9a9590;
    padding: 10px 0 10px 22px;
    border-bottom: 1px solid #1a1a1a;
    position: relative;
  }
  .expect-list li::before {
    content: '→';
    position: absolute;
    left: 0;
    color: #cc1111;
    font-weight: 700;
  }

  /* ── CTA ── */
  .cta-block {
    background: #cc1111;
    padding: 32px 28px;
    text-align: center;
    margin-bottom: 36px;
  }
  .cta-block p {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    letter-spacing: 3px;
    color: #0a0a0a;
    line-height: 1.2;
    margin-bottom: 6px;
  }
  .cta-block small {
    font-size: 11px;
    letter-spacing: 2px;
    color: rgba(0,0,0,0.55);
    text-transform: uppercase;
  }

  /* ── SIGN-OFF ── */
  .signoff {
    font-size: 12px;
    line-height: 1.8;
    color: #6a6560;
    margin-bottom: 8px;
  }
  .signoff-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px;
    letter-spacing: 3px;
    color: #cc1111;
  }

  /* ── FOOTER ── */
  .footer {
    background: #080808;
    border-top: 1px solid #1a1a1a;
    padding: 28px 40px;
    text-align: center;
  }
  .footer p {
    font-size: 10px;
    letter-spacing: 2px;
    color: #3a3530;
    text-transform: uppercase;
    line-height: 2;
  }
  .footer a { color: #cc1111; text-decoration: none; }

</style>
</head>
<body>

<div class="email-wrapper">

  <!-- HEADER -->
  <div class="header">
    <img
      class="logo-img"
      src="data:image/png;base64,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"
      alt="Slugs Era Logo"
    />
    <p class="tagline">MOVEMENT. not merch</p>
  </div>

  <!-- HERO BAND -->
  <div class="hero-band">
    <p>WELCOME TO THE COMMUNITY — THE SLOW CLUB.</p>
  </div>

  <!-- BODY -->
  <div class="body">

    <h1 class="greeting">
      <span>THE SLOW CLUB.</span>
    </h1>

    <p class="intro">
      You didn't just subscribe to a newsletter.<br>
      You just joined something real — and we don't take that lightly.<br><br>
      It's official. You're a member of The Slow Club.<br>
      A community built on intention, culture, and moving on your own terms.
      That's something you're gonna remember.
    </p>

    <div class="divider">
      <div class="divider-line"></div>
      <div class="divider-dot"></div>
      <div class="divider-line"></div>
    </div>

    <!-- MANIFESTO -->
    <div class="manifesto">
      <p class="manifesto-label">What is Slugs Era?</p>
      <p>
        Slugs Era isn't a brand. It's not a drop. It's not hype — it's a
        movement built on the idea that real culture moves slow, intentional,
        and on its own terms. Like a slug. Unbothered. Unstoppable.
      </p>
      <p>
        We exist for the ones who think differently, create without asking
        permission, and build something lasting out of nothing. No noise.
        Just movement.
      </p>
      <p>
        Every piece we put into the world carries a message. Every release is a
        statement. Every person who joins is proof that the culture is shifting —
        and you're ahead of the curve.
      </p>
    </div>

    <!-- WHAT TO EXPECT -->
    <p class="expect-title">WHAT COMES NEXT</p>
    <ul class="expect-list">
      <li>Early access to every drop before the public sees anything</li>
      <li>Behind-the-scenes looks at the movement as it grows</li>
      <li>Member-only updates, stories, and moments that won't be shared anywhere else</li>
      <li>First invite to events, collabs, and whatever we're building next</li>
      <li>A seat at the table — as a certified member of The Slow Club</li>
    </ul>

    <!-- CTA BLOCK -->
    <div class="cta-block">
      <p>THANKS FOR MAKING A MOVEMENT<br>YOU'RE GONNA REMEMBER.</p>
      <small>You were here first.</small>
    </div>

    <!-- SIGN-OFF -->
    <p class="signoff">
      Stay slow. Stay moving.<br>
      With love from the era —
    </p>
    <p class="signoff-name">Slugs Era</p>

  </div>

  <!-- FOOTER -->
  <div class="footer">
    <p>
      SLUGS ERA &nbsp;·&nbsp; MOVEMENT. NOT MERCH.<br>
      You're receiving this because you subscribed at <a href="#">slugsera.com</a><br>
      <a href="#">Unsubscribe</a> &nbsp;|&nbsp; <a href="#">View in browser</a>
    </p>
  </div>

</div>
</body>
</html>`;
