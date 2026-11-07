import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import { OrderForm } from './OrderForm';
import { type EditOrder, type Order } from '../types/Interfaces'
import "../App.css"
import { apiFetch } from '../apiFetch';

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

export const DataTable = ({ onApiKeyReset }: props) => {
  const [dataTableFormShown, setDataTableFormShown] = useState<boolean>(false);
  const [orderData, setOrderData] = useState<Order[]>([]);
  const [postOrPut, setPostOrPut] = useState<"POST" | "PUT">("POST");
  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [numberOfPages, setNumberOfPages] = useState<number>(1);
  const [sortBy, setSortBy] = useState<"createdAt" | "deadline">("createdAt");
  const [descending, setDescending] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<"Created" | "Ordered" | "Arrived" | "Finished" | "ReportedAsFinished" | "Delivered" | "null">("null");

  async function getOrders() {
    await apiFetch(`?Page=${selectedPage}&SortBy=${sortBy}&IsDescending=${descending}${statusFilter === "null" ? "" : "&Status=" + statusFilter}`, { method: 'GET' }).then((res) => {
      if (!res.ok && res.status !== 401) {
        throw new Error(`Get failed: ${res.status}`);
      } else if (res.status === 401) {
        onApiKeyReset();
      }

      return res.json();
    })
      .then((data) => {
        setSelectedPage(data.page);
        setNumberOfPages(Math.floor(data.totalCount / data.pageSize) + 1);
        setOrderData(data.items);
      }).catch((err) => {
        alert(`Error: ${err}`)
      })
  }

  async function deleteOrder(id: string) {
    await apiFetch(id, { method: 'DELETE' }).then((res) => {
      if (!res.ok) {
        alert(`Delete failed: ${res.status}`)
        return
      }

      setOrderData((prev) => prev.filter(order => order.id !== id));
    }).catch((err) => {
      alert(`Error: ${err}`)
    })
  }

  const handleOrderForm = (method: "POST" | "PUT", id?: string) => {
    setPostOrPut(method);
    if (method == "PUT" && id) {
      setSelectedId(id)
    }
    dataTableFormShown == false ? setDataTableFormShown(true) : setDataTableFormShown(false);
  }

  useEffect(() => {
    getOrders();
  }, [selectedPage, descending, sortBy, statusFilter]);

  const handleSortChange = (newlySelected: "createdAt" | "deadline") => {
    if (sortBy === newlySelected) {
      setDescending(!descending);
    } else {
      setDescending(false);
    }
    setSortBy(newlySelected);
  }

  return (
    <div className={`${Cookies.get('x-api-key') == undefined ? "hidden" : ""}`}>
      <div className={`${dataTableFormShown ? "blur-sm pointer-events-none z-0" : ""}`}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity Groups</th>
              <th>
                <button onClick={() => { handleSortChange("createdAt") }}>
                  {`Created At`}
                  <p className={`${sortBy === "createdAt" ? "" : "hidden"} ${descending ? "rotate-180" : ""}`}>{"⏷"}
                  </p>
                </button>
              </th>
              <th>
                <button onClick={() => { handleSortChange("deadline") }}>
                  {`Deadline`}
                  <p className={`${sortBy === "deadline" ? "" : "hidden"} ${descending ? "rotate-180" : ""}`}>{"⏷"}
                  </p>
                </button>
              </th>
              <th>
                <select name="filter" id="filter" onChange={(e) => {
                  const newStatus = Number(e.target.value);
                  switch(newStatus){
                    case 0: setStatusFilter("Created"); break;
                    case 1: setStatusFilter("Ordered"); break;
                    case 2: setStatusFilter("Arrived"); break;
                    case 3: setStatusFilter("Finished"); break;
                    case 4: setStatusFilter("ReportedAsFinished"); break;
                    case 5: setStatusFilter("Delivered"); break;
                    default: setStatusFilter("null"); break;
                  }
                }}>
                  <option value="null">Status</option>
                  <option value="0">{OrderStatusMap[0]}</option>
                  <option value="1">{OrderStatusMap[1]}</option>
                  <option value="2">{OrderStatusMap[2]}</option>
                  <option value="3">{OrderStatusMap[3]}</option>
                  <option value="4">{OrderStatusMap[4]}</option>
                  <option value="5">{OrderStatusMap[5]}</option>
                </select>
              </th>
              <th>Price</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orderData.map((order, index) => {
              return (
                <tr key={order.id} className={`${(index + 2) % 2 == 0 ? "bg-[#171717]" : ""}`}>
                  <td>{order.name}</td>
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
                  <td>{new Date(order.createdAt).toLocaleDateString("en-GB")}</td>
                  <td>{new Date(order.deadline).toLocaleDateString("en-GB")}</td>
                  <td>
                    <select name="statusSelect" id={`statusSelect-${index}`} value={order.status} onChange={
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
                              alert(`Edit error: ${res.status}`);
                              return;
                            }

                            setOrderData(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
                          }).catch((err) => {
                            alert(`Error: ${err}`)
                          })

                        } catch (e) {
                          alert(`Error occured: ${e}`)
                        }
                      }}>
                      <option value="0">Created</option>
                      <option value="1">Ordered</option>
                      <option value="2">Arrived</option>
                      <option value="3">Finished</option>
                      <option value="4">Reported</option>
                      <option value="5">Delivered</option>
                    </select>
                  </td>
                  <td>{`${order.totalPrice}€`}</td>
                  <td>
                    <div>
                      <button onClick={() => handleOrderForm("PUT", order.id)}><img src='./icon-edit.png' alt='edit icon' /></button>
                      <button onClick={() => { deleteOrder(order.id) }}><img src='./icon-delete.png' alt='delete icon' /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            <tr>
              <td colSpan={7}>
                <div>
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
      <OrderForm dataTableFormShown={dataTableFormShown} postOrPut={postOrPut} selectedId={selectedId} setSelectedId={() => setSelectedId("")} onClose={() => setDataTableFormShown(false)} orderData={orderData} onSuccess={(data: Order[]) => { setOrderData(data) }} />
      <div>
        <button onClick={() => { setSelectedPage(selectedPage === 1 ? selectedPage : selectedPage - 1) }}>{"<"}</button>
        <p>{`${selectedPage}/${numberOfPages}`}</p>
        <button onClick={() => { setSelectedPage(selectedPage === numberOfPages ? selectedPage : selectedPage + 1) }}>{">"}</button>
      </div>
    </div>
  )
}
