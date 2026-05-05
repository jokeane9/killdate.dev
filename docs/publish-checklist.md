# Publish checklist

Run through this every time a post goes from draft to live.

## Before publishing

- [ ] Post has accurate `title` and `description` in frontmatter
- [ ] `draft: false` is set
- [ ] `post` number is sequential (check existing posts — no duplicates)
- [ ] `part` number is correct (0=preamble, 1–3=main parts, 4=appendix)
- [ ] Read the post once as a reader — not as the author

## On publish

- [ ] If the post introduces new terminology or concepts, add them to the **Key Concepts** section in `src/pages/llms.txt.ts`
- [ ] If the post references a process that doesn't have a Reference doc yet, create it or flag it

## After push

- [ ] Confirm GitHub Actions deploy completes (check Actions tab)
- [ ] Hit the live URL — confirm post appears in the index and renders correctly
- [ ] Check `https://killdate.dev/llms.txt` — confirm the new post appears
