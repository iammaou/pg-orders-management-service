import { useState } from "react"
import { type NewOrder } from "../types/Interfaces"

export const OrderForm = () => {
    const [newOrder, setNewOrder] = useState<NewOrder>();
    const [sizeAmount, setSizeAmount] = useState<number[]>([1]);
    const [quantityAmout, setquantityAmout] = useState<number[]>([1]);

    const updateSizeAmount = (index: number, amount: number) => {
        console.log(index, amount)

        setSizeAmount(prev => {
            const newSizes = [...prev];
            newSizes[index] = amount;
            return newSizes;
        })
    }

  return (
    <div>
        <form>
            <label htmlFor="Name">Name:</label>
            <input type="text" name="Name" id="Name" />

            <label htmlFor="QuantityGroup">QuantityGroup</label>
            <input type="text" />

            {
                sizeAmount.map((sizeCount, sizeIndex) => (
                    <div key={sizeIndex}>
                        <label htmlFor={`Size-${sizeIndex}`}>Size</label>
                        <input type="text" id={`Size-${sizeIndex}`}/>

                        <button type="button" onClick={() => {updateSizeAmount(sizeIndex, sizeCount + 1)}}>+</button>
                        <button type="button" onClick={() => {updateSizeAmount(sizeIndex, Math.max(1, sizeCount - 1))}}>-</button>
                    </div>
                ))
            }

            {/* {
                Array.from({ length: sizeAmount[index] }).map((_, index) => (
                    <div key={index}>
                        <label htmlFor="Size">Size</label>
                        <input type="text" />
                        <button type="button" onClick={() => {setSizeAmount(sizeAmount[index]+1)}}>+</button>
                        <button type="button" onClick={() => {setSizeAmount(sizeAmount!=1? sizeAmount-1 : sizeAmount)}}>-</button>
                        <div>
                        {
                            Array.from({ length: quantityAmout}).map((_, index) => (
                                <div key={index}>
                                    <label htmlFor="Quantity">quantity</label>
                                    <input type="number" />
                                    <button type="button" onClick={() => {setquantityAmout(quantityAmout+1)}}>+</button>
                                    <button type="button" onClick={() => {setquantityAmout(quantityAmout!=1? quantityAmout-1 : quantityAmout)}}>-</button>
                                </div>
                            ))
                        }
                        </div>
                    </div>
                ))
            } */}


            <label htmlFor="Deadline">Deadline:</label>
            <input type="datetime-local" name="Deadline" id="Deadline" />

            <label htmlFor="ExpectedPrice">Expected Price</label>
            <input type="number" name="ExpectedPrice" id="ExpectedPrice" />
            
            <input type="submit" value="submit" />
        </form>
    </div>
  )
}
