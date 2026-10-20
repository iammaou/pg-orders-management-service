import Cookies from 'js-cookie'
import { useState } from 'react'

interface Order {
    id: string,
    name: string,
    quantityGroups: QuantityGroup[],
    createdAt: string,
    deadline: string,
    status: number,
    totalPrice: number
}

interface QuantityGroup{
    id: number,
    groupKey: string,
    quantities: Quantity[]
}

interface Quantity{
    id: number,
    size: string,
    quantity: number
}

export const DataTable = () => {
    const [orderData, setOrderData] = useState<Order[]>([]);

    async function getOrders() {
        await fetch('http://localhost:8080/api/Order', {
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
        })

        console.log(orderData);
    }   
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
                                                    <p>{quantity.size}</p>
                                                    <h6>{quantity.quantity}</h6>
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
                        </tr>
                    );
                })}
            </tbody>
        </table>
        <button onClick={getOrders}>asdasd</button>
    </div>
  )
}
