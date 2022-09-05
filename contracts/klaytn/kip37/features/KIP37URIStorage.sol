// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Strings } from "../../../common/utils/Strings.sol";
import { KIP37 } from "../KIP37.sol";

/**
 * @dev KIP37 token with storage based token URI management.
 * Inspired by the ERC721URIStorage extension
 *
 * _Available since v4.6._
 */
abstract contract KIP37URIStorage is KIP37 {
  using Strings for uint256;

  // Optional base URI
  string private _baseURI = "";

  // Optional mapping for token URIs
  mapping(uint256 => string) private _tokenURIs;

  /**
   * @dev See {IKIP37MetadataURI-uri}.
   *
   * This implementation returns the concatenation of the `_baseURI`
   * and the token-specific uri if the latter is set
   *
   * This enables the following behaviors:
   *
   * - if `_tokenURIs[tokenId]` is set, then the result is the concatenation
   *   of `_baseURI` and `_tokenURIs[tokenId]` (keep in mind that `_baseURI`
   *   is empty per default);
   *
   * - if `_tokenURIs[tokenId]` is NOT set then we fallback to `super.uri()`
   *   which in most cases will contain `KIP37._uri`;
   *
   * - if `_tokenURIs[tokenId]` is NOT set, and if the parents do not have a
   *   uri value set, then the result is empty.
   */
  function uri(uint256 tokenId)
    public
    view
    virtual
    override
    returns (string memory)
  {
    string memory tokenURI = _tokenURIs[tokenId];

    // If token URI is set, concatenate base URI and tokenURI (via abi.encodePacked).
    return
      bytes(tokenURI).length > 0
        ? string(abi.encodePacked(_baseURI, tokenURI))
        : super.uri(tokenId);
  }

  /**
   * @dev Sets `tokenURI` as the tokenURI of `tokenId`.
   */
  function _setURI(uint256 tokenId, string memory tokenURI) internal virtual {
    _tokenURIs[tokenId] = tokenURI;
    emit URI(uri(tokenId), tokenId);
  }

  /**
   * @dev Sets `baseURI` as the `_baseURI` for all tokens
   */
  function _setBaseURI(string memory baseURI) internal virtual {
    _baseURI = baseURI;
  }
}
