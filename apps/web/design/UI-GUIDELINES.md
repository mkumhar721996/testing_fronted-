# UI guidelines

These rules are generated from this system's design choices (direction **calm**,
palette **Ocean**); they hold for every screen. Tokens are referred to by name; their values
live in `tokens.css`.

## Colour

- Every colour is a semantic token: surfaces (`--color-bg`, `--color-surface`,
  `--color-surface-subtle`), text (`--color-fg`, `--color-fg-muted`, `--color-fg-faint`), the brand
  (`--color-primary`, with `--color-on-primary` on it), borders and the status roles. A literal
  colour in a screen breaks dark mode, which swaps only the tokens.
- Status is a role, never a hue: success, warning, danger and info each come as a strong colour, a
  text colour and a soft fill (`--color-danger`, `--color-danger-text`, `--color-danger-soft`).
  Status text goes on its own soft fill, the pairing that is contrast-checked.
- Light and dark are both supported: `tokens.css` follows the system setting and
  `[data-theme="light"]` / `[data-theme="dark"]` pin one. Test a screen in both.
- Charts use `--color-viz-1` to `--color-viz-6` in order, with `--color-on-viz-n` for a label on a
  series; a sixth series is the limit, beyond it group the rest as "Other".

## Typography

- Headings use Inter, body copy Inter, code and ids JetBrains Mono (`--font-family-heading`,
  `--font-family-body`, `--font-family-mono`). The fonts are vendored under `fonts/`; until the
  files are added the declared fallback stack renders.
- Sizes come from the eight-step scale `--font-size-xs` to `--font-size-4xl`: page titles
  `--font-size-3xl`, section headings `--font-size-2xl` or `--font-size-xl`, body `--font-size-md`,
  captions `--font-size-sm`. Skip no more than one step between a title and the text under it.
- Weights are `--font-weight-regular` for text, `--font-weight-medium` for labels and
  `--font-weight-heading` for headings; line height is `--line-height-normal` for text and
  `--line-height-tight` for headings.

## Icons

The icon set is **Outline** (Lucide-style, round caps. The default), drawn at 20px with a 2px stroke: sizes come from `--icon-size-sm`, `--icon-size-md` and `--icon-size-lg`, never a literal.

- Draw an icon with `<svg class="icon"><use href="#i-name"/></svg>` from the sprite in `icons.svg`; it takes the colour of the text around it, so an icon is never given a colour of its own.
- The starter glyphs are `home`, `kanban`, `check`, `cal`, `user`, `users`, `bell`, `search`, `sliders`, `plus`, `filter`, `flag`, `clock`, `tag`, `msg`, `trash`. A screen that needs another asks for a design-system change; it does not draw one-off icons or use emoji.
- An icon-only control (`.btn-icon`) carries an `aria-label` and a tooltip, and only a conventional glyph (search, plus, close, settings) stands without a visible label.
- A decorative icon next to text is `aria-hidden`; a status is never shown by an icon alone, it is paired with text or a `.badge`.
- Licence: Glyph geometry authored for bnts-arc. Style follows Lucide (ISC); no Lucide paths are copied.

## Layout kit

- The shell is **sidebar app shell** (left navigation, header, content); `app-shell.html` is the
  frame and a screen designs only the content inside it. A screen never restyles the shell.
- A screen picks one page template from `layout-templates.html` (this system's default is
  **dashboard grid**: stat cards over a main chart and a side panel), chooses its columns and states, and stays inside
  it. A needed new template is a design-system change, reviewed once.
- Widths and rhythm come from tokens: `.container` follows `--container-sm` to `--container-xl`,
  the page edge is `--page-gutter`, vertical sections sit `--section-gap` apart and related items
  `--density-gap`. Content never grows past `--container-xl`.
- Spacing uses `--space-1` to `--space-10` only. Breakpoints are `--breakpoint-sm` to
  `--breakpoint-xl` (documented values: a media query cannot read a custom property); the shell
  collapses its navigation below 820px behind a menu button.
- Compose pages from the page kit (`.page`, `.page-header`, `.toolbar`, `.page-body`) and the
  layout helpers (`.stack`, `.cluster`, `.grid`, `.split`); do not write a screen's own flex or
  grid rules where one of these does the job.

## Density

- The density is **comfortable** (36 px controls, 44 px rows): controls take `--control-height-md`, table and list rows take `--density-row-height`, cards and panels pad with `--density-padding` and sit `--density-gap` apart. Pick sizes (`.btn-sm`, `.btn-lg`) for hierarchy, never to fix a layout, so the density stays one decision.

## Motion

- Motion is **subtle**: transitions use `--motion-duration-fast`, `--motion-duration-base` or `--motion-duration-slow` with `--motion-easing-standard`, and only on colour, shadow and position. Every animation is switched off under `prefers-reduced-motion`, so none carries information on its own.

## Accessibility

- Text and its background meet WCAG AA in both modes (4.5:1 for text, 3:1 for graphics and the
  focus ring): the pairs above are checked when the system is generated, so use a token pair as
  named and do not tint text or surfaces by hand.
- Focus is always visible: `:focus-visible` draws a ring of `--focus-ring-width` in
  `--color-primary`; do not remove it. A touch target is at least `--control-height-md` tall
  except in dense tables, where the whole row is the target.
- Information never rests on colour alone: a status pairs its colour with text or an icon, and an
  error message sits next to the field that caused it (`.field-error`).

## Content voice

- Plain, reassuring sentences. Say what happened and what to do next; no exclamation marks.
- Sentence case for headings, buttons and labels. A button says the action ("Save changes",
  "Create board"), never "OK" or "Submit"; a destructive one names what goes ("Delete 3 items").
- An empty state says what belongs here and offers the one action that fills it; an error says
  what went wrong in the person's terms and what to try, and never blames them.

<!-- arc:additions (everything below this line is kept on regeneration) -->

## Product navigation

The sidebar in `app-shell.html` is the only main navigation; it has four sections, in this order, and a screen belongs to exactly one of them.

- **Overview** (`home`): the dashboard grid of stat cards, activity chart and side panel; it is the landing page, so it answers "what needs me today".
- **Boards** (`kanban`): the list of boards and each board's columns and cards; the board is the product's core object, so it stays second.
- **My tasks** (`check`): every task assigned to the person across boards; it is a personal cross-board view, so it never shows other people's work by default.
- **Settings** (`sliders`): profile, workspace and notification preferences; it sits last because it is visited rarely.
- A new top-level section is a design-system change that updates `app-shell.html` too; the labels here and in the shell stay identical so they do not drift.
- Mark the current section with `aria-current="page"` (`--color-primary-soft` fill, `--color-primary-text`), and keep a board's own sub-views (list, board, calendar) as tabs inside the page, not as extra sidebar items, so the sidebar stays four items long.
- Search and Alerts live in the header as `.btn-icon` controls with `aria-label`s; they are not repeated in the sidebar, so each action has one place.

## Imagery and illustration

- The product is text- and data-led: use no stock photography, because photos compete with cards and charts for attention in a calm interface.
- Illustration is limited to empty states: one simple line drawing, 160px wide at most, stroked with `--color-fg-faint` and accented with `--color-primary`, so it matches the Outline icons and follows dark mode.
- Avatars are circles (`--radius-full`) at 24px in dense rows, 32px in cards and 40px in headers; a photo is `object-fit: cover`, so faces are never stretched.
- With no photo, an avatar shows one or two initials on `--color-primary-soft` in `--color-primary-text`, never a random hue per person, because status colours must keep their meaning.
- A board or workspace cover, where used, is 16:9 and sits behind no text; a card thumbnail is 4:3 and an attachment preview 1:1, so grids align.
- Every meaningful image has `alt` text describing its content; a decorative one has `alt=""`, and an image never carries text that is not also in the page.
- An image that is loading or missing shows a `--color-surface-subtle` placeholder of the same aspect ratio, so the layout does not jump.

## Brand wording

- The product name is written as it appears in the shell brand mark, never abbreviated, and the shell's brand mark is the only logo, so there is one identity.
- Use the product's own nouns consistently: **board** (not "project" or "kanban"), **card** for an item on a board, **task** for a card assigned to a person (shown in My tasks), **column** for a stage, because mixed terms make people hunt for things.
- Name stages and statuses in plain words ("To do", "In progress", "Done") and show a status with a `.badge`, never colour alone.
- Address the person as "you" and the team as "your team"; avoid "user", because the voice speaks to people.
- Dates are relative within seven days ("Due tomorrow") and absolute beyond ("Due 12 Dec"), with the exact date in a tooltip, so urgency is scannable.
- Confirmation and success messages are one short sentence naming the thing ("Board archived. You can restore it from Settings."); a destructive action offers undo before it asks for confirmation, so mistakes stay cheap.
- Empty states by section: Boards "No boards yet. Create a board to start planning." and My tasks "Nothing assigned to you. Tasks you are given will appear here.", so each points at its one next action.
