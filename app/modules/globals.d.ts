/**
 * Ambient declarations for libraries loaded via <script> tags rather than ES module imports.
 * Each is loosely typed as `any` — the goal of the type checker here is to catch our own
 * mistakes, not to type-check Chart.js / DataTables / etc. usage in detail.
 *
 * If you ever want better autocomplete on these, swap the `any` for proper @types packages
 * (`@types/chart.js`, `@types/jquery`, `@types/bootstrap`, `@types/datatables.net`) and
 * delete the matching declaration here.
 */

// Chart.js (loaded from cdn.jsdelivr.net/npm/chart.js as UMD).
declare const Chart: any;

// Chart.js datalabels plugin (loaded from cdn.jsdelivr.net/npm/chartjs-plugin-datalabels).
declare const ChartDataLabels: any;

// Bootstrap 5 JS bundle (loaded from cdn.jsdelivr.net/npm/bootstrap).
declare const bootstrap: any;

// jQuery (bundled with DataTables on most pages, standalone on PersonalBarChart).
declare const $: any;

// DataTables (loaded from cdn.datatables.net/...). Both the constructor namespace
// and the global render helpers are exposed on `window.DataTable`.
declare const DataTable: any;
