import React from 'react'

export default function SetRPC({setError}) {


  const switchreload = async () => {
    await switchnet();
    location.reload();
  }

  const switchnet = async () => {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x538' }],
      });
      setError("")
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x538',
                chainName: 'Our AvaxTest v1',
                rpcUrls: ["https://pay2consume.com/api/67jksdf45fsdif56/"],
                nativeCurrency: {
                  name: 'AVAX',
                  symbol: 'AVAX',
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addError) {
          setError("You must be connected to our testnetwork.")
        }
      }
      setError("You must be connected to our testnetwork.")
    }
  }




  return (
    <div className='section'>
        <h2>SetRPC</h2>
        <div>Click the button to set the custom RPC</div>
        <button onClick={switchreload}>Get RPC</button>
    </div>
  )
}

