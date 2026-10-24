import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import { OrderForm } from './OrderForm';
import {type Order} from '../types/Interfaces'
import "../App.css"

export const apiUrl:string = "http://localhost:8080/api/Order";

export const DataTable = () => {
    const [dataTableFormShown, setDataTableFormShown] = useState<boolean>(false);
    const [orderData, setOrderData] = useState<Order[]>([]);

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
                                  <th>{order.status}</th>
                                  <th>{order.totalPrice}</th>
                                  <th><button>E</button></th>
                                  <th><button onClick={() => {deleteOrder(order.id)}}>D</button></th>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
              <button type="button" onClick={() => {
                    dataTableFormShown == false ? setDataTableFormShown(true) : setDataTableFormShown(false);
                }}>Add New Order</button>
              <OrderForm dataTableFormShown={dataTableFormShown}/>
          </div>
        )
    }
