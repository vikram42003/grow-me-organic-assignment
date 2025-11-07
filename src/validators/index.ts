import { z } from "zod";

export const ArtworkSchema = z.object({
  id: z.number(),
  title: z.string(),
  place_of_origin: z.string().nullable(),
  artist_display: z.string().nullable(),
  inscriptions: z.string().nullable(),
  date_start: z.number().nullable(),
  date_end: z.number().nullable(),
});

export const PaginatorSchema = z.object({
  total: z.number(),
  limit: z.number(),
});
