import React, {useRef} from 'react'

export default function ItemStuff({head, note, label, callback}) {

    const itemRef = useRef(null)

    const attachy = async () => {
        const itemId = parseInt(itemRef.current.value)
        await callback(itemId)
    }

  return (
    <div className='mintcontainer'>
        <h4>{head}</h4>
        <div style={{fontSize: "0.8rem"}}>{note}</div>
        <div>
            <label>Id</label>
            <input size={7} ref={itemRef} />
        </div>
        <button onClick={attachy}>{label}</button>
    </div>
  )
}
