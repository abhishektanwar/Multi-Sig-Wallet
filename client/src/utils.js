import Web3 from 'web3';
import Wallet from './contract/Wallet.json';

//--------******************----------------------------------------------
//below function is fine for testing with localblockchain provided by truffle ,
//for metamask we need to use other functionality

// const getWeb3 = () => {
    // return new Web3('http://127.0.0.1:9545');
// };


//--------******************----------------------------------------------

const getWeb3 = () => {
    return new Promise((resolve,reject) => {
        // window.addEventListener("load",async () => {
            // new metamask
            if(window.ethereum){
                const web3 = new Web3(window.ethereum);
                try{
                    //permission to use metamask
                    window.ethereum.enable();
                    resolve(web3);
                }catch(error){
                    reject(error);
                }
            }
            //old version of metamask
            else if(window.web3){
                resolve(window.web3);
            }
            //metamastk not found
            else{
                reject('Must install metamask');
            }
        });
    // });
};

const getWallet = async web3 =>{
    const networkId = await web3.eth.net.getId();
    const contractDeployment =Wallet.networks[networkId];
    return new web3.eth.Contract(
        Wallet.abi,
        contractDeployment && contractDeployment.address
    );
};

export {getWeb3, getWallet};