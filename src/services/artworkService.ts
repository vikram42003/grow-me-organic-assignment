import type { ArtworkType, PaginatorType } from "../types";
import { ArtworkSchema, PaginatorSchema } from "../validators";

const API_BASE_URL = "https://api.artic.edu/api/v1/artworks";

const fetchData = async (page: number) => {
  try {
    const rawData = await fetch(`${API_BASE_URL}?page=${page}`);
    const jsonData = await rawData.json();
    console.log(jsonData);
    const artworkData: ArtworkType[] = jsonData?.data?.map((d: unknown) => ArtworkSchema.parse(d));
    const pagination: PaginatorType = PaginatorSchema.parse(jsonData?.pagination);

    const data = { artworkData, pagination };

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
