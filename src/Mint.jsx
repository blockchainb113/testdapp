import React, {useRef}  from 'react'


export default function Mint({head, label, note1, note2, mintFromQuant}) {

const inpRef = useRef(null)

  return (
    <div className='mintcontainer'>
     <h2>{head}</h2>
     <div>{note1}</div>
     <div>{note2}</div>
        <div><label>how many?</label></div>
        <div><input type="text" ref={inpRef} /></div>
        <div><button onClick={async () => {const x = parseInt(inpRef.current.value); await mintFromQuant(x)}}>{label}</button></div>
    </div>
  )
}
