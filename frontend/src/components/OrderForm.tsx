import { useEffect, useState } from "react"
import { type NewOrder, type NewQuantityGroup, type EditOrder, type Order } from "../types/Interfaces";
import { apiFetch } from "../apiFetch";

interface props {
  dataTableFormShown: boolean,
  postOrPut: "POST" | "PUT",
  selectedId: string,
  onClose: () => void,
  onSuccessPOST: (data: Order) => void,
  onSuccessPUT: (data: Order) => void,
  orderData: Order[],
  setSelectedId: () => void
}

export const OrderForm = ({ dataTableFormShown, postOrPut, selectedId, setSelectedId, onClose, onSuccessPOST, onSuccessPUT, orderData }: props) => {
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
  const [isHandover, setIsHandover] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);

  const quantityGroupValueHelper = (index: number, groupName: string) => {
    setQuantityGroups(prev => prev.map((g, i) => i === index ? { ...g, groupKey: groupName.toUpperCase() } : g));
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
    return await apiFetch(!id ? "" : id, { method: postOrPut.toUpperCase(), body: JSON.stringify(payload) });
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!submitting) {
      setSubmitting(true);

      if (postOrPut == "POST") {
        const baseDate = deadline === '' ? new Date() : new Date(deadline);

        if (deadline === '') {
          baseDate.setDate(baseDate.getDate() + 14);
        }
        const pad = (num: number) => String(num).padStart(2, '0');
        const finalDeadline = `${baseDate.getFullYear()}-${pad(baseDate.getMonth() + 1)}-${pad(baseDate.getDate())}T${pad(baseDate.getHours())}:${pad(baseDate.getMinutes())}`;

        const payload: NewOrder = {
          name: name,
          deadline: finalDeadline,
          totalPrice: price == undefined ? 0 : price,
          quantityGroups: quantityGroups,
          isHandover: isHandover
        }

        try {
          const response = await sendData(payload, postOrPut);

          if (!response.ok) {
            alert(`Failed to send data!`);
          } else {
            const data: Order = await response.json();

            var newOrders: Order[] = [...orderData];
            newOrders.push(data);

            onSuccessPOST(data);
            resetState();
            setSelectedId();
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
          status: orderStatus,
          isHandover: isHandover
        }

        try {
          const response = await sendData(payload, postOrPut, selectedId);

          if (!response.ok) {
            alert("Failed to send data!");
          } else {
            const data: Order = await response.json();

            onSuccessPUT(data);
            resetState();
            setSelectedId();
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
        await apiFetch(id, { method: 'GET' }).then(res => {
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
            setIsHandover(data.isHandover);
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
    setIsHandover(false);
  }

  const setSize = (index: number, jndex: number, size: string) => {
    setQuantityGroups(prev => prev.map((g, i) => i === index ? { ...g, quantities: g.quantities.map((q, j) => j === jndex ? { ...q, size } : q) } : g));
  }

  const setQuantity = (index: number, jndex: number, quantity: number) => {
    setQuantityGroups(prev => prev.map((g, i) => i === index ? { ...g, quantities: g.quantities.map((q, j) => j === jndex ? { ...q, quantity } : q) } : g));
  }

  return (
    <div className={`${dataTableFormShown ? "" : "hidden"} text-xl md:text-xl lg:text-3xl absolute dark-gray white-border z-10 top-3 p-3 md:top-4 lg:top-13 md:left-1/2 md:-translate-x-1/2 md:w-full lg:w-2/3`}>
      <div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-1 lg:gap-4 lg:pl-10 w-full">
          <div className="flex justify-center gap-1 items-center">
            <label htmlFor="Name">Name:</label>
            <input className="w-1/2 lg:w-1/2 white-border p-1" autoComplete='off' type="text" id="Name" name="Name" placeholder="P&G" value={name} onChange={(e) => { setName(e.target.value) }} required />
          </div>

          {/* Quantity Groups */}
          {
            Array.from({ length: quantityGroups.length }).map((_, index) => {
              return (
                <div key={index} className="flex flex-col gap-1">
                  <div className="flex gap-2 items-center">
                    <label htmlFor={`quantityGroup-${index}`}>Group:</label>
                    <input className="w-1/2 lg:w-1/4 white-border p-1" autoComplete='off' type="text" id={`quantityGroup-${index}`} name={`quantityGroup-${index}`} value={quantityGroups[index].groupKey} onChange={(e) => { quantityGroupValueHelper(index, e.target.value) }} required placeholder="129" />
                    <button className="white-border small-button-size" type="button" onClick={() => { modifyQuantityGroupAmount() }}>+</button>
                    <button className="white-border small-button-size" type="button" onClick={() => { modifyQuantityGroupAmount(index) }}>-</button>
                  </div>

                  {/* Size */}
                  {
                    Array.from({ length: quantityGroups[index].quantities.length }).map((_, jndex) => {
                      return (
                        <div key={jndex}>
                          <div className="flex gap-2 pl-8 items-center">
                            <label htmlFor={`size-${index}-${jndex}`}>Size:</label>
                            <input className="w-1/3 lg:w-1/5  white-border p-1" autoComplete='off' type="text" id={`size-${index}-${jndex}`} name={`size-${index}-${jndex}`} value={quantityGroups[index].quantities[jndex].size} onChange={(e) => { setSize(index, jndex, String(e.target.value).toUpperCase()) }} required placeholder="XL" />
                            <input className="w-1/5 lg:w-1/8 white-border p-1" autoComplete='off' type="number" id={`quantity-${index}-${jndex}`} name={`quantity-${index}-${jndex}`} value={quantityGroups[index].quantities[jndex].quantity == 0 ? "" : quantityGroups[index].quantities[jndex].quantity} onChange={(e) => { setQuantity(index, jndex, Number.isNaN(e.target.valueAsNumber) ? 0 : Number(e.target.valueAsNumber))}} required placeholder="3" />
                            <button className="white-border small-button-size" type="button" onClick={() => { modifyQuantityAmout(index) }}>+</button>
                            <button className="white-border small-button-size" type="button" onClick={() => { modifyQuantityAmout(index, jndex) }}>-</button>
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
            <label htmlFor="Deadline" className="pr-2">Deadline:</label>
            <input autoComplete='off' type="datetime-local" name="Deadline" id="Deadline" value={deadline} onChange={(e) => { setDeadline(e.target.value) }} className="w-2/5 lg:w-4/9 white-border p-1" />
          </div>

          <div className="flex gap-1 items-center">
            <label htmlFor="Price" className={postOrPut == "PUT" ? "" : "hidden"}>Price:</label>
            <input autoComplete='off' id="Price" type="number" value={price} onChange={((e) => { setPrice(Number(e.target.value)) })} className={`${postOrPut == "PUT" ? "" : "hidden"} white-border p-1 w-1/3 lg:w-1/6`} />
          </div>

          <div className="flex gap-1 items-center">
            <label htmlFor="Status" className={postOrPut == "PUT" ? "" : "hidden"}>Status:</label>
            <select
              name="Status"
              id="Status"
              value={orderStatus}
              onChange={(e) => setOrderStatus(Number(e.target.value))}
              className={`${postOrPut == "PUT" ? "" : "hidden"} white-border p-1`}
            >
              <option value="0" className='dark-gray'>Created</option>
              <option value="1" className='darker-gray'>Ordered</option>
              <option value="2" className='dark-gray'>Arrived</option>
              <option value="3" className='darker-gray'>Finished</option>
              <option value="4" className='dark-gray'>Reported</option>
              <option value="5" className='darker-gray'>Delivered</option>
            </select>
          </div>

          <div className="flex gap-1 items-center">
            <h3>IsHandover?</h3>
            <input type="checkbox" className="checkbox" checked={isHandover} onChange={() => setIsHandover(prev => !prev)}/>
          </div>

          <div>
            <h3 className={`${postOrPut == "PUT" ? "" : "hidden"} pr-2`}>Created At: {new Date(createdAt).toLocaleDateString("en-GB")}</h3>
          </div>
          <div className="flex justify-center pt-5 gap-3">
            <button type="submit" className="red-button button-size">Submit</button>
            <button type="reset" className="button-size border border-white hover:bg-white hover:text-[#1f1f1f]" onClick={() => {
              resetState();
              setSelectedId();
              onClose();
            }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
