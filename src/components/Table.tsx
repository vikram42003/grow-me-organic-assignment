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

  const paginatorTemplate = {
    layout: "CurrentPageReport PrevPageLink PageLinks NextPageLink",
    CurrentPageReport: () => {
      return (
        <span style={{ marginRight: "auto" }}>
          Showing
          <span style={{ fontWeight: 600 }}> {page} </span>
          to
          <span style={{ fontWeight: 600 }}> {page * 12} </span>
          of
          <span style={{ fontWeight: 600 }}> {paginationData.total} </span>
          entries
        </span>
      );
    },
    PrevPageLink: () => (
      <button className={`pagination-button ${page === 1 && "pagination-button-disabled"}`} disabled={page === 1}>
        Previous
      </button>
    ),
    NextPageLink: () => (
      <button
        className={`pagination-button ${page === paginationData.total && "pagination-button-disabled"}`}
        disabled={page === paginationData.total}
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
