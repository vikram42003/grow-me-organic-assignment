import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import type { ArtworkType, PaginatorType } from "../types";

interface TableProps {
  page: number;
  data: ArtworkType[] | null;
  paginationData: PaginatorType | null;
  setPage: (page: number) => void;
}

const Table = ({ page, data, paginationData, setPage }: TableProps) => {
  const columns = [
    { field: "title", header: "Title" },
    { field: "place_of_origin", header: "Place of Origin" },
    { field: "artist_display", header: "Artist Display" },
    { field: "inscriptions", header: "Inscriptions" },
    { field: "date_start", header: "Date Start" },
    { field: "date_end", header: "Date End" },
  ];

  if (data?.length === 0 || !paginationData) return <div>Loading...</div>;

  if (!data || !paginationData) return <div>No data to display</div>;

  const tableStyle = {
    minWidth: "50rem",
    maxHeight: "100vh",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const totalPages = Math.ceil(paginationData.total / paginationData.limit);

  const paginatorTemplate = {
    layout: "CurrentPageReport PrevPageLink PageLinks NextPageLink",
    CurrentPageReport: () => {
      return (
        <span style={{ marginRight: "auto" }}>
          {/* Just mathematically calculate the limits like page 13 to 24 */}
          Showing <strong>{page * paginationData.limit - paginationData.limit + 1}</strong> to{" "}
          <strong>{page * paginationData.limit}</strong> of <strong>{paginationData.total}</strong> entries
        </span>
      );
    },
    PrevPageLink: () => (
      <button
        className={`pagination-button ${page === 1 ? "pagination-button-disabled" : ""}`}
        disabled={page === 1}
        onClick={() => page > 1 && setPage(page - 1)}
      >
        Previous
      </button>
    ),
    PageLinks: () => {
      // Here we need to manually create the buttons and their values since we are doing server side pagination
      const pagesToShow = 5;

      let start = Math.max(1, page - 2);
      const end = Math.min(totalPages, start + pagesToShow - 1);

      // Adjust if we’re near the end
      if (end - start < pagesToShow - 1) {
        start = Math.max(1, end - pagesToShow + 1);
      }

      const pageButtons = [];
      for (let i = start; i <= end; i++) {
        pageButtons.push(
          <button
            key={i}
            className={`pagination-button ${page === i ? "pagination-button-active" : ""}`}
            onClick={() => setPage(i)}
          >
            {i}
          </button>
        );
      }
      return <>{pageButtons}</>;
    },
    NextPageLink: () => (
      <button
        className={`pagination-button ${page >= totalPages ? "pagination-button-disabled" : ""}`}
        disabled={page >= totalPages}
        onClick={() => page < totalPages && setPage(page + 1)}
      >
        Next
      </button>
    ),
  };

  return (
    <div>
      {/* Here, we can use the loading and empty properties to show loading or empty list components 
      but we transform the data above so we need to ensure it is there at the top of the component 
      so we dont use the empty and loading properties here*/}
      <DataTable
        value={data}
        tableStyle={tableStyle}
        stripedRows
        paginator
        onPage={(e) => setPage(e.page! + 1)}
        rows={paginationData.limit}
        totalRecords={paginationData.total}
        paginatorTemplate={paginatorTemplate}
      >
        {columns.map(({ field, header }) => (
          <Column key={field} field={field} header={header} />
        ))}
      </DataTable>
    </div>
  );
};

export default Table;
