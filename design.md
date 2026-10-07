# Swell Apps — design direction

## Identity
Preserve the supplied hero reference and existing custom founder doodle. Warm paper #faf9f6, near-black ink #101110, vermilion #ff4b23. Self-hosted DM Sans, Bodoni Moda and Leckerli One. Fine paper grain, generous editorial whitespace, no cards or invented portfolio.

## Approved page flow and exact copy
Hero: “Building a collection of swell apps.” / “Thoughtful products for the internet.” / Book a call.
Three-part strip: BUILD / Products; OPERATE / Apps; ADVISE / Teams.
About: “Swell Apps is the home for the products I’m building.” / “I’m Max — builder, operator, and occasional advisor.” No handwritten annotation under About.
Work with us: “I work with a small number of founders and teams on product, growth, and app strategy.” / Book a call.
Footer: “Swell Apps © 2026” / “Made by Max”.

## Structure
Keep original split hero layout, wordmark, illustration, orange handwritten headline, ink underline and pill CTA. Add minimal About / Work with us anchor navigation on desktop. Ruled three-part strip followed by two spacious editorial sections. Consulting surface has a very light warm-gray tint, not a sales card. Footer simple and ruled. Responsive mobile stacked composition.

## Motion
Motion for React: staggered hero lines within 900ms, underline path draw, static illustration enters once with 15px/98% scale; never animate the character after entry. Viewport-triggered one-time copy and strip reveals with tiny 10–14px offsets. Two scroll-triggered rules. Single slow-moving section star, restrained 20px total parallax. Compact translucent header on scroll. Hand-drawn nav underlines, 550ms anchored scrolling, consistent soft easing. CTA lifts 2px, scales 1.015, arrow shifts diagonally, press compresses; fine-pointer magnetic movement capped at 4px. Reduced-motion visitors see content immediately with no sliding, drawing, parallax or smooth scroll.

## Booking and implementation
No booking URL has been supplied. Remove the former coming-soon dialog completely. Book a call remains a visibly styled, aria-disabled placeholder until the BOOKING_URL constant is set; no fake email or provider. Clearly report this limitation on delivery, not as site copy.
Web only. Modify swell-home.tsx and styles.css; introduce reusable site-motion.tsx components. No new API routes or database tables. Preserve platform runtime and analytics.

## Latest approved refinement
Keep the headline unchanged; replace only its supporting sentence. Preserve About pending a clear removal decision. Strip uses chunky DM Sans uppercase verbs and orange handwritten nouns, with original stagger and rules. Consulting copy remains unchanged; only heading and navigation change to Work with us.

## Matching section doodles and studio voice
Replace the consulting star with two overlapping hand-ink conversation bubbles. About receives a matching lightbulb/idea sketch. Both are custom vector UI decorations in near-black with sparse orange accent strokes, same stroke weight and small entrance motion. Keep hero untouched. About lead becomes “Swell Apps is the home for the products we’re building.” Consulting becomes “We work with a small number of founders and teams on product, growth, and app strategy.” Retain Max’s personal introduction and maker credit.

## Advisory enquiry — approved six-step flow
All landing CTAs become “Work with us” and link to /work-with-us. Advisory section gains understated eyebrow “Advisory”, approved selective-work copy and three simple text columns (Growth/Product/Strategy), not a second strip or cards.
Form shares paper, font pairing, doodles and orange accents. One spacious question per screen, small six-part progress rail, back/continue controls, explicit selection highlighting and keyboard access. Step 1 one-sentence project (250 char); stage and revenue are single-select instant-advance; help areas up to two with auto-advance on second selection and Continue for one; challenge 200 char; contact fields last. Name/email/product required; URL optional, accepts normal domains. Final submit is “Send enquiry”. Preserve answers when stepping back; no browser storage of contact info. Inline validation, submitting/error/retry and real success only on successful database insert. No calendar or fabricated acceptance.
Backend: public write-only advisory.submit oRPC procedure; validated shared schema; enquiries persisted in private Turso advisory_enquiries table, no public listing. Submission UUID gives retry deduplication; simple database-backed email submission throttle and hidden spam field. No email delivery configured, no notifications claimed. Existing runtime and analytics preserved. No admin UI in this scope.

## Help-area selection update
Allow all five help areas, with at least one required. Remove the two-selection cap and automatic advance from this step; explicit Continue lets visitors finish choosing. Stage/revenue auto-advance unchanged. Shared server/client schema accepts one to five unique areas.
