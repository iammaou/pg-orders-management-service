import "../App.css"
import { OrderStatusMap } from "./DataTable"

interface props {
  setStatusFilter: (status: "Created" | "Ordered" | "Arrived" | "Finished" | "ReportedAsFinished" | "Delivered" | "null") => void,
  filterIsHandover: boolean,
  showingHistory:boolean,
  toggleFilterIsHandover: () => void,
}

function FunnelForFilters({setStatusFilter, filterIsHandover, toggleFilterIsHandover, showingHistory}: props) {
  return (
    <div className={`absolute lg:w-550 sm:w-400 lg:h-27 sm:h-24 flex justify-end top-22 lg:-right-20 sm:right-4 text-xl md:text-lg lg:text-3xl`}>
      <div className="bg-[#1f1f1f] white-border w-1/8 flex flex-col gap-1">
        <div className="flex gap-1 justify-center items-center">
          <h1>Handover?</h1>
          <input type="checkbox" className="checkbox" checked={filterIsHandover} onChange={toggleFilterIsHandover}/>
        </div>
        <div className={`${showingHistory ? "hidden" : ""}`}>
          <select name="filter" id="filter" onChange={(e) => {
            const newStatus = Number(e.target.value);
            switch (newStatus) {
              case 0: setStatusFilter("Created"); break;
              case 1: setStatusFilter("Ordered"); break;
              case 2: setStatusFilter("Arrived"); break;
              case 3: setStatusFilter("Finished"); break;
              case 4: setStatusFilter("ReportedAsFinished"); break;
              case 5: setStatusFilter("Delivered"); break;
              default: setStatusFilter("null"); break;
            }
          }}>
            <option value="null" className="dark-gray">No Filter</option>
            <option value="0" className='darker-gray'>{OrderStatusMap[0]}</option>
            <option value="1" className='dark-gray'>{OrderStatusMap[1]}</option>
            <option value="2" className='darker-gray'>{OrderStatusMap[2]}</option>
            <option value="3" className='dark-gray'>{OrderStatusMap[3]}</option>
            <option value="4" className='darker-gray'>{OrderStatusMap[4]}</option>
            <option value="5" className='dark-gray'>{OrderStatusMap[5]}</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default FunnelForFilters