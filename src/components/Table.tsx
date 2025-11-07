import { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { OverlayPanel } from "primereact/overlaypanel";

import type { ArtworkType, PaginatorType } from "../types";
import { InputText } from "primereact/inputtext";

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

  // If we need to select stuff from this page (due to multi page select), then do that first
  useEffect(() => {
    console.log("USE EFFECT TRIGGERED");
    if (!selectionPlan.has(page)) return;
    if (!data || data.length === 0) return;

    const count = selectionPlan.get(page)!;
    const newSet = new Set(selectedArtworks);
    // debugger;
    // Strict: take first `count` rows from this page
    console.log("BEFORE NEW SET", newSet);
    console.log("DATA", data);
    data.slice(0, count).forEach((item) => newSet.add(item.id));
    console.log("AFTER NEW SET", newSet);

    setSelectedArtworks(newSet);

    const newPlan = new Map(selectionPlan);
    newPlan.delete(page);
    setSelectionPlan(newPlan);
  }, [data, selectionPlan]);

  console.log("PAGE IS ", page);

  console.log(selectionPlan);

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

  const handleSelectionPlan = (n: number | undefined) => {
    if (!n || n <= 0 || !paginationData) return;

    const pageSize = paginationData.limit;
    const totalPages = Math.ceil(paginationData.total / pageSize);

    const plan = new Map<number, number>();

    let remaining = n;
    let p = 1;

    while (remaining > 0 && p <= totalPages) {
      const take = Math.min(pageSize, remaining);
      plan.set(p, take);
      remaining -= take;
      p++;
    }

    setSelectionPlan(plan);
    op.current?.hide();
  };

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
          console.log("SELECTED ARTWORKS IN TABLE BEFORE", selectedArtworks);
          const newSet = new Set(selectedArtworks);
          // First deselect all from this page
          data.forEach((item) => newSet.delete(item.id));
          // Now add the freshly selected items
          e.value.forEach((item) => newSet.add(item.id));
          console.log("SELECTED ARTWORKS IN TABLE BEFORE", newSet);
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
