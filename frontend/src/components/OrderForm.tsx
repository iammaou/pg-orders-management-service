import { useEffect, useState } from "react"
import { type NewOrder, type NewQuantityGroup, type EditOrder } from "../types/Interfaces";
import { apiUrl } from "./DataTable";
import Cookies from 'js-cookie'

interface props{
    dataTableFormShown:boolean,
    postOrPut: "POST" | "PUT",
    selectedId: string
}

export const OrderForm = ({dataTableFormShown, postOrPut, selectedId}:props) => {
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

    const quantityGroupValueHelper = (index:number, groupName:string) => {
        var newQuantityGroups = [...quantityGroups];

        newQuantityGroups[index].groupKey=groupName != '' ? groupName : newQuantityGroups[index].groupKey;

        setQuantityGroups(newQuantityGroups);

    }

    const SizeValueHelper = (index:number, jndex:number, size?:string, quantity?:number) => {
        var newQuantityGroups = [...quantityGroups];

        if(size != undefined){
            newQuantityGroups[index].quantities[jndex].size = size;
        } else if (quantity != undefined){
            newQuantityGroups[index].quantities[jndex].quantity = quantity
        }

        setQuantityGroups(newQuantityGroups);
    }

    const modifyQuantityGroupAmount = (index?:number) => {
        var newQuantityGroups = [...quantityGroups];

        if(index != undefined && quantityGroups.length > 1){
            newQuantityGroups = newQuantityGroups.filter((_, i) => i !== index);
        } else if (index == undefined){
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

    const modifyQuantityAmout = (index:number, jndex?:number) => {
        
        var newQuantityGroups = [...quantityGroups];

        if(jndex != undefined && quantityGroups[index].quantities.length > 1){
            newQuantityGroups[index].quantities = newQuantityGroups[index].quantities.filter((_, j) => j!==jndex)
        } else if(jndex == undefined){
            newQuantityGroups[index].quantities.push(
                {
                    size: '',
                    quantity: 0
                }
            )
        }

        setQuantityGroups(newQuantityGroups);
    }

    async function sendData(payload:NewOrder, postOrPut:"POST" | "PUT", id?:string) {
        return await fetch(!id ? apiUrl : apiUrl + `/${id}`, {
            method: postOrPut.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
                'X-api-key': `${Cookies.get('x-api-key')}`
            },
            body: JSON.stringify(payload)
        });
    }

    const handleSubmit = async(e: React.SubmitEvent) => {
        e.preventDefault();

        if(postOrPut == "POST"){
            const payload: NewOrder = {
                name: name,
                deadline: deadline,
                totalPrice: price == undefined ? 0 : price,
                quantityGroups: quantityGroups
            }
    
            try {
                const response = await sendData(payload, postOrPut);
    
                if(!response.ok){
                    alert(`Failed to send data!`);
                } else{
                    window.location.reload();
                }
    
    
            } catch (e) {
                console.error(`Error occured: ${e}`)
            } 
        } else{
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

                if(!response.ok){
                    alert("Failed to send data!");
                } else{
                    window.location.reload();
                }
            } catch (e){
                console.error(`Error occured: ${e}`);
            }
        }
    }

    useEffect(() => {
        if(postOrPut == "PUT" && selectedId){
            console.log(`${apiUrl}/${selectedId}`)

            async function getData(id:string){
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

  return (
    <div className={dataTableFormShown ? "" : "hidden"}>
        <form onSubmit={handleSubmit}>
            <label htmlFor="Name">Name</label>
            <input type="text" id="Name" name="Name" placeholder="P&G" value={name} onChange={(e) => {setName(e.target.value)}} required/>

            {/* Quantity Groups */}
            {
                Array.from({length:quantityGroups.length}).map((_, index) => {
                    return(
                        <div key={index}>
                            <label htmlFor={`quantityGroup-${index}`}>group</label>
                            <input type="text" id={`quantityGroup-${index}`} name={`quantityGroup-${index}`} value={quantityGroups[index].groupKey} onChange={(e) => {quantityGroupValueHelper(index, e.target.value)}} required placeholder="129"/>
                            <button type="button" onClick={() => {modifyQuantityGroupAmount()}}>+</button>
                            <button type="button" onClick={() => {modifyQuantityGroupAmount(index)}}>-</button>

                            {/* Size */}
                            {
                                Array.from({length:quantityGroups[index].quantities.length}).map((_, jndex) => {
                                    return(
                                        <div key={jndex}>
                                            <label htmlFor={`size-${jndex}`}>size</label>
                                            <input type="text" id={`size-${jndex}`} name={`size-${jndex}`} value={quantityGroups[index].quantities[jndex].size} onChange={(e) => {SizeValueHelper(index, jndex, e.target.value)}} required placeholder="XL"/>

                                            <input type="number" id={`quantity-${jndex}`} name={`quantity-${jndex}`} value={quantityGroups[index].quantities[jndex].quantity == 0 ? "" : quantityGroups[index].quantities[jndex].quantity} onChange={(e) => {SizeValueHelper(index, jndex, undefined, Number(e.target.value))}} required placeholder="3"/>
                                            <button type="button" onClick={() => {modifyQuantityAmout(index)}}>+</button>
                                            <button type="button" onClick={() => {modifyQuantityAmout(index, jndex)}}>-</button>
                                        </div>
                                    );

                                    quantityGroups[index].quantities[jndex].quantity
                                })
                            }
                        </div>
                    );
                })
            }

            <label htmlFor="Deadline">Deadline</label>
            <input type="datetime-local" name="Deadline" id="Deadline" value={deadline} onChange={(e) => {setDeadline(e.target.value)}} required/>

            <label htmlFor="CreatedAt" className={postOrPut == "PUT" ? "" : "hidden"}>CreatedAt</label>
            <input type="datetime-local" name="CreatedAt" id="CreatedAt" value={createdAt} className={postOrPut == "PUT" ? "" : "hidden"} readOnly/>

            <label htmlFor="Price" className={postOrPut == "PUT" ? "" : "hidden"}>Price</label>
            <input type="number" value={price} onChange={((e) => {setPrice(Number(e.target.value))})} className={postOrPut == "PUT" ? "" : "hidden"}/>

            <label htmlFor="Status" className={postOrPut == "PUT" ? "" : "hidden"}>Status</label>
            <select 
                name="Status" 
                id="Status" 
                value={orderStatus} 
                onChange={(e) => setOrderStatus(Number(e.target.value))} 
                className={postOrPut == "PUT" ? "" : "hidden"}
                >
                    <option value="0">Created</option>
                    <option value="1">Ordered</option>
                    <option value="2">Finished</option>
                    <option value="3">Reported As Finished</option>
                    <option value="4">Delivered</option>
                </select>

            <button type="submit">Submit</button>
        </form>
    </div>
  )
}
