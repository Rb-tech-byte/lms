export interface DatatableProps {
    columns: any[]; // You can replace `any[]` with the specific type of columns you expect
    dataSource: any[]; // You can replace `any[]` with the specific type of dataSource you expect
    Selection?: boolean | undefined;
  }