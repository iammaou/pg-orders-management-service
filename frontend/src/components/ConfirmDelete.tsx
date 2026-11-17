import { useState } from 'react';
import '../App.css';
import { apiFetch } from '../apiFetch';

interface props {
  orderName: string,
  orderId: string,
  deleteWindowVisible: boolean,
  onClose: () => void,
  onDelete: (id:string) => void
}

const deleteOrder = async (id: string): Promise<boolean> => {
  const res = await apiFetch(id, { method: 'DELETE' });

  if (!res.ok) {
    alert(`Delete Failed: ${res.status}`);
    return false;
  } else {
    return true;
  }
}

function ConfirmDelete({ orderName, deleteWindowVisible, orderId, onClose, onDelete }: props) {

  const onYes = async (id: string) => {
    if (id !== '' && !processing) {
      setProcessing(true);
      const ok = await deleteOrder(id);

      if (ok) {
        onDelete(id);
        onClose();
      }
    }
    setProcessing(false);
  }

  const [processing, setProcessing] = useState<boolean>(false);
  return (
    <div role='dialog' className={`${deleteWindowVisible ? "" : "hidden"} fixed white-border top-50 left-[50%] translate-x-[-50%] p-4 w-3/5 dark-gray text-2xl flex flex-col gap-5`}>
      <h2>Are you sure you want to delete {orderName}?</h2>
      <div className='flex gap-3 justify-end'>
        <button type='button' onClick={() => { onYes(orderId) }} className='red-button px-6'>Yes</button>
        <button autoFocus type='button' onClick={() => { onClose() }} className='white-border p-2 px-5 hover:bg-white hover:text-black'>No</button>

      </div>
    </div>
  )
}

export default ConfirmDelete