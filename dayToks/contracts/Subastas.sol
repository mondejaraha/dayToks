// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;
/**
 * @title DayToks Bids
 * @notice Do not use this contract in production
 * @dev All function calls are currently implemented without side effects
 */

contract Subastas{
    
    uint total_bids = 0;
    uint stable_value = 10 wei;
    address public minter;
    
    struct Bid {
        uint id_bid;
        uint highest_bid;
        address highest_bidder;
        address daytokNFT;
        uint deadline;
        bool sold;
    }
    
    mapping(uint => Bid) bids;

    constructor() {
        minter = msg.sender;
    }

    // @notice place a Bid
    // @dev only if the bid is higher than the highest bid
    // @param id_bid bid's id 
    // @return Transaction execution status
    function placeBid(uint id_bid) public payable returns (bool){
        require(msg.value > bids[id_bid].highest_bid, "The bid should be higher than the highest bid");

        bids[id_bid].highest_bid = msg.value;
        bids[id_bid].highest_bidder = msg.sender;
        
        //if deadline is lower than 5 minutes, the deadline is postponed 5 minutes after the latest bid.
        if(bids[id_bid].deadline < block.timestamp + 5 minutes){
            bids[id_bid].deadline = block.timestamp + 5 minutes;
        }

        return true;
    }
    
    // @notice Create a bid
    // @dev Only if a bid is not active
    // @param tokenId nft identifier
    // @return Transaction execution status
    function createBid(uint tokenId) public returns (bool){
        require(msg.sender == minter, "This operation is only available for the minter");
        require(bids[tokenId].sold == false);
        
        bids[tokenId].sold == false;
        bids[tokenId].highest_bid = 0;
        bids[tokenId].highest_bidder = msg.sender;
        bids[tokenId].deadline = block.timestamp + 1 days;
        
        return true;
    }
    

    // @notice Get the highest bidder
    // @return address of the highest bidder
    function getHighestBidder(uint tokenId) public view returns (address){
        return (bids[tokenId].highest_bidder);
    }

    // @notice Get the bid deadline
    // @return deadline of the bid
    function getDeadline(uint tokenId) public view returns (uint){
        return (bids[tokenId].deadline);
    }

    // @notice Get contract's balance
    // @return The ether stored in the contract
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function getMinter() public view returns (address) {
        return minter;
    }

    // @notice Execute the claim and withdraw the funds.
    // @dev Only for accecpted claims
    // @return Transaction execution status    
    function transferBalance(uint amount) external returns (bool) {
        require(msg.sender == minter, "This operation is only available for the minter");
        require(amount < address(this).balance, "There is not enough funds in the contract");
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed.");    
        
        return true;
    }


    function msgSender() public view returns (address){     
        return msg.sender;
    }
    

}
