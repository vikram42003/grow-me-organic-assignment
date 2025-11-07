import type { ArtworkType } from "../types";
import { ArtworkSchema } from "../validators";

const API_BASE_URL = "https://api.artic.edu/api/v1/artworks";

const fetchData = async (page: number) => {
  try {
    const rawData = await fetch(`${API_BASE_URL}?page=${page}`);
    const jsonData = await rawData.json();
    const data: ArtworkType[] = jsonData?.data?.map((d: unknown) => ArtworkSchema.parse(d));
    console.log(data);
    return data;
  } catch (error) {
    console.error("Could not fetch the artwork data", error);
    return null;
  }
};

const artworkService = {
  fetchData,
};

export default artworkService;
