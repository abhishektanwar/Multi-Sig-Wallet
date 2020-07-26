const Wallet = artifacts.require('./Wallet.sol');
contract('Wallet', (accounts) => {
    let wallet;
    beforeEach(async () => {
        
        wallet = await Wallet.new([accounts[0],accounts[1],accounts[2]],2);
        await web3.eth.sendTransaction({from:accounts[0],to:wallet.address,value:1000});
        console.log(wallet.address);
    });

    it('should have correct approvers and quorum',async () => {
        const approvers = await wallet.getApprovers();
        const quorum = await wallet.quorum();
        assert(approvers.length === 3);
        assert(approvers[0] === accounts[0]);
        assert(approvers[1] === accounts[1]);
        assert(approvers[2] === accounts[2]);
        assert(quorum.toNumber() === 2);
    });
    
    it('create transfer',async () => {
        await wallet.createTransfer(accounts[5],100, {from:accounts[0]});
        const transfers = await wallet.getTransfers();
        assert(transfers.length === 1);
        assert(transfers[0].id === '0');
        assert(transfers[0].amount = '100');
        assert(transfers[0].to === accounts[5]);
        assert(transfers[0].approvals === '0');
        assert(transfers[0].sent === false);
    });

    it('show not create transfer if,sender is not approved',async() => {
        try{
            await wallet.createTransfer(accounts[5],100, {from:accounts[4]});
        }catch(e){
            assert((e.reason).toString() === 'only approver allowed');
        }
    });
    it('should increment approval',async () => {
        await wallet.createTransfer(accounts[5],100, {from:accounts[0]});
        await wallet.approveTransfer(0,{from:accounts[0]});
        const balanceOfWallet = await web3.eth.getBalance(wallet.address);
        const transfers = await wallet.getTransfers();
        assert(transfers[0].approvals === '1');
        assert(transfers[0].sent === false);
        assert(balanceOfWallet === '1000');
    });

    it('should send transfer if quorum reached', async () => {
        const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(accounts[6]));
        await wallet.createTransfer(accounts[6],100, {from:accounts[0]});
        await wallet.approveTransfer(0,{from:accounts[0]});
        await wallet.approveTransfer(0,{from:accounts[2]});
        const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(accounts[6]));
        assert(balanceAfter.sub(balanceBefore).toNumber() === 100);
    });

    it('should not approve transfer if sender is not approved',async () => {
        await wallet.createTransfer(accounts[6],100, {from:accounts[0]});
        try{
            await wallet.approveTransfer(0,{from:accounts[4]});
        }catch(e){
            console.log("check",e.reason,typeof(e.reason));
            assert((e.reason).toString() === 'only approver allowed');
        }
        
    });

    it('should not approver transfer if transfer si already sent',async () => {
        await wallet.createTransfer(accounts[6],100, {from:accounts[0]});
        await wallet.approveTransfer(0,{from:accounts[0]});
        await wallet.approveTransfer(0,{from:accounts[2]});
        try{
            await wallet.approveTransfer(0,{from:accounts[1]});
        }catch(e){
            assert((e.reason).toString() === 'Transfer already sent');
        }
    });
    it('should not approve a transfer twice',async () => {
        await wallet.createTransfer(accounts[6],100, {from:accounts[0]});
        await wallet.approveTransfer(0,{from:accounts[0]});
        try{
            await wallet.approveTransfer(0,{from:accounts[0]});
        }catch(e){
            assert((e.reason).toString() === 'Already approved,cannot approve twice');
        }
    });
});