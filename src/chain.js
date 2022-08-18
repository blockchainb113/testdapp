import {useEffect, useState} from 'react'
import {ethers, ContractFactory} from 'ethers'

export function useWallet(acceptedChains) {
      
   const [provider, setProvider] = useState(null)
   const [signer, setSigner] = useState(null)
   const [chainid, setChainid] = useState(null)
   const [address, setAddress] = useState(null)

   const [error, setError] = useState(null)
   const [loading, setLoading] = useState(false)
   const [ready, setReady]  = useState(false)

   const chain = {
       provider: provider,
       signer: signer,
       chainid, chainid,
       address: address,
       ready: ready
   }

   const connect = async () => {
       try {
           setLoading(true)
           const lprovider = new ethers.providers.Web3Provider(window.ethereum, "any");
           const cons = await lprovider.send("eth_requestAccounts", []);
           const lsigner = lprovider.getSigner();
           const laddr = await lsigner.getAddress();
           const id = (await lprovider.getNetwork())["chainId"]
           setAddress(laddr)
           setChainid(id)
           if (!acceptedChains.includes(id)) {
                setError({code: 1, message: "Connected to Wrong Network"})
           } else {
               setError(null)
           }
           setProvider(lprovider)
           setSigner(lsigner)
           setReady(true)
           setLoading(false)
       } catch (e) {
           try {
               setError({code: 99, message: e.data.message})
           } catch (e2) {
            setError({code: 999, message: e.message})
           }
           setLoading(false)
       }
   }

   return [chain, connect, loading, error]
}


export function useContract(chain, address, jsondata, customfun = {}) {
 
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const [view, setView] = useState(null)
    const [tx, setTx] = useState(null)
    const [something, setSomething] = useState(null)
    const [my, setMy] = useState(null)
    const [custom, setCustom] = useState(null)
    const [ready, setReady] = useState(false)

    const [innerctr, setInnerctr] = useState(null)

    const [freshMy, setFreshMy] = useState([])
    const [freshState, setFreshState] = useState([])

    

    const wrap_view = async (fun, name) => {
        const wrap = async (...params) => {
            try {
                setLoading(true)
                setError(null)
                const dat =  await fun(...params)
                return dat
            } catch (e) {
                console.log(e)
                try {
                    setError({code: 99, message: e.data.message})
                } catch (e2) {
                    setError({code: 999, message: e.message})
                }
            }
            setLoading(false)
        }
    
        return wrap
    }

    const wrap_tx = async (fun) => {
        const wrap = async (...params) => {
            try {
                setLoading(true)
                setError(null)
                const tx = await fun(...params)
                await tx.wait()
                //await refresh_all()
            } catch (e) {
                console.log(e)
                try {
                    setError({code: 99, message: e.data.message})
                } catch (e2) {
                    setError({code: 999, message: e.message})
                }
            }
            setLoading(false)
        }
    
        return wrap
    }

    const setup_tx = async (abi, ctr) => {
        let v = {}
        for(let fun of abi) {
            if (fun.type == "function" && fun.stateMutability == "nonpayable") {
                v[fun.name] = await wrap_tx(ctr[fun.name])
            }
            if (fun.type == "function" && fun.stateMutability == "payable") {
                v[fun.name] = await wrap_tx(ctr[fun.name])
            }
        }
        setTx(v)
        console.log("tx setup", address)
    }

    const setup_view = async (abi, ctr) => {
        let v = {}
        for(let fun of abi) {
            if (fun.type == "function" && fun.stateMutability == "view") {
                v[fun.name] = await wrap_view(ctr[fun.name], fun.name)
            }
        }
        setView(v)
        console.log("view setup", address)
    }

    const refresh_state = async ( ...params) => {
        //filter out click events etc.
        const reqs = freshState.concat(params.filter(x => typeof x === 'string'))
        let promlist = []
        for (let req of reqs) {
            const arr = req.split(",")
            const prom = innerctr[arr[0]](...arr.slice(1))
            promlist.push(prom)
        }
        const vals = await Promise.all(promlist)
        let newstate = {}
        for (let i = 0; i< reqs.length; i++) {
            newstate[reqs[i]] = vals[i]
        }
        setSomething(newstate)
        console.log("refresh state", address)
        return newstate
    }

    const refresh_my = async (...params) => {
        const reqs = freshMy.concat(params.filter(x => typeof x === 'string'))
        let promlist = []
        for (let req of reqs) {
            const arr = req.split(",").concat([chain.address])
            const prom = innerctr[arr[0]](...arr.slice(1))
            promlist.push(prom)
        }
        const vals = await Promise.all(promlist)
        let newstate = {}
        for (let i = 0; i< reqs.length; i++) {
            newstate[reqs[i]] = vals[i]
        }
        setMy(newstate)
        console.log("refresh my", address)
        return newstate
    }

    const refresh_custom = async (obj) => {
        let promlist = []
        let namelist = []
        for (let fname in obj) {
            const fun = obj[fname]
            const prom = fun()
            console.log("prom", prom)
            promlist.push(prom)
            namelist.push(fname)
        }
        const vals = await Promise.all(promlist)
        let newstate = {}
        for (let i = 0; i< promlist.length; i++) {
            newstate[namelist[i]] = vals[i]
        }
        setCustom(newstate)
        console.log("refresh custom", address)
        return newstate
    }

    const refresh_all = async() => {
        await refresh_state()
        await refresh_my()
        await refresh_custom(customfun)
    }

    const setup_my = async (abi, ctr) => {
        let fresh = []
        for(let fun of abi) {
            if (fun.type == "function" && fun.stateMutability == "view") {
                const inp = fun?.inputs
                if (inp) {
                    if (inp.length == 1) {
                        //function with 1 address arg
                        if (inp[0].type == "address") {
                            fresh.push(fun.name)
                        }
                    }  else {
                        //todo: whitelist from hook param
                    }
                }
            }
        }
        console.log("my setup", address)
        setFreshMy(fresh)
    }
        

    const setup_state = async (abi, ctr) => {
        let fresh = []
        for(let fun of abi) {
            if (fun.type == "function" && fun.stateMutability == "view") {
                const inp = fun?.inputs
                if (inp) {
                    if (inp.length == 0) {
                        //function without arg
                        fresh.push(fun.name)
                    } else if (inp.length == 1){
                        //optimistic 0, 1, 2, 3, 4
                        if (inp[0].type == "uint256" ) {
                            const wl = ["mintPrices", "currentSupply", "doughRate", "maxSupply"] 
                            if (wl.includes(fun.name)){
                                for(let locindex = 1; locindex < 4; locindex++) {
                                    fresh.push(`${fun.name},${locindex}`)
                                }
                            }
                        }
                    }  else if (inp.length == 2 && fun.name == "balanceOf") {
                        for(let locindex = 1; locindex < 4; locindex++) {
                            fresh.push(`${fun.name},${chain.address},${locindex}`)
                        }
                    } else {

                        //todo: whitelist from hook param
                    }
                }
            }
        }
        console.log("state setup", address, fresh)
        setFreshState(fresh)
    }

    const setup = async () => {
        try {
            const factory = new ContractFactory(jsondata["abi"], jsondata["bytecode"], chain.signer)
            const c = await factory.attach(address);
            await setup_tx(jsondata["abi"], c)
            await setup_view(jsondata["abi"], c)
            await setup_state(jsondata["abi"], c)
            await setup_my(jsondata["abi"], c)
            setInnerctr(c)
            setReady(true)
        } catch(e) {
            setError({code: 999, message: "Error during Contract setup"})
        }
    }

    useEffect(() => {
        if (chain.ready ) {
            console.log("setup contract hook", address)
            setup()
        }
    }, [chain.ready])

 
    const contract = {
        view: view,
        tx: tx,
        state: something,
        my: my,
        custom: custom,
        ready: ready,
        address: address,
        ctr: innerctr,
        refresh: refresh_all
    }
   
    return [contract, loading, error]
 }