import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import { OrderForm } from './OrderForm';
import { type EditOrder, type Order } from '../types/Interfaces'
import "../App.css"
import { apiFetch } from '../apiFetch';
import { useMediaQuery } from 'react-responsive';
import ConfirmDelete from './ConfirmDelete';

interface props {
  onApiKeyReset: () => void
}

export const OrderStatusMap: Record<number, string> = {
  0: 'Created',
  1: 'Ordered',
  2: 'Arrived',
  3: 'Finished',
  4: 'Reported',
  5: 'Delivered',
};

const emptyOrder: Order = {
  id: '',
  name: '',
  quantityGroups: [
    {
      id: 0,
      groupKey: '',
      quantities: [
        {
          id: 0,
          size: '',
          quantity: 0
        }
      ]
    }
  ],
  status: 0,
  createdAt: '',
  deadline: '',
  totalPrice: 0
}

export const DataTable = ({ onApiKeyReset }: props) => {
  const [dataTableFormShown, setDataTableFormShown] = useState<boolean>(false);
  const [dataTableHidden, setDataTableHidden] = useState<boolean>(false)
  const [orderData, setOrderData] = useState<Order[]>([]);
  const [postOrPut, setPostOrPut] = useState<"POST" | "PUT">("POST");
  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order>(emptyOrder);
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [numberOfPages, setNumberOfPages] = useState<number>(1);
  const [sortBy, setSortBy] = useState<"createdAt" | "deadline">("createdAt");
  const [descending, setDescending] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<"Created" | "Ordered" | "Arrived" | "Finished" | "ReportedAsFinished" | "Delivered" | "null">("null");
  const [deleteWindowVisible, setDeleteWindowVisible] = useState<boolean>(false);
  const [deleteOrderName, setDeleteOrderName] = useState<string>('');
  const [deleteOrderId, setDeleteOrderId] = useState<string>('');

  async function getOrders(signal?:AbortSignal) {
    await apiFetch(`?Page=${selectedPage}&SortBy=${sortBy}&IsDescending=${descending}${statusFilter === "null" ? "" : "&Status=" + statusFilter}`, { method: 'GET', signal }).then((res) => {
      if (res.status === 401) {
        onApiKeyReset();
        return;
      }
      if (!res.ok) {
        throw new Error(`Get failed: ${res.status}`);
      } else{
        return res.json();
      }

    })
      .then((data) => {
        setSelectedPage(data.page);
        setNumberOfPages(Math.max(1, Math.ceil(data.totalCount / data.pageSize)));
        setOrderData(data.items);
      }).catch((err) => {
        alert(`Error: ${err}`)
      })
  }

  async function requestDelete(id: string, name:string) {
    setDataTableHidden(true);
    setDeleteOrderName(name);
    setDeleteOrderId(id);
    setDeleteWindowVisible(true);
  }

  const handleOrderForm = (method: "POST" | "PUT", id?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setPostOrPut(method);
    if (method === "PUT" && id) {
      setSelectedId(id)
    }
    dataTableFormShown == false ? setDataTableFormShown(true) : setDataTableFormShown(false);
  }

  useEffect(() => {
    const signal = new AbortController();
    getOrders(signal.signal);
    setSelectedPage(1);
  }, [selectedPage, descending, sortBy, statusFilter]);

  function useBreakpoint() {
    const isMobile = useMediaQuery({ query: '(max-width: 640px)' });
    const isTablet = useMediaQuery({ query: '(max-width: 1024px)' });

    return { isMobile, isTablet };
  }

  const { isMobile, isTablet } = useBreakpoint();

  const handleSortChange = (newlySelected: "createdAt" | "deadline") => {
    if (sortBy === newlySelected) {
      setDescending(!descending);
    } else {
      setDescending(false);
    }
    setSortBy(newlySelected);
  }

  const handleOnViewMore = (index: number) => {
    if (isMobile) {
      setDataTableHidden(true);
      setSelectedOrder(orderData[index]);
    }
  }

  const statusSelect = (index:number, order: Order) => {
    return <select className='white' name="statusSelect" id={`statusSelect-${index}`} value={order.status} onChange={
      async (e) => {
        try {
          const newStatus: number = Number(e.target.value);

          const payload: EditOrder = {
            name: order.name,
            deadline: order.deadline,
            totalPrice: order.totalPrice,
            quantityGroups: order.quantityGroups,
            createdAt: order.createdAt,
            status: newStatus
          }

          await apiFetch(order.id, { method: "PUT", body: JSON.stringify(payload) }).then((res) => {
            if (!res.ok) {
              throw new Error(`Order update failed: ${res.status}`)
            }

            setOrderData(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
            setSelectedOrder(prev => prev.id === order.id ? { ...prev, status: newStatus } : prev);
          }).catch((err) => {
            alert(`Error: ${err}`)
          })

        } catch (e) {
          alert(`Error occured: ${e}`)
        }
      }}>
      <option value="0" className='dark-gray'>Created</option>
      <option value="1" className='darker-gray'>Ordered</option>
      <option value="2" className='dark-gray'>Arrived</option>
      <option value="3" className='darker-gray'>Finished</option>
      <option value="4" className='dark-gray'>Reported</option>
      <option value="5" className='darker-gray'>Delivered</option>
    </select>
  }

  const breakLine = () => {
    return <div className='h-px w-full bg-white my-2'></div>;
  }

  return (
    <div className={`${Cookies.get('x-api-key') == undefined ? "hidden" : ""} relative w-full lg:w-5/6 text-white pt-5 mx-auto`}>
      <div className={`${dataTableHidden || dataTableFormShown ? "blur-sm pointer-events-none z-0" : ""} white-border p-1 `}>
        <table className='text-xl md:text-xl lg:text-2xl w-full text-center'>
          <thead className='text-3xl md:text-xl lg:text-3xl  border-b'>
            <tr>
              <th>Name</th>
              {
                !isMobile ? <th>QuantityGroups</th> : null
              }
              {
                !isMobile && !isTablet ?
                  <th className='text-center'>
                    <div className='flex justify-self-center gap-2'>
                      <button  onClick={() => { handleSortChange("createdAt") }}>
                        {`Created At`}
                      </button>

                        <p className={`${sortBy === "createdAt" ? "" : "hidden"} ${descending ? "rotate-180" : ""}`}>{"⏷"}
                        </p>
                    </div>
                  </th>
                  : null
              }
              <th>
                <div className='flex justify-center gap-2'>
                  <button onClick={() => { handleSortChange("deadline") }}>
                    Deadline
                  </button>
                    <p className={`${sortBy === "deadline" ? "" : "hidden"} ${descending ? "rotate-180" : ""}`}>{"⏷"}
                    </p>

                </div>
              </th>
              {
                !isMobile ?
                  <th>
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
                      <option value="null" className='dark-gray'>Status</option>
                      <option value="0"className='darker-gray'>{OrderStatusMap[0]}</option>
                      <option value="1" className='dark-gray'>{OrderStatusMap[1]}</option>
                      <option value="2" className='darker-gray'>{OrderStatusMap[2]}</option>
                      <option value="3" className='dark-gray'>{OrderStatusMap[3]}</option>
                      <option value="4" className='darker-gray'>{OrderStatusMap[4]}</option>
                      <option value="5" className='dark-gray'>{OrderStatusMap[5]}</option>
                    </select>
                  </th>
                  : null
              }

              {
                !isMobile && !isTablet ? <th>Price</th> : null
              }
              <th className='w-10'></th>
            </tr>
          </thead>
          <tbody>
            {orderData.map((order, index) => {
              return (
                <tr key={order.id} className={`${(index + 2) % 2 == 0 ? "bg-[#171717]" : ""}`}>
                  <td>{order.name}</td>

                  {
                    !isMobile ?
                      <td>{order.quantityGroups.map((group) => {
                        return (
                          <div key={group.id}>
                            <h4>{group.groupKey}</h4>
                            <div>{group.quantities.map((quantity) => {
                              return (
                                <div key={quantity.id}>
                                  <p>{quantity.size}-{quantity.quantity}kom</p>
                                </div>
                              );
                            })}</div>
                          </div>
                        );
                      })}</td>
                      : null
                  }
                  {
                    !isMobile && !isTablet ? <td>{new Date(order.createdAt).toLocaleDateString("en-GB")}</td> : null
                  }
                  <td>{new Date(order.deadline).toLocaleDateString("en-GB")}</td>

                  {
                    !isMobile ?
                      <td>
                        {statusSelect(index, order)}
                      </td>
                      : null
                  }
                  {
                    !isMobile && !isTablet ? <td>{`€${order.totalPrice}`}</td> : null
                  }
                  <td className='w-1/3 md:w-1/6 lg:w-1/10'>
                    <div className='flex gap-1'>
                      {
                        isMobile ? <button onClick={() => { handleOnViewMore(index) }}><img src={`./icon-view-more.png`} alt="view more icon" /></button> : null
                      }
                      <button onClick={() => handleOrderForm("PUT", order.id)}><img src={`./icon-edit.png`} alt='edit icon' /></button>
                      <button onClick={() => { requestDelete(order.id, order.name) }}><img src={`./icon-delete.png`} alt='delete icon' /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            <tr className='border-t'>
              <td colSpan={isMobile ? 3 : isTablet ? 5 : 7}>
                <div className='text-center text-xl lg:text-5xl'>
                  <button
                    type="button"
                    onClick={() => {
                      handleOrderForm("POST");
                    }}
                  >
                    +
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {
        (dataTableHidden && isMobile && selectedOrder.id !== '') ? 
          <div className='dark-gray absolute text-2xl w-full white-border top-3 z-1 p-4'>
            <div className='w-full relative'>
              <button
                type="button"
                className='red-button absolute px-2 top-0 right-0'
                onClick={() => {
                  setSelectedOrder(emptyOrder);
                  setDataTableHidden(false);
                }}
              >X</button>
              <h3 className='pt-2 text-center'>{`${selectedOrder.name}`}</h3>
              {breakLine()}
              <div className='pl-3'>
                {selectedOrder.quantityGroups.map((_, index) => {
                  return <div key={`quantityGroup-${index}`}>
                    <h3>{`${selectedOrder.quantityGroups[index].groupKey}`}</h3>
                    <div className='pl-7'>
                      {
                        selectedOrder.quantityGroups[index].quantities.map((_, jndex) => {
                          return <div key={`quantity-${jndex}`}>
                            <h3>{`${selectedOrder.quantityGroups[index].quantities[jndex].size}-${selectedOrder.quantityGroups[index].quantities[jndex].quantity}`}</h3>
                          </div>
                        })
                      }
                    </div>
                  </div>
                })}
              </div>
              {breakLine()}
              <h3>{`Created At: ${new Date(selectedOrder.createdAt).toLocaleDateString("en-GB")}`}</h3>
              <h3>{`Deadline At: ${new Date(selectedOrder.deadline).toLocaleDateString("en-GB")}`}</h3>
              <h3>{`Price: €${selectedOrder.totalPrice}`}</h3>
              {statusSelect(0, selectedOrder)}
            </div>
          </div>
          : null
      }
      <OrderForm dataTableFormShown={dataTableFormShown} postOrPut={postOrPut} selectedId={selectedId} setSelectedId={() => setSelectedId("")} onClose={() => {
        setDataTableFormShown(false);
        setDataTableHidden(false);
      }} orderData={orderData} onSuccessPOST={(data: Order) => { 
        if(orderData.length >= 10){
          setNumberOfPages(prev => prev + 1);
        }
        setOrderData(prev => prev.length >= 10 ? [...prev] :[...prev, data]);
      }} onSuccessPUT={(data:Order) => {
        setOrderData(prev => prev.map(order => order.id === data.id ? data : order));
      }}/>
      <ConfirmDelete orderName={deleteOrderName} orderId={deleteOrderId} deleteWindowVisible={deleteWindowVisible} onClose={() => {
        setDeleteOrderId('');
        setDeleteOrderName('');
        setDeleteWindowVisible(false);
        setDataTableHidden(false);
      }} onDelete={(id:string) => {
        setOrderData(prev => {
          const next = prev.filter(order => order.id !== id);
          if(next.length < 1){
            setSelectedPage(page => page === 1 ? page : page - 1);
          }
          return next;
        })

      }}/>
      <div className={`flex lg:text-3xl lg:pt-5 gap-2 justify-center ${dataTableHidden ? "hidden" : null}`}>
        <button onClick={() => { setSelectedPage(page => page === 1 ? page : page - 1) }}>{"<"}</button>
        <p>{`${selectedPage}/${numberOfPages}`}</p>
        <button onClick={() => { setSelectedPage(page => page === numberOfPages ? page : page + 1) }}>{">"}</button>
      </div>
    </div>
  )
}
