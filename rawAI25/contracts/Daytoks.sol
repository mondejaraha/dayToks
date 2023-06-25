// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../app/node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../app/node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "../app/node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../app/node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract DayToks is ERC721, ERC721URIStorage, Ownable {
    
    constructor() ERC721("ToDaysToks", "DAYTOKS") {}

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return ERC721.supportsInterface(interfaceId) || ERC721URIStorage.supportsInterface(interfaceId);
    }

    function safeMint(address to, uint256 tokenId, string memory swarmHash) public onlyOwner {
        _safeMint(to, tokenId);
        //_setTokenURI(tokenId, bytes32ToString(swarmHash));
        _setTokenURI(tokenId, swarmHash);
    }

    function transferNFT(address _from, address _to, uint256 _tokenId) external onlyOwner() {
        // Transfer the NFT using the ERC721 transferFrom function
        transferFrom(_from, _to, _tokenId);
    }

   function bytes32ToString(bytes32 _bytes32) private pure returns (string memory) {
        bytes memory bytesArray = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            bytesArray[i * 2] = bytes1(hexChar(uint8(_bytes32[i] >> 4)));
            bytesArray[i * 2 + 1] = bytes1(hexChar(uint8(_bytes32[i] & 0x0f)));
        }
        return string(bytesArray);
    }   

    function hexChar(uint8 _byte) private pure returns (uint8) {
        return _byte < 10 ? 48 + _byte : 87 + _byte;
    }

    function _burn(uint256 tokenId) internal override(ERC721,ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    // Función que permite consultar la propiedad de una unidad de token
    function ownerOf(uint256 id) public view override(ERC721, IERC721) returns (address owner) {
        // Devuelve la dirección del dueño actual de la unidad de token con el ID especificado
        return _ownerOf(id);
    }

    function ownerOfToken(uint256 id) public view returns (address owner) {
        // Devuelve la dirección del dueño actual de la unidad de token con el ID especificado
        return ERC721._ownerOf(id);
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

}
