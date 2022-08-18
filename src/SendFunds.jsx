import React, {useRef} from 'react'

import {ethers} from 'ethers'

export default function SendFunds({sendFunds}) {

    const recRef = useRef(null)
    const amountRef = useRef(null)


    const sendhere = async () => {
        const receiver = recRef.current.value
        const amount = ethers.utils.parseEther(amountRef.current.value)
        const tx = await sendFunds(receiver, amount)
        await tx.wait()
    }

  return (
    <div className='mintcontainer'>
        <h4>SendFunds</h4>
        <div><label>to</label><input size={50} ref={recRef} /></div>
        <div><label>avax</label><input size={7} ref={amountRef} /></div>
        <div><button onClick={sendhere}>Send</button></div>
    </div>
  )
}
