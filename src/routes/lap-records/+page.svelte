<script lang="ts">
    import { Table } from "@flowbite-svelte-plugins/datatable";
    import type { DataTableOptions } from "@flowbite-svelte-plugins/datatable";
    import type { LapRecordRow } from './+page.server';
  
    export let data: { lapRecords: LapRecordRow[] };
    const lapRecords: LapRecordRow[] = data.lapRecords ?? [];
  
    const tableOptions: DataTableOptions = {
      paging: true,
      searchable: true,
      perPage: 25,
      columns: [
        { select: 0, hidden: true, type: "string" }, // DriverGUID
        { select: 1, hidden: false, type: "string" }, // TrackName
        { select: 2, hidden: false, type: "string" }, // CarModel
        { select: 3, hidden: false, type: "string" }, // Platform
        { select: 4, hidden: true, type: "string" }, // BestLap
        { select: 5, hidden: false, type: "string" }, // Driver
        { select: 6, hidden: true, type: "string" }, // BestLap_Num
        { select: 7, hidden: false, type: "string" }  // Lap Time
      ],
      tableRender: (data: any[], table: any, type: string) => {
        if (type === "print") return table;
  
        const tHead = table.childNodes[0];
  
        const filterHeaders = {
          nodeName: "TR",
          attributes: { class: "search-filtering-row" },
          childNodes: tHead.childNodes[0].childNodes.map((_th: any, index: number) => {
            // Only add input for the columns we want searchable
            const searchableColumns = [0, 1, 2, 3]; // TrackName, CarModel, Platform, Driver
            if (!searchableColumns.includes(index)) return { nodeName: "TH", childNodes: [] };
  
            return {
              nodeName: "TH",
              childNodes: [
                {
                  nodeName: "INPUT",
                  attributes: {
                    class: "datatable-input",
                    type: "search",
                    "data-column": index
                  }
                }
              ]
            };
          })
        };
  
        tHead.childNodes.push(filterHeaders);
        
        // Add event listeners to the search inputs
        setTimeout(() => {
          const inputs = table.querySelectorAll('.search-filtering-row input[type="search"]');
          inputs.forEach((input: HTMLInputElement) => {
            const columnIndex = parseInt(input.getAttribute('data-column') || '0');
            input.addEventListener('input', (e) => {
              const searchValue = (e.target as HTMLInputElement).value;
              // Trigger search on the specific column
              const event = new CustomEvent('datatable:search', {
                detail: { column: columnIndex, value: searchValue }
              });
              table.dispatchEvent(event);
            });
          });
        }, 100);
        
        return table;
      }
    };
  </script>
  
  <div class="m-8">
    <Table items={lapRecords} dataTableOptions={tableOptions} />
  </div>
  