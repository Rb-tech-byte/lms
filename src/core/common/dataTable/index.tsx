// index.tsx
import React, { useEffect, useState } from "react";
import { Table } from "antd";
import { DatatableProps } from "../../common/data/interface/index"; // Ensure correct path


const Datatable: React.FC<DatatableProps> = ({ columns, dataSource , Search }) => {
  const [searchText, setSearchText] = useState<string>("");
  const [showSearch, setShowSearch] = useState<any>(true);
  const [filteredDataSource, setFilteredDataSource] = useState(dataSource);


  const handleSearch = (value: string) => {
    setSearchText(value);
    const filteredData = dataSource.filter((record) =>
      Object.values(record).some((field) =>
        String(field).toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredDataSource(filteredData);
  };


  useEffect(() => {
    return setShowSearch(Search);
  }, [Search])
  
  
  return (
    <div className="custom-table antd-custom-table" >
      

     {!showSearch ?
      <Table
      className="table datanew dataTable no-footer"
     
      columns={columns}
      rowHoverable={false}
      dataSource={filteredDataSource}
      pagination={{
        locale: { items_per_page: "" },
        nextIcon: <span><i className="fas fa-angle-right" /></span>,
        prevIcon: <span><i className="fas fa-angle-left" /></span>,
        showTotal: (total, range) => `Page ${range[0]} of ${total}`,
      }}
    /> : 
    <>
    <div className="table-search">
  <div className="input-icon mb-3">
    <span className="input-icon-addon">
      <i className="isax isax-search-normal-14" />
    </span>
    <input type="search" className="form-control form-control-md mb-3 w-auto float-end" value={searchText} placeholder="Search" onChange={(e) => handleSearch(e.target.value)} aria-controls="DataTables_Table_0"></input>
  </div>
  </div>
  <Table
        className="table datanew dataTable no-footer"
        columns={columns}
        rowHoverable={false}
        dataSource={filteredDataSource}
        pagination={{
          locale: { items_per_page: "" },
          nextIcon: <span><i className="fas fa-angle-right" /></span>,
          prevIcon: <span><i className="fas fa-angle-left" /></span>,
          showTotal: (total, range) => `Page ${range[0]} of ${total}`,
        }}
      />
    </>

      }
      
    </div>
  );
};

export default Datatable;
