import { useEffect, useState } from 'react'
import './App.css'

import SetRPC from './SetRPC'
import Mint from './Mint'
import ItemStuff from './ItemStuff'

import {ethers} from 'ethers'

import {useWallet, useContract} from './chain'

import chefdata from '../../solidity/artifacts/contracts/Chef.sol/Chef.json'
import itemdata from '../../solidity/artifacts/contracts/Upgrade.sol/Upgrade.json'
import doughdata from '../../solidity/artifacts/contracts/DOUGH.sol/DOUGH.json'
import truckdata from '../../solidity/artifacts/contracts/FoodTruck.sol/FoodTruck.json'
import fermenterdata from '../../solidity/artifacts/contracts/Fermenter.sol/Fermenter.json'
import pizzadata from '../../solidity/artifacts/contracts/PZA.sol/PZA.json'
import ovendata from  '../../solidity/artifacts/contracts/Oven.sol/Oven.json'
import pizzaStakerdata from  '../../solidity/artifacts/contracts/Pizzaria.sol/Pizzaria.json'

const chefPrice = "3.0"
const itemPrices = ["no", "0.2", "0.35"]

function App() {


  const [chain, connect, loadingWallet, errorWallet] = useWallet([0x538, 31337])

  const chefAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
  const [chef, loadingChef, errorChef] = useContract(chain, chefAddress, chefdata)

  const itemAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  const [item, loadingItem, errorItem] = useContract(chain, itemAddress, itemdata)

  const doughAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
  const [dough, loadingDough, errorDough] = useContract(chain, doughAddress, doughdata)

  const truckAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
  const [truck, loadingTruck, errorTruck] = useContract(chain, truckAddress, truckdata, {"doughStatus": doughStatus})

  const fermenterAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
  const [fermenter, loadingFermenter, errorFermenter] = useContract(chain, fermenterAddress, fermenterdata)

  const pizzaAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"
  const [pizza, loadingPizza, errorPizza] = useContract(chain, pizzaAddress, pizzadata)

  const ovenAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F"
  const [oven, loadingOven, errorOven] = useContract(chain, ovenAddress, ovendata)

  const pizzaStakerAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"
  const [pizzastaker, loadingpizzastaker, errorpizzastaker] = useContract(chain, pizzaStakerAddress, pizzaStakerdata)

  const timeAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6"

  const [myStakedItems, setMyStakedItems] = useState([0,0,0])

  async function doughStatus() {
    return ethers.utils.parseEther("55")
  }
  //todo: useful custom functions 
  //async function doughStatus() {
  //  return await truck.view?.getStakingDough(truck.my?.getAllTokens)
  //}

  useEffect(() => {
    if (chef.ready && item.ready && truck.ready && dough.ready && fermenter.ready && pizza.ready && oven.ready) {
      allfresh()
      //const filt = chef.ctr?.filters?.Transfer(null, chain?.address)
      //chef.ctr?.on(filt, (...all)  => {
      //  setEvents([...events, all])
      //})
    }
  },[chef.ready, item.ready, truck.ready, dough.ready, fermenter.ready, pizza.ready, oven.ready])

  const [loadingHere, setLoading] = useState(false)
  const [errorHere, setError] = useState(null)

  const [blabla, setBlabla] = useState(0)

  const error = errorChef | errorDough | errorHere | errorWallet | errorTruck
  const loading = loadingChef | loadingDough | loadingHere | loadingWallet | loadingTruck

  const allfresh = async () => {
    //await Promise.all([chef.refresh()])
    const nrsitems = await Promise.all([truck.view?.getItemBalance(1, chain.address),
      truck.view?.getItemBalance(2, chain.address),
      truck.view?.getItemBalance(3, chain.address) ])
    setMyStakedItems(nrsitems)
    await Promise.all([chef.refresh(), item.refresh(), dough.refresh(), truck.refresh(), fermenter.refresh(), oven.refresh(), pizza.refresh()])
  }

  const [myStakes, setMyStakes] = useState(ethers.utils.parseEther("0.0"))

  const safeWithdraw = async () => {
    await truck.tx.withdraw()
    await allfresh()
  }

  const safeEquip = async (itemid) => {
    if (await item.view.isApprovedForAll(chain.address, truck.address)) {
      //nothing
    } else {
      await item.tx.setApprovalForAll( truck.address, true)
    }
    await truck.tx.equipItem(itemid)
    await allfresh()
  }

  const safeUnequip = async (itemid) => {
    await truck.tx?.removeItem(itemid)
    await allfresh()
  }

  const safeStake = async (chefid) => {
    const approv = await chef.view.isApprovedForAll(chain.address, truck.address)
    if (approv) {
      //nothing
    } else {
      await chef.tx.setApprovalForAll(truck.address, true)
    }
    await truck.tx.stake(chefid)
    await allfresh()
  }

  const safeReduceCollectionFee = async () => {
    const total = truck.state?.priceCollectionUpgrade
    const approv = await pizza.view.allowance(chain.address, item.address)
    if (approv >= total) {
      //nothing
    } else {
      await pizza.tx?.approve(item.address, total)
    }
    await truck.tx?.reduceCollectionFee()
    await allfresh()
  }

  const safeIncreaseChefLimit = async () => {
    const total = truck.state?.priceWalletUpgrade
    const approv = await pizza.view.allowance(chain.address, item.address)
    if (approv >= total) {
      //nothing
    } else {
      await pizza.tx?.approve(item.address, total)
    }
    await truck.tx?.increaseChefLimit()
    await allfresh()
  }


  const safeMintChef = async (amount) => {
    //todo: only mock, fix in contract
    let cntreg = 0;
    let cnttiki = 0;
    for(let i = 0; i < amount; i++) {
      const x = Math.floor(Math.random() * 10) 
      if (x == 4) {
        cnttiki += 1;
      } else {
        cntreg += 1;
      }
    }
    let price = ethers.utils.parseEther("3.0")
    if (cnttiki > 0) {
      await chef.tx.mintTiki(cnttiki, {value: price.mul(cnttiki)})
    }
    if (cntreg > 0) {
      await chef.tx.mintRegular(cntreg, {value: price.mul(cntreg)})
    }
    await allfresh()
  }

  const fmtAddr = (addr) => {
    if (addr) {
      return addr.slice(0,5) + ".." + addr.slice(-3,-1)
    } else {
      return "<emtpy>"
    }
    
  }

  const fmtEth = (x) => {
    if (x) {
      return ethers.utils.formatEther(x)
    } else {
      return "--"
    }
  }

  const fmtArr = (x) => {
    if (x) {
      return x.map(y => <div>{y.toString()}</div>)
    } else {
      return []
    }
  }

  const safeStakeDough = async () => {
    const am = document.getElementById("doughstakein").value
    const amount = ethers.utils.parseEther(am)
    
    const approv = await dough.view.allowance(chain.address, fermenter.address)
    if (approv >= amount) {
      //nothing
    } else {
      await dough.tx.approve(fermenter.address, amount)
    }
    await fermenter.tx.stake(amount)
    await allfresh()
  }

  const safeStakePZA = async () => {
    const am = document.getElementById("pzastakein").value
    const amount = ethers.utils.parseEther(am)
    
    const approv = await pizza.view.allowance(chain.address, pizzastaker.address)
    if (approv >= amount) {
      //nothing
    } else {
      await pizza.tx.approve(pizzastaker.address, amount)
    }
    await pizzastaker.tx.stake(amount)
    await allfresh()
  }

  const fmtDate = (big_unix_timestamp) => {
// Create a new JavaScript Date object based on the timestamp
// multiplied by 1000 so that the argument is in milliseconds, not seconds.
  if (big_unix_timestamp == undefined ) {
    return "--"
  }
  if (big_unix_timestamp.gt(4102441200)) {
    return "INF"
  }
  var unix_timestamp = big_unix_timestamp.toNumber()
  console.log("unix", unix_timestamp)
  var date = new Date(unix_timestamp * 1000);
// Hours part from the timestamp
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hours = date.getHours();
// Minutes part from the timestamp
  var minutes = "0" + date.getMinutes();
// Seconds part from the timestamp
  var seconds = "0" + date.getSeconds();

// Will display time in 10:30:23 format
  return `${month}/${day} - ` + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

  }

  const yesreward = (truck.my != null) ? truck.my?.getChefs.filter(x => x.unlockTime._hex.length >= 30) : []
  const noreward = (truck.my != null) ? truck.my?.getChefs.filter(x => x.unlockTime._hex.length < 30 ) : []

  console.log("yesreward", yesreward)

  const fmtNr = (x) => {
    if (x != undefined && x != null) {
      return x.toString()
    } else {
      return "-"
    }
  }
//               {item.my?.toks.map(x => <div key={x.key}><span>{x.key}:</span> <span className='kind'>{x.amount}</span></div>)}
//               <div>{truck.my?.stakeStatus.length == 0 ? "Nothing staked" : truck.my?.stakeStatus.map(x => <div key={x.token.toNumber()}><span>Chef #{x.token.toNumber()} </span><span>Rewards:  {x.active ? "yes": "cooldown"}</span></div>)}</div>
  
// {fmtEth(truck.custom?.doughStatus)}

const safePrepareUnstakeDough = async () => {
  const unst = document.getElementById("xunstakedough").value
  const amount = ethers.utils.parseEther(unst)
  await fermenter.tx.prepareUnstake(amount)
  await allfresh()
}

const safeInstantUnstakeDough = async () => {
  const unst = document.getElementById("xunstakedough").value
  const amount = ethers.utils.parseEther(unst)
  await fermenter.tx.unstakeNow(amount)
  await allfresh()
}

const safePizzaUnstakeNow = async () => {
  const unst = document.getElementById("xunstakepizza").value
  const amount = ethers.utils.parseEther(unst)
  await pizzastaker.tx.unstakeNow(amount)
  await allfresh()
}

const safeUnstakeDough = async (lvl) => {
  const unst = document.getElementById("unstakedough").value
  const amount = ethers.utils.parseEther(unst)
  await fermenter.tx.unstakeDelay(amount, lvl)
  await allfresh()
}

const safeMintItem = async (id, amount) => {
  const total = item.state?.[`mintPrices,${id}`].mul(amount)
  const approv = await dough.view.allowance(chain.address, item.address)
  if (approv >= total) {
    //nothing
  } else {
    await dough.tx?.approve(item.address, total)
  }
  await item.tx?.mint(id, amount)
  await allfresh()
}

const safeBake = async() => {
  const amtstr = document.getElementById("amountbake").value;
  const amount = ethers.utils.parseEther(amtstr)
  const approv = await dough.view.allowance(chain.address, oven.address)
  if (approv >= amount) {
    //nothing
  } else {
    await dough.tx?.approve(oven.address, amount)
  }
  await oven.tx?.bake(amount) 
  await allfresh()
}



console.log("item state debug", item.state)

return (
    <div className="App">
      <div className='fixview'> 
        <div className='warn'>Info: {loading ? "LOADING...." : "Nothing loading"}</div>
        <div className='error'>Errors: {error != null && error.message}</div>
      </div>
         {chain.provider == null ? <button className='btnconnect' onClick={connect}>CONNECT</button> :
          (errorWallet) ? <SetRPC setError={setError} /> :
        <div>
        <div className='section'>
          <h3>Minting</h3>
          <div className='mintsection'>
            <Mint head={"Mint Chef"} label={"Mint Chef Now"} note1={`Current id #${fmtNr(chef.state?.currentSupply)}`} mintFromQuant={safeMintChef} note2={"Price 3.0 AVAX"} />
            <Mint head={"Mint Item 1"} label={"Mint Item 1"} note1={`Cost ${fmtEth(item.state?.[`mintPrices,${1}`])} DOUGH, StakeBoost: ${fmtNr(item.state?.[`doughRate,${1}`])} DOUGH.`} note2={`Minted: ${fmtNr(item.state?.[`currentSupply,1`])} / ${fmtNr(item.state?.[`maxSupply,1`])}`} mintFromQuant={async (x) => safeMintItem(1, x) } />
            <Mint head={"Mint Item 2"} label={"Mint Item 2"} note1={`Cost ${fmtEth(item.state?.[`mintPrices,${2}`])} DOUGH, StakeBoost: ${fmtNr(item.state?.[`doughRate,${2}`])} DOUGH.`} note2={`Minted: ${fmtNr(item.state?.[`currentSupply,2`])} / ${fmtNr(item.state?.[`maxSupply,2`])}`} mintFromQuant={async (x) => safeMintItem(2, x) } />
            <Mint head={"Mint Item 3"} label={"Mint Item 3"} note1={`Cost ${fmtEth(item.state?.[`mintPrices,${3}`])} DOUGH, StakeBoost: ${fmtNr(item.state?.[`doughRate,${3}`])} DOUGH.`} note2={`Minted: ${fmtNr(item.state?.[`currentSupply,3`])} / ${fmtNr(item.state?.[`maxSupply,3`])}`} mintFromQuant={async (x) => safeMintItem(3, x) } />
            </div>
            <h3>Food Truck 1: Stake Chefs</h3>
          <div className='mintsection'>
            <div className='mintcontainer'>
              <h4>My Unstaked Chefs</h4>
              <div>Total: {fmtNr(chef.my?.balanceOf)} </div>
              <div>{chef.my?.getMyChefs?.map(x => <div key={x.tokenId.toString()}><span>Token {x.tokenId.toString()}:</span> <span className='kind'>{x.kind.toString() == "1" ? "Chef" : "Tiki"}</span> owned by <span className='addr'>{fmtAddr(chain.address)}</span> <button onClick={() => safeStake(x.tokenId)}>Stake</button> </div>)} </div>
            </div>
            <div className='mintcontainer'>
              <h4>My Staked Chefs</h4>
              <div>Total: {yesreward?.length} </div>
              <div>{yesreward?.map(x => <div>{`Chef #${x.tokenId.toString()}`} {`timestamp ${fmtDate(x.unlockTime)}`} <button onClick={async () => { await truck.tx?.prepareUnstake(x.tokenId); await allfresh()}}>cooldown</button></div>)}</div>
            </div>
            <div className='mintcontainer'>
              <h4>My Chefs in Cooldown</h4>
              <div style={{fontSize: "0.8rem", fontWeight: "600"}}>cooldown 1 day</div>
              <div>Total: {noreward?.length} </div>
              <div>{noreward?.map(x => <div>{`Chef #${x.tokenId.toString()}`} {`timestamp ${fmtDate(x.unlockTime)}`} <button onClick={async () => { await truck.tx?.unstake(x.tokenId); await allfresh()}}>unstake</button></div>)}</div>
            </div>
            <div className='mintcontainer'>
              <h4>Free Item Slots</h4>
                <div>Total Slots: {fmtNr(truck.my?.getSlots)}</div>
                <h5>Your Items</h5>
                <div>{[1,2,3].map(x => <div>{`Item #${x}: ${fmtNr(item.state?.[`balanceOf,${chain.address},${x}`])}`}<button onClick={() => safeEquip(x)}>Equip</button></div>)}</div>
              </div>
            </div>
            <div className='mintcontainer'>
              <h4>Taken Item Slots</h4>
                <div>Occupied Slots: {fmtNr(truck.my?.getNrItems)}</div>
                <h5>ItemKinds</h5>
                <div>{[1,2,3].map(x => <div>{`Item #${x}: ${fmtNr(myStakedItems[x-1])}`}<button onClick={() => safeUnequip(x)}>Unequip</button></div>)}</div>
            </div>

            <h3>Food Truck 2: DOUGH</h3>
            <div className='mintsection'>

            <div className='mintcontainer'>
              <h4>Withdraw DOUGH</h4>
              <div><button onClick={allfresh}>Instant Refresh</button></div>
              <div>Your Rate: {fmtEth(truck.my?.getUserRate)} DOUGH / minute </div>
              <div>Staking balance:  {fmtEth(truck.my?.getReward)} DOUGH </div>
              <div><button onClick={safeWithdraw}>Withdraw Now</button></div>
            </div>
            
            
            <div className='mintcontainer'>
              <h4>Show My DOUGH balance</h4>
              <div>{fmtEth(dough.my?.balanceOf)} DOUGH</div>
            </div>  

            <div className='mintcontainer'>
              <h4>Upgrades</h4>
              <div>Chef Stakinlimit: {fmtNr(truck.my?.getWalletLimit)}</div>
              <div>Upgrade Cost: {fmtEth(truck.state?.priceWalletUpgrade)} PZA</div>
              <div><button onClick={safeIncreaseChefLimit}>Increase Chef Limit</button></div>
              <div>Collection Fee: {fmtNr(truck.my?.getCollectionFee)}%</div>
              <div>Upgrade Cost: {fmtEth(truck.state?.priceCollectionUpgrade)} PZA</div>
              <div><button onClick={safeReduceCollectionFee}>Reduce Collection Fee</button></div>
            </div>
            
          </div>
          <h3>Fermenter</h3>
        <div className='mintsection'>
        
        <div className='mintcontainer'>
              <h4>Stake DOUGH in Fermenter</h4>
              <div><label>How much</label></div>
              <input id="doughstakein"></input>
              <div><button onClick={safeStakeDough}>Stake Now</button></div>
            </div>

            <div className='mintcontainer'>
              <h4>Rewards</h4>
              <div><button onClick={allfresh}>Instant Refresh</button></div>
              <div>Claimable Now:  {fmtEth(fermenter.my?.getClaimable)} DOUGH </div>
              <div>Estimate current epoch:  {fmtEth(fermenter.my?.getEstimate)} DOUGH </div>
              <div>Next Epoch End: {fmtDate(fermenter.state?.getEndTime)}</div>
              <div><button onClick={allfresh}>Claim Now</button></div>
            </div>

            <div className='mintcontainer'>
              <h4>Staked</h4>
              <div><button onClick={allfresh}>Instant Refresh</button></div>
              <div>My stake:  {fmtEth(fermenter.my?.getStake)} DOUGH </div>
              <div>Total stake:  {fmtEth(fermenter.state?.tvs)} DOUGH </div>
              <input id="xunstakedough"></input>
              <div><button onClick={safePrepareUnstakeDough}>Prepare Unstake</button></div>
              <div><button onClick={safeInstantUnstakeDough}>Instant Unstake</button></div>
            </div>
            
            <div className='mintcontainer'>
              <h4>Stake in Cooldown </h4>
              <div><button onClick={allfresh}>Instant Refresh</button></div>
              <div>My cooldown stake:  {fmtEth(fermenter.my?.cooldownStake)} DOUGH </div>
              <div>Total cooldown stake:  {fmtEth(fermenter.state?.cooldownSum)} DOUGH </div>
              <input id="unstakedough"></input>
              <div><button onClick={() => safeUnstakeDough(0)}>Unstake 24h</button></div>
              <div><button onClick={() => safeUnstakeDough(1)}>Unstake 48h</button></div>
              <div><button onClick={() => safeUnstakeDough(2)}>Unstake 72h</button></div>
            </div>
            <div className='mintcontainer'>
              <h4>Delayed Unstake</h4>
              <div><button onClick={allfresh}>Instant Refresh</button></div>
              <div>Amount:  {fmtEth(fermenter.my?.getDelayedAmount)} DOUGH </div>
              <div>Withdraw on:  {fmtDate(fermenter.my?.getDelayedTime)} DOUGH </div>
              <div><button onClick={() => fermenter.tx?.withdrawDelayed()}>Withdraw it</button></div>
            </div>
          </div>
          <h3>Oven</h3>
        <div className='mintsection'>
        <div className='mintcontainer'>
              <h4>Put Dough in Oven</h4>
              <div><button onClick={allfresh}>Instant Refresh</button></div>
              <div> <input id="amountbake"></input> DOUGH</div>
              <div> You have to wait 6 hours for your pizza </div>
              <div><button onClick={safeBake}>Bake it</button></div>
            </div>
            <div className='mintcontainer'>
              <h4>Get Pizza from Oven</h4>
              <div><button onClick={allfresh}>Instant Refresh</button></div>
              <div>Amount baking:  {fmtEth(oven.my?.getDoughDeposit)} DOUGH </div>
              <div>Expected output:  {fmtEth(oven.my?.getPizzaAmount)} PZA </div>
              <div>Ready on:  {fmtDate(oven.my?.getPizzaReady)} </div>
              <div><button onClick={() => oven.tx?.withdraw()}>Withdraw it</button></div>
            </div>
            <div className='mintcontainer'>
              <h4>Show My PZA balance</h4>
              <div>{fmtEth(pizza.my?.balanceOf)} PZA</div>
            </div>  

          </div>

          <h3>Pizzeria</h3>
        <div className='mintsection'>
          <div className='mintcontainer'>
              <h4>Stake PZA in Pizzeria</h4>
              <div><label>How much</label></div>
              <input id="pzastakein"></input>
              <div><button onClick={safeStakePZA}>Stake Now</button></div>
            </div>

            <div className='mintcontainer'>
              <h4>Rewards</h4>
              <div><button onClick={allfresh}>Instant Refresh</button></div>
              <div>Claimable Now:  {fmtEth(pizzastaker.my?.getClaimable)} PZA </div>
              <div>Estimate current epoch:  {fmtEth(pizzastaker.my?.getEstimate)} PZA </div>
              <div>Next Epoch End: {fmtDate(pizzastaker.state?.getEndTime)}</div>
              <div><button onClick={allfresh}>Claim Now</button></div>
            </div>

            <div className='mintcontainer'>
              <h4>Staked</h4>
              <div><button onClick={allfresh}>Instant Refresh</button></div>
              <div>My stake:  {fmtEth(pizzastaker.my?.getStake)} DOUGH </div>
              <div>Total stake:  {fmtEth(pizzastaker.state?.tvs)} DOUGH </div>
              <input id="xunstakepizza"></input>
              <div><button onClick={safePizzaUnstakeNow}>Instant Unstake</button></div>
            </div>
        </div>

          </div>
        <div className='section'>
          <h3>Admin Prespective</h3>
          <div className='mintsection'>
            <div className='mintcontainer'>
              <h4>All Chefs</h4>
              <div>Total minted: {fmtNr(chef.state?.currentSupply)}</div>
              {[].map(x => <div key={x.key}><span>Token {x.key}:</span> <span className='kind'>{x.kind == 1 ? "Chef" : "Tiki"}</span> owned by <span className='addr'>{fmtAddr(x.owner)}</span> </div>)}
            </div>

          </div>  
        </div>
        </div> }
    </div>
  )
}

export default App
