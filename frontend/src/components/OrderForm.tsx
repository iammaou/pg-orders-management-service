import { useEffect, useState } from "react"
import { type NewOrder, type NewQuantityGroup, type EditOrder } from "../types/Interfaces";
import { apiUrl } from "./DataTable";
import Cookies from 'js-cookie'

interface props {
    dataTableFormShown: boolean,
    postOrPut: "POST" | "PUT",
    selectedId: string,
    onClose: () => void
}

export const OrderForm = ({ dataTableFormShown, postOrPut, selectedId, onClose }: props) => {
    const [quantityGroups, setQuantityGroups] = useState<NewQuantityGroup[]>(
        [
            {
                groupKey: '',
                quantities: [
                    {
                        size: '',
                        quantity: 0
                    }
                ]
            }
        ]);
    const [name, setName] = useState<string>('');
    const [deadline, setDeadline] = useState<string>('');
    const [price, setPrice] = useState<number>(0);
    const [oldCreatedAt, setOldCreatedAt] = useState<string>('');
    const [createdAt, setCreatedAt] = useState<string>('');
    const [orderStatus, setOrderStatus] = useState<number>(0);

    const quantityGroupValueHelper = (index: number, groupName: string) => {
        var newQuantityGroups = [...quantityGroups];

        newQuantityGroups[index].groupKey = groupName != '' ? groupName : newQuantityGroups[index].groupKey;

        setQuantityGroups(newQuantityGroups);

    }

    const SizeValueHelper = (index: number, jndex: number, size?: string, quantity?: number) => {
        var newQuantityGroups = [...quantityGroups];

        if (size != undefined) {
            newQuantityGroups[index].quantities[jndex].size = size;
        } else if (quantity != undefined) {
            newQuantityGroups[index].quantities[jndex].quantity = quantity
        }

        setQuantityGroups(newQuantityGroups);
    }

    const modifyQuantityGroupAmount = (index?: number) => {
        var newQuantityGroups = [...quantityGroups];

        if (index != undefined && quantityGroups.length > 1) {
            newQuantityGroups = newQuantityGroups.filter((_, i) => i !== index);
        } else if (index == undefined) {
            newQuantityGroups.push(
                {
                    groupKey: '',
                    quantities: [
                        {
                            size: '',
                            quantity: 0
                        }
                    ]
                }
            );
        }

        setQuantityGroups(newQuantityGroups);
    }

    const modifyQuantityAmout = (index: number, jndex?: number) => {

        var newQuantityGroups = [...quantityGroups];

        if (jndex != undefined && quantityGroups[index].quantities.length > 1) {
            newQuantityGroups[index].quantities = newQuantityGroups[index].quantities.filter((_, j) => j !== jndex)
        } else if (jndex == undefined) {
            newQuantityGroups[index].quantities.push(
                {
                    size: '',
                    quantity: 0
                }
            )
        }

        setQuantityGroups(newQuantityGroups);
    }

    async function sendData(payload: NewOrder, postOrPut: "POST" | "PUT", id?: string) {
        return await fetch(!id ? apiUrl : apiUrl + `/${id}`, {
            method: postOrPut.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
                'X-api-key': `${Cookies.get('x-api-key')}`
            },
            body: JSON.stringify(payload)
        });
    }

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        if (postOrPut == "POST") {
            const payload: NewOrder = {
                name: name,
                deadline: deadline,
                totalPrice: price == undefined ? 0 : price,
                quantityGroups: quantityGroups
            }

            try {
                const response = await sendData(payload, postOrPut);

                if (!response.ok) {
                    alert(`Failed to send data!`);
                } else {
                    window.location.reload();
                }


            } catch (e) {
                console.error(`Error occured: ${e}`)
            }
        } else {
            const payload: EditOrder = {
                name: name,
                deadline: deadline,
                totalPrice: price,
                quantityGroups: quantityGroups,
                createdAt: oldCreatedAt,
                status: orderStatus
            }

            try {
                const response = await sendData(payload, postOrPut, selectedId);

                if (!response.ok) {
                    alert("Failed to send data!");
                } else {
                    window.location.reload();
                }
            } catch (e) {
                console.error(`Error occured: ${e}`);
            }
        }
    }

    useEffect(() => {
        if (postOrPut == "PUT" && selectedId) {
            console.log(`${apiUrl}/${selectedId}`)

            async function getData(id: string) {
                await fetch(`${apiUrl}/${id}`, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'X-api-key': `${Cookies.get('x-api-key')}`
                    }
                }).then(res => res.json())
                    .then(data => {
                        setName(data.name);
                        setQuantityGroups(data.quantityGroups);
                        setOldCreatedAt(data.createdAt);
                        setCreatedAt(() => {
                            const date = new Date(data.createdAt);

                            const correctedDate = new Date(date.getTime() + (2 * 60 * 60 * 1000));

                            const year = correctedDate.getFullYear();
                            const month = String(correctedDate.getMonth() + 1).padStart(2, '0');
                            const day = String(correctedDate.getDate()).padStart(2, '0');
                            const hours = String(correctedDate.getHours()).padStart(2, '0');
                            const minutes = String(correctedDate.getMinutes()).padStart(2, '0');

                            return `${year}-${month}-${day}T${hours}:${minutes}`;
                        });
                        setOrderStatus(data.status);
                        setDeadline(data.deadline);
                        setPrice(data.totalPrice);
                    });
            }

            getData(selectedId);
        }
    }, [selectedId])

    const resetState = () => {
        setQuantityGroups(
            [
                {
                    groupKey: '',
                    quantities: [
                        {
                            size: '',
                            quantity: 0
                        }
                    ]
                }
            ]
        );

        setName('');
        setDeadline('');
        setPrice(0);
        setOldCreatedAt('');
        setCreatedAt('');
        setOrderStatus(0);
    }

    return (
        <div className={`${dataTableFormShown ? "" : "hidden"} z-1 absolute bg-[#1f1f1f] p-10 border rounded-lg w-2/3`}>
            <div className="relative w-full h-full">
                <button
                    type="button"
                    onClick={() => {
                        resetState();

                        onClose();
                    }}
                    className="absolute top-0 right-0 border rounded-lg px-2 bg-[#e81123] border-[#980b17] hover:bg-[#980b17]"
                >X</button>

                <form onSubmit={handleSubmit} className="text-xl grid">
                    <div className="flex justify-center items-center gap-3 pb-3">
                        <label htmlFor="Name" className="">Name:</label>
                        <input type="text" className="border rounded-lg p-1" id="Name" name="Name" placeholder="P&G" value={name} onChange={(e) => { setName(e.target.value) }} required />
                    </div>

                    {/* Quantity Groups */}
                    {
                        Array.from({ length: quantityGroups.length }).map((_, index) => {
                            return (
                                <div key={index}>
                                    <div className="flex gap-5 pb-1">
                                        <div className="flex gap-3 items-center w-1/3">
                                            <label htmlFor={`quantityGroup-${index}`}>Group:</label>
                                            <input type="text" className="border rounded-lg p-1 w-full" id={`quantityGroup-${index}`} name={`quantityGroup-${index}`} value={quantityGroups[index].groupKey} onChange={(e) => { quantityGroupValueHelper(index, e.target.value) }} required placeholder="129" />
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="border rounded-lg w-10 hover:bg-white hover:text-[#1f1f1f]" type="button" onClick={() => { modifyQuantityGroupAmount() }}>+</button>
                                            <button className="border rounded-lg w-10 hover:bg-white hover:text-[#1f1f1f]" type="button" onClick={() => { modifyQuantityGroupAmount(index) }}>-</button>
                                        </div>
                                    </div>

                                    {/* Size */}
                                    {
                                        Array.from({ length: quantityGroups[index].quantities.length }).map((_, jndex) => {
                                            return (
                                                <div key={jndex} className="pl-10 pb-1">
                                                    <div className="flex gap-5">
                                                        <div className="flex gap-3 items-center w-1/4">
                                                            <label htmlFor={`size-${jndex}`}>Size:</label>
                                                            <input type="text" id={`size-${jndex}`} className="border rounded-lg p-1 w-full" name={`size-${jndex}`} value={quantityGroups[index].quantities[jndex].size} onChange={(e) => { SizeValueHelper(index, jndex, e.target.value) }} required placeholder="XL" />
                                                            <input className="border rounded-lg p-1 w-full" type="number" id={`quantity-${jndex}`} name={`quantity-${jndex}`} value={quantityGroups[index].quantities[jndex].quantity == 0 ? "" : quantityGroups[index].quantities[jndex].quantity} onChange={(e) => { SizeValueHelper(index, jndex, undefined, Number(e.target.value)) }} required placeholder="3" />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button className="border rounded-lg w-10 hover:bg-white hover:text-[#1f1f1f]" type="button" onClick={() => { modifyQuantityAmout(index) }}>+</button>
                                                            <button className="border rounded-lg w-10 hover:bg-white hover:text-[#1f1f1f]" type="button" onClick={() => { modifyQuantityAmout(index, jndex) }}>-</button>
                                                        </div>
                                                    </div>

                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            );
                        })
                    }

                    <div className="flex gap-3 w-1/4 items-center pb-1">
                        <label htmlFor="CreatedAt" className={postOrPut == "PUT" ? "" : "hidden"}>CreatedAt:</label>
                        <input type="datetime-local" name="CreatedAt" id="CreatedAt" value={createdAt} className={`${postOrPut == "PUT" ? "" : "hidden"} border rounded-lg w-full p-1`} readOnly />

                        <label htmlFor="Deadline">Deadline:</label>
                        <input type="datetime-local" name="Deadline" id="Deadline" value={deadline} onChange={(e) => { setDeadline(e.target.value) }} required className="border rounded-lg w-full p-1"/>
                    </div>

                    <div className="flex gap-3 w-full items-center pb-1">
                        <label htmlFor="Price" className={postOrPut == "PUT" ? "" : "hidden"}>Price:</label>
                        <input type="number" value={price} onChange={((e) => { setPrice(Number(e.target.value)) })} className={`${postOrPut == "PUT" ? "" : "hidden"} border rounded-lg p-1 w-1/10`} />
                    </div>

                    <div className="flex gap-3 items-center pb-1">
                        <label htmlFor="Status" className={postOrPut == "PUT" ? "" : "hidden"}>Status:</label>
                        <select
                            name="Status"
                            id="Status"
                            value={orderStatus}
                            onChange={(e) => setOrderStatus(Number(e.target.value))}
                            className={`${postOrPut == "PUT" ? "" : "hidden"} bg-[#1f1f1f] p-1 border rounded-lg`}
                        >
                            <option value="0">Created</option>
                            <option value="1">Ordered</option>
                            <option value="2">Finished</option>
                            <option value="3">Reported As Finished</option>
                            <option value="4">Delivered</option>
                        </select>
                    </div>

                    <div className="flex justify-center">
                        <button type="submit" className="border rounded-lg bg-[#e81123] border-[#980b17] hover:bg-[#980b17] w-1/10">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
