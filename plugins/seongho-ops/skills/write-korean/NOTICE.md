# Third-party attribution

The bundled `references/korean-polishing.md` is a selected and modified adaptation of Humanize KR's quick-rules, not an unmodified upstream distribution.

- Upstream: https://github.com/epoko77-ai/im-not-ai
- Copyright (c) 2026 epoko77-ai
- License: MIT; the full, unmodified notice is included in [LICENSE](LICENSE).
- Pinned release: v2.3.2
- Commit: `bad4ef0a2b514318b2278b65cb4545414ad84d82`
- Source: https://github.com/epoko77-ai/im-not-ai/blob/bad4ef0a2b514318b2278b65cb4545414ad84d82/skills/humanize-korean/references/quick-rules.md
- License source: https://github.com/epoko77-ai/im-not-ai/blob/bad4ef0a2b514318b2278b65cb4545414ad84d82/LICENSE
- Source SHA-256: `258bd9f755fc04a5894f42e5e0a0dcf3c66ee7cf20854d91b4fbac0becf2c08e`
- License SHA-256: `4cc7e8c439fe42f09d98457599c129ea6df9e5d0e622750d75952b441a38343f`
- Verified on: 2026-10-27. The locally installed quick-rules file matched this pinned upstream file byte for byte; this does not establish the installation date or exact installed release.

## Changes maintained by Seongho Ops

Rules are grouped and selectively rewritten for preserving the user's voice. Upstream IDs are retained for provenance. Numerical repetition thresholds, forced sentence-length variation, mandatory artifact output, grades, and change-rate gates are omitted. Edits must preserve uncertainty, negation, tense, agency, commitments, quotations, terminology, and useful formatting. Rules that strengthen claims or replace balanced judgments with assertions are explicitly restricted. Examples and the final comparison procedure are adapted for this workflow. This is a focused polishing guide, not the complete upstream taxonomy or a validated AI-text detector.

The original skill, scripts, scholarly reference collection, and other upstream resources are not bundled or needed at runtime. The standalone `humanize-korean` installation is not a dependency. Future updates must compare against the pinned source and retain this notice and the MIT license.

OpenAI's `write-like-me` remains an optional external integration for retrieving style examples. No OpenAI plugin source is copied or relicensed here. Supplied examples and draft-only polishing work without it.
