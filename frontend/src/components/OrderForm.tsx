import { useState } from "react"
import { type NewQuantityGroup } from "../types/Interfaces";

export const OrderForm = () => {
    // const [newOrder, setNewOrder] = useState<NewOrder>();
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
        console.log(`index = ${index}, jndex = ${jndex}`);
        
        var newQuantityGroups = [...quantityGroups];
        console.log(newQuantityGroups)

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

        console.log(newQuantityGroups)

        setQuantityGroups(newQuantityGroups);
    }

  return (
    <div>
        <form>
            <label htmlFor="Name">Name</label>
            <input type="text" id="Name" name="Name" placeholder="P&G"/>

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
            <input type="datetime-local" name="Deadline" id="Deadline" />

            <label htmlFor="Price">Price</label>
            <input type="number" />
        </form>
    </div>
  )
}
