import { useEffect, useState } from "react";
import type { ArtworkType, PaginatorType } from "./types";

import artworkService from "./services/artworkService";
import Table from "./components/Table";

function App() {
  const [page, setPage] = useState<number>(1);
  const [data, setData] = useState<ArtworkType[] | null>([]);
  const [paginationData, setPaginationData] = useState<PaginatorType | null>(null);
  const [selectedArtworks, setSelectedArtworks] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadData = async () => {
      const result = await artworkService.fetchData(page);
      if (result) {
        setData(result.artworkData);
        setPaginationData(result.pagination);
      }
    };

    loadData();
  }, [page]);

  return (
    <>
      <Table page={page} data={data} paginationData={paginationData} setPage={setPage} selectedArtworks={selectedArtworks} setSelectedArtworks={setSelectedArtworks}/>
    </>
  );
}

export default App;
