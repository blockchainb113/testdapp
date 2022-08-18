

import chefdata from '../../solidity/artifacts/contracts/Chef.sol/Chef.json'
import itemdata from '../../solidity/artifacts/contracts/ChefItems.sol/ChefItems.json'
import doughdata from '../../solidity/artifacts/contracts/DOUGH.sol/DOUGH.json'
import truckdata from '../../solidity/artifacts/contracts/FoodTruck.sol/FoodTruck.json'

import {ethers, ContractFactory} from 'ethers'
import {useState} from 'react'

export function useChainTx(funky, setLoading, setError) {
    const setStuff = async (addy) => {
        try {
            setLoading(true)
            setError("")
            const tx = await funky(addy)
            await tx.wait()
        } catch (e) {
            console.log(e)
            try {
                setError(e.data)
            } catch (e2) {
                setError(e)
            }
        }
        setLoading(false)
    }

    return setStuff
}

export function useChainGet(original, funky, setLoading, setError) {
    const [data, setData] = useState(original)

    const getData = async (addy) => {
        try {
            setLoading(true)
            setError("")
            const d = await funky(addy)
            setData(d)
            setLoading(false)
            return d
        } catch (e) {
            console.log(e)
            try {
                setError(e.data)
            } catch (e2) {
                setError(e)
            }
            setLoading(false)
            return original       
        }
        
    }

    return [data, getData]
}
    


const chefAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
const itemAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
const doughAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
const ftAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
export function useBlockChain(setError) {
    
    const [provider, setProvider] = useState(null)
    const [signer, setSigner] = useState(null)
    const [chainid, setChainid] = useState(null)
    const [addr, setAddr] = useState(null)

    const [chef, setChef] = useState(null)
    const [item, setItem] = useState(null)
    const [dough, setDough] = useState(null)
    const [foodtruck, setFoodTruck] = useState(null)

    const bc = {
        chef: chef,
        item: item,
        dough: dough,
        foodtruck: foodtruck,
        provider: provider,
        signer: signer,
        chainid, chainid,
        addr: addr
    }

    const connectChain = async () => {
        try {
            console.log("try connect")
            const lprovider = new ethers.providers.Web3Provider(window.ethereum, "any");
            const cons = await lprovider.send("eth_requestAccounts", []);
            const lsigner = lprovider.getSigner();
            const laddr = await lsigner.getAddress();
            const cheffactory = new ContractFactory(chefdata["abi"], chefdata["bytecode"], lsigner)
            const lchef = await cheffactory.attach(chefAddress);

            const itemfactory = new ContractFactory(itemdata["abi"], itemdata["bytecode"], lsigner)
            const litem = await itemfactory.attach(itemAddress);

            const doughfactory = new ContractFactory(doughdata["abi"], doughdata["bytecode"], lsigner)
            const ldough = await doughfactory.attach(doughAddress);

            const ftfactory = new ContractFactory(truckdata["abi"], truckdata["bytecode"], lsigner)
            const lft = await ftfactory.attach(ftAddress);
            setAddr(laddr)
            setChainid((await lprovider.getNetwork())["chainId"])
            setProvider(lprovider)
            setSigner(lsigner)
            setChef(lchef)
            setItem(litem)
            setDough(ldough)
            setFoodTruck(lft)
        } catch (e) {
            console.log(e)
            try {
                setError(e.data)
            } catch (e2) {
                setError(e)
            }
        }
    }

    return [bc, connectChain]
}