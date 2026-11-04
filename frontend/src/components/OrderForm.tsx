import { useEffect, useState } from "react"
import { type NewOrder, type NewQuantityGroup, type EditOrder, type Order } from "../types/Interfaces";
import { apiFetch } from "../apiFetch";

interface props {
  dataTableFormShown: boolean,
  postOrPut: "POST" | "PUT",
  selectedId: string,
  onClose: () => void,
  onSuccess: (data: Order[]) => void,
  orderData: Order[],
  setSelectedId: () => void
}

export const OrderForm = ({ dataTableFormShown, postOrPut, selectedId, setSelectedId, onClose, onSuccess, orderData }: props) => {
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
  const [createdAt, setCreatedAt] = useState<string>('');
  const [orderStatus, setOrderStatus] = useState<number>(0);

  const [submitting, setSubmitting] = useState<boolean>(false);

  const quantityGroupValueHelper = (index: number, groupName: string) => {
    setQuantityGroups(prev => prev.map((g, i) => i === index ? { ...g, groupKey: groupName } : g));
  }

  const modifyQuantityGroupAmount = (index?: number) => {
    if (index != undefined && quantityGroups.length > 1) {
      setQuantityGroups(prev => prev.filter((_, i) => i !== index));
    } else if (index == undefined) {
      setQuantityGroups(prev => [...prev, {
        groupKey: '',
        quantities: [
          {
            size: '',
            quantity: 0
          }
        ]
      }])
    }
  }

  const modifyQuantityAmout = (index: number, jndex?: number) => {
    if (jndex != undefined && quantityGroups[index].quantities.length > 1) {
      setQuantityGroups(prev => prev.map((group, i) => {
        if (i === index) {
          return {
            ...group,
            quantities: group.quantities.filter((_, j) => j !== jndex)
          };
        } else {
          return group;
        }
      }));
    } else if (jndex === undefined) {
      setQuantityGroups(prev => prev.map((group, i) => {
        if (i === index) {
          return {
            ...group,
            quantities: [
              ...group.quantities, { size: '', quantity: 0 }
            ]
          }
        }
        else {
          return group;
        }
      }))
    }
  }

  async function sendData(payload: NewOrder, postOrPut: "POST" | "PUT", id?: string) {
    return await apiFetch(!id ? "" : id, {method:postOrPut.toUpperCase(), body: JSON.stringify(payload)});
  }

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    
    if(!submitting){
      setSubmitting(true);

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
            const data: Order = await response.json();
  
            var newOrders: Order[] = [...orderData];
            newOrders.push(data);
  
            onSuccess(newOrders);
            resetState();
            onClose();
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
          createdAt: createdAt,
          status: orderStatus
        }
  
        try {
          const response = await sendData(payload, postOrPut, selectedId);
  
          if (!response.ok) {
            alert("Failed to send data!");
          } else {
            const data: Order = await response.json();
  
            const newOrders: Order[] = orderData.map(order => order.id === selectedId ? data : order);
  
            onSuccess(newOrders);
            resetState();
            onClose();
          }
        } catch (e) {
          console.error(`Error occured: ${e}`);
        }
      }
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (postOrPut == "PUT" && selectedId) {
      async function getData(id: string) {
        await apiFetch(id, {method:'GET'}).then(res => {
            if (!res.ok) {
              throw new Error(`GET failed: ${res.status}`)
            }

            return res.json();
          })
          .then(data => {
            setName(data.name);
            setQuantityGroups(data.quantityGroups);
            setCreatedAt(data.createdAt.slice(0, 16));
            setOrderStatus(data.status);
            setDeadline(data.deadline.slice(0, 16));
            setPrice(data.totalPrice);
          })
          .catch((err) => {
            alert(`Error occured: ${err}`)
          });
      }

      getData(selectedId);
    }
  }, [selectedId, postOrPut])

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
    setCreatedAt('');
    setOrderStatus(0);
  }

  const setSize = (index: number, jndex: number, size: string) => {
    setQuantityGroups(prev => prev.map((g, i) => i === index ? { ...g, quantities: g.quantities.map((q, j) => j === jndex ? { ...q, size } : q) } : g));
  }

  const setQuantity = (index: number, jndex: number, quantity: number) => {
    setQuantityGroups(prev => prev.map((g, i) => i === index ? { ...g, quantities: g.quantities.map((q, j) => j === jndex ? { ...q, quantity } : q) } : g));
  }

  return (
    <div className={`${dataTableFormShown ? "" : "hidden"} z-1 absolute bg-[#1f1f1f] p-10 border rounded-lg w-2/3`}>
      <div className="relative w-full h-full">
        <button
          type="button"
          onClick={() => {
            resetState();
            setSelectedId();
            onClose();
          }}
          className="absolute top-0 right-0 border rounded-lg px-2 bg-[#e81123] border-[#980b17] hover:bg-[#980b17]"
        >X</button>

        <form onSubmit={handleSubmit} className="text-xl grid">
          <div className="flex justify-center items-center gap-3 pb-3">
            <label htmlFor="Name" className="">Name:</label>
            <input autoComplete='off' type="text" className="border rounded-lg p-1" id="Name" name="Name" placeholder="P&G" value={name} onChange={(e) => { setName(e.target.value) }} required />
          </div>

          {/* Quantity Groups */}
          {
            Array.from({ length: quantityGroups.length }).map((_, index) => {
              return (
                <div key={index}>
                  <div className="flex gap-5 pb-1">
                    <div className="flex gap-3 items-center w-1/3">
                      <label htmlFor={`quantityGroup-${index}`}>Group:</label>
                      <input autoComplete='off' type="text" className="border rounded-lg p-1 w-full" id={`quantityGroup-${index}`} name={`quantityGroup-${index}`} value={quantityGroups[index].groupKey} onChange={(e) => { quantityGroupValueHelper(index, e.target.value) }} required placeholder="129" />
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
                              <input autoComplete='off' type="text" id={`size-${jndex}`} className="border rounded-lg p-1 w-full" name={`size-${jndex}`} value={quantityGroups[index].quantities[jndex].size} onChange={(e) => { setSize(index, jndex, e.target.value) }} required placeholder="XL" />
                              <input autoComplete='off' className="border rounded-lg p-1 w-full" type="number" id={`quantity-${jndex}`} name={`quantity-${jndex}`} value={quantityGroups[index].quantities[jndex].quantity == 0 ? "" : quantityGroups[index].quantities[jndex].quantity} onChange={(e) => { setQuantity(index, jndex, Number(e.target.valueAsNumber)) }} required placeholder="3" />
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
            <input autoComplete='off' type="datetime-local" name="CreatedAt" id="CreatedAt" value={createdAt} className={`${postOrPut == "PUT" ? "" : "hidden"} border rounded-lg w-full p-1`} readOnly />

            <label htmlFor="Deadline">Deadline:</label>
            <input autoComplete='off' type="datetime-local" name="Deadline" id="Deadline" value={deadline} onChange={(e) => { setDeadline(e.target.value) }} required className="border rounded-lg w-full p-1" />
          </div>

          <div className="flex gap-3 w-full items-center pb-1">
            <label htmlFor="Price" className={postOrPut == "PUT" ? "" : "hidden"}>Price:</label>
            <input autoComplete='off' id="Price" type="number" value={price} onChange={((e) => { setPrice(Number(e.target.value)) })} className={`${postOrPut == "PUT" ? "" : "hidden"} border rounded-lg p-1 w-1/10`} />
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
