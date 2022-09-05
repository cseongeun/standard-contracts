// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IKIP37 } from "./IKIP37.sol";

interface IKIP37MetadataURI is IKIP37 {
  /**
   * @dev Returns the URI for token type `id`.
   *
   * If the `\{id\}` substring is present in the URI, it must be replaced by
   * clients with the actual token type ID.
   */
  function uri(uint256 id) external view returns (string memory);
}
