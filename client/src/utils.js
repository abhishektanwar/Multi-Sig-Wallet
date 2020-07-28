import Web3 from 'web3';
import Wallet from './contract/Wallet.json';

const getWeb3 = () => {
    return new Web3('https://localhost:9545');
};

const getWallet = async web3 =>{
    const networkId = await web3.eth.net.getId();
    const contractDeployment = Wallet.network[networkId];
    return new web3.eth.Contract(
        Wallet.abi,
        contractDeployment && contractDeployment.address
    );
};

export {getWeb3, getWallet};