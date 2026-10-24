import { useState } from "react"
import { type NewOrder, type NewQuantityGroup } from "../types/Interfaces";
import { apiUrl } from "./DataTable";
import Cookies from 'js-cookie'

interface props{
    dataTableFormShown:boolean
}

export const OrderForm = ({dataTableFormShown}:props) => {
    const [quantityGroups, setQuantityGroups] = useState<NewQuantityGroup[]>(
        [
            {
                groupKey: '129',
                quantities: [
                    {
                        size: 'XL',
                        quantity: 1
                    }
                ]
            }
        ]);
    const [name, setName] = useState<string>('');
    const [deadline, setDeadline] = useState<string>('');
    const [price, setPrice] = useState<number>(0);

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

    async function sendData(payload:NewOrder) {
        return await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-api-key': `${Cookies.get('x-api-key')}`
            },
            body: JSON.stringify(payload)
        });


    }

    const handleSubmit = async(e: React.SubmitEvent) => {
        e.preventDefault();

        const payload: NewOrder = {
            name: name,
            deadline: deadline,
            totalPrice: price == undefined ? 0 : price,
            quantityGroups: quantityGroups
        }

        try {
            const response = await sendData(payload);

            if(!response.ok){
                alert(`Failed to send data!`);
            } else{
                window.location.reload();
            }


        } catch (e) {
            console.error(`Error occured: ${e}`)
        } 
    }

  return (
    <div className={dataTableFormShown ? "" : "hidden"}>
        <form onSubmit={handleSubmit}>
            <label htmlFor="Name">Name</label>
            <input type="text" id="Name" name="Name" placeholder="P&G" value={name} onChange={(e) => {setName(e.target.value)}}/>

            {/* Quantity Groups */}
            {
                Array.from({length:quantityGroups.length}).map((_, index) => {
                    return(
                        <div key={index}>
                            <label htmlFor={`quantityGroup-${index}`}>group</label>
                            <input type="text" id={`quantityGroup-${index}`} name={`quantityGroup-${index}`} value={quantityGroups[index].groupKey} onChange={(e) => {quantityGroupValueHelper(index, e.target.value)}}/>
                            <button type="button" onClick={() => {modifyQuantityGroupAmount()}}>+</button>
                            <button type="button" onClick={() => {modifyQuantityGroupAmount(index)}}>-</button>

                            {/* Size */}
                            {
                                Array.from({length:quantityGroups[index].quantities.length}).map((_, jndex) => {
                                    return(
                                        <div key={jndex}>
                                            <label htmlFor={`size-${jndex}`}>size</label>
                                            <input type="text" id={`size-${jndex}`} name={`size-${jndex}`} value={quantityGroups[index].quantities[jndex].size} onChange={(e) => {SizeValueHelper(index, jndex, e.target.value)}}/>

                                            <input type="number" id={`quantity-${jndex}`} name={`quantity-${jndex}`} value={`${quantityGroups[index].quantities[jndex].quantity}`} onChange={(e) => {SizeValueHelper(index, jndex, undefined, Number(e.target.value))}}/>
                                            <button type="button" onClick={() => {modifyQuantityAmout(index)}}>+</button>
                                            <button type="button" onClick={() => {modifyQuantityAmout(index, jndex)}}>-</button>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    );
                })
            }

            <label htmlFor="Deadline">Deadline</label>
            <input type="datetime-local" name="Deadline" id="Deadline" value={deadline} onChange={(e) => {setDeadline(e.target.value)}}/>

            <label htmlFor="Price">Price</label>
            <input type="number" value={price} onChange={((e) => {setPrice(Number(e.target.value))})}/>

            <button type="submit">Submit</button>
        </form>
    </div>
  )
}
