# BEI Website Design System

This document translates `BEI_Brand_Guidelines.pdf` into working rules for this website. The PDF is the canonical source; when this file and the PDF differ, follow the PDF.

## Brand Position

Bitcoin Education Institute is an educational and institutional brand built on credibility, trust, and intellectual seriousness. The website should feel scholarly, credible, timeless, principled, and Bitcoin-native.

The brand should read as academic and premium while staying accessible and modern. Avoid hype, gimmicks, generic crypto language, meme-driven visuals, speculative-market framing, and trend-led styling.

## Color System

Use the official restrained institutional palette:

| Token | Color | Hex |
| --- | --- | --- |
| Primary Navy | Deep institutional navy | `#01091C` |
| Primary Black | Formal black | `#111111` |
| Institutional Gold | Primary accent | `#B38A49` |
| Light Gold | Secondary accent | `#D8B080` |
| Cream / Ivory | Warm neutral background | `#EEEBE5` |
| White / Reverse | Light reverse color | `#FFFFFF` |

Guidance:
- Use navy, black, cream, and white as the structural colors.
- Use gold sparingly as a deliberate accent, not as a dominant theme color.
- Do not introduce Bitcoin orange, gradients, glow effects, or unrelated palettes unless the brand guide is updated.
- Place text and logos only on backgrounds with strong contrast.

## Typography

The brand typography pairs a refined serif headline voice with a neutral sans body voice.

| Role | Typeface | Implementation Rule |
| --- | --- | --- |
| Primary / Headlines | Tiempos | Required when licensed webfont files are available. Until then, use a high-contrast serif fallback such as Georgia or Source Serif. |
| Secondary / Body | Inter | Use for body copy, navigation, buttons, labels, captions, and interface text. |

Guidance:
- Headings should feel authoritative and editorial, with confident sizing and restrained spacing.
- Body copy should be left aligned, readable, and calm, with comfortable line height.
- Captions and labels should use Inter at smaller sizes with quiet hierarchy.
- Do not recreate the logo wordmark with a font.

## Logo System

Approved website assets live under `public/brand/`. Print/source PDFs and the asset map live under `docs/brand-assets/`.

Primary usage:
- Use the primary horizontal logo for formal and external-facing brand identity, especially the website header and primary navigation.
- Use the wordmark only when a clean text-only institutional treatment is needed or when the column icon would be redundant.
- Use the monogram/secondary mark only for compact, social, avatar, watermark, stamp, community, or decorative moments.
- Do not use the monogram as the primary identity in formal site contexts.

Clear space and minimum sizes:
- Keep at least one column-icon width of clear space around the logo.
- Digital minimum width: primary logo `160px`; icon or monogram `32px`.
- When in doubt, add more space.

Do not:
- Stretch, distort, rotate, recolor, outline, shadow, or add effects to approved marks.
- Rebuild or rearrange logo parts.
- Place logos on low-contrast or busy backgrounds.
- Separate primary logo elements except by using approved standalone assets.

## Imagery

Use images that support BEI as a serious academic institution for Bitcoin scholarship.

Prefer:
- Real teaching, classroom, seminar, research, conference, curriculum, faculty, and institutional gathering imagery.
- Calm, documentary, editorial, and academic compositions.
- Images that leave enough negative space and contrast for nearby text or logos.

Avoid:
- Generic crypto stock imagery.
- Hype-driven market, trading, neon, coin-stack, or speculative visuals.
- Busy image regions behind text or logos.
- Purely atmospheric images that do not help explain the page.

## Interface Tone

The interface should be measured, durable, and restrained. Use clear hierarchy, consistent spacing, and quiet interactions. Avoid oversized decorative effects, novelty theme switching, or animation that makes the institution feel less serious.

Future UI work should validate:
- Brand palette alignment.
- Tiempos/fallback heading policy and Inter body/interface usage.
- Primary logo usage and clear space.
- Image tone and contrast.
- Build/lint status and Marcus manual approval for UI changes.
