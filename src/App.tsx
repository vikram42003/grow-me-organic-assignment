import { useEffect, useState } from "react";
import type { ArtworkType } from "./types";

import artworkService from "./services/artworkService";

function App() {
  const [page, setPage] = useState<number>(1);
  const [data, setData] = useState<ArtworkType[] | null>([]);

  useEffect(() => {
    const loadData = async () => {
      const result = await artworkService.fetchData(page);
      setData(result);
    };

    loadData();
  }, [page]);

  return <>Hello World</>;
}

export default App;
