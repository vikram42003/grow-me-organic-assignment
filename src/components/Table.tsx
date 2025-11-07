import { useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { OverlayPanel } from "primereact/overlaypanel";

import type { ArtworkType, PaginatorType } from "../types";

interface TableProps {
  page: number;
  data: ArtworkType[] | null;
  paginationData: PaginatorType | null;
  setPage: (page: number) => void;
  selectedArtworks: Set<number>;
  setSelectedArtworks: (selectedArtworks: Set<number>) => void;
}

const Table = ({ page, data, paginationData, setPage, selectedArtworks, setSelectedArtworks }: TableProps) => {
  const op = useRef<OverlayPanel>(null);
  const [rowsToSelect, setRowsToSelect] = useState<number>(0);

  const columns = [
    { field: "title", header: "Title" },
    { field: "place_of_origin", header: "Place of Origin" },
    { field: "artist_display", header: "Artist" },
    { field: "inscriptions", header: "Inscriptions" },
    { field: "date_start", header: "Start Date" },
    { field: "date_end", header: "End Date" },
  ];

  if (data?.length === 0 || !paginationData) return <div>Loading...</div>;
  if (!data || !paginationData) return <div>No data to display</div>;

  const totalPages = Math.ceil(paginationData.total / paginationData.limit);

  const paginatorTemplate = {
    layout: "CurrentPageReport PrevPageLink PageLinks NextPageLink",
    CurrentPageReport: () => {
      return (
        <span style={{ marginRight: "auto" }}>
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
      const pagesToShow = 5;
      let start = Math.max(1, page - 2);
      const end = Math.min(totalPages, start + pagesToShow - 1);

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

  const currentPageSelectedArtworks = data.filter((item) => selectedArtworks.has(item.id));

  const toggleSelectAllPage = () => {
    const allSelected = data.every((item) => selectedArtworks.has(item.id));
    const newSet = new Set(selectedArtworks);

    if (allSelected) {
      data.forEach((item) => newSet.delete(item.id));
    } else {
      data.forEach((item) => newSet.add(item.id));
    }

    setSelectedArtworks(newSet);
  };

  const selectNArtworks = (count?: number) => {
    count = count || paginationData.limit;

    const newSet = new Set(selectedArtworks);

    data.slice(0, count).forEach((item) => newSet.add(item.id));

    setSelectedArtworks(newSet);
    op.current?.hide();
  };

  const tableStyle = {
    minWidth: "50rem",
    maxHeight: "100vh",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  return (
    <div>
      <p>
        Selected: <span style={{ color: "blue" }}>{selectedArtworks.size}</span> rows
      </p>

      <DataTable
        value={data}
        id="table"
        tableStyle={tableStyle}
        stripedRows
        paginator
        onPage={(e) => setPage(e.page! + 1)}
        rows={paginationData.limit}
        selectionMode="multiple"
        totalRecords={paginationData.total}
        paginatorTemplate={paginatorTemplate}
        selection={currentPageSelectedArtworks}
        onSelectionChange={(e) => {
          // This func only gives us the newly selected items, theres no way to know which items
          // FROM THIS PAGE, we need to remove unless we do manual calculations like this
          const newSet = new Set(selectedArtworks);
          // First deselect all from this page
          data.forEach((item) => newSet.delete(item.id));
          // Now add the freshly selected items
          e.value.forEach((item) => newSet.add(item.id));
          setSelectedArtworks(newSet);
        }}
        dataKey="id"
        // showSelectAll={false}
      >
        <Column
          header={
            <span style={{ cursor: "pointer" }} onClick={(e) => op.current?.toggle(e)}>
                ▼
              </span>
            // <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: "0.25rem" }}>
            //   {/* <input
            //     type="checkbox"
            //     checked={data.every((item) => selectedArtworks.has(item.id))}
            //     onChange={toggleSelectAllPage}
            //   /> */}
              
            // </div>
          }
          selectionMode="multiple"
          headerStyle={{ width: "3rem" }}
        ></Column>

        {columns.map(({ field, header }) => (
          <Column key={field} field={field} header={header} />
        ))}
      </DataTable>

      <OverlayPanel ref={op}>
        <div style={{ padding: "10px", width: "200px" }}>
          <p style={{ fontWeight: 600, marginBottom: "6px" }}>Select Multiple Rows</p>
          <p style={{ fontSize: "12px", marginBottom: "8px" }}>Enter number of rows to select on this page</p>

          <input
            type="number"
            placeholder="e.g. 5"
            min={1}
            max={paginationData.limit}
            value={rowsToSelect}
            onChange={(e) => setRowsToSelect(Number(e.target.value))}
            style={{ width: "100%", padding: "6px" }}
          />

          <button style={{ marginTop: "10px", width: "100%" }} onClick={() => selectNArtworks(rowsToSelect)}>
            Select
          </button>
        </div>
      </OverlayPanel>
    </div>
  );
};

export default Table;
