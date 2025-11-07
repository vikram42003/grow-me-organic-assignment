import type z from "zod";
import { ArtworkSchema } from "../validators";

// I prefer keeping my validators and types in their own files so its easy to derive new ones out of these
// and I know where each one is

export type ArtworkType = z.infer<typeof ArtworkSchema>;
