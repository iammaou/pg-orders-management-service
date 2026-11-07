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
        const baseDate = deadline === '' ? new Date() : new Date(deadline);

        if(deadline === ''){
          baseDate.setDate(baseDate.getDate() + 14);
        }
        const pad = (num: number) => String(num).padStart(2, '0');
        const finalDeadline = `${baseDate.getFullYear()}-${pad(baseDate.getMonth() + 1)}-${pad(baseDate.getDate())}T${pad(baseDate.getHours())}:${pad(baseDate.getMinutes())}`;

        const payload: NewOrder = {
          name: name,
          deadline: finalDeadline,
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
    <div className={`${dataTableFormShown ? "" : "hidden"}`}>
      <div>
        <button
          type="button"
          onClick={() => {
            resetState();
            setSelectedId();
            onClose();
          }}
          
        >X</button>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="Name">Name:</label>
            <input autoComplete='off' type="text" id="Name" name="Name" placeholder="P&G" value={name} onChange={(e) => { setName(e.target.value) }} required />
          </div>

          {/* Quantity Groups */}
          {
            Array.from({ length: quantityGroups.length }).map((_, index) => {
              return (
                <div key={index}>
                  <div>
                    <div>
                      <label htmlFor={`quantityGroup-${index}`}>Group:</label>
                      <input autoComplete='off' type="text" id={`quantityGroup-${index}`} name={`quantityGroup-${index}`} value={quantityGroups[index].groupKey} onChange={(e) => { quantityGroupValueHelper(index, e.target.value) }} required placeholder="129" />
                    </div>
                    <div>
                      <button type="button" onClick={() => { modifyQuantityGroupAmount() }}>+</button>
                      <button type="button" onClick={() => { modifyQuantityGroupAmount(index) }}>-</button>
                    </div>
                  </div>

                  {/* Size */}
                  {
                    Array.from({ length: quantityGroups[index].quantities.length }).map((_, jndex) => {
                      return (
                        <div key={jndex}>
                          <div>
                            <div>
                              <label htmlFor={`size-${jndex}`}>Size:</label>
                              <input autoComplete='off' type="text" id={`size-${jndex}`} name={`size-${jndex}`} value={quantityGroups[index].quantities[jndex].size} onChange={(e) => { setSize(index, jndex, e.target.value) }} required placeholder="XL" />
                              <input autoComplete='off' type="number" id={`quantity-${jndex}`} name={`quantity-${jndex}`} value={quantityGroups[index].quantities[jndex].quantity == 0 ? "" : quantityGroups[index].quantities[jndex].quantity} onChange={(e) => { setQuantity(index, jndex, Number(e.target.valueAsNumber)) }} required placeholder="3" />
                            </div>
                            <div>
                              <button type="button" onClick={() => { modifyQuantityAmout(index) }}>+</button>
                              <button type="button" onClick={() => { modifyQuantityAmout(index, jndex) }}>-</button>
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

          <div>
            <label htmlFor="CreatedAt" className={postOrPut == "PUT" ? "" : "hidden"}>CreatedAt:</label>
            <input autoComplete='off' type="datetime-local" name="CreatedAt" id="CreatedAt" value={createdAt} className={`${postOrPut == "PUT" ? "" : "hidden"}`} readOnly />

            <label htmlFor="Deadline">Deadline:</label>
            <input autoComplete='off' type="datetime-local" name="Deadline" id="Deadline" value={deadline} onChange={(e) => { setDeadline(e.target.value) }} />
          </div>

          <div>
            <label htmlFor="Price" className={postOrPut == "PUT" ? "" : "hidden"}>Price:</label>
            <input autoComplete='off' id="Price" type="number" value={price} onChange={((e) => { setPrice(Number(e.target.value)) })} className={`${postOrPut == "PUT" ? "" : "hidden"}`} />
          </div>

          <div>
            <label htmlFor="Status" className={postOrPut == "PUT" ? "" : "hidden"}>Status:</label>
            <select
              name="Status"
              id="Status"
              value={orderStatus}
              onChange={(e) => setOrderStatus(Number(e.target.value))}
              className={`${postOrPut == "PUT" ? "" : "hidden"}`}
            >
              <option value="0">Created</option>
              <option value="1">Ordered</option>
              <option value="2">Arrived</option>
              <option value="3">Finished</option>
              <option value="4">Reported</option>
              <option value="5">Delivered</option>
            </select>
          </div>

          <div>
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    </div>
  )
}
