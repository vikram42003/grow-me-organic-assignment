import { useEffect, useState } from "react";

const API_BASE_URL = "https://api.artic.edu/api/v1/artworks";

function App() {
  const [page, setPage] = useState<number>(1);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rawData = await fetch(`${API_BASE_URL}?page${page}`);
        const jsonData = await rawData.json();
        setData(jsonData);
        console.log(jsonData);
      } catch (error) {
        console.log("Could not fetch the artwork data");
        console.log(error);
      }
    };

    fetchData();
  }, [page]);

  return <>Hello World</>;
}

export default App;
