# Artworks Data Viewer

A React + TypeScript web app built for the **AppConnector Assignment** to display artworks from the Art Institute of Chicago API with server‑side pagination, performance safe multi‑page row selection.

---

## Live Demo

> **Netlify:** 

---

## Tech Stack

* React + TypeScript
* PrimeReact (DataTable + OverlayPanel)
* REST API (Art Institute of Chicago API)
* Netlify

**Note**: For css I decided to not use any css library since the PrimeReact components already came prestyled and only minor css tweaks were needed. Although I did try to use Tailwind, but it wasn't natively compatible with PrimeReach and continuing with it would've been counter productive.

---

## Get Started

I use pnpm, but it'll work just fine with npm.

```bash
pnpm install
pnpm run dev
```
or
```bash
npm install
npm run dev
```

App runs at:

> [http://localhost:5173](http://localhost:5173)

---

## Features

* Server‑side pagination
* Select rows on current page
* Select **N rows** across multiple pages (without prefetching)
* Persist selection across page navigation (storing only ids, not whole objects)
* Total selected count visible
* Deployed publicly

---

## Key Implementation Details

This project focuses on **performance-safe multi-page selection**, designed to meet the assignment requirement:

> **No prefetching of data from pages not yet visited.**

- **My selection strategy was -** since we cannot prefetch, the only information we have to get first N rows is the index position of rows.
- So on clicking the get N rows button (Eg. the user put in 25), we crete a HashMap that tracks the page number and the number of items we need from that page. (Eg. for 25, we need 12 rows from page 1, 12 again from 2, and 1 from 3) and the HashMap will look like this { 1: 12, 2: 12, 3: 1 }.
- And when the user visits page 3, one row will be added, and then if they go to page 2, 12 rows will be added.
- This wasnt part of the assignment but if we need to submit the selected rows and some are left then we can directly query the page of the HashMap from the API.

---

### How Row Selections Are Stored

Row selections are stored using **unique artwork IDs**:

```ts
selectedArtworks: Set<number>
```

* This ensures selections are consistent and persistent across pages.
* IDs prevent duplicate selection and avoid storing unnecessary page data.

---

### When Index Position Is Used

To support the **“Select N Rows” across multiple pages** (without prefetching):

* Index positions are used only to **plan how many rows to select on each page**.
* We **never store artwork data** for future pages, only the count to be selected.

```ts
selectionPlan: Map<pageNumber, number>
```

* Page numbers map to how many rows will be selected when that page loads.
* Final selection always uses unique IDs once the page is visited.

---

## Multi‑Page Selection (No Prefetch)

* Selecting **N rows** creates a `selectionPlan` mapping: `page -> rowsToSelect`
* No future page data is fetched in advance
* When a page loads, if it exists in `selectionPlan`, rows are selected and that entry is removed

Example (Page size = 12, N = 25):

| Page | Rows Selected |
| ---- | ------------- |
| 1    | 12            |
| 2    | 12            |
| 3    | 1             |

Selections only occur for pages the user visits.

---

## Key Challenge & Fix

**Issue:** A race condition triggered selection before new page data arrived, causing incorrect counts.

**Fix:** Apply selection only when both:

* Data for the page is loaded
* Page exists in `selectionPlan`

Using a strict `useEffect` dependency:

```ts
useEffect(() => {
  if (!selectionPlan.has(page) || !data?.length) return;

  const count = selectionPlan.get(page)!;
  const updated = new Set(selectedArtworks);

  data.slice(0, count).forEach(item => updated.add(item.id));
  setSelectedArtworks(updated);

  const plan = new Map(selectionPlan);
  plan.delete(page);
  setSelectionPlan(plan);
}, [data, selectionPlan]);
```

---

## Future Enhancements (Supported by the current architecture)

The selection logic makes the assumption that the select N rows function meant that "select first N rows", but the function itself is flexible and can be extended to:

* Select rows from index **X to Y**
* Select starting from the **current page onward**
* Select backward (last pages first)

Only minor math/offset adjustments are required.

---

## License

This project was built as a submission for the **AppConnector React + TypeScript Assignment**.

