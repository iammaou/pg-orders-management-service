import Cookies from 'js-cookie'
import { useEffect, useState, useRef, type RefObject } from 'react'
import { OrderForm } from './OrderForm';
import { type EditOrder, type Order } from '../types/Interfaces'
import "../App.css"
import { apiFetch } from '../apiFetch';
import { useMediaQuery } from 'react-responsive';
import ConfirmDelete from './ConfirmDelete';
import FunnelForFilters from './FunnelForFilters';

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
  totalPrice: 0,
  isHandover: false
}

export interface deleteArray {
  id: string,
  name: string,
  value: boolean
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
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortBy, setSortBy] = useState<"createdAt" | "deadline">("createdAt");
  const [descending, setDescending] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<"Created" | "Ordered" | "Arrived" | "Finished" | "ReportedAsFinished" | "Delivered" | "null">("null");
  const [filterIsHandover, setFilterIsHandover] = useState<boolean>(false);
  const [deleteWindowVisible, setDeleteWindowVisible] = useState<boolean>(false);
  const [deleteOrderQue, setDeleteOrderQue] = useState<deleteArray[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [deleteSelected, setDeleteSelected] = useState<deleteArray[]>([]);
  const [numOfSelected, setNumOfSelected] = useState<number>(0);
  const [filterPopUpVisible, setFilterPopUpVisible] = useState<boolean>(false);
  const filterRef = useClickOutside<HTMLTableCellElement>(() => setFilterPopUpVisible(false));
  const [viewHistory, setViewHistory] = useState<boolean>(false);

  async function getOrders(signal?: AbortSignal) {
    console.log(viewHistory)
    if (!isFetching) {
      setIsFetching(true);
      await apiFetch(`?Page=${selectedPage}&PageSize=${pageSize}&SortBy=${sortBy}&IsDescending=${descending}${statusFilter === "null" ? "" : "&Status=" + statusFilter}&isHandover=${filterIsHandover}`, { method: 'GET', signal }, viewHistory).then((res) => {
        if (res.status === 401) {
          onApiKeyReset();
          return;
        }
        if (!res.ok) {
          throw new Error(`Get failed: ${res.status}`);
        } else {
          return res.json();
        }

      })
        .then((data) => {
          setSelectedPage(data.page);
          setNumberOfPages(Math.max(1, Math.ceil(data.totalCount / data.pageSize)));
          setPageSize(data.pageSize);

          var orderItems: Order[] = data.items;

          setOrderData(orderItems);

          var copyDeleteSelected: deleteArray[] = [];
          orderItems.forEach(order => {
            copyDeleteSelected = [...copyDeleteSelected, {
              id: order.id,
              name: order.name,
              value: false
            }]
          });

          setDeleteSelected(copyDeleteSelected);

        }).catch((err) => {
          alert(`Error: ${err}`)
        })
      setIsFetching(false);
    }
  }

  async function requestDelete() {
    setDeleteOrderQue(deleteSelected);
    setDataTableHidden(true);
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

  const handleCheckboxClick = (index?: number) => {
    if(index === undefined) {
      const allSelected = numOfSelected === deleteSelected.length && deleteSelected.length >0;

      setDeleteSelected(prev => prev.map(o => ({...o, value: !allSelected})));
      return;
    } else{
      const i = index - 1;
      setDeleteSelected(prev => {
        return prev.map((order, j) => j === i ? {...order, value: !order.value} : order)
      }
      )
    }
  }

  useEffect(() => {
    let selected = 0;

    deleteSelected.forEach(order => {
      if (order.value === true) {
        selected++;
      }
    })
    setNumOfSelected(selected);
  }, [deleteSelected])

  useEffect(() => {
    const abortController = new AbortController();
    getOrders(abortController.signal);
  }, [selectedPage, descending, sortBy, statusFilter, filterIsHandover, viewHistory]);

  useEffect(() => {
    setSelectedPage(1);
  }, [descending, sortBy, statusFilter]);

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

  const statusSelect = (index: number, order: Order) => {
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
            status: newStatus,
            isHandover: order.isHandover
          }

          await apiFetch(order.id, { method: "PUT", body: JSON.stringify(payload) }, viewHistory).then((res) => {
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

  function useClickOutside<T extends HTMLElement = HTMLElement>(callback: (event:MouseEvent | TouchEvent) => void
  ): RefObject<T | null> {
    const ref = useRef<T>(null);

    useEffect(() => {
      function handleClick(event: MouseEvent | TouchEvent){
        const target = event.target as Node;
        if(ref.current && !ref.current.contains(target)){
          callback(event);
        }
      }

      document.addEventListener('mousedown', handleClick);
      document.addEventListener('touchstart', handleClick);

      return () => {
        document.removeEventListener('mousedown', handleClick);
        document.removeEventListener('touchstart', handleClick);
      };
    }, [callback]);

    return ref;
  }

  return (
    <div className={`${Cookies.get('x-api-key') == undefined ? "hidden" : ""} relative w-full lg:w-5/6 text-white pt-5 mx-auto`}>
      <div className={`${dataTableHidden || dataTableFormShown ? "blur-sm pointer-events-none z-0" : ""} white-border p-1 `}>
        <table className='text-xl md:text-lg lg:text-3xl w-full text-center'>
          <thead className={`text-2xl md:text-md lg:text-3xl ${isFetching ? "" : "border-b"}`}>
            <tr className={isFetching ? "" : "hidden"}>
              <th colSpan={8}>
                LOADING...
              </th>
            </tr>
            <tr className={!isFetching ? "" : "hidden"}>
              <th className={`${orderData.length === 0 ? "hidden" : ""}`}>
                <input type="checkbox" className='checkbox' checked={(() => {
                  let numOfSelected = 0;
                  deleteSelected.forEach(selection => {
                    if (selection.value == true) {
                      numOfSelected++;
                    }
                  })

                  if (numOfSelected === deleteSelected.length) return true;

                  return false;
                })()} name="checkbox-all" id="checkbox-all" onChange={() => handleCheckboxClick()} />
              </th>
              <th>Name</th>
              {
                !isMobile ? <th>QuantityGroups</th> : null
              }
              {
                !isMobile && !isTablet ?
                  <th className='text-center'>
                    <div className='flex justify-self-center gap-2'>
                      <button onClick={() => { handleSortChange("createdAt") }}>
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
                    Status
                  </th>
                  : null
              }

              {
                !isMobile && !isTablet ? <th>Price</th> : null
              }
              <th className='w-10' ref={filterRef}>
                <button className='button-size border-white border hover:bg-white hover:text-[#1f1f1f]' onClick={() => setFilterPopUpVisible(prev => !prev)}>Filter</button>
                <div className={filterPopUpVisible ? "" : "hidden"}>
                  <FunnelForFilters setStatusFilter={(status:"Created" | "Ordered" | "Arrived" | "Finished" | "ReportedAsFinished" | "Delivered" | "null") => setStatusFilter(status)} filterIsHandover={filterIsHandover} toggleFilterIsHandover={() => setFilterIsHandover(prev => !prev)}/>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {orderData.map((order, index) => {
              return (
                <tr key={order.id} className={`${(index + 2) % 2 == 0 ? "bg-[#171717]" : ""} ${!isFetching ? "" : "hidden"}`}>
                  <td>
                    <input type="checkbox" className='checkbox' checked={deleteSelected[index].value} id={`checkbox-${index}`} onChange={() => handleCheckboxClick(index + 1)} />
                  </td>

                  <td>{order.name}</td>

                  {
                    !isMobile ?
                      <td>{order.quantityGroups.map((group) => {
                        return (
                          <div key={group.id} className='flex justify-center gap-3 text-left'>
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
                  <td className='w-1/3 md:w-1/6 lg:w-1/20'>
                    <div className='flex gap-1 justify-center'>
                      {
                        isMobile ? <button className='button-size border border-white hover:bg-white hover:text-[#1f1f1f]' onClick={() => { handleOnViewMore(index) }}>View More</button> : null
                      }
                      <button className='button-size border-white border hover:bg-white hover:text-[#1f1f1f]' onClick={() => handleOrderForm("PUT", order.id)}>
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className={`${dataTableHidden || dataTableFormShown || isFetching ? "hidden" : null} text-center flex justify-center text-xl lg:text-5xl fixed bottom-10 right-20 rounded-lg border border-[#980b17] bg-[#e81123] hover:bg-[#980b17]`}>
        <button
          type="button"
          className='flex items-center justify-center w-5 h-5 p-10'
          onClick={() => {
            handleOrderForm("POST");
          }}
        >
          +
        </button>
      </div>
      <div className={`${numOfSelected === 0 || dataTableHidden || dataTableFormShown ? "hidden" : ""} text-center flex justify-center text-lg lg:text-2xl fixed bottom-10 right-45`}>
        <button
          onClick={() => requestDelete()}
          className='w-30 h-20.5 items-center rounded-lg border border-[#980b17] bg-[#e81123] hover:bg-[#980b17]'>
          Delete
        </button>
      </div>
      <div className='text-center flex justify-center text-lg lg:text-2xl fixed bottom-10 left-20'>
        <button
          className={`w-30 h-20.5 items-center rounded-lg border ${viewHistory ? "border-white bg-[#1f1f1f] hover:bg-white hover:text-[#1f1f1f]" : "border-[#980b17] bg-[#e81123] hover:bg-[#980b17]"}`}
          onClick={() => setViewHistory(prev => !prev)}
        >History</button>
      </div>
      {
        (dataTableHidden && isMobile && selectedOrder.id !== '') ?
          <div className='dark-gray absolute text-2xl w-3/4 white-border top-3 z-1 p-4 flex justify-center left-1/2 -translate-x-1/2'>
            <div className='w-full relative'>
              <button
                type="button"
                className='red-button absolute right-0 px-3 rounded-lg'
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
        if (orderData.length >= 10) {
          setNumberOfPages(prev => prev + 1);
        }
        setOrderData(prev => prev.length >= 10 ? [...prev] : [...prev, data]);
        setDeleteSelected(prev => [...prev, {
          id: data.id,
          name: data.name,
          value: false
        }])
      }} onSuccessPUT={(data: Order) => {
        setOrderData(prev => prev.map(order => order.id === data.id ? data : order));
      }} />
      <ConfirmDelete orderQue={deleteOrderQue} viewHistory={viewHistory} deleteWindowVisible={deleteWindowVisible} onClose={() => {
        setDeleteOrderQue([]);
        setDeleteWindowVisible(false);
        setDataTableHidden(false);

      }} onDelete={(id: string) => {
        setOrderData(prev => {
          const next = prev.filter(order => order.id !== id);
          if (next.length < 1) {
            setSelectedPage(page => page === 1 ? page : page - 1);
          }
          return next;
        });
        setDeleteSelected(prev => {
          return prev.filter(order => order.id !== id)
        });

        const abortController = new AbortController();
        getOrders(abortController.signal);
      }} />
      <div className={`flex text-3xl pt-5 gap-2 justify-center ${dataTableHidden || dataTableFormShown || isFetching ? "hidden" : null}`}>
        <button onClick={() => { setSelectedPage(page => page === 1 ? page : page - 1) }}>{"<"}</button>
        <p>{`${selectedPage}/${numberOfPages}`}</p>
        <button onClick={() => { setSelectedPage(page => page === numberOfPages ? page : page + 1) }}>{">"}</button>
      </div>
    </div>
  )
}
