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
  2: 'Finished',
  3: 'Reported',
  4: 'Delivered',
};

export const DataTable = ({onApiKeyReset}:props) => {
  const [dataTableFormShown, setDataTableFormShown] = useState<boolean>(false);
  const [orderData, setOrderData] = useState<Order[]>([]);
  const [postOrPut, setPostOrPut] = useState<"POST" | "PUT">("POST");
  const [selectedId, setSelectedId] = useState<string>('');

  async function getOrders() {
    await apiFetch("", { method: 'GET' }).then((res) => {
      if (!res.ok && res.status !== 401) {
        throw new Error(`Get failed: ${res.status}`);
      } else if (res.status === 401) {
        onApiKeyReset();
      }

      return res.json();
    })
      .then((data) => {
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
  }, []);

  return (
    <div className={`${Cookies.get('x-api-key') == undefined ? "hidden" : ""} flex flex-col w-full pt-10 items-center`}>
      <div className={`border rounded-lg w-5/6 px-10 py-5 ${dataTableFormShown ? "blur-sm pointer-events-none z-0" : ""}`}>
        <table className='w-full table-fixed'>
          <thead>
            <tr className='border-b'>
              <th>Name</th>
              <th>Quantity Groups</th>
              <th>Created At</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Price</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orderData.map((order, index) => {
              return (
                <tr key={order.id} className={`${(index + 2) % 2 == 0 ? "bg-[#171717]" : ""} border-b text-center`}>
                  <td>{order.name}</td>
                  <td>{order.quantityGroups.map((group) => {
                    return (
                      <div key={group.id} className='flex gap-1 justify-center'>
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
                    <select name="statusSelect" className='bg-[#171717] border p-3' id={`statusSelect-${index}`} value={order.status} onChange={
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
                      <option value="1" className='bg-[#1f1f1f]'>Ordered</option>
                      <option value="2">Finished</option>
                      <option value="3" className='bg-[#1f1f1f]'>Reported</option>
                      <option value="4">Delivered</option>
                    </select>
                  </td>
                  <td>{`${order.totalPrice}€`}</td>
                  <td className='w-full h-full'>
                    <div className='flex'>
                      <button onClick={() => handleOrderForm("PUT", order.id)}><img src='./icon-edit.png' alt='edit icon' className='w-3/6' /></button>
                      <button onClick={() => { deleteOrder(order.id) }}><img src='./icon-delete.png' alt='delete icon' className='w-3/6' /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            <tr className='text-center justify-center w-full text-5xl'>
              <td colSpan={7}>
                <div className='w-full flex justify-center h-10'>
                  <button
                    type="button"
                    onClick={() => {
                      handleOrderForm("POST");
                    }}
                    className='w-full'>
                    +
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <OrderForm dataTableFormShown={dataTableFormShown} postOrPut={postOrPut} selectedId={selectedId} setSelectedId={() => setSelectedId("")} onClose={() => setDataTableFormShown(false)} orderData={orderData} onSuccess={(data: Order[]) => { setOrderData(data) }} />
    </div>
  )
}
