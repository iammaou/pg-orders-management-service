import { useState } from "react"
import { type NewQuantityGroup } from "../types/Interfaces";

export const OrderForm = () => {
    // const [newOrder, setNewOrder] = useState<NewOrder>();
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

    const quantityGroupHelper = (index:number, groupName?:string) => {
        var newQuantityGroups = [...quantityGroups];

        newQuantityGroups[index].groupKey=groupName ? groupName : newQuantityGroups[index].groupKey;

        console.log(newQuantityGroups)

        setQuantityGroups(newQuantityGroups);

    }

    const modifyQuantityGroupAmount = (index?:number) => {
        console.log("modifying...")
        var newQuantityGroups = [...quantityGroups];

        console.log(`index = ${index}`)

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

  return (
    <div>
        <form>
            <label htmlFor="Name">Name</label>
            <input type="text" id="Name" name="Name"/>

            {/* Quantity Groups */}
            {
                Array.from({length:quantityGroups.length}).map((_, index) => {
                    return(
                        <div key={index}>
                            <label htmlFor={`quantityGroup-${index}`}>group</label>
                            <input type="text" id={`quantityGroup-${index}`} name={`quantityGroup-${index}`} value={quantityGroups[index].groupKey} onChange={(e) => {quantityGroupHelper(index, e.target.value)}}/>
                            <button type="button" onClick={() => {modifyQuantityGroupAmount()}}>+</button>
                            <button type="button" onClick={() => {modifyQuantityGroupAmount(index)}}>-</button>

                            {/* Size */}
                            {
                                Array.from({length:quantityGroups[index].quantities.length}).map((_, jndex) => {
                                    return(
                                        <div key={jndex}>
                                            <label htmlFor={`size-${jndex}`}>size</label>
                                            <input type="text" id={`size-${jndex}`} name={`size-${jndex}`}/>

                                            <input type="text" id={`quantity-${jndex}`} name={`quantity-${jndex}`}/>
                                            <button type="button">+</button>
                                            <button type="button">-</button>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    );
                })
            }
        </form>
    </div>
  )
}
