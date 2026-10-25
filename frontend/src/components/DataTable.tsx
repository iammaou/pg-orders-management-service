import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import { OrderForm } from './OrderForm';
import {type EditOrder, type Order} from '../types/Interfaces'
import "../App.css"

export const apiUrl:string = "http://localhost:8080/api/Order";

export const OrderStatusMap: Record<number, string> = {
  0: 'Created',
  1: 'Ordered',
  2: 'Finished',
  3: 'Reported As Finished',
  4: 'Delivered',
};

export const DataTable = () => {
    const [dataTableFormShown, setDataTableFormShown] = useState<boolean>(false);
    const [orderData, setOrderData] = useState<Order[]>([]);
    const [postOrPut, setPostOrPut] = useState<"POST" | "PUT">("POST");
    const [selectedId, setSelectedId] = useState<string>('');

    async function getOrders() {
        await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-api-key': `${Cookies.get('x-api-key')}`,
            },
        })
        .then((res) => {
            return res.json()
        })
        .then((data) => {
            setOrderData(data.items);
        }).catch((err) => {
            console.error(err);
        })
    }   

    async function deleteOrder(id:string) {
        await fetch(`${apiUrl}/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-api-key': `${Cookies.get('x-api-key')}`
            }
        })
        .then(() => {
            window.location.reload();
        })
    }

    const handleOrderForm = (method:"POST"|"PUT", id?:string) => {
        setPostOrPut(method);
        if(method == "PUT" && id){
            setSelectedId(id)
        }
        dataTableFormShown == false ? setDataTableFormShown(true) : setDataTableFormShown(false);
    }

        useEffect(() => {
            getOrders();
        }, []);

        return (
          <div>
              <table>
                  <thead>
                      <tr>
                          <th>Name</th>
                          <th>Quantity Groups</th>
                          <th>Created At</th>
                          <th>Deadline</th>
                          <th>Status</th>
                          <th>Total Price</th>
                          <th>Edit</th>
                          <th>Delete</th>
                      </tr>
                  </thead>
                  <tbody>
                      {orderData.map((order) => {
                          return(
                              <tr key={order.id}>
                                  <th>{order.name}</th>
                                  <th>{order.quantityGroups.map((group) => {
                                      return(
                                          <div key={group.id}>
                                              <h4>{group.groupKey}</h4>
                                              <div>{group.quantities.map((quantity) => {
                                                  return(
                                                      <div key={quantity.id}>
                                                          <p>{quantity.size}-{quantity.quantity}kom</p>
                                                      </div>
                                                  );
                                              })}</div>
                                          </div>
                                      );
                                  })}</th>
                                  <th>{new Date(order.createdAt).toLocaleDateString()}</th>
                                  <th>{new Date(order.deadline).toLocaleDateString()}</th>
                                  {/* <th>{OrderStatusMap[order.status]}</th> */}
                                  <th>
                                    <select name="statusSelect" id="statusSelect" value={order.status} onChange={async(e) => {
                                         try{
                                            const payload: EditOrder = {
                                                name: order.name,
                                                deadline: order.deadline,
                                                totalPrice: order.totalPrice,
                                                quantityGroups: order.quantityGroups,
                                                createdAt: order.createdAt,
                                                status: Number(e.target.value)
                                            }

                                            await fetch(`${apiUrl}/${order.id}`, {
                                                method: "PUT",
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'X-api-key': `${Cookies.get('x-api-key')}`,
                                                },
                                                body: JSON.stringify(payload)
                                            })

                                            window.location.reload();

                                        } catch (e) {
                                            console.error(e);
                                        }
                                    }}>
                                        <option value="0">Created</option>
                                        <option value="1">Ordered</option>
                                        <option value="2">Finished</option>
                                        <option value="3">Reported As Finished</option>
                                        <option value="4">Delivered</option>
                                    </select>
                                  </th>
                                  <th>{`${order.totalPrice}€`}</th>
                                  <th><button onClick={() => handleOrderForm("PUT", order.id)}>E</button></th>
                                  <th><button onClick={() => {deleteOrder(order.id)}}>D</button></th>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
              <button type="button" onClick={() => {
                    handleOrderForm("POST");
                }}>Add New Order</button>
              <OrderForm dataTableFormShown={dataTableFormShown} postOrPut={postOrPut} selectedId={selectedId}/>
          </div>
        )
    }
