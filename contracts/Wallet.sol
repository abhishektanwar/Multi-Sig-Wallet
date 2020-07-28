pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

contract Wallet{
    address[] public approvers;
    uint public quorum;
    
    struct Transfer{
        uint id;
        address payable to;
        uint amount;
        uint approvals;
        bool sent;
        
    }
    
    Transfer[] public transfers;
    
    mapping(address => mapping(uint => bool)) public approvals;
    constructor(address[] memory _approvers,uint _quorum) public {
        approvers = _approvers;
        quorum = _quorum;
    }

    function getApprovers() external view returns(address[] memory) {
        return approvers;
    }
    
    function createTransfer(address payable _to, uint _amount) external onlyApprover{
        transfers.push(Transfer(
                transfers.length,
                _to,
                _amount,
                0,
                false
            ));
    }
    
    function getTransfers() external view returns(Transfer[] memory){
        return transfers;
    }
    
    function approveTransfer(uint _id) external onlyApprover{
        require(transfers[_id].sent == false,'Transfer already sent');
        require(approvals[msg.sender][_id] == false,'Already approved,cannot approve twice');
        
        approvals[msg.sender][_id] = true;
        transfers[_id].approvals++;
        
        if(transfers[_id].approvals >= quorum){
            transfers[_id].sent = true;
            address payable to = transfers[_id].to;
            uint amt = transfers[_id].amount;
            to.transfer(amt);
        }
    }
    
    //function to receive ether
    receive() external payable{}
    
    modifier onlyApprover() {
        bool allowed = false;
        for(uint i=0;i<approvers.length;i++){
            if(approvers[i] == msg.sender){
                allowed = true;
            }
            
        }
        require(allowed == true,'only approver allowed');
        _;
    }
    
}