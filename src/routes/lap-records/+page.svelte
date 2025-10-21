<script lang="ts">
    import { Table } from "@flowbite-svelte-plugins/datatable";
    import type { DataTableOptions } from "@flowbite-svelte-plugins/datatable";
    import type { LapRecord } from '$lib/lapRecords';
  
    export let data: { lapRecords: LapRecord[] };
    
    // Sort lap records by lap time (ascending - fastest first)
    const lapRecords: LapRecord[] = (data.lapRecords ?? []).sort((a, b) => {
        // Convert lap times to comparable format (remove colons and compare as numbers)
        const timeA = (a.lap_time || '').replace(/:/g, '');
        const timeB = (b.lap_time || '').replace(/:/g, '');
        return timeA.localeCompare(timeB);
    });
  
    const tableOptions: DataTableOptions = {
      paging: true,
      searchable: true,
      perPage: 25,
      perPageSelect: [10, 15, 20, 25, 50, 100],
     
      tableRender: (data: any[], table: any, type: string) => {
        if (type === "print") {
          return table;
        }

        const tHead = table.childNodes[0];
        const filterHeaders = {
          nodeName: "TR",
          attributes: {
            class: "search-filtering-row"
          },
          childNodes: tHead.childNodes[0].childNodes.map((_th: any, index: number) => {
            // Only add search inputs for visible columns (track_name, car_model, platform, driver)
            const searchableColumns = [0, 1, 2, 3]; // track_name, car_model, platform, driver
            if (!searchableColumns.includes(index)) {
              return { nodeName: "TH", childNodes: [] };
            }

            return {
              nodeName: "TH",
              childNodes: [
                {
                  nodeName: "INPUT",
                  attributes: {
                    class: "datatable-input",
                    type: "search",
                    "data-columns": `[${index}]`
                  }
                }
              ]
            };
          })
        };

        tHead.childNodes.push(filterHeaders);
        return table;
      }
    };
  </script>
  
  <div class="m-8">
    <Table items={lapRecords as any} dataTableOptions={tableOptions} />
  </div>
  