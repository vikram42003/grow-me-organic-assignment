import { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { OverlayPanel } from "primereact/overlaypanel";

import type { ArtworkType, PaginatorType } from "../types";
import { InputText } from "primereact/inputtext";
import { createSelectionPlan } from "../utils/selectionPlan";

interface TableProps {
  page: number;
  data: ArtworkType[] | null;
  paginationData: PaginatorType | null;
  setPage: (page: number) => void;
  selectedArtworks: Set<number>;
  setSelectedArtworks: (selectedArtworks: Set<number>) => void;
  selectionPlan: Map<number, number>;
  setSelectionPlan: (selectionPlan: Map<number, number>) => void;
}

const Table = ({
  page,
  data,
  paginationData,
  setPage,
  selectedArtworks,
  setSelectedArtworks,
  selectionPlan,
  setSelectionPlan,
}: TableProps) => {
  const op = useRef<OverlayPanel>(null);
  const [rowsToSelect, setRowsToSelect] = useState<number>();

  // If we need to select items from this page (due to multi page select), then do that first
  useEffect(() => {
    if (!selectionPlan.has(page)) return;
    if (!data || data.length === 0) return;

    const count = selectionPlan.get(page)!;
    const newSet = new Set(selectedArtworks);

    data.slice(0, count).forEach((item) => newSet.add(item.id));

    setSelectedArtworks(newSet);

    const newPlan = new Map(selectionPlan);
    newPlan.delete(page);
    setSelectionPlan(newPlan);

    // We strictly need only these dependencies for the no-prefetch pagination to work, any more and it will cause race
    // conditions and delete the key in map before can add NEW DATA to set
    // any less and it wont trigger on cases on which it should trigger
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, selectionPlan]);

  if (data?.length === 0 || !paginationData) return <div>Loading...</div>;
  if (!data || !paginationData) return <div>No data to display</div>;

  const totalPages = Math.ceil(paginationData.total / paginationData.limit);
  const currentPageSelectedArtworks = data.filter((item) => selectedArtworks.has(item.id));
  let totalRows = selectedArtworks.size;
  selectionPlan.forEach((value) => (totalRows += value));

  // Selection plan business logic, it kinda needs to stay couple within Table, otherwise major refactoring would be needed, so im keeping it like this
  // Described in detail in README.md
  const handleSelectionPlan = (n: number | undefined) => {
    if (!n || n <= 0 || !paginationData) return;

    const plan = createSelectionPlan(n, totalPages, paginationData.limit);
    setSelectionPlan(plan);
    op.current?.hide();
  };

  // Custom pagination, it is used as a parameter in the component below so I feel like it is justifiable to keep it here
  // But I would think of other options if I had more time
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

  const columns = [
    { field: "title", header: "Title" },
    { field: "place_of_origin", header: "Place of Origin" },
    { field: "artist_display", header: "Artist" },
    { field: "inscriptions", header: "Inscriptions" },
    { field: "date_start", header: "Start Date" },
    { field: "date_end", header: "End Date" },
  ];

  const tableStyle = {
    minWidth: "50rem",
    maxHeight: "100vh",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  return (
    <div>
      <p>
        Selected: <span style={{ color: "blue" }}>{totalRows}</span> rows
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
          // are FROM THIS PAGE, we need to remove unless we do manual calculations like this
          const newSet = new Set(selectedArtworks);

          // First deselect all from this page
          data.forEach((item) => newSet.delete(item.id));

          // Now add the freshly selected items
          e.value.forEach((item) => newSet.add(item.id));

          setSelectedArtworks(newSet);
        }}
        dataKey="id"
      >
        <Column
          header={
            <span style={{ cursor: "pointer" }} onClick={(e) => op.current?.toggle(e)}>
              ▼
            </span>
          }
          selectionMode="multiple"
          headerStyle={{ width: "3rem" }}
        ></Column>

        {columns.map(({ field, header }) => (
          <Column key={field} field={field} header={header} />
        ))}
      </DataTable>

      {/* The popup box for selecting the rows by inputting a number */}
      <OverlayPanel ref={op}>
        <div>
          <p style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Select Multiple Rows</p>
          <p style={{ fontSize: "0.8rem", marginBottom: "0.5rem" }}>Enter number of rows to select on this page</p>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <InputText
              type="number"
              placeholder="Eg. 20"
              min={1}
              max={paginationData.total}
              value={"" + rowsToSelect}
              onChange={(e) => setRowsToSelect(Number(e.target.value))}
              style={{ width: "100%", padding: "0.5rem" }}
            />
            <button
              className="pagination-button pagination-button-active"
              onClick={() => handleSelectionPlan(rowsToSelect)}
            >
              Select
            </button>
          </div>
        </div>
      </OverlayPanel>
    </div>
  );
};

export default Table;
